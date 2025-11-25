import { invoke } from '@tauri-apps/api/core';
import type { ProcessInfo } from './types/process.types';

/**
 * 进程管理命令
 */
export class ProcessCommands {
  /**
   * 启动 Antigravity 应用
   * @returns 启动结果消息
   */
  static async start(): Promise<string> {
    return invoke('start_antigravity');
  }

  /**
   * 关闭 Antigravity 进程
   * @returns 关闭结果消息
   */
  static async kill(): Promise<string> {
    return invoke('kill_antigravity');
  }

  /**
   * 检查 Antigravity 进程是否正在运行
   * @returns 是否正在运行
   */
  static async isRunning(): Promise<boolean> {
    return invoke('is_antigravity_running');
  }

  /**
   * 列出所有 Antigravity 相关的进程（用于调试）
   * @returns 进程信息列表
   */
  static async listProcesses(): Promise<ProcessInfo[]> {
    return invoke('list_antigravity_processes');
  }

  /**
   * 备份并重启 Antigravity（登录新账户流程）
   *
   * 完整流程：
   * 1. 关闭 Antigravity 进程
   * 2. 备份当前账户（如果已登录）
   * 3. 清除所有数据
   * 4. 重新启动 Antigravity
   *
   * @returns 操作结果消息
   */
  static async backupAndRestart(): Promise<string> {
    return invoke('backup_and_restart_antigravity');
  }
}
