use std::path::PathBuf;
use std::process::Command;

/// 获取Antigravity应用数据目录（跨平台）
pub fn get_antigravity_data_dir() -> Option<PathBuf> {
    match std::env::consts::OS {
        "windows" => {
            // Windows: %APPDATA%\Antigravity\User\globalStorage\
            dirs::config_dir()
                .map(|path| path.join("Antigravity").join("User").join("globalStorage"))
        }
        "macos" => {
            // macOS: 基于 product.json 中的 dataFolderName: ".antigravity" 配置
            // ~/Library/Application Support/Antigravity/User/globalStorage/
            dirs::data_dir().map(|path| path.join("Antigravity").join("User").join("globalStorage"))
        }
        "linux" => {
            // Linux: 基于 product.json 中的 dataFolderName: ".antigravity" 配置
            // 优先使用 ~/.config/Antigravity/User/globalStorage/，备用 ~/.local/share/Antigravity/User/globalStorage/
            dirs::config_dir() // 优先：~/.config
                .map(|path| path.join("Antigravity").join("User").join("globalStorage"))
                .or_else(|| {
                    // 备用：~/.local/share
                    dirs::data_dir()
                        .map(|path| path.join("Antigravity").join("User").join("globalStorage"))
                })
        }
        _ => {
            // 其他系统：尝试使用数据目录
            dirs::data_dir().map(|path| path.join("Antigravity").join("User").join("globalStorage"))
        }
    }
}

/// 获取Antigravity状态数据库文件路径
pub fn get_antigravity_db_path() -> Option<PathBuf> {
    get_antigravity_data_dir().map(|dir| dir.join("state.vscdb"))
}

/// 检查Antigravity是否安装并运行
pub fn is_antigravity_available() -> bool {
    get_antigravity_db_path()
        .map(|path| path.exists())
        .unwrap_or(false)
}

/// 搜索可能的Antigravity安装位置
pub fn find_antigravity_installations() -> Vec<PathBuf> {
    let mut possible_paths = Vec::new();

    // 用户数据目录
    if let Some(user_data) = dirs::data_dir() {
        possible_paths.push(user_data.join("Antigravity"));
    }

    // 配置目录
    if let Some(config_dir) = dirs::config_dir() {
        possible_paths.push(config_dir.join("Antigravity"));
    }

    possible_paths
}

/// 获取所有可能的Antigravity数据库路径
pub fn get_all_antigravity_db_paths() -> Vec<PathBuf> {
    let mut db_paths = Vec::new();

    // 主要路径
    if let Some(main_path) = get_antigravity_db_path() {
        db_paths.push(main_path);
    }

    // 搜索其他可能的位置
    for install_dir in find_antigravity_installations() {
        if install_dir.exists() {
            // 递归搜索state.vscdb文件
            if let Ok(entries) = std::fs::read_dir(&install_dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.is_file() && path.file_name().is_some_and(|name| name == "state.vscdb")
                    {
                        db_paths.push(path);
                    }
                }
            }
        }
    }

    db_paths
}

/// 关闭Antigravity进程
pub fn kill_antigravity_processes() -> Result<String, String> {
    match std::env::consts::OS {
        "windows" => {
            // Windows: 尝试多种可能的进程名
            let process_names = vec!["Antigravity.exe", "Antigravity"];
            let mut last_error = String::new();

            for process_name in process_names {
                let output = Command::new("taskkill")
                    .args(["/F", "/IM", process_name])
                    .output()
                    .map_err(|e| format!("执行taskkill命令失败: {}", e))?;

                if output.status.success() {
                    return Ok(format!("已成功关闭Antigravity进程 ({})", process_name));
                } else {
                    last_error = format!(
                        "关闭进程 {} 失败: {:?}",
                        process_name,
                        String::from_utf8_lossy(&output.stderr)
                    );
                }
            }

            Err(last_error)
        }
        "macos" | "linux" => {
            // macOS/Linux: 使用pkill命令，尝试多种进程名模式
            let process_patterns = vec!["Antigravity", "antigravity"];
            let mut last_error = String::new();

            for pattern in process_patterns {
                let output = Command::new("pkill")
                    .args(["-f", pattern])
                    .output()
                    .map_err(|e| format!("执行pkill命令失败: {}", e))?;

                if output.status.success() {
                    return Ok(format!("已成功关闭Antigravity进程 (模式: {})", pattern));
                } else {
                    last_error = format!(
                        "关闭进程失败 (模式: {}): {:?}",
                        pattern,
                        String::from_utf8_lossy(&output.stderr)
                    );
                }
            }

            Err(last_error)
        }
        _ => Err("不支持的操作系统".to_string()),
    }
}
