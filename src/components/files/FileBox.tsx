import { useState } from 'react';
import { Search, Filter, Download, Trash2, Settings } from 'lucide-react';
import { useStore } from '../../store';
import FileItemCard from './FileItem';
import FileUploader from './FileUploader';
import { exportFiles } from '../../utils/exportUtils';

export default function FileBox() {
  const { files, channels, currentChannel } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'document' | 'archive'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    const matchesChannel = !currentChannel || file.channelId === currentChannel.id;
    return matchesSearch && matchesType && matchesChannel;
  });
  
  const handleExport = () => {
    const channelName = currentChannel?.name || '全部';
    exportFiles(filteredFiles, channelName);
  };
  
  return (
    <div className="flex-1 bg-[#0F1419] overflow-hidden flex flex-col">
      <div className="h-14 border-b border-[#2C3E50] flex items-center justify-between px-6 bg-[#1E3A5F]">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">
            {currentChannel ? `${currentChannel.name} - 文件` : '文件箱'}
          </h2>
          <p className="text-xs text-gray-400">{filteredFiles.length} 个文件</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C3E50] text-white rounded-lg hover:bg-[#34495E] transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            导出列表
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2C3E50] rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {showSettings && (
        <div className="border-b border-[#2C3E50] p-4 bg-[#1E3A5F]/50">
          <h3 className="text-sm font-medium text-white mb-3">缓存设置</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">缓存大小限制 (MB)</label>
              <input
                type="number"
                defaultValue={500}
                min={100}
                max={2000}
                className="w-full px-3 py-1.5 bg-[#2C3E50] border border-[#34495E] rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">文件保留天数</label>
              <input
                type="number"
                defaultValue={30}
                min={7}
                max={365}
                className="w-full px-3 py-1.5 bg-[#2C3E50] border border-[#34495E] rounded text-white text-sm"
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="px-4 py-1.5 bg-[#E67E22] text-white rounded text-sm hover:bg-[#D35400] transition-colors">
              保存设置
            </button>
            <button className="px-4 py-1.5 bg-[#2C3E50] text-white rounded text-sm hover:bg-[#34495E] transition-colors">
              清理过期文件
            </button>
          </div>
        </div>
      )}
      
      <div className="p-6 space-y-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文件名..."
              className="w-full pl-10 pr-4 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67E22] text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E67E22]"
            >
              <option value="all">全部类型</option>
              <option value="image">图片</option>
              <option value="document">文档</option>
              <option value="archive">压缩包</option>
            </select>
          </div>
        </div>
        
        {currentChannel && <FileUploader />}
      </div>
      
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无文件</p>
          </div>
        ) : (
          filteredFiles.map(file => (
            <FileItemCard
              key={file.id}
              file={file}
              onPreview={() => setPreviewFile(file.url)}
            />
          ))
        )}
      </div>
      
      {previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-6 h-6" />
          </button>
          {previewFile.startsWith('data:image') ? (
            <img
              src={previewFile}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          ) : (
            <div className="text-white text-center">
              <p>文件预览</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
