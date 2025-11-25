/**
 * Antigravity 进程运行状态 Store
 * 全局单例，每 10 秒自动检测 Antigravity 是否在运行
 */

import { create } from 'zustand';
import { ProcessCommands } from '@/commands/ProcessCommands';

// 状态接口
interface AntigravityIsRunningState {
  /** 是否正在运行 */
  isRunning: boolean;
  /** 是否正在检查 */
  isChecking: boolean;
  /** 最后检查时间 */
  lastChecked: Date | null;
}

// 操作接口
interface AntigravityIsRunningActions {
  /** 检查运行状态 */
  checkStatus: () => Promise<void>;
  /** 启动自动检查 */
  startAutoCheck: () => void;
  /** 停止自动检查 */
  stopAutoCheck: () => void;
}

// 全局定时器 ID
let checkIntervalId: ReturnType<typeof setInterval> | null = null;

// 检查间隔（10 秒）
const CHECK_INTERVAL = 10000;

/**
 * Antigravity 运行状态 Store
 */
export const useAntigravityIsRunning = create<
  AntigravityIsRunningState & AntigravityIsRunningActions
>((set, get) => ({
  // 初始状态
  isRunning: false,
  isChecking: false,
  lastChecked: null,

  // 检查运行状态
  checkStatus: async () => {
    // 防止并发检查
    if (get().isChecking) {
      return;
    }

    set({ isChecking: true });

    try {
      const running = await ProcessCommands.isRunning();
      set({
        isRunning: running,
        lastChecked: new Date(),
        isChecking: false,
      });
    } catch (error) {
      console.error('[AntigravityIsRunning] 检查状态失败:', error);
      // 检查失败时假设未运行
      set({
        isRunning: false,
        lastChecked: new Date(),
        isChecking: false,
      });
    }
  },

  // 启动自动检查
  startAutoCheck: () => {
    // 清除已存在的定时器
    if (checkIntervalId !== null) {
      clearInterval(checkIntervalId);
    }

    // 立即检查一次
    get().checkStatus();

    // 启动定时检查
    checkIntervalId = window.setInterval(() => {
      get().checkStatus();
    }, CHECK_INTERVAL);

    console.log('[AntigravityIsRunning] 已启动自动检查（间隔 10 秒）');
  },

  // 停止自动检查
  stopAutoCheck: () => {
    if (checkIntervalId !== null) {
      clearInterval(checkIntervalId);
      checkIntervalId = null;
      console.log('[AntigravityIsRunning] 已停止自动检查');
    }
  },
}));
