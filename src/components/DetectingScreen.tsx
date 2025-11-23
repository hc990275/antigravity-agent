import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * 检测中界面
 * 在应用启动检测 Antigravity 时显示
 */
export function DetectingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="text-center">
                <Loader2 className="animate-spin h-16 w-16 mx-auto mb-6 text-blue-500" />
                <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                    正在检测 Antigravity...
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                    请稍候，正在查找 Antigravity 安装路径
                </p>
            </div>
        </div>
    );
}
