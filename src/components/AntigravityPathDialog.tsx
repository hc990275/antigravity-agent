import React, { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { AntigravityPathService } from '../services/antigravity-path-service';

interface AntigravityPathDialogProps {
    isOpen: boolean;
    onPathSelected: () => void;
    onCancel: () => void;
}

const AntigravityPathDialog: React.FC<AntigravityPathDialogProps> = ({
    isOpen,
    onPathSelected,
    onCancel,
}) => {
    const [dataPath, setDataPath] = useState<string>('');
    const [isDataPathValid, setIsDataPathValid] = useState(false);
    const [isValidatingData, setIsValidatingData] = useState(false);

    const [execPath, setExecPath] = useState<string>('');
    const [isExecPathValid, setIsExecPathValid] = useState(false);
    const [isValidatingExec, setIsValidatingExec] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    if (!isOpen) return null;

    const handleBrowseDataPath = async () => {
        try {
            const result = await open({
                directory: true,
                multiple: false,
                title: '选择 Antigravity 数据目录',
            });

            if (result && typeof result === 'string') {
                setDataPath(result);
                setErrorMessage('');

                setIsValidatingData(true);
                const valid = await AntigravityPathService.validatePath(result);
                setIsValidatingData(false);

                setIsDataPathValid(valid);
                if (!valid) {
                    setErrorMessage('此目录中未找到 state.vscdb 文件');
                }
            }
        } catch (error) {
            console.error('选择数据目录失败:', error);
            setErrorMessage(`选择失败: ${error}`);
        }
    };

    const handleBrowseExecPath = async () => {
        try {
            const result = await open({
                directory: false,
                multiple: false,
                title: '选择 Antigravity 可执行文件',
                filters: [
                    { name: '可执行文件', extensions: ['exe', 'app', ''] },
                    { name: '所有文件', extensions: ['*'] }
                ]
            });

            if (result && typeof result === 'string') {
                setExecPath(result);
                setErrorMessage('');

                setIsValidatingExec(true);
                const valid = await AntigravityPathService.validateExecutable(result);
                setIsValidatingExec(false);

                setIsExecPathValid(valid);
                if (!valid) {
                    setErrorMessage('所选文件不是有效的可执行文件');
                }
            }
        } catch (error) {
            console.error('选择可执行文件失败:', error);
            setErrorMessage(`选择失败: ${error}`);
        }
    };

    const handleSave = async () => {
        if (!dataPath || !isDataPathValid) {
            setErrorMessage('请先选择有效的数据目录');
            return;
        }

        try {
            setIsSaving(true);

            await AntigravityPathService.savePath(dataPath);

            if (execPath && isExecPathValid) {
                await AntigravityPathService.saveExecutable(execPath);
            }

            setIsSaving(false);
            onPathSelected();
        } catch (error) {
            setIsSaving(false);
            setErrorMessage(`保存失败: ${error}`);
        }
    };

    const canSave = isDataPathValid && !isSaving;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    配置 Antigravity 路径
                </h2>

                <p className="text-gray-600 mb-6">
                    无法自动检测到 Antigravity，请手动配置以下路径：
                </p>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                            1. 数据目录 <span className="text-red-500">*</span>
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                        包含 <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">state.vscdb</code> 文件的目录
                    </p>

                    <button
                        onClick={handleBrowseDataPath}
                        disabled={isValidatingData || isSaving}
                        className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                    >
                        {isValidatingData ? '验证中...' : '浏览数据目录...'}
                    </button>

                    {dataPath && (
                        <div className="mt-2">
                            <p className="text-xs bg-gray-100 p-2 rounded break-all text-gray-700">
                                {dataPath}
                            </p>
                            {isDataPathValid && (
                                <p className="text-xs text-green-600 mt-1">✅ 路径有效</p>
                            )}
                        </div>
                    )}

                    <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            常见位置参考
                        </summary>
                        <ul className="text-xs text-gray-500 list-disc list-inside space-y-1 mt-1 ml-2">
                            <li>Windows: <code>%APPDATA%\Antigravity\User\globalStorage</code></li>
                            <li>macOS: <code>~/Library/Application Support/Antigravity/User/globalStorage</code></li>
                            <li>Linux: <code>~/.config/Antigravity/User/globalStorage</code></li>
                        </ul>
                    </details>
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                            2. 可执行文件 <span className="text-gray-400">(可选)</span>
                        </h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                        用于启动 Antigravity 应用程序
                    </p>

                    <button
                        onClick={handleBrowseExecPath}
                        disabled={isValidatingExec || isSaving}
                        className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                    >
                        {isValidatingExec ? '验证中...' : '浏览可执行文件...'}
                    </button>

                    {execPath && (
                        <div className="mt-2">
                            <p className="text-xs bg-gray-100 p-2 rounded break-all text-gray-700">
                                {execPath}
                            </p>
                            {isExecPathValid && (
                                <p className="text-xs text-green-600 mt-1">✅ 文件有效</p>
                            )}
                        </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                        💡 如果跳过此步骤，启动功能可能不可用
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        退出应用
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!canSave}
                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? '保存中...' : '保存并继续'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AntigravityPathDialog;
