/**
 * 系统托盘相关类型定义
 */

/**
 * 托盘切换结果
 */
export interface TrayToggleResult {
  /** 是否已启用 */
  enabled: boolean;

  /** 结果消息 */
  message: string;
}
