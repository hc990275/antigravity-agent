import { useState, useCallback } from 'react';
import { AntigravityService } from '../services/antigravity-service';

interface UseAntigravityProcessResult {
    isProcessLoading: boolean;
    backupAndRestartAntigravity: () => Promise<void>;
}

/**
 * Antigravity 进程管理 Hook
 * 负责处理登录新账户（备份并重启）操作
 */
export function useAntigravityProcess(
    showStatus: (message: string, isError?: boolean) => void,
    onRefresh: () => void
): UseAntigravityProcessResult {
    const [isProcessLoading, setIsProcessLoading] = useState(false);

    /**
     * 备份并重启 Antigravity（登录新账户）
     * 注意：此函数只负责执行逻辑，确认对话框在组件中处理
     */
    const backupAndRestartAntigravity = useCallback(async () => {
        console.log('✅ 用户确认登录新账户操作');
        try {
            setIsProcessLoading(true);

            console.log('📤 发送状态更新: 正在备份当前用户并注销...');
            showStatus('正在备份当前用户并注销...');

            console.log('🔄 调用 AntigravityService.backupAndRestartAntigravity');
            await AntigravityService.backupAndRestartAntigravity(showStatus);

            console.log('✅ 备份并重启操作完成，准备刷新界面');
            // 延迟刷新以确保操作完成
            setTimeout(() => {
                console.log('🔄 执行界面刷新');
                onRefresh();
            }, 1000);

        } catch (error) {
            console.error('❌ 登录新账户操作失败:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            showStatus(errorMessage, true);
        } finally {
            setIsProcessLoading(false);
            console.log('🔧 操作流程结束，重置加载状态');
        }
    }, [showStatus, onRefresh]);

    return {
        isProcessLoading,
        backupAndRestartAntigravity
    };
}
