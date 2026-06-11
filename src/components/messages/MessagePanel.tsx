import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store';
import { formatMessageTime } from '../../utils/dateUtils';
import { Message } from '../../types';
import { Check, CheckCheck, Image, FileText, Mic, AtSign, Play, Pause, Download, MoreVertical, CheckSquare, X } from 'lucide-react';
import { exportChannelMessages } from '../../utils/exportUtils';

export default function MessagePanel() {
  const { currentChannel, messages, members, currentUser, markAsRead } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const channelMessages = currentChannel 
    ? messages[currentChannel.id] || [] 
    : [];
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages]);
  
  useEffect(() => {
    if (currentChannel && channelMessages.length > 0) {
      channelMessages.forEach(msg => {
        if (!msg.readBy.includes(currentUser.id)) {
          markAsRead(msg.id, currentChannel.id, currentUser.id);
        }
      });
    }
  }, [currentChannel, channelMessages.length]);
  
  const handleExport = () => {
    if (!currentChannel || channelMessages.length === 0) {
      alert('当前频道没有消息可导出');
      return;
    }
    exportChannelMessages(channelMessages, currentChannel.name, members);
  };
  
  if (!currentChannel) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0F1419]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#2C3E50] rounded-full flex items-center justify-center">
            <AtSign className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">选择一个频道开始聊天</h3>
          <p className="text-sm text-gray-500">从左侧列表选择频道或创建新频道</p>
        </div>
      </div>
    );
  }
  
  const getMember = (memberId: string) => members.find(m => m.id === memberId);
  
  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      case 'voice': return <Mic className="w-4 h-4" />;
      default: return null;
    }
  };
  
  const isReadByAll = (msg: Message) => {
    const allMembers = currentChannel.members;
    return allMembers.every(memberId => msg.readBy.includes(memberId));
  };
  
  return (
    <div className="flex-1 flex flex-col bg-[#0F1419]">
      <div className="h-14 border-b border-[#2C3E50] flex items-center justify-between px-6 bg-[#1E3A5F]">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">{currentChannel.name}</h2>
          <p className="text-xs text-gray-400">{currentChannel.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{currentChannel.members.length} 位成员</span>
            <span className="text-gray-600">•</span>
            <span>{channelMessages.length} 条消息</span>
          </div>
          <button
            onClick={handleExport}
            disabled={channelMessages.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#2C3E50] text-white rounded-lg hover:bg-[#34495E] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            导出记录
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {channelMessages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无消息，发送第一条消息开始对话</p>
          </div>
        ) : (
          channelMessages.map(message => {
            const sender = getMember(message.senderId);
            const isOwnMessage = message.senderId === currentUser.id;
            
            return (
              <MessageItem
                key={message.id}
                message={message}
                sender={sender}
                isOwnMessage={isOwnMessage}
                isReadByAll={isReadByAll(message)}
                currentChannel={currentChannel}
                members={members}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

interface MessageItemProps {
  message: Message;
  sender: any;
  isOwnMessage: boolean;
  isReadByAll: boolean;
  currentChannel: any;
  members: any[];
}

function MessageItem({ message, sender, isOwnMessage, isReadByAll, currentChannel, members }: MessageItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const { addTask, addTaskActivity, linkMessageToTask, currentUser } = useStore();
  
  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      case 'voice': return <Mic className="w-4 h-4" />;
      default: return null;
    }
  };
  
  const handleConvertToTask = () => {
    setShowMenu(false);
    setShowCreateTask(true);
  };
  
  const handleCreateTask = (taskData: any) => {
    const newTaskId = addTask({
      channelId: currentChannel.id,
      title: taskData.title,
      description: `${message.content}\n\n---\n转自消息`,
      assigneeId: taskData.assigneeId,
      priority: taskData.priority,
      status: 'todo',
      dueDate: Date.now() + 86400000
    });
    
    if (newTaskId && message.mentions.length > 0) {
      linkMessageToTask(newTaskId, message.id, currentChannel.id);
    }
    
    setShowCreateTask(false);
  };
  
  return (
    <>
      <div
        className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(true);
        }}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
          isOwnMessage 
            ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
            : 'bg-gradient-to-br from-gray-500 to-gray-700'
        }`}>
          {sender?.name.charAt(0) || '?'}
        </div>
        
        <div className={`flex-1 max-w-2xl ${isOwnMessage ? 'text-right' : ''}`}>
          <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
            <span className="text-sm font-medium text-white">{sender?.name}</span>
            <span className="text-xs text-gray-500">
              {formatMessageTime(message.createdAt)}
            </span>
            {message.mentions.length > 0 && (
              <span className="text-xs text-orange-400 flex items-center gap-1">
                <AtSign className="w-3 h-3" />
                @提及
              </span>
            )}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-white hover:bg-[#34495E] rounded transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className={`absolute top-full mt-1 w-40 bg-[#2C3E50] border border-[#34495E] rounded-lg shadow-xl z-10 ${
                  isOwnMessage ? 'right-0' : 'left-0'
                }`}>
                  <button
                    onClick={handleConvertToTask}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#34495E] transition-colors text-sm text-white"
                  >
                    <CheckSquare className="w-4 h-4" />
                    转为待办
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className={`inline-block px-4 py-2 rounded-lg ${
            isOwnMessage 
              ? 'bg-[#E67E22] text-white' 
              : 'bg-[#2C3E50] text-white'
          }`}>
            {message.type === 'voice' ? (
              <VoiceMessage message={message} />
            ) : (
              <>
                <p className="text-sm">{message.content}</p>
                
                {message.attachmentUrl && (
                  <div className="mt-2">
                    {message.type === 'image' ? (
                      <img
                        src={message.attachmentUrl}
                        alt={message.attachmentName}
                        className="max-w-md rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center gap-2 bg-[#34495E] p-2 rounded">
                        {getMessageIcon(message.type)}
                        <span className="text-sm">{message.attachmentName}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : ''}`}>
            {isOwnMessage && (
              isReadByAll ? (
                <CheckCheck className="w-4 h-4 text-green-400" />
              ) : message.readBy.length > 1 ? (
                <CheckCheck className="w-4 h-4 text-gray-400" />
              ) : (
                <Check className="w-4 h-4 text-gray-400" />
              )
            )}
            <span className="text-xs text-gray-500">
              {message.readBy.length} 人已读
            </span>
          </div>
        </div>
      </div>
      
      {showMenu && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setShowMenu(false)}
        />
      )}
      
      {showCreateTask && (
        <CreateTaskFromMessage
          message={message}
          onClose={() => setShowCreateTask(false)}
          onCreate={handleCreateTask}
        />
      )}
    </>
  );
}

function VoiceMessage({ message }: { message: Message }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const duration = message.duration || 0;
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      <audio ref={audioRef} src={message.attachmentUrl} />
      
      <button
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white ml-0.5" />
        )}
      </button>
      
      <div className="flex-1">
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-white/70">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

function CreateTaskFromMessage({ message, onClose, onCreate }: {
  message: Message;
  onClose: () => void;
  onCreate: (data: any) => void;
}) {
  const { members, channels, currentChannel, currentUser } = useStore();
  const [title, setTitle] = useState(message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''));
  const [assigneeId, setAssigneeId] = useState(message.senderId || currentUser.id);
  const [priority, setPriority] = useState<'urgent' | 'important' | 'normal'>('normal');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onCreate({
      title: title.trim(),
      assigneeId,
      priority
    });
  };
  
  const mentionedMembers = message.mentions.map(id => members.find(m => m.id === id)).filter(Boolean);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1E3A5F] rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">将消息转为待办</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#2C3E50] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-[#2C3E50] rounded-lg">
          <p className="text-sm text-gray-300 line-clamp-3">{message.content}</p>
          {mentionedMembers.length > 0 && (
            <p className="text-xs text-orange-400 mt-2">
              @提及: {mentionedMembers.map(m => m?.name).join(', ')}
            </p>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              待办标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              负责人
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
            >
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.position}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              优先级
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'normal', label: '一般', color: 'blue' },
                { value: 'important', label: '重要', color: 'orange' },
                { value: 'urgent', label: '紧急', color: 'red' }
              ].map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    priority === p.value
                      ? p.color === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                        p.color === 'orange' ? 'bg-orange-500/20 text-orange-400 border border-orange-500' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500'
                      : 'bg-[#2C3E50] text-gray-300 border border-[#34495E] hover:border-gray-500'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[#2C3E50] text-gray-300 rounded-lg hover:bg-[#34495E] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#D35400] transition-colors"
            >
              创建待办
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
