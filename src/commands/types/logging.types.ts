/**
 * 日志相关类型定义
 */

/**
 * 日志文件信息
 */
export interface LogInfo {
  /** 日志文件是否存在 */
  exists: boolean;

  /** 日志文件路径 */
  path: string;

  /** 文件大小（字节） */
  size_bytes: number;

  /** 人类可读的文件大小 */
  size_human: string;

  /** 最后修改时间 */
  last_modified: string;
}

/**
 * 前端日志条目
 */
export interface FrontendLogEntry {
  /** 日志级别 */
  level: 'info' | 'warn' | 'error';

  /** 日志消息 */
  message: string;

  /** 详细信息（可选） */
  details?: string;

  /** 会话 ID */
  sessionId?: string;
}
