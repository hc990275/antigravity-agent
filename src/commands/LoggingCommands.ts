import { invoke } from '@tauri-apps/api/core';
import type { LogInfo, FrontendLogEntry } from './types/logging.types';

/**
 * 日志和加密命令
 */
export class LoggingCommands {
  /**
   * 获取日志文件信息
   * @returns 日志文件信息，包含大小、修改时间等
   */
  static async getLogInfo(): Promise<LogInfo> {
    return invoke('get_log_info');
  }

  /**
   * 清空日志文件（会自动备份）
   * @returns 清空结果消息
   */
  static async clearLogs(): Promise<string> {
    return invoke('clear_logs');
  }

  /**
   * 写入文本文件
   * @param path 文件路径
   * @param content 文件内容
   * @returns 写入结果消息
   */
  static async writeTextFile(path: string, content: string): Promise<string> {
    return invoke('write_text_file', { path, content });
  }

  /**
   * 加密配置数据（使用 XOR 算法）
   * @param jsonData JSON 格式的配置数据
   * @param password 加密密码
   * @returns Base64 编码的加密数据
   */
  static async encryptConfig(jsonData: string, password: string): Promise<string> {
    return invoke('encrypt_config_data', { json_data: jsonData, password });
  }

  /**
   * 解密配置数据（使用 XOR 算法）
   * @param encryptedData Base64 编码的加密数据
   * @param password 解密密码
   * @returns JSON 格式的配置数据
   */
  static async decryptConfig(encryptedData: string, password: string): Promise<string> {
    return invoke('decrypt_config_data', { encrypted_data: encryptedData, password });
  }

  /**
   * 写入前端日志到统一日志系统
   * @param logEntry 日志条目
   */
  static async writeFrontendLog(logEntry: FrontendLogEntry): Promise<void> {
    return invoke('write_frontend_log', { log_entry: logEntry });
  }
}
