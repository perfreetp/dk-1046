import { Search, Bell, Settings, Wifi, WifiOff } from 'lucide-react';
import { useStore } from '../../store';

export default function TopBar() {
  const { currentUser, connectionStatus, updateMemberStatus } = useStore();
  
  const statusColors = {
    connected: 'text-green-400',
    disconnected: 'text-red-400',
    syncing: 'text-yellow-400'
  };
  
  return (
    <div className="h-16 bg-[#1E3A5F] border-b border-[#2C3E50] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white">应急协同平台</h1>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          {connectionStatus === 'connected' ? (
            <Wifi className="w-4 h-4" />
          ) : connectionStatus === 'disconnected' ? (
            <WifiOff className="w-4 h-4" />
          ) : (
            <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          )}
          <span className={statusColors[connectionStatus]}>
            {connectionStatus === 'connected' && '已连接'}
            {connectionStatus === 'disconnected' && '已断开'}
            {connectionStatus === 'syncing' && '同步中'}
          </span>
        </div>
      </div>
      
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索频道、成员、文件..."
            className="w-full pl-10 pr-4 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67E22] transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-300 hover:text-white hover:bg-[#2C3E50] rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button className="p-2 text-gray-300 hover:text-white hover:bg-[#2C3E50] rounded-lg transition-colors">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-[#2C3E50]">
          <div className="text-right">
            <div className="text-sm font-medium text-white">{currentUser.name}</div>
            <div className="text-xs text-gray-400">{currentUser.position}</div>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1E3A5F] ${
              currentUser.status === 'online' ? 'bg-green-400' :
              currentUser.status === 'busy' ? 'bg-red-400' :
              currentUser.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
            }`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
