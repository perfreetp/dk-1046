import { HardDrive, Database, Clock, RefreshCw } from 'lucide-react';
import { useStore } from '../../store';

export default function StatusBar() {
  const { settings, files, resetToDemo } = useStore();
  
  const totalFileSize = files.reduce((sum, file) => sum + file.size, 0);
  const cacheSizeMB = (totalFileSize / (1024 * 1024)).toFixed(2);
  
  const handleResetToDemo = () => {
    if (confirm('确定要恢复演示数据吗？这将清除所有已保存的数据。')) {
      resetToDemo();
      window.location.reload();
    }
  };
  
  return (
    <div className="h-8 bg-[#1E3A5F] border-t border-[#2C3E50] flex items-center justify-between px-6 text-xs text-gray-400">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Database className="w-3 h-3" />
          <span>文件缓存: {cacheSizeMB} MB</span>
        </div>
        <div className="flex items-center gap-2">
          <HardDrive className="w-3 h-3" />
          <span>缓存限制: {settings.offlineCacheSize} MB</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>
            {settings.autoCleanup 
              ? `自动清理: ${settings.cleanupDays}天后过期文件` 
              : '自动清理: 关闭'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleResetToDemo}
          className="flex items-center gap-1 hover:text-white transition-colors"
          title="恢复演示数据"
        >
          <RefreshCw className="w-3 h-3" />
          <span>恢复数据</span>
        </button>
        <span>版本 1.0.0</span>
        <span>局域网协同平台</span>
      </div>
    </div>
  );
}
