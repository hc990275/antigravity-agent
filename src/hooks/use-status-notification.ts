import { useState, useCallback, useRef, useEffect } from 'react';

interface Status {
  message: string;
  isError: boolean;
}

interface UseStatusNotification {
  status: Status;
  showStatus: (message: string, isError?: boolean) => void;
}

export const useStatusNotification = (timeoutMs: number = 5000): UseStatusNotification => {
  const [status, setStatus] = useState<Status>({
    message: '',
    isError: false
  });

  // 使用 useRef 存储定时器引用，避免内存泄漏
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const showStatus = useCallback((message: string, isError: boolean = false) => {
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setStatus({ message, isError });

    // 自动清除状态消息
    if (message) {
      timeoutRef.current = setTimeout(() => {
        setStatus({ message: '', isError: false });
        timeoutRef.current = null;
      }, timeoutMs);
    }
  }, [timeoutMs]);

  return {
    status,
    showStatus
  };
};
