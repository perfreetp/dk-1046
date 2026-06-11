import { Hash, FileBox, Users, LayoutList, Plus } from 'lucide-react';
import { useStore } from '../../store';
import { Channel } from '../../types';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onCreateChannel: () => void;
}

export default function Sidebar({ currentView, onViewChange, onCreateChannel }: SidebarProps) {
  const { channels, currentChannel, setCurrentChannel, tasks, currentUser } = useStore();
  
  const activeChannels = channels.filter(ch => !ch.isArchived);
  const archivedChannels = channels.filter(ch => ch.isArchived);
  
  const myTasks = tasks.filter(t => 
    t.assigneeId === currentUser.id && t.status !== 'completed'
  );
  
  const unreadCount = activeChannels.reduce((sum, ch) => sum + ch.unreadCount, 0);
  
  const getCategoryIcon = (category: string) => {
    return <Hash className="w-4 h-4" />;
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency': return 'text-red-400';
      case 'task': return 'text-blue-400';
      case 'general': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-64 bg-[#1E3A5F] border-r border-[#2C3E50] flex flex-col">
      <div className="p-4 border-b border-[#2C3E50]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-300">功能模块</h2>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => onViewChange('channels')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'channels' 
                ? 'bg-[#2C3E50] text-white' 
                : 'text-gray-300 hover:bg-[#2C3E50]/50'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">频道列表</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => onViewChange('files')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'files' 
                ? 'bg-[#2C3E50] text-white' 
                : 'text-gray-300 hover:bg-[#2C3E50]/50'
            }`}
          >
            <FileBox className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">文件箱</span>
          </button>
          
          <button
            onClick={() => onViewChange('members')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'members' 
                ? 'bg-[#2C3E50] text-white' 
                : 'text-gray-300 hover:bg-[#2C3E50]/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">人员状态</span>
          </button>
          
          <button
            onClick={() => onViewChange('kanban')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              currentView === 'kanban' 
                ? 'bg-[#2C3E50] text-white' 
                : 'text-gray-300 hover:bg-[#2C3E50]/50'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span className="flex-1 text-left text-sm">事件看板</span>
            {myTasks.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                {myTasks.length}
              </span>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase">频道</h3>
            <button
              onClick={onCreateChannel}
              className="p-1 text-gray-400 hover:text-white hover:bg-[#2C3E50] rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1">
            {activeChannels.map(channel => (
              <button
                key={channel.id}
                onClick={() => {
                  setCurrentChannel(channel);
                  onViewChange('channels');
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  currentChannel?.id === channel.id
                    ? 'bg-[#2C3E50] text-white'
                    : 'text-gray-300 hover:bg-[#2C3E50]/50'
                }`}
              >
                {getCategoryIcon(channel.category)}
                <span className={`flex-1 text-left text-sm truncate ${
                  currentChannel?.id === channel.id ? 'text-white' : ''
                }`}>
                  {channel.name}
                </span>
                {channel.unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                    {channel.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {archivedChannels.length > 0 && (
            <>
              <div className="mt-6 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase">已归档</h3>
              </div>
              <div className="space-y-1">
                {archivedChannels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setCurrentChannel(channel);
                      onViewChange('channels');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-[#2C3E50]/30 transition-colors"
                  >
                    {getCategoryIcon(channel.category)}
                    <span className="flex-1 text-left text-sm truncate">
                      {channel.name}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
