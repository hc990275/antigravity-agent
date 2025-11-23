import React, { useState, useCallback } from 'react';
import ManageSection from './ManageSection';
import StatusNotification from './StatusNotification';
import Toolbar from './Toolbar';
import { TooltipProvider } from './ui/tooltip';
import { useDevToolsShortcut } from '../hooks/useDevToolsShortcut';
import { usePasswordDialog } from '../hooks/use-password-dialog';
import { useBackupManagement } from '../hooks/use-backup-management';
import { useConfigManager } from '../hooks/use-config-manager';
import { useAntigravityProcess } from '../hooks/use-antigravity-process';
import SettingsDialog from './SettingsDialog';

interface Status {
    message: string;
    isError: boolean;
}

/**
 * 主应用组件
 * 包含所有主要功能和业务逻辑
 * 只在 Antigravity 路径检测成功后渲染
 */
export function MainApp() {
    // 全局状态
    const [status, setStatus] = useState<Status>({ message: '', isError: false });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // 启用开发者工具快捷键 (Shift+Ctrl+I)
    useDevToolsShortcut();

    // 状态提示函数
    const showStatus = useCallback((message: string, isError: boolean = false): void => {
        setStatus({ message, isError });
        setTimeout(() => {
            setStatus({ message: '', isError: false });
        }, 5000);
    }, []);

    // 密码对话框 Hook
    const {
        passwordDialog,
        showPasswordDialog,
        closePasswordDialog,
        handlePasswordDialogCancel
    } = usePasswordDialog(showStatus);

    // 备份管理 Hook
    const {
        backups,
        isRefreshing,
        isInitialLoading,
        refreshBackupList,
        handleRefresh
    } = useBackupManagement(showStatus);

    // 配置管理 Hook
    const {
        configLoadingState,
        hasUserData,
        isCheckingData,
        importConfig,
        exportConfig
    } = useConfigManager(
        showStatus,
        showPasswordDialog,
        closePasswordDialog,
        handleRefresh,
        isRefreshing
    );

    // Antigravity 进程管理 Hook
    const {
        isProcessLoading,
        backupAndRestartAntigravity
    } = useAntigravityProcess(showStatus, handleRefresh);

    // 合并 loading 状态
    const loadingState = {
        isProcessLoading,
        isImporting: configLoadingState.isImporting,
        isExporting: configLoadingState.isExporting
    };

    return (
        <TooltipProvider>
            <style>{`
        .DialogOverlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 50;
        }

        .DialogContent {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgb(31, 41, 55);
          padding: 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          max-width: 28rem;
          z-index: 50;
        }

        .DialogTitle {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .DialogDescription {
          color: rgb(209, 213, 219);
          margin-bottom: 1rem;
        }

        .Button {
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .Button--secondary {
          background-color: rgb(55, 65, 81);
          color: white;
        }

        .Button--secondary:hover:not(:disabled) {
          background-color: rgb(75, 85, 99);
        }

        .Button--danger {
          background-color: rgb(220, 38, 38);
          color: white;
        }

        .Button--danger:hover:not(:disabled) {
          background-color: rgb(185, 28, 28);
        }

        .Button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Radix UI base animation classes */
        @keyframes overlayShow {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes contentShow {
          from {
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .DialogOverlay {
          animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .DialogContent {
          animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

            <>
                <Toolbar
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    onImport={importConfig}
                    onExport={exportConfig}
                    hasUserData={hasUserData}
                    isCheckingData={isCheckingData}
                    onBackupAndRestart={backupAndRestartAntigravity}
                    loadingState={loadingState}
                    showStatus={showStatus}
                    passwordDialog={passwordDialog}
                    onPasswordDialogCancel={handlePasswordDialogCancel}
                    onSettingsClick={() => setIsSettingsOpen(true)}
                />

                <div className="container">
                    <ManageSection
                        backups={backups}
                        showStatus={showStatus}
                        onRefresh={refreshBackupList}
                        isInitialLoading={isInitialLoading}
                    />
                </div>

                <StatusNotification
                    status={status}
                />

                <SettingsDialog
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                />
            </>
        </TooltipProvider>
    );
}
