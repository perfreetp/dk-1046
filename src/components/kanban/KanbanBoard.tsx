import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useStore } from '../../store';
import { Task } from '../../types';
import TaskDetail from './TaskDetail';

export default function KanbanBoard() {
  const { tasks, channels, members, currentUser, updateTask, addTask } = useStore();
  const [, setForceUpdate] = useState(0);
  
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null);
  
  useEffect(() => {
    if (selectedTask) {
      const updatedTask = tasks.find(t => t.id === selectedTask.id);
      if (updatedTask && updatedTask.status !== selectedTask.status) {
        setSelectedTask(updatedTask);
      }
    }
  }, [tasks]);
  
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'inProgress');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };
  
  const handleDragLeave = () => {
    setDragOverColumn(null);
  };
  
  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== status) {
      updateTask(draggedTask.id, { status });
      
      if (selectedTask?.id === draggedTask.id) {
        const updatedTask = { ...selectedTask, status };
        setSelectedTask(updatedTask);
      }
    }
    setDraggedTask(null);
  };
  
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
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
  
  const getAssignee = (assigneeId: string) => members.find(m => m.id === assigneeId);
  
  const isOverdue = (dueDate: number) => dueDate < Date.now();
  
  const renderTaskCard = (task: Task) => {
    const assignee = getAssignee(task.assigneeId);
    const channel = channels.find(ch => ch.id === task.channelId);
    const isSelected = selectedTask?.id === task.id;
    
    return (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        onDragEnd={handleDragEnd}
        onClick={() => setSelectedTask(task)}
        className={`bg-[#2C3E50] rounded-lg p-3 cursor-pointer hover:bg-[#34495E] transition-all border-l-4 ${
          task.priority === 'urgent' ? 'border-red-500' :
          task.priority === 'important' ? 'border-orange-500' :
          'border-blue-500'
        } ${draggedTask?.id === task.id ? 'opacity-50' : ''} ${
          isSelected ? 'ring-2 ring-[#E67E22]' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-sm font-medium text-white flex-1">{task.title}</h4>
          <button className="p-1 text-gray-400 hover:text-white hover:bg-[#1E3A5F] rounded transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </span>
          {channel && (
            <span className="px-2 py-0.5 text-xs bg-[#1E3A5F] text-gray-400 rounded">
              {channel.name}
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {assignee && (
              <>
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {assignee.name.charAt(0)}
                </div>
                <span className="text-xs text-gray-400">{assignee.name}</span>
              </>
            )}
          </div>
          
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue(task.dueDate) && task.status !== 'completed'
              ? 'text-red-400'
              : 'text-gray-500'
          }`}>
            <Clock className="w-3 h-3" />
            <span>{formatTaskDueDate(task.dueDate)}</span>
          </div>
        </div>
        
        {task.status === 'completed' && (
          <div className="mt-2 pt-2 border-t border-[#34495E] flex items-center gap-1 text-green-400 text-xs">
            <CheckCircle className="w-3 h-3" />
            <span>已完成</span>
          </div>
        )}
      </div>
    );
  };
  
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
  
  const renderColumn = (title: string, columnTasks: Task[], status: Task['status'], color: string) => (
    <div
      onDragOver={(e) => handleDragOver(e, status)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, status)}
      className={`flex-1 min-w-[300px] bg-[#1E3A5F]/30 rounded-lg p-4 transition-all ${
        dragOverColumn === status ? 'ring-2 ring-[#E67E22] ring-opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="px-2 py-0.5 text-xs bg-[#2C3E50] text-gray-400 rounded-full">
          {columnTasks.length}
        </span>
      </div>
      
      <div className="space-y-3 min-h-[200px]">
        {columnTasks.map(task => renderTaskCard(task))}
        
        {columnTasks.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-[#34495E] rounded-lg text-gray-500 text-sm">
            拖拽任务到这里
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="flex-1 bg-[#0F1419] overflow-hidden flex flex-col">
      <div className="h-14 border-b border-[#2C3E50] flex items-center justify-between px-6 bg-[#1E3A5F]">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">事件看板</h2>
          <p className="text-xs text-gray-400">
            {tasks.length} 个任务，{completedTasks.length} 已完成
          </p>
        </div>
        <button
          onClick={() => setShowCreateTask(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#D35400] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          创建待办
        </button>
      </div>
      
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full min-w-max">
          {renderColumn('待处理', todoTasks, 'todo', 'bg-gray-400')}
          {renderColumn('进行中', inProgressTasks, 'inProgress', 'bg-blue-400')}
          {renderColumn('已完成', completedTasks, 'completed', 'bg-green-400')}
        </div>
      </div>
      
      {showCreateTask && (
        <CreateTaskModal onClose={() => setShowCreateTask(false)} />
      )}
      
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={setSelectedTask}
        />
      )}
    </div>
  );
}

function CreateTaskModal({ onClose }: { onClose: () => void }) {
  const { channels, members, currentUser, addTask } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState(currentUser.id);
  const [priority, setPriority] = useState<Task['priority']>('normal');
  const [channelId, setChannelId] = useState(channels[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !channelId) return;
    
    addTask({
      channelId,
      title: title.trim(),
      description: description.trim(),
      assigneeId,
      priority,
      status: 'todo',
      dueDate: dueDate ? new Date(dueDate).getTime() : Date.now() + 86400000
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1E3A5F] rounded-lg w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">创建待办事项</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#2C3E50] rounded transition-colors"
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              任务标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题"
              className="w-full px-4 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              任务描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="详细描述任务内容..."
              rows={3}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67E22] resize-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                所属频道
              </label>
              <select
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="w-full px-4 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
              >
                {channels.map(channel => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
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
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
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
                    onClick={() => setPriority(p.value as Task['priority'])}
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
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                截止日期
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
              />
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
