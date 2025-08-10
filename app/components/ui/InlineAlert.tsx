'use client';

interface InlineAlertProps {
  type: 'success' | 'error';
  message: string;
  onDismiss?: () => void;
}

const InlineAlert = ({ type, message, onDismiss }: InlineAlertProps) => {
  const baseClasses = "px-4 py-3 rounded border flex items-start space-x-3";
  const typeClasses = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700"
  };

  const icons = {
    success: "✅",
    error: "❌"
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <div className="flex-shrink-0">
        <span className="text-lg">{icons[type]}</span>
      </div>
      <div className="flex-1">
        <p className="font-medium">{type === 'success' ? 'Success' : 'Error'}</p>
        <p className="text-sm">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-auto pl-3 text-lg hover:opacity-70 transition-opacity"
          title="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default InlineAlert;
