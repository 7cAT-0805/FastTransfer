import React from 'react';
import { AlertTriangle, X, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface ErrorDisplayProps {
  error: string | Error;
  onRetry?: () => void;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'network';
  title?: string;
  showRetry?: boolean;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  type = 'error',
  title,
  showRetry = true,
  className = ''
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  const getIcon = () => {
    switch (type) {
      case 'network':
        return WifiOff;
      case 'warning':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'network':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          message: 'text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700 text-white',
          secondaryButton: 'border-blue-300 text-blue-700 hover:bg-blue-50'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          message: 'text-yellow-800',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
          secondaryButton: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50'
        };
      default:
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-900',
          message: 'text-red-800',
          button: 'bg-red-600 hover:bg-red-700 text-white',
          secondaryButton: 'border-red-300 text-red-700 hover:bg-red-50'
        };
    }
  };

  const colors = getColorClasses();
  const Icon = getIcon();

  const getDefaultTitle = () => {
    switch (type) {
      case 'network':
        return '網路連線問題';
      case 'warning':
        return '注意';
      default:
        return '發生錯誤';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${colors.container} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-sm font-medium ${colors.title}`}>
                {title || getDefaultTitle()}
              </h3>
              <div className={`mt-1 text-sm ${colors.message}`}>
                <p>{errorMessage}</p>
              </div>
            </div>
            
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`ml-3 flex-shrink-0 p-1 rounded-md ${colors.secondaryButton} transition-colors`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {(onRetry && showRetry) && (
            <div className="mt-3 flex space-x-3">
              <button
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md ${colors.button} transition-colors`}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                重試
              </button>
              
              {type === 'network' && (
                <button
                  onClick={() => window.location.reload()}
                  className={`inline-flex items-center px-3 py-2 border rounded-md text-xs font-medium ${colors.secondaryButton} transition-colors`}
                >
                  <Wifi className="w-3 h-3 mr-1" />
                  重新載入頁面
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 預設的錯誤處理 Hook
export const useErrorHandler = () => {
  const [error, setError] = React.useState<string | null>(null);

  const handleError = React.useCallback((err: string | Error) => {
    const message = typeof err === 'string' ? err : err.message;
    setError(message);
    console.error('錯誤:', err);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};

// 網路錯誤專用組件
export const NetworkError: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay {...props} type="network" />
);

// 警告專用組件
export const WarningDisplay: React.FC<Omit<ErrorDisplayProps, 'type'>> = (props) => (
  <ErrorDisplay {...props} type="warning" />
);

export default ErrorDisplay;