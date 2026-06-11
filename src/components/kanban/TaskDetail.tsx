import { X, Clock, User, CheckCircle, Trash2, Edit2, MessageSquare, Activity, FileText, GitBranch, ChevronDown, Paperclip } from 'lucide-react';
import { useStore } from '../../store';
import { Task, TaskActivity } from '../../types';
import { formatDateTime } from '../../utils/dateUtils';
import { useState, useEffect, useRef } from 'react';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onUpdate?: (task: Task) => void;
}

const formatTaskDueDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `已逾期 ${Math.abs(diffDays)} 天`;
  }
  if (diffDays === 0) {
    return '今天截止';
  }
  if (diffDays === 1) {
    return '明天截止';
  }
  return `${diffDays}天后截止`;
};

const getActivityIcon = (type: TaskActivity['type']) => {
  switch (type) {
    case 'created':
      return <GitBranch className="w-4 h-4" />;
    case 'status_changed':
    case 'completed':
      return <Activity className="w-4 h-4" />;
    case 'assigned':
      return <User className="w-4 h-4" />;
    case 'priority_changed':
      return <Edit2 className="w-4 h-4" />;
    case 'message_linked':
      return <MessageSquare className="w-4 h-4" />;
    case 'file_attached':
      return <FileText className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getActivityColor = (type: TaskActivity['type']) => {
  switch (type) {
    case 'created':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-green-500';
    case 'status_changed':
      return 'bg-purple-500';
    case 'assigned':
      return 'bg-orange-500';
    case 'priority_changed':
      return 'bg-yellow-500';
    case 'message_linked':
      return 'bg-cyan-500';
    case 'file_attached':
      return 'bg-indigo-500';
    default:
      return 'bg-gray-500';
  }
};

export default function TaskDetail({ task, onClose, onUpdate }: TaskDetailProps) {
  const { channels, members, updateTask, deleteTask, currentUser, tasks, setCurrentChannel, messages, addTaskActivity, files } = useStore();
  const [showSourceMessage, setShowSourceMessage] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  
  const channel = channels.find(ch => ch.id === task.channelId);
  const assignee = members.find(m => m.id === task.assigneeId);
  const isAssignee = task.assigneeId === currentUser.id;
  const channelFiles = files.filter(f => f.channelId === task.channelId);
  
  const linkedMessage = task.linkedMessageId && task.activities?.find(
    a => a.type === 'message_linked' && a.metadata?.messageId === task.linkedMessageId
  );
  
  const sourceMessage = task.sourceMessageInfo ? {
    message: messages[task.sourceMessageInfo.channelId]?.find(m => m.id === task.sourceMessageInfo?.messageId),
    channel: channels.find(c => c.id === task.sourceMessageInfo?.channelId)
  } : null;
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        setShowAssigneeDropdown(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setShowPriorityDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleStatusChange = (newStatus: Task['status']) => {
    updateTask(task.id, { status: newStatus });
    if (onUpdate) {
      onUpdate({ ...task, status: newStatus });
    }
  };
  
  const handleAssigneeChange = (newAssigneeId: string) => {
    updateTask(task.id, { assigneeId: newAssigneeId });
    setShowAssigneeDropdown(false);
    if (onUpdate) {
      onUpdate({ ...task, assigneeId: newAssigneeId });
    }
  };
  
  const handlePriorityChange = (newPriority: Task['priority']) => {
    updateTask(task.id, { priority: newPriority });
    setShowPriorityDropdown(false);
    if (onUpdate) {
      onUpdate({ ...task, priority: newPriority });
    }
  };
  
  const handleAttachFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      addTaskActivity(task.id, {
        type: 'file_attached',
        description: `添加了附件"${file.name}"`,
        performedBy: currentUser.id,
        metadata: {
          fileId: file.id,
          fileName: file.name
        }
      });
    }
    setShowFileSelector(false);
  };
  
  const handleDelete = () => {
    if (confirm('确定要删除这个任务吗？')) {
      deleteTask(task.id);
      onClose();
    }
  };
  
  const handleViewSourceMessage = () => {
    if (task.sourceMessageInfo) {
      const targetChannel = channels.find(c => c.id === task.sourceMessageInfo.channelId);
      if (targetChannel) {
        setCurrentChannel(targetChannel);
        setTimeout(() => {
          const messageElement = document.querySelector(`[data-message-id="${task.sourceMessageInfo?.messageId}"]`);
          if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('ring-2', 'ring-yellow-400');
            setTimeout(() => {
              messageElement.classList.remove('ring-2', 'ring-yellow-400');
            }, 3000);
          }
        }, 100);
        onClose();
      }
    } else if (linkedMessage?.metadata?.channelId) {
      const targetChannel = channels.find(c => c.id === linkedMessage.metadata?.channelId);
      if (targetChannel) {
        setCurrentChannel(targetChannel);
        setTimeout(() => {
          const messageElement = document.querySelector(`[data-message-id="${linkedMessage.metadata?.messageId}"]`);
          if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('ring-2', 'ring-yellow-400');
            setTimeout(() => {
              messageElement.classList.remove('ring-2', 'ring-yellow-400');
            }, 3000);
          }
        }, 100);
        onClose();
      }
    }
  };
  
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500';
      case 'important': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500';
    }
  };
  
  const getPriorityLabel = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return '紧急';
      case 'important': return '重要';
      default: return '一般';
    }
  };
  
  const isOverdue = task.dueDate < Date.now() && task.status !== 'completed';
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="bg-[#1E3A5F] rounded-lg w-full max-w-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-white">{task.title}</h2>
              <span className={`px-3 py-1 text-sm rounded border ${getPriorityColor(task.priority)}`}>
                {getPriorityLabel(task.priority)}
              </span>
            </div>
            {channel && (
              <p className="text-sm text-gray-400">所属频道: {channel.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2C3E50] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {task.description && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-2">任务描述</h3>
            <p className="text-white bg-[#2C3E50] rounded-lg p-4">
              {task.description}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#2C3E50] rounded-lg p-4 relative" ref={assigneeDropdownRef}>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">负责人</span>
              <button
                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                className="ml-auto p-1 hover:bg-[#34495E] rounded transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            {assignee && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {assignee.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium">{assignee.name}</p>
                  <p className="text-xs text-gray-400">{assignee.position}</p>
                </div>
              </div>
            )}
            
            {showAssigneeDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#34495E] border border-[#4A5568] rounded-lg shadow-xl z-10 max-h-48 overflow-y-auto">
                {members.map(member => (
                  <button
                    key={member.id}
                    onClick={() => handleAssigneeChange(member.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-[#4A5568] transition-colors ${
                      member.id === task.assigneeId ? 'bg-[#E67E22]/20' : ''
                    }`}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white text-sm">{member.name}</p>
                      <p className="text-gray-400 text-xs">{member.position}</p>
                    </div>
                    {member.id === task.assigneeId && (
                      <CheckCircle className="w-4 h-4 text-[#E67E22]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-[#2C3E50] rounded-lg p-4 relative" ref={priorityDropdownRef}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-400">优先级</span>
              <button
                onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                className="ml-auto p-1 hover:bg-[#34495E] rounded transition-colors"
              >
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-sm rounded border ${getPriorityColor(task.priority)}`}>
                {getPriorityLabel(task.priority)}
              </span>
            </div>
            
            {showPriorityDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#34495E] border border-[#4A5568] rounded-lg shadow-xl z-10">
                {(['urgent', 'important', 'normal'] as const).map(priority => (
                  <button
                    key={priority}
                    onClick={() => handlePriorityChange(priority)}
                    className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-[#4A5568] transition-colors ${
                      priority === task.priority ? 'bg-[#E67E22]/20' : ''
                    }`}
                  >
                    <span className={`px-3 py-1 text-sm rounded border ${getPriorityColor(priority)}`}>
                      {getPriorityLabel(priority)}
                    </span>
                    {priority === task.priority && (
                      <CheckCircle className="w-4 h-4 text-[#E67E22] ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            截止日期
          </h3>
          <div className="bg-[#2C3E50] rounded-lg p-4">
            <p className={`text-lg font-semibold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
              {formatTaskDueDate(task.dueDate)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDateTime(task.dueDate)}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Paperclip className="w-4 h-4" />
            关联文件
            <button
              onClick={() => setShowFileSelector(!showFileSelector)}
              className="ml-auto px-3 py-1 bg-[#E67E22] text-white text-xs rounded hover:bg-[#D35400] transition-colors"
            >
              添加文件
            </button>
          </h3>
          {showFileSelector && (
            <div className="bg-[#2C3E50] rounded-lg p-4 mb-3 max-h-48 overflow-y-auto">
              {channelFiles.length > 0 ? (
                <div className="space-y-2">
                  {channelFiles.map(file => (
                    <button
                      key={file.id}
                      onClick={() => handleAttachFile(file.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-[#34495E] hover:bg-[#4A5568] rounded transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-white text-sm">{file.name}</p>
                        <p className="text-gray-400 text-xs">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center">该频道暂无文件</p>
              )}
            </div>
          )}
          <div className="bg-[#2C3E50] rounded-lg p-4">
            {task.activities?.filter(a => a.type === 'file_attached').length > 0 ? (
              <div className="space-y-2">
                {task.activities.filter(a => a.type === 'file_attached').map(activity => (
                  <div key={activity.id} className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className="text-gray-300">{activity.metadata?.fileName}</span>
                    <span className="text-gray-500 text-xs ml-auto">
                      {formatDateTime(activity.performedAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">暂无关联文件</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">任务状态</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleStatusChange('todo')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                task.status === 'todo'
                  ? 'bg-gray-500/20 text-gray-400 border-2 border-gray-500'
                  : 'bg-[#2C3E50] text-gray-300 hover:bg-[#34495E] border-2 border-transparent'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span className="text-sm font-medium">待处理</span>
            </button>
            
            <button
              onClick={() => handleStatusChange('inProgress')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                task.status === 'inProgress'
                  ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500'
                  : 'bg-[#2C3E50] text-gray-300 hover:bg-[#34495E] border-2 border-transparent'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-sm font-medium">进行中</span>
            </button>
            
            <button
              onClick={() => handleStatusChange('completed')}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                task.status === 'completed'
                  ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                  : 'bg-[#2C3E50] text-gray-300 hover:bg-[#34495E] border-2 border-transparent'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">已完成</span>
            </button>
          </div>
        </div>
        
        {task.status === 'completed' && task.completedAt && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">任务已完成</span>
            </div>
            <p className="text-sm text-green-400/80 mt-1">
              完成时间: {formatDateTime(task.completedAt)}
            </p>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            处置时间线
          </h3>
          <div className="bg-[#2C3E50] rounded-lg p-4 max-h-64 overflow-y-auto">
            {task.activities && task.activities.length > 0 ? (
              <div className="space-y-3">
                {[...task.activities].reverse().map((activity, index) => {
                  const performer = members.find(m => m.id === activity.performedBy);
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {performer?.name || '系统'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDateTime(activity.performedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{activity.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">暂无处置记录</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          {isAssignee && task.status !== 'completed' && (
            <button
              onClick={() => handleStatusChange('completed')}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              标记完成
            </button>
          )}
          
          {(task.sourceMessageInfo || linkedMessage) && (
            <button
              onClick={handleViewSourceMessage}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              {task.sourceMessageInfo ? `查看来源消息 (${task.sourceMessageInfo.channelName})` : '查看来源消息'}
            </button>
          )}
          
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2C3E50] text-white rounded-lg hover:bg-[#34495E] transition-colors">
            <Edit2 className="w-4 h-4" />
            编辑
          </button>
          
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
        
        {task.sourceMessageInfo && (
          <div className="mt-4 p-4 bg-[#2C3E50] rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              来源消息
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">频道:</span>
                <span className="text-white">{task.sourceMessageInfo.channelName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">发送者:</span>
                <span className="text-white">{task.sourceMessageInfo.senderName}</span>
              </div>
              {task.sourceMessageInfo.mentions && task.sourceMessageInfo.mentions.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">@提及:</span>
                  <span className="text-orange-400">
                    {task.sourceMessageInfo.mentions.map(id => members.find(m => m.id === id)?.name).filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-[#34495E]">
                <p className="text-gray-300 line-clamp-3">{task.sourceMessageInfo.content}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
