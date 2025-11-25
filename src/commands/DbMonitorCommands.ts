import { invoke } from '@tauri-apps/api/core';

/**
 * 数据库监控命令
 */
export class DbMonitorCommands {
  /**
   * 检查数据库监控是否正在运行
   * @returns 是否正在运行
   */
  static async isRunning(): Promise<boolean> {
    return invoke('is_database_monitoring_running');
  }

  /**
   * 启动数据库监控
   * @returns 启动结果消息
   */
  static async start(): Promise<string> {
    return invoke('start_database_monitoring');
  }

  /**
   * 停止数据库监控
   * @returns 停止结果消息
   */
  static async stop(): Promise<string> {
    return invoke('stop_database_monitoring');
  }
}
