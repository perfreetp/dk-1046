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
      const value = row[header];
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
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

export const exportMessages = (messages: any[], channelName: string) => {
  const exportData = messages.map(msg => ({
    时间: new Date(msg.createdAt).toLocaleString('zh-CN'),
    发送者: msg.senderId,
    类型: msg.type,
    内容: msg.content,
    已读: msg.readBy.join(', ')
  }));
  
  exportToCSV(exportData, `${channelName}-聊天记录.csv`);
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
