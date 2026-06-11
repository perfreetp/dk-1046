import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { useStore } from '../../store';
import { getFileType, validateFile } from '../../utils/fileUtils';

export default function FileUploader() {
  const { currentChannel, currentUser, addFile, members } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showMemberSelect, setShowMemberSelect] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!currentChannel) return null;
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };
  
  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      const validation = validateFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        addFile({
          name: file.name,
          type: getFileType(file.name),
          size: file.size,
          channelId: currentChannel.id,
          uploadedBy: currentUser.id,
          distributeTo: selectedMembers.length > 0 
            ? selectedMembers 
            : currentChannel.members,
          confirmedBy: [],
          expiredAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
          url
        });
      };
      reader.readAsDataURL(file);
    });
  };
  
  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };
  
  return (
    <div className="mb-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-[#E67E22] bg-[#E67E22]/10'
            : 'border-[#34495E] hover:border-[#4A5568]'
        }`}
      >
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-[#E67E22]' : 'text-gray-500'}`} />
        <p className="text-white mb-2">
          拖拽文件到此处，或
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[#E67E22] hover:underline ml-1"
          >
            点击上传
          </button>
        </p>
        <p className="text-sm text-gray-400">
          支持图片、文档、压缩包等文件，单个文件最大10MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">分发对象</span>
          <button
            onClick={() => setShowMemberSelect(!showMemberSelect)}
            className="px-3 py-1 text-xs bg-[#2C3E50] text-gray-300 rounded hover:bg-[#34495E] transition-colors"
          >
            {selectedMembers.length > 0 
              ? `已选择 ${selectedMembers.length} 人` 
              : '选择成员'}
          </button>
        </div>
        
        {showMemberSelect && (
          <div className="bg-[#2C3E50] border border-[#34495E] rounded-lg p-3 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {members
                .filter(m => currentChannel.members.includes(m.id))
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
            <div className="mt-3 pt-3 border-t border-[#34495E] flex gap-2">
              <button
                onClick={() => setSelectedMembers(currentChannel.members)}
                className="px-3 py-1 text-xs bg-[#34495E] text-white rounded hover:bg-[#4A5568] transition-colors"
              >
                全选
              </button>
              <button
                onClick={() => setSelectedMembers([])}
                className="px-3 py-1 text-xs bg-[#34495E] text-white rounded hover:bg-[#4A5568] transition-colors"
              >
                清空
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
