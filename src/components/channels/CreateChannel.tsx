import { X } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store';

interface CreateChannelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateChannel({ isOpen, onClose }: CreateChannelProps) {
  const { addChannel, currentUser, members } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'emergency' | 'task' | 'general'>('task');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    addChannel({
      name: name.trim(),
      description: description.trim(),
      category,
      members: [...selectedMembers, currentUser.id],
      createdBy: currentUser.id,
      isArchived: false
    });
    
    setName('');
    setDescription('');
    setCategory('task');
    setSelectedMembers([]);
    onClose();
  };
  
  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1E3A5F] rounded-lg w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">创建新频道</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-[#2C3E50] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              频道名称 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：设备故障应急响应"
              className="w-full px-4 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              频道描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="简要描述频道用途..."
              rows={3}
              className="w-full px-4 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67E22] resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              频道类型
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'emergency', label: '紧急事件', color: 'red' },
                { value: 'task', label: '任务协作', color: 'blue' },
                { value: 'general', label: '一般讨论', color: 'gray' }
              ].map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setCategory(type.value as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    category === type.value
                      ? type.color === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                        type.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-500' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500'
                      : 'bg-[#2C3E50] text-gray-300 border border-[#34495E] hover:border-gray-500'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              添加成员
            </label>
            <div className="max-h-48 overflow-y-auto bg-[#2C3E50] border border-[#34495E] rounded-lg p-3 space-y-2">
              {members
                .filter(m => m.id !== currentUser.id)
                .map(member => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-[#34495E] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => toggleMember(member.id)}
                      className="w-4 h-4 rounded border-gray-500 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-white">{member.name}</div>
                      <div className="text-xs text-gray-400">{member.position}</div>
                    </div>
                  </label>
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
              创建频道
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
