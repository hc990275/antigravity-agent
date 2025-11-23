import React from 'react';
import AntigravityPathDialog from './AntigravityPathDialog';

interface PathNotFoundScreenProps {
    onPathSelected: () => void;
    onCancel: () => Promise<void>;
}

/**
 * 路径未找到界面
 * 当检测不到 Antigravity 时显示，要求用户手动选择路径
 */
export function PathNotFoundScreen({ onPathSelected, onCancel }: PathNotFoundScreenProps) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <AntigravityPathDialog
                isOpen={true}
                onPathSelected={onPathSelected}
                onCancel={onCancel}
            />
        </div>
    );
}
