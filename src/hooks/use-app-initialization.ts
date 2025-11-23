import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { exit } from '@tauri-apps/plugin-process';
import type { ListBackupsResult } from '../types/tauri';
import { AntigravityPathService } from '../services/antigravity-path-service';

interface UseAppInitializationResult {
    isDetecting: boolean;
    antigravityFound: boolean | null;
    isPathDialogOpen: boolean;
    handlePathSelected: () => void;
    handlePathDialogCancel: () => Promise<void>;
}

/**
 * 应用初始化 Hook
 * 负责检测 Antigravity 路径和初始化应用
 */
export function useAppInitialization(
    refreshBackupList: (skipAutoBackup?: boolean) => Promise<void>
): UseAppInitializationResult {
    const [isDetecting, setIsDetecting] = useState(true);
    const [antigravityFound, setAntigravityFound] = useState<boolean | null>(null);
    const [isPathDialogOpen, setIsPathDialogOpen] = useState(false);

    /**
     * 处理路径选择成功
     */
    const handlePathSelected = () => {
        setIsPathDialogOpen(false);
        setAntigravityFound(true);
        // 路径设置完成后加载备份列表
        refreshBackupList(true).catch(console.error);
    };

    /**
     * 处理路径选择取消
     */
    const handlePathDialogCancel = async () => {
        // 用户取消选择路径，退出应用
        try {
            await exit(0);
        } catch (error) {
            console.error('退出应用失败:', error);
        }
    };

    // 应用启动时检测 Antigravity 路径
    useEffect(() => {
        const detectAndInit = async () => {
            try {
                console.log('🔍 检测 Antigravity 安装路径...');

                // 检测数据库路径
                const pathInfo = await AntigravityPathService.detectAntigravityPath();
                console.log('🔍 [Frontend] pathInfo:', JSON.stringify(pathInfo));

                // 检测可执行文件路径
                const execInfo = await AntigravityPathService.detectExecutable();
                console.log('🔍 [Frontend] execInfo:', JSON.stringify(execInfo));

                // 必须同时检测到数据库和可执行文件才能进入主应用
                const bothFound = pathInfo.found && execInfo.found;
                console.log('🔍 [Frontend] bothFound:', bothFound, '(pathInfo.found:', pathInfo.found, ', execInfo.found:', execInfo.found, ')');

                if (bothFound) {
                    console.log('✅ Antigravity 数据库路径检测成功:', pathInfo.path);
                    console.log('✅ Antigravity 可执行文件检测成功:', execInfo.path);
                    setAntigravityFound(true);

                    // 自动加载备份列表（跳过自动备份，只读取列表）
                    console.log('📋 自动加载备份列表...');
                    await refreshBackupList(true);

                    // 检测和初始化完成
                    setIsDetecting(false);
                } else {
                    // 显示缺少哪个组件
                    if (!pathInfo.found) {
                        console.log('⚠️ [Frontend] 未找到 Antigravity 数据库');
                    }
                    if (!execInfo.found) {
                        console.log('⚠️ [Frontend] 未找到 Antigravity 可执行文件');
                    }
                    console.log('📝 [Frontend] 请手动选择 Antigravity 路径');

                    setAntigravityFound(false);
                    setIsPathDialogOpen(true);
                    setIsDetecting(false);
                }
            } catch (error) {
                console.error('启动检测失败:', error);
                // 检测失败时也显示路径选择对话框
                setAntigravityFound(false);
                setIsPathDialogOpen(true);
                setIsDetecting(false);
            }
        };

        detectAndInit();
    }, [refreshBackupList]);

    return {
        isDetecting,
        antigravityFound,
        isPathDialogOpen,
        handlePathSelected,
        handlePathDialogCancel
    };
}
