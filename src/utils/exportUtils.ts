export const exportToJSON = (data: any, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, filename);
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = String(row[header] || '');
      const escaped = value.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, filename);
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportChannelMessages = (
  messages: any[], 
  channelName: string,
  members: any[]
) => {
  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member?.name || memberId;
  };
  
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: '文字',
      voice: '语音',
      image: '图片',
      file: '文件'
    };
    return labels[type] || type;
  };
  
  const exportData = messages.map(msg => ({
    时间: new Date(msg.createdAt).toLocaleString('zh-CN'),
    发送人: getMemberName(msg.senderId),
    消息类型: getTypeLabel(msg.type),
    正文: msg.content,
    '@提及对象': msg.mentions.map((id: string) => getMemberName(id)).join(', ') || '-',
    已读人员: msg.readBy.map((id: string) => getMemberName(id)).join(', ') || '-'
  }));
  
  const filename = `${channelName}-沟通记录_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
  exportToCSV(exportData, filename);
};

export const exportFiles = (files: any[], channelName: string) => {
  const exportData = files.map(file => ({
    文件名: file.name,
    类型: file.type,
    大小: file.size,
    上传者: file.uploadedBy,
    上传时间: new Date(file.uploadedAt).toLocaleString('zh-CN'),
    分发对象: file.distributeTo.join(', '),
    已确认: file.confirmedBy.join(', ')
  }));
  
  exportToCSV(exportData, `${channelName}-文件列表.csv`);
};
