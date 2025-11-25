/**
 * Antigravity 账户相关类型定义
 */

/**
 * Antigravity 账户认证信息
 * 注意：后端返回的是动态 JSON (serde_json::Value)，可能包含额外字段
 */
export interface AntigravityAuthInfo {
  /** 用户邮箱地址 */
  email?: string;

  /** 数据库文件路径 */
  db_path?: string;

  /** 其他可能的认证相关字段（支持动态扩展） */
  [key: string]: unknown;
}

/**
 * Antigravity 账户信息
 */
export interface AntigravityAccount {
  /** 账户ID */
  id?: string;

  /** 账户名称 */
  name?: string;

  /** 邮箱地址 */
  email?: string;

  /** 其他账户字段 */
  [key: string]: unknown;
}
