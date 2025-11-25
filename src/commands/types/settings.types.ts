/**
 * 设置相关类型定义
 */

/**
 * 应用设置
 */
export interface AppSettings {
  /** 系统托盘是否启用 */
  system_tray_enabled: boolean;

  /** 数据库监控是否启用 */
  db_monitoring_enabled: boolean;

  /** 静默启动是否启用 */
  silent_start_enabled: boolean;
}
