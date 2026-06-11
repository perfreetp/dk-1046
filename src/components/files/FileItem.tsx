import { FileText, Image, Archive, File, Download, Trash2, CheckCircle, Eye, Share2 } from 'lucide-react';
import { FileItem } from '../../types';
import { useStore } from '../../store';
import { formatFileSize } from '../../utils/fileUtils';
import { formatRelativeTime } from '../../utils/dateUtils';
import { useState } from 'react';

interface FileItemProps {
  file: FileItem;
  onPreview: () => void;
}

export default function FileItemCard({ file, onPreview }: FileItemProps) {
  const { members, currentUser, deleteFile, confirmFile, channels } = useStore();
  const [showDistribute, setShowDistribute] = useState(false);
  
  const uploader = members.find(m => m.id === file.uploadedBy);
  const channel = channels.find(ch => ch.id === file.channelId);
  const confirmedCount = file.confirmedBy.length;
  const totalCount = file.distributeTo.length;
  
  const getFileIcon = () => {
    switch (file.type) {
      case 'image':
        return <Image className="w-5 h-5 text-green-400" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-purple-400" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const handleDownload = () => {
    if (file.url.startsWith('data:') || file.url.startsWith('http')) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.click();
    } else {
      alert('文件下载功能');
    }
  };
  
  const handleConfirm = () => {
    confirmFile(file.id, currentUser.id);
  };
  
  const isConfirmed = file.confirmedBy.includes(currentUser.id);
  const isExpired = file.expiredAt < Date.now();
  
  return (
    <div className="bg-[#2C3E50] rounded-lg p-4 hover:bg-[#34495E] transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {file.type === 'image' && file.url ? (
            <img
              src={file.url}
              alt={file.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-[#1E3A5F] rounded-lg flex items-center justify-center">
              {getFileIcon()}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white truncate">
                {file.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {uploader?.name} • {formatRelativeTime(file.uploadedAt)}
              </p>
              {channel && (
                <p className="text-xs text-gray-500">
                  来自: {channel.name}
                </p>
              )}
            </div>
            {isExpired && (
              <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
                已过期
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>{formatFileSize(file.size)}</span>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>{confirmedCount}/{totalCount} 已确认</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isConfirmed && (
                <button
                  onClick={handleConfirm}
                  className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors"
                >
                  确认接收
                </button>
              )}
              <button
                onClick={onPreview}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1E3A5F] rounded transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1E3A5F] rounded transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowDistribute(!showDistribute)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-[#1E3A5F] rounded transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {showDistribute && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#1E3A5F] border border-[#34495E] rounded-lg shadow-xl overflow-hidden z-10">
                    <div className="p-2 border-b border-[#34495E]">
                      <span className="text-xs text-gray-400">分发对象</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {file.distributeTo.map(memberId => {
                        const member = members.find(m => m.id === memberId);
                        const confirmed = file.confirmedBy.includes(memberId);
                        return (
                          <div
                            key={memberId}
                            className="flex items-center justify-between px-3 py-2 hover:bg-[#34495E]"
                          >
                            <span className="text-sm text-white">{member?.name}</span>
                            {confirmed && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteFile(file.id)}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
