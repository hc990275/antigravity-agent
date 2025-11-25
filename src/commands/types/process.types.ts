/**
 * 进程相关类型定义
 */

/**
 * 进程信息
 */
export interface ProcessInfo {
  /** 进程 ID */
  pid: string;

  /** 进程名称 */
  name: string;

  /** 命令行参数 */
  command: string;

  /** 匹配的模式索引 */
  matched_pattern: number;

  /** 模式描述 */
  pattern_description: string;
}
