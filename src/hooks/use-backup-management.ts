import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type {
  ListBackupsResult,
  AntigravityCurrentUserInfo,
  BackupCurrentAccountParams,
  BackupCurrentAccountResult
} from '../types/tauri';

// 常量定义
const FILE_WRITE_DELAY_MS = 500; // 等待文件写入完成的延迟时间

interface UseBackupManagementResult {
    backups: string[];
    isRefreshing: boolean;
    isInitialLoading: boolean;
    setIsInitialLoading: (loading: boolean) => void;
    refreshBackupList: (skipAutoBackup?: boolean) => Promise<void>;
    handleRefresh: () => Promise<void>;
}

/**
 * 备份管理 Hook
 * 负责备份列表的获取、刷新和自动备份逻辑
 */
export function useBackupManagement(
    showStatus: (message: string, isError?: boolean) => void
): UseBackupManagementResult {
    const [backups, setBackups] = useState<string[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    /**
     * 获取备份列表
     */
    const fetchBackups = useCallback(async (): Promise<string[]> => {
        const backupList = await invoke<ListBackupsResult>('list_backups');
        setBackups(backupList);
        return backupList;
    }, []);

    /**
     * 自动备份当前用户
     * 返回是否成功备份
     */
    const autoBackupCurrentUser = useCallback(async (): Promise<boolean> => {
        try {
            console.log('📦 [刷新] 尝试自动备份当前账户');
            // 注意：智能备份可以在进程运行时进行（只读数据库）
            const currentInfo = await invoke<AntigravityCurrentUserInfo>('get_current_antigravity_info');
            console.log('当前Antigravity用户信息:', currentInfo);

            // 检查是否有有效的用户信息（通过API Key或用户状态判断）
            if (currentInfo && (currentInfo.apiKey || currentInfo.userStatusProtoBinaryBase64)) {
                // 从认证信息中提取邮箱
                const userEmail = currentInfo.email;
                console.log('提取的邮箱:', userEmail);

                const result = await invoke<BackupCurrentAccountResult>('backup_antigravity_current_account', {
                    email: userEmail
                });
                console.log('智能备份成功:', result);

                showStatus(`已自动备份当前用户: ${userEmail}`, false);
                return true;
            } else {
                console.log('未检测到有效的用户信息');
                showStatus('未检测到已登录的用户', false);
                return false;
            }
        } catch (error) {
            console.error('自动备份失败:', error);
            showStatus(`自动备份失败: ${error}`, true);
            return false;
        }
    }, [showStatus]);

    /**
     * 等待文件写入完成
     */
    const waitForFileWrite = useCallback(async (): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, FILE_WRITE_DELAY_MS));
    }, []);

    /**
     * 刷新备份列表
     * @param skipAutoBackup 是否跳过自动备份
     */
    const refreshBackupList = useCallback(async (skipAutoBackup: boolean = false): Promise<void> => {
        console.log('🔄 [刷新] 开始刷新备份列表, skipAutoBackup:', skipAutoBackup);
        try {
            // 获取当前备份列表
            await fetchBackups();

            // 自动备份当前用户
            let autoBackedUp = false;
            if (!skipAutoBackup) {
                autoBackedUp = await autoBackupCurrentUser();
                if (autoBackedUp) {
                    // 等待文件写入完成
                    await waitForFileWrite();
                    // 重新获取备份列表
                    await fetchBackups();
                }
            }

            // 初始加载完成
            setIsInitialLoading(false);

            // 显示成功状态
            if (autoBackedUp) {
                showStatus('刷新成功并已更新备份', false);
            } else if (!skipAutoBackup) {
                // 如果没有备份成功，说明当前没有登录用户，这是正常状态
                // 不显示，避免覆盖上面的"未检测到已登录的用户"提示
            } else {
                showStatus('刷新成功', false);
            }
        } catch (error) {
            console.error('❌ [刷新] 获取备份列表失败:', error);
            showStatus(`获取备份列表失败: ${error}`, true);
            setIsInitialLoading(false);
        }
    }, [showStatus, fetchBackups, autoBackupCurrentUser, waitForFileWrite]);

    /**
     * 处理刷新按钮点击
     */
    const handleRefresh = useCallback(async (): Promise<void> => {
        console.log('🔘 [按钮] 点击刷新按钮');
        setIsRefreshing(true);
        try {
            // 正确：刷新按钮应该触发智能备份，然后刷新列表
            await refreshBackupList(false);
            console.log('✅ [按钮] 刷新完成');
        } catch (error) {
            console.error('❌ [按钮] 刷新失败:', error);
            showStatus(`刷新失败: ${error}`, true);
        } finally {
            setIsRefreshing(false);
        }
    }, [refreshBackupList, showStatus]);

    return {
        backups,
        isRefreshing,
        isInitialLoading,
        setIsInitialLoading,
        refreshBackupList,
        handleRefresh
    };
}
