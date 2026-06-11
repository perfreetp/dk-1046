import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Image, X } from 'lucide-react';
import { useStore } from '../../store';

export default function MessageInput() {
  const { currentChannel, currentUser, members, addMessage } = useStore();
  const [inputValue, setInputValue] = useState('');
  const [showMention, setShowMention] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );
  
  useEffect(() => {
    const lastChar = inputValue.slice(-1);
    if (lastChar === '@') {
      setShowMention(true);
      setMentionQuery('');
    } else if (showMention && lastChar === ' ') {
      setShowMention(false);
    } else if (showMention) {
      setMentionQuery(inputValue.split('@').pop() || '');
    }
  }, [inputValue, showMention]);
  
  const handleSend = () => {
    if (!inputValue.trim() || !currentChannel) return;
    
    const mentionMatches = inputValue.match(/@(\w+)/g) || [];
    const mentionedUserIds = mentionMatches
      .map(match => {
        const name = match.slice(1);
        return members.find(m => m.name.includes(name))?.id;
      })
      .filter(Boolean) as string[];
    
    addMessage({
      channelId: currentChannel.id,
      senderId: currentUser.id,
      type: 'text',
      content: inputValue,
      mentions: mentionedUserIds
    });
    
    setInputValue('');
    setShowMention(false);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const selectMention = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      const newValue = inputValue.replace(/@\w*$/, `@${member.name} `);
      setInputValue(newValue);
      setShowMention(false);
      inputRef.current?.focus();
    }
  };
  
  const handleFileUpload = (type: 'image' | 'file') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : '*/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && currentChannel) {
        const url = type === 'image' 
          ? URL.createObjectURL(file)
          : `data:application/octet-stream;base64,${btoa('dummy file')}`;
        
        addMessage({
          channelId: currentChannel.id,
          senderId: currentUser.id,
          type: type,
          content: `上传了文件: ${file.name}`,
          mentions: [],
          attachmentUrl: url,
          attachmentName: file.name
        });
      }
    };
    
    input.click();
    setShowFileMenu(false);
  };
  
  if (!currentChannel) return null;
  
  return (
    <div className="border-t border-[#2C3E50] bg-[#1E3A5F] p-4">
      <div className="relative">
        {showMention && (
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#2C3E50] border border-[#34495E] rounded-lg shadow-xl overflow-hidden">
            <div className="p-2 border-b border-[#34495E]">
              <span className="text-xs text-gray-400">选择要@提及的成员</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => selectMention(member.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#34495E] transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm text-white">{member.name}</div>
                    <div className="text-xs text-gray-400">{member.position}</div>
                  </div>
                </button>
              ))}
              {filteredMembers.length === 0 && (
                <div className="p-3 text-sm text-gray-500">未找到匹配的成员</div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`在 ${currentChannel.name} 中发送消息...`}
              className="w-full px-4 py-3 bg-[#2C3E50] border border-[#34495E] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E67E22] pr-20"
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => setShowFileMenu(!showFileMenu)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-[#34495E] rounded transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                {showFileMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-40 bg-[#2C3E50] border border-[#34495E] rounded-lg shadow-xl overflow-hidden">
                    <button
                      onClick={() => handleFileUpload('image')}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#34495E] transition-colors text-sm text-white"
                    >
                      <Image className="w-4 h-4" />
                      上传图片
                    </button>
                    <button
                      onClick={() => handleFileUpload('file')}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#34495E] transition-colors text-sm text-white"
                    >
                      <Paperclip className="w-4 h-4" />
                      上传文件
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#34495E] rounded transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="px-6 py-3 bg-[#E67E22] text-white rounded-lg hover:bg-[#D35400] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            发送
          </button>
        </div>
      </div>
      
      {showVoiceRecorder && (
        <div className="mt-3 p-4 bg-[#2C3E50] rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-white">录音中...</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowVoiceRecorder(false)}
                className="px-4 py-2 bg-[#34495E] text-white rounded hover:bg-[#4A5568] transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (currentChannel) {
                    addMessage({
                      channelId: currentChannel.id,
                      senderId: currentUser.id,
                      type: 'voice',
                      content: '语音留言 (3:00)',
                      mentions: [],
                      duration: 180
                    });
                  }
                  setShowVoiceRecorder(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                发送录音
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
