export const exportToJSON = (data: any, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, filename);
};

export const getFileBase64 = async (url: string): Promise<string | null> => {
  try {
    if (url.startsWith('data:')) {
      return url;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      console.warn('Failed to fetch file:', response.statusText);
      return null;
    }
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting file to Base64:', error);
    return null;
  }
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

export const exportChannelArchive = async (
  channel: any,
  messages: any[],
  files: any[],
  tasks: any[],
  members: any[],
  getFileContent?: (fileUrl: string) => Promise<string | null>
) => {
  const getMemberName = (memberId: string) => {
    const member = members.find((m: any) => m.id === memberId);
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
  
  const filesWithContent = await Promise.all(
    files.map(async (file) => {
      const fileData: any = {
        文件名: file.name,
        类型: file.type,
        大小: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        上传者: getMemberName(file.uploadedBy),
        上传时间: new Date(file.uploadedAt).toLocaleString('zh-CN'),
        分发对象: file.distributeTo.map((id: string) => getMemberName(id)).join(', '),
        已确认接收: file.confirmedBy.map((id: string) => getMemberName(id)).join(', ') || '-',
        过期时间: new Date(file.expiredAt).toLocaleString('zh-CN')
      };
      
      if (getFileContent && file.content) {
        fileData.文件内容Base64 = file.content;
        fileData.文件可恢复 = true;
      } else if (file.contentUrl || (file as any).attachmentUrl) {
        const url = file.contentUrl || (file as any).attachmentUrl;
        if (getFileContent) {
          try {
            const base64Content = await getFileContent(url);
            if (base64Content) {
              fileData.文件内容Base64 = base64Content;
              fileData.文件可恢复 = true;
            }
          } catch (err) {
            console.warn('Failed to load file content:', err);
          }
        }
        fileData.原始地址 = url;
      }
      
      return fileData;
    })
  );
  
  const messagesWithDetails = messages.map(msg => {
    const msgData: any = {
      时间: new Date(msg.createdAt).toLocaleString('zh-CN'),
      发送人: getMemberName(msg.senderId),
      消息类型: getTypeLabel(msg.type),
      正文: msg.content,
      '@提及对象': msg.mentions.map((id: string) => getMemberName(id)).join(', ') || '-',
      已读人员: msg.readBy.map((id: string) => getMemberName(id)).join(', ') || '-'
    };
    
    if (msg.type === 'voice' && msg.duration) {
      msgData.语音时长 = `${Math.floor(msg.duration / 60)}:${(msg.duration % 60).toString().padStart(2, '0')}`;
    }
    
    return msgData;
  });
  
  const tasksWithDetails = tasks.map(task => ({
    任务标题: task.title,
    描述: task.description || '-',
    负责人: getMemberName(task.assigneeId),
    优先级: { urgent: '紧急', important: '重要', normal: '一般' }[task.priority] || task.priority,
    状态: { todo: '待处理', inProgress: '进行中', completed: '已完成' }[task.status] || task.status,
    截止日期: new Date(task.dueDate).toLocaleString('zh-CN'),
    创建时间: new Date(task.createdAt).toLocaleString('zh-CN'),
    完成时间: task.completedAt ? new Date(task.completedAt).toLocaleString('zh-CN') : '-',
    来源消息: task.sourceMessageInfo ? {
      频道: task.sourceMessageInfo.channelName,
      发送者: task.sourceMessageInfo.senderName,
      内容: task.sourceMessageInfo.content,
      '@提及': task.sourceMessageInfo.mentions?.length > 0 
        ? task.sourceMessageInfo.mentions.map((id: string) => getMemberName(id)).join(', ')
        : '-'
    } : null
  }));
  
  const archiveData = {
    归档信息: {
      频道名称: channel.name,
      频道描述: channel.description,
      归档时间: new Date().toLocaleString('zh-CN'),
      成员数量: channel.members.length,
      消息数量: messages.length,
      文件数量: files.length,
      任务数量: tasks.length
    },
    成员列表: channel.members.map((id: string) => {
      const member = members.find((m: any) => m.id === id);
      return {
        姓名: member?.name || id,
        岗位: member?.position || '-',
        部门: member?.department || '-'
      };
    }),
    沟通记录: messagesWithDetails,
    文件列表: filesWithContent,
    任务列表: tasksWithDetails
  };
  
  const filename = `${channel.name}_事件归档_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
  exportToJSON(archiveData, filename);
};
