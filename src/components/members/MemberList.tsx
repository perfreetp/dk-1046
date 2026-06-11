import { useState } from 'react';
import { Search, Filter, Mail, Phone, MapPin, Clock, X } from 'lucide-react';
import { useStore } from '../../store';
import { Member } from '../../types';
import { formatRelativeTime } from '../../utils/dateUtils';

export default function MemberList() {
  const { members, currentUser, updateMemberStatus } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Member['status']>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  
  const statusColors = {
    online: 'bg-green-400',
    offline: 'bg-gray-400',
    busy: 'bg-red-400',
    away: 'bg-yellow-400'
  };
  
  const statusLabels = {
    online: '在线',
    offline: '离线',
    busy: '忙碌',
    away: '离开'
  };
  
  const getStatusCounts = () => {
    return {
      online: members.filter(m => m.status === 'online').length,
      offline: members.filter(m => m.status === 'offline').length,
      busy: members.filter(m => m.status === 'busy').length,
      away: members.filter(m => m.status === 'away').length
    };
  };
  
  const statusCounts = getStatusCounts();
  
  const handleStatusChange = (status: Member['status']) => {
    updateMemberStatus(currentUser.id, status);
  };
  
  return (
    <div className="flex-1 bg-[#0F1419] overflow-hidden flex flex-col">
      <div className="h-14 border-b border-[#2C3E50] flex items-center justify-between px-6 bg-[#1E3A5F]">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">人员状态</h2>
          <p className="text-xs text-gray-400">{members.length} 位成员</p>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span className="text-gray-300">{statusCounts.online} 在线</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            <span className="text-gray-300">{statusCounts.offline} 离线</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            <span className="text-gray-300">{statusCounts.busy} 忙碌</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            <span className="text-gray-300">{statusCounts.away} 离开</span>
          </span>
        </div>
      </div>
      
      <div className="p-6 space-y-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索成员姓名、岗位、部门..."
              className="w-full pl-10 pr-4 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67E22] text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
            >
              <option value="all">全部状态</option>
              <option value="online">在线</option>
              <option value="busy">忙碌</option>
              <option value="away">离开</option>
              <option value="offline">离线</option>
            </select>
          </div>
        </div>
        
        <div className="bg-[#2C3E50] rounded-lg p-4">
          <h3 className="text-sm font-medium text-white mb-3">设置我的状态</h3>
          <div className="grid grid-cols-4 gap-2">
            {(['online', 'busy', 'away', 'offline'] as const).map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  currentUser.status === status
                    ? status === 'online' ? 'bg-green-500/20 text-green-400 border border-green-500' :
                      status === 'busy' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                      status === 'away' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500' :
                      'bg-gray-500/20 text-gray-400 border border-gray-500'
                    : 'bg-[#1E3A5F] text-gray-300 hover:bg-[#34495E] border border-transparent'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${statusColors[status]}`}></span>
                <span className="text-sm">{statusLabels[status]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map(member => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="bg-[#2C3E50] rounded-lg p-4 hover:bg-[#34495E] transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {member.name.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#2C3E50] ${statusColors[member.status]}`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-medium text-white truncate">
                      {member.name}
                    </h3>
                    {member.id === currentUser.id && (
                      <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                        我
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{member.position}</p>
                  <p className="text-xs text-gray-500">{member.department}</p>
                </div>
                
                <div className="text-xs text-gray-500">
                  {statusLabels[member.status]}
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-[#34495E] flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {member.status === 'offline' 
                    ? `最后在线 ${formatRelativeTime(member.lastSeen)}`
                    : member.status === 'away'
                    ? `离开于 ${formatRelativeTime(member.lastSeen)}`
                    : '当前在线'}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  member.status === 'online' ? 'bg-green-500/20 text-green-400' :
                  member.status === 'busy' ? 'bg-red-500/20 text-red-400' :
                  member.status === 'away' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {statusLabels[member.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">未找到匹配的成员</p>
          </div>
        )}
      </div>
      
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-[#1E3A5F] rounded-lg w-full max-w-md p-6 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-[#1E3A5F] ${statusColors[selectedMember.status]}`}></div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedMember.name}</h2>
                  <p className="text-sm text-gray-400">{selectedMember.position}</p>
                  <p className="text-xs text-gray-500">{selectedMember.department}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 text-gray-400 hover:text-white hover:bg-[#2C3E50] rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-white">{selectedMember.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-white">{selectedMember.department}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">
                  {selectedMember.status === 'offline'
                    ? `最后在线: ${formatRelativeTime(selectedMember.lastSeen)}`
                    : `当前状态: ${statusLabels[selectedMember.status]}`}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-[#E67E22] text-white rounded-lg hover:bg-[#D35400] transition-colors">
                发送消息
              </button>
              <button className="flex-1 px-4 py-2 bg-[#2C3E50] text-white rounded-lg hover:bg-[#34495E] transition-colors">
                查看详情
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
