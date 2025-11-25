/**
 * 备份相关类型定义
 */

/**
 * JSON 值类型（匹配 Rust 的 serde_json::Value）
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * 备份数据结构
 */
export interface BackupData {
  /** 备份文件名 */
  filename: string;

  /** 备份内容（JSON 格式，可以是任何有效的 JSON 值） */
  content: JsonValue;

  /** 备份时间戳（Unix 时间戳，秒） */
  timestamp: number;
}

/**
 * 恢复操作失败的备份信息
 */
export interface FailedBackup {
  /** 文件名 */
  filename: string;

  /** 错误信息 */
  error: string;
}

/**
 * 恢复操作结果
 */
export interface RestoreResult {
  /** 成功恢复的数量 */
  restoredCount: number;

  /** 失败的备份列表 */
  failed: FailedBackup[];
}
