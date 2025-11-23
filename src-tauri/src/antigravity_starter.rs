/// Antigravity 启动模块
///
/// 提供跨平台的 Antigravity 应用程序启动功能
/// 支持 Windows、macOS 和 Linux 系统
use std::path::PathBuf;
use std::process::Command;

/// 启动 Antigravity 应用程序（主入口函数）
///
/// # 返回值
///
/// * `Ok(String)` - 启动成功，返回成功消息
/// * `Err(String)` - 启动失败，返回错误信息
///
/// # 示例
///
/// ```rust
/// match antigravity_starter::start_antigravity() {
///     Ok(msg) => println!("启动成功: {}", msg),
///     Err(e) => println!("启动失败: {}", e),
/// }
/// ```
pub fn start_antigravity() -> Result<String, String> {
    // 优先使用用户配置的可执行文件路径
    if let Ok(Some(custom_exec)) = crate::antigravity_path_config::get_custom_executable_path() {
        let path = PathBuf::from(&custom_exec);
        if path.exists() && path.is_file() {
            log::info!("📁 使用自定义 Antigravity 可执行文件: {}", custom_exec);
            return try_start_from_path(&path)
                .map_err(|e| format!("无法启动自定义 Antigravity: {}. 请检查路径是否正确", e));
        } else {
            log::warn!("⚠️ 自定义可执行文件路径无效: {}", custom_exec);
        }
    }
    
    // 回退到自动检测
    match std::env::consts::OS {
        "windows" => start_antigravity_windows(),
        "macos" => start_antigravity_macos(),
        "linux" => start_antigravity_linux(),
        _ => Err("不支持的操作系统".to_string()),
    }
}

/// 在 Windows 平台启动 Antigravity
fn start_antigravity_windows() -> Result<String, String> {
    let mut errors = Vec::new();
    let antigravity_paths = get_antigravity_windows_paths();

    // 尝试所有推测的路径
    for path in &antigravity_paths {
        if path.exists() {
            eprintln!("找到并尝试启动: {}", path.display());
            match try_start_from_path(path) {
                Ok(_) => {
                    return Ok(format!("Antigravity启动成功 ({})", path.display()));
                }
                Err(e) => {
                    errors.push(format!("{}: {}", path.display(), e));
                }
            }
        } else {
            errors.push(format!("{}: 文件不存在", path.display()));
        }
    }

    // 尝试从系统 PATH 启动命令
    let commands = vec!["Antigravity", "antigravity"];
    match try_start_from_commands(commands) {
        Ok(msg) => Ok(msg),
        Err(e) => {
            errors.push(e);
            Err(format!(
                "无法启动Antigravity。请手动启动Antigravity应用。\n尝试的方法：\n{}",
                errors.join("\n")
            ))
        }
    }
}

/// 在 macOS 平台启动 Antigravity
fn start_antigravity_macos() -> Result<String, String> {
    let mut errors = Vec::new();
    let antigravity_paths = get_antigravity_macos_paths();

    // 尝试所有推测的路径
    for path in &antigravity_paths {
        if path.exists() {
            eprintln!("找到并尝试启动: {}", path.display());
            match try_start_from_path(path) {
                Ok(_) => {
                    return Ok(format!("Antigravity启动成功 ({})", path.display()));
                }
                Err(e) => {
                    errors.push(format!("{}: {}", path.display(), e));
                }
            }
        } else {
            errors.push(format!("{}: 文件不存在", path.display()));
        }
    }

    // 尝试系统 PATH 命令
    let commands = vec!["Antigravity", "antigravity"];
    match try_start_from_commands(commands) {
        Ok(msg) => Ok(msg),
        Err(e) => {
            errors.push(e);
            Err(format!(
                "无法启动Antigravity。请手动启动Antigravity应用。\n尝试的方法：\n{}",
                errors.join("\n")
            ))
        }
    }
}

/// 在 Linux 平台启动 Antigravity
fn start_antigravity_linux() -> Result<String, String> {
    let mut errors = Vec::new();
    let antigravity_paths = get_antigravity_linux_paths();

    // 尝试所有推测的路径
    for path in &antigravity_paths {
        if path.exists() {
            eprintln!("找到并尝试启动: {}", path.display());
            match try_start_from_path(path) {
                Ok(_) => {
                    return Ok(format!("Antigravity启动成功 ({})", path.display()));
                }
                Err(e) => {
                    errors.push(format!("{}: {}", path.display(), e));
                }
            }
        } else {
            errors.push(format!("{}: 文件不存在", path.display()));
        }
    }

    // 尝试系统 PATH 中的命令
    let commands = vec!["antigravity", "Antigravity"];
    match try_start_from_commands(commands) {
        Ok(msg) => Ok(msg),
        Err(e) => {
            errors.push(e);
            Err(format!(
                "无法启动Antigravity。请手动启动Antigravity应用。\n尝试的方法：\n{}",
                errors.join("\n")
            ))
        }
    }
}

/// 获取 Windows 平台下 Antigravity 的可能安装路径
fn get_antigravity_windows_paths() -> Vec<PathBuf> {
    let mut antigravity_paths = Vec::new();

    // 1. 基于用户主目录构建可能的路径
    if let Some(home) = dirs::home_dir() {
        // C:\Users\{用户名}\AppData\Local\Programs\Antigravity\Antigravity.exe (最常见)
        antigravity_paths.push(home.join(r"AppData\Local\Programs\Antigravity\Antigravity.exe"));
        // C:\Users\{用户名}\AppData\Roaming\Local\Programs\Antigravity\Antigravity.exe
        antigravity_paths
            .push(home.join(r"AppData\Roaming\Local\Programs\Antigravity\Antigravity.exe"));
    }

    // 2. 使用 data_local_dir (通常是 C:\Users\{用户名}\AppData\Local)
    if let Some(local_data) = dirs::data_local_dir() {
        antigravity_paths.push(local_data.join(r"Programs\Antigravity\Antigravity.exe"));
    }

    // 3. 其他可能的位置
    antigravity_paths.push(PathBuf::from(
        r"C:\Program Files\Antigravity\Antigravity.exe",
    ));
    antigravity_paths.push(PathBuf::from(
        r"C:\Program Files (x86)\Antigravity\Antigravity.exe",
    ));

    antigravity_paths
}

/// 获取 macOS 平台下 Antigravity 的可能安装路径
/// 
/// 注意：返回的是 .app bundle 路径，而不是内部的二进制文件路径
/// 这是因为 macOS 应该使用 `open` 命令来启动 .app 应用
fn get_antigravity_macos_paths() -> Vec<PathBuf> {
    let mut antigravity_paths = Vec::new();

    // 候选的 .app bundle 位置和对应的内部可执行文件名
    let app_locations = vec![
        (PathBuf::from("/Applications/Antigravity.app"), vec!["Electron", "Antigravity"]),
    ];
    
    // 如果有用户主目录，也检查用户应用目录
    let mut locations_to_check = app_locations;
    if let Some(home) = dirs::home_dir() {
        locations_to_check.push((
            home.join("Applications/Antigravity.app"),
            vec!["Electron", "Antigravity"]
        ));
    }

    // 对每个位置，检查内部可执行文件是否存在
    for (app_path, exec_names) in locations_to_check {
        for exec_name in exec_names {
            let exec_path = app_path.join("Contents/MacOS").join(exec_name);
            // 如果可执行文件存在，说明这是一个完整的 .app
            if exec_path.exists() {
                // 但返回的是 .app bundle 路径，不是内部的可执行文件路径
                antigravity_paths.push(app_path.clone());
                break; // 找到一个可执行文件就够了，不需要重复添加
            }
        }
    }

    antigravity_paths
}

/// 获取 Linux 平台下 Antigravity 的可能安装路径
fn get_antigravity_linux_paths() -> Vec<PathBuf> {
    let mut antigravity_paths = Vec::new();

    // 1. 系统全局安装路径
    antigravity_paths.push(PathBuf::from("/usr/share/antigravity/antigravity"));
    antigravity_paths.push(PathBuf::from("/usr/bin/antigravity"));
    antigravity_paths.push(PathBuf::from("/usr/local/bin/antigravity"));
    
    // 2. Snap 包安装路径
    antigravity_paths.push(PathBuf::from("/snap/bin/antigravity"));
    
    // 3. AppImage 常见位置
    if let Some(home) = dirs::home_dir() {
        antigravity_paths.push(home.join("Applications/Antigravity.AppImage"));
        antigravity_paths.push(home.join(".local/bin/antigravity"));
        antigravity_paths.push(home.join("bin/antigravity"));
    }
    
    // 4. Flatpak 安装路径
    antigravity_paths.push(PathBuf::from("/var/lib/flatpak/exports/bin/antigravity"));
    if let Some(home) = dirs::home_dir() {
        antigravity_paths.push(home.join(".local/share/flatpak/exports/bin/antigravity"));
    }

    antigravity_paths
}

/// 尝试从指定路径启动应用程序
fn try_start_from_path(path: &PathBuf) -> Result<String, String> {
    // macOS 需要特殊处理：使用 open 命令启动 .app 应用
    #[cfg(target_os = "macos")]
    {
        // 从路径中提取 .app 包的路径
        // 例如: /Applications/Antigravity.app/Contents/MacOS/Electron -> /Applications/Antigravity.app
        let app_bundle_path = if let Some(app_path) = path.to_str() {
            if let Some(app_index) = app_path.find(".app") {
                let app_end = app_index + 4; // ".app" 的长度
                PathBuf::from(&app_path[..app_end])
            } else {
                path.clone()
            }
        } else {
            path.clone()
        };

        log::info!("🍎 macOS: 使用 open 命令启动应用: {}", app_bundle_path.display());
        
        // 使用 open 命令启动 .app 应用
        // -n 参数: 打开应用的新实例，即使应用已经在运行
        // -a 参数: 根据应用名称启动 (如果 app_bundle_path 是完整路径则不需要)
        Command::new("open")
            .arg("-n")  // 允许打开新实例
            .arg(&app_bundle_path)
            .spawn()
            .map_err(|e| format!("使用 open 命令启动失败: {}", e))?;

        Ok(format!("成功启动应用程序 (macOS open 命令)"))
    }

    // Windows 和 Linux 直接执行二进制文件
    #[cfg(not(target_os = "macos"))]
    {
        Command::new(path)
            .spawn()
            .map_err(|e| format!("启动失败: {}", e))?;

        Ok(format!("成功启动应用程序"))
    }
}

/// 尝试从系统命令启动应用程序
fn try_start_from_commands(commands: Vec<&str>) -> Result<String, String> {
    let mut errors = Vec::new();

    for cmd in commands {
        eprintln!("尝试命令: {}", cmd);
        match Command::new(cmd).spawn() {
            Ok(_) => {
                return Ok(format!("Antigravity启动成功 (命令: {})", cmd));
            }
            Err(e) => {
                errors.push(format!("{}命令: {}", cmd, e));
            }
        }
    }

    Err(format!("所有命令尝试失败: {}", errors.join(", ")))
}

/// 检测 Antigravity 可执行文件路径（不启动，只检测）
pub fn detect_antigravity_executable() -> Option<PathBuf> {
    log::info!("🔍 开始自动检测 Antigravity 可执行文件...");
    
    let result = match std::env::consts::OS {
        "windows" => {
            let paths = get_antigravity_windows_paths();
            paths.into_iter().find(|p| {
                if p.exists() {
                    log::info!("✅ 找到 Antigravity 可执行文件: {}", p.display());
                    true
                } else {
                    false
                }
            })
        },
        "macos" => {
            let paths = get_antigravity_macos_paths();
            paths.into_iter().find(|p| {
                if p.exists() {
                    log::info!("✅ 找到 Antigravity 可执行文件: {}", p.display());
                    true
                } else {
                    false
                }
            })
        },
        "linux" => {
            let paths = get_antigravity_linux_paths();
            paths.into_iter().find(|p| {
                if p.exists() {
                    log::info!("✅ 找到 Antigravity 可执行文件: {}", p.display());
                    true
                } else {
                    false
                }
            })
        },
        _ => None,
    };
    
    if result.is_none() {
        log::warn!("⚠️ 未能自动检测到 Antigravity 可执行文件");
    }
    
    result
}
