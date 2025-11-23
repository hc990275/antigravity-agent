import React, { useState } from 'react';
import { useDevToolsShortcut } from './hooks/useDevToolsShortcut';
import { useBackupManagement } from './hooks/use-backup-management';
import { useAppInitialization } from './hooks/use-app-initialization';
import { useStatusNotification } from './hooks/use-status-notification';
import ManageSection from './components/ManageSection';
import StatusNotification from './components/StatusNotification';
import Toolbar from './components/Toolbar';
import AntigravityPathDialog from './components/AntigravityPathDialog';
import SettingsDialog from './components/SettingsDialog';
import { TooltipProvider } from './components/ui/tooltip';

interface LoadingState {
  isProcessLoading: boolean;
  isImporting: boolean;
  isExporting: boolean;
}

interface PasswordDialogState {
  isOpen: boolean;
  title: string;
  description?: string;
  requireConfirmation?: boolean;
  validatePassword?: (password: string) => { isValid: boolean; message?: string };
  onSubmit: (password: string) => void;
}

/**
 * 主应用组件
 * 负责组合各个 Hooks 并渲染 UI
 */
function App() {
  // 启用开发者工具快捷键 (Shift+Ctrl+I)
  useDevToolsShortcut();

  // 状态通知 Hook
  const { status, showStatus } = useStatusNotification(5000);

  // 备份管理 Hook
  const {
    backups,
    isRefreshing,
    refreshBackupList,
    handleRefresh
  } = useBackupManagement(showStatus);

  // 应用初始化 Hook
  const {
    isDetecting,
    isPathDialogOpen,
    handlePathSelected,
    handlePathDialogCancel
  } = useAppInitialization(refreshBackupList);

  // 加载状态
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isProcessLoading: false,
    isImporting: false,
    isExporting: false
  });

  // 密码对话框状态
  const [passwordDialog, setPasswordDialog] = useState<PasswordDialogState>({
    isOpen: false,
    title: '',
    onSubmit: () => {}
  });

  // 设置对话框状态
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 导入配置
  const handleImport = async () => {
    // TODO: 实现导入逻辑
    showStatus('导入功能开发中...', false);
  };

  // 导出配置
  const handleExport = async () => {
    // TODO: 实现导出逻辑
    showStatus('导出功能开发中...', false);
  };

  // 备份并重启
  const handleBackupAndRestart = async () => {
    // TODO: 实现备份重启逻辑
    showStatus('登录新账户功能开发中...', false);
  };

  // 取消密码对话框
  const handlePasswordDialogCancel = () => {
    setPasswordDialog(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <TooltipProvider>
      {/* 路径检测中显示加载界面 */}
      {isDetecting && (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4 mx-auto"></div>
            <p className="text-slate-600">正在检测 Antigravity 安装...</p>
          </div>
        </div>
      )}

      {/* 主应用界面 */}
      {!isPathDialogOpen && !isDetecting && (
        <>
          <Toolbar
            onRefresh={refreshBackupList}
            isRefreshing={isRefreshing}
            onImport={handleImport}
            onExport={handleExport}
            hasUserData={backups.length > 0}
            isCheckingData={isDetecting}
            onBackupAndRestart={handleBackupAndRestart}
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
            />
          </div>

          <StatusNotification
            status={status}
          />
        </>
      )}

      {/* 路径选择对话框 */}
      <AntigravityPathDialog
        isOpen={isPathDialogOpen}
        onPathSelected={handlePathSelected}
        onCancel={handlePathDialogCancel}
      />

      {/* 设置对话框 */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </TooltipProvider>
  );
}

export default App;
