import { create } from 'zustand';
import { Member, Channel, Message, FileItem, Task, AppSettings, TaskActivity, ChannelActivity } from './types';
import { 
  mockMembers, 
  mockChannels, 
  mockMessages, 
  mockFiles, 
  mockTasks,
  currentUser 
} from './mockData';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_PREFIX = 'emergency_';

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage save error:', error);
  }
};

interface AppState {
  currentUser: Member;
  currentChannel: Channel | null;
  channels: Channel[];
  messages: Record<string, Message[]>;
  members: Member[];
  files: FileItem[];
  tasks: Task[];
  settings: AppSettings;
  connectionStatus: 'connected' | 'disconnected' | 'syncing';
  channelActivities: Record<string, ChannelActivity[]>;
  
  setCurrentChannel: (channel: Channel | null) => void;
  addChannel: (channel: Omit<Channel, 'id' | 'createdAt' | 'unreadCount'>) => void;
  updateChannel: (id: string, updates: Partial<Channel>) => void;
  deleteChannel: (id: string) => void;
  joinChannel: (channelId: string, memberId: string) => void;
  
  addMessage: (message: Omit<Message, 'id' | 'createdAt' | 'readBy'>) => string;
  markAsRead: (messageId: string, channelId: string, userId: string) => void;
  
  addFile: (file: Omit<FileItem, 'id' | 'uploadedAt'>) => void;
  deleteFile: (id: string) => void;
  confirmFile: (fileId: string, userId: string) => void;
  cleanupExpiredFiles: () => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'activities'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addTaskActivity: (taskId: string, activity: Omit<TaskActivity, 'id' | 'taskId' | 'performedAt'>) => void;
  linkMessageToTask: (taskId: string, messageId: string, channelId: string) => void;
  
  updateMemberStatus: (memberId: string, status: Member['status']) => void;
  
  setSettings: (settings: Partial<AppSettings>) => void;
  setConnectionStatus: (status: AppState['connectionStatus']) => void;
  
  resetToDemo: () => void;
}

const initialChannels = mockChannels;
const initialMessages = mockMessages;
const initialFiles = mockFiles;
const initialTasks = mockTasks;
const initialMembers = mockMembers;
const initialSettings = {
  offlineCacheSize: 500,
  autoCleanup: true,
  cleanupDays: 30,
  notifications: true
};

export const useStore = create<AppState>((set, get) => ({
  currentUser: loadFromStorage('currentUser', currentUser),
  currentChannel: null,
  channels: loadFromStorage('channels', initialChannels),
  messages: loadFromStorage('messages', initialMessages),
  members: loadFromStorage('members', initialMembers),
  files: loadFromStorage('files', initialFiles),
  tasks: loadFromStorage('tasks', initialTasks),
  settings: loadFromStorage('settings', initialSettings),
  connectionStatus: 'connected',
  channelActivities: loadFromStorage('channelActivities', {}),

  setCurrentChannel: (channel) => set({ currentChannel: channel }),

  addChannel: (channelData) => {
    const newChannel: Channel = {
      ...channelData,
      id: uuidv4(),
      createdAt: Date.now(),
      unreadCount: 0
    };
    set((state) => {
      const newChannels = [...state.channels, newChannel];
      saveToStorage('channels', newChannels);
      return {
        channels: newChannels,
        currentChannel: newChannel
      };
    });
  },

  updateChannel: (id, updates) => set((state) => {
    const newChannels = state.channels.map((ch) =>
      ch.id === id ? { ...ch, ...updates } : ch
    );
    const newCurrentChannel = state.currentChannel?.id === id
      ? { ...state.currentChannel, ...updates }
      : state.currentChannel;
    saveToStorage('channels', newChannels);
    return {
      channels: newChannels,
      currentChannel: newCurrentChannel
    };
  }),

  deleteChannel: (id) => set((state) => {
    const newChannels = state.channels.filter((ch) => ch.id !== id);
    const newMessages = { ...state.messages };
    delete newMessages[id];
    const newChannelActivities = { ...state.channelActivities };
    delete newChannelActivities[id];
    saveToStorage('channels', newChannels);
    saveToStorage('messages', newMessages);
    saveToStorage('channelActivities', newChannelActivities);
    return {
      channels: newChannels,
      messages: newMessages,
      channelActivities: newChannelActivities,
      currentChannel: state.currentChannel?.id === id ? null : state.currentChannel
    };
  }),

  joinChannel: (channelId, memberId) => set((state) => {
    const newChannels = state.channels.map((ch) =>
      ch.id === channelId && !ch.members.includes(memberId)
        ? { ...ch, members: [...ch.members, memberId] }
        : ch
    );
    saveToStorage('channels', newChannels);
    return { channels: newChannels };
  }),

  addMessage: (messageData) => {
    const messageId = uuidv4();
    const newMessage: Message = {
      ...messageData,
      id: messageId,
      createdAt: Date.now(),
      readBy: [messageData.senderId]
    };
    
    set((state) => {
      const channelMessages = state.messages[messageData.channelId] || [];
      const updatedMessages = {
        ...state.messages,
        [messageData.channelId]: [...channelMessages, newMessage]
      };
      
      const updatedChannels = state.channels.map((ch) =>
        ch.id === messageData.channelId
          ? { ...ch, unreadCount: ch.unreadCount + 1 }
          : ch
      );
      
      saveToStorage('messages', updatedMessages);
      saveToStorage('channels', updatedChannels);
      
      return {
        messages: updatedMessages,
        channels: updatedChannels
      };
    });
    
    return messageId;
  },

  markAsRead: (messageId, channelId, userId) => set((state) => {
    const channelMessages = state.messages[channelId] || [];
    const updatedMessages = {
      ...state.messages,
      [channelId]: channelMessages.map((msg) =>
        msg.id === messageId && !msg.readBy.includes(userId)
          ? { ...msg, readBy: [...msg.readBy, userId] }
          : msg
      )
    };
    
    const updatedChannels = state.channels.map((ch) =>
      ch.id === channelId
        ? { ...ch, unreadCount: Math.max(0, ch.unreadCount - 1) }
        : ch
    );
    
    saveToStorage('messages', updatedMessages);
    saveToStorage('channels', updatedChannels);
    
    return {
      messages: updatedMessages,
      channels: updatedChannels
    };
  }),

  addFile: (fileData) => {
    const newFile: FileItem = {
      ...fileData,
      id: uuidv4(),
      uploadedAt: Date.now()
    };
    set((state) => {
      const newFiles = [...state.files, newFile];
      saveToStorage('files', newFiles);
      return { files: newFiles };
    });
  },

  deleteFile: (id) => set((state) => {
    const newFiles = state.files.filter((f) => f.id !== id);
    saveToStorage('files', newFiles);
    return { files: newFiles };
  }),

  confirmFile: (fileId, userId) => set((state) => {
    const file = state.files.find(f => f.id === fileId);
    const newFiles = state.files.map((f) =>
      f.id === fileId && !f.confirmedBy.includes(userId)
        ? { ...f, confirmedBy: [...f.confirmedBy, userId] }
        : f
    );
    
    if (file && !file.confirmedBy.includes(userId)) {
      const member = state.members.find(m => m.id === userId);
      const activity: ChannelActivity = {
        id: uuidv4(),
        channelId: file.channelId,
        type: 'task_updated',
        description: `${member?.name || '成员'}确认接收了文件"${file.name}"`,
        performedBy: userId,
        performedAt: Date.now()
      };
      
      const channelActivities = {
        ...state.channelActivities,
        [file.channelId]: [...(state.channelActivities[file.channelId] || []), activity]
      };
      saveToStorage('channelActivities', channelActivities);
      
      set({ channelActivities });
    }
    
    saveToStorage('files', newFiles);
    return { files: newFiles };
  }),

  cleanupExpiredFiles: () => set((state) => {
    const now = Date.now();
    const newFiles = state.files.filter((f) => f.expiredAt > now);
    const removedCount = state.files.length - newFiles.length;
    if (removedCount > 0) {
      saveToStorage('files', newFiles);
    }
    return { files: newFiles };
  }),

  addTask: (taskData) => {
    const taskId = uuidv4();
    const { currentUser, members, channels } = get();
    
    const taskCreator = members.find(m => m.id === taskData.assigneeId) || currentUser;
    const channel = channels.find(c => c.id === taskData.channelId);
    
    const initialActivity: TaskActivity = {
      id: uuidv4(),
      taskId,
      type: 'created',
      description: `创建了任务`,
      performedBy: taskData.assigneeId,
      performedAt: Date.now()
    };
    
    const newTask: Task = {
      ...taskData,
      id: taskId,
      createdAt: Date.now(),
      activities: [initialActivity]
    };
    
    set((state) => {
      const newTasks = [...state.tasks, newTask];
      saveToStorage('tasks', newTasks);
      
      const channelActivity: ChannelActivity = {
        id: uuidv4(),
        channelId: taskData.channelId,
        type: 'task_created',
        description: `${taskCreator.name}创建了待办"${taskData.title}"`,
        relatedTaskId: taskId,
        performedBy: taskData.assigneeId,
        performedAt: Date.now()
      };
      
      const channelActivities = {
        ...state.channelActivities,
        [taskData.channelId]: [...(state.channelActivities[taskData.channelId] || []), channelActivity]
      };
      saveToStorage('channelActivities', channelActivities);
      
      return { tasks: newTasks, channelActivities };
    });
    
    return taskId;
  },

  updateTask: (id, updates) => set((state) => {
    const task = state.tasks.find(t => t.id === id);
    const newActivities = [...(task?.activities || [])];
    let channelActivity: ChannelActivity | null = null;
    
    if (updates.status && updates.status !== task?.status) {
      const statusLabels: Record<string, string> = {
        'todo': '待处理',
        'inProgress': '进行中',
        'completed': '已完成'
      };
      
      const activityType = updates.status === 'completed' ? 'completed' : 'status_changed';
      newActivities.push({
        id: uuidv4(),
        taskId: id,
        type: activityType,
        description: `将状态改为"${statusLabels[updates.status]}"`,
        performedBy: state.currentUser.id,
        performedAt: Date.now()
      });
      
      const member = state.members.find(m => m.id === state.currentUser.id);
      channelActivity = {
        id: uuidv4(),
        channelId: task!.channelId,
        type: updates.status === 'completed' ? 'task_completed' : 'task_status_changed',
        description: `${member?.name || '成员'}${updates.status === 'completed' ? '完成了' : '更新了'}待办"${task?.title}"${updates.status !== 'completed' ? `至"${statusLabels[updates.status]}"` : ''}`,
        relatedTaskId: id,
        performedBy: state.currentUser.id,
        performedAt: Date.now()
      };
    }
    
    if (updates.assigneeId && updates.assigneeId !== task?.assigneeId) {
      const oldAssignee = state.members.find(m => m.id === task?.assigneeId);
      const newAssignee = state.members.find(m => m.id === updates.assigneeId);
      newActivities.push({
        id: uuidv4(),
        taskId: id,
        type: 'assigned',
        description: `将负责人从"${oldAssignee?.name || '未知'}"改为"${newAssignee?.name || '未知'}"`,
        performedBy: state.currentUser.id,
        performedAt: Date.now(),
        previousValue: oldAssignee?.name,
        newValue: newAssignee?.name
      });
      
      const member = state.members.find(m => m.id === state.currentUser.id);
      channelActivity = {
        id: uuidv4(),
        channelId: task!.channelId,
        type: 'task_assigned',
        description: `${member?.name || '成员'}将待办"${task?.title}"指派给${newAssignee?.name || '未知'}`,
        relatedTaskId: id,
        performedBy: state.currentUser.id,
        performedAt: Date.now()
      };
    }
    
    if (updates.priority && updates.priority !== task?.priority) {
      const priorityLabels: Record<string, string> = {
        'urgent': '紧急',
        'important': '重要',
        'normal': '一般'
      };
      newActivities.push({
        id: uuidv4(),
        taskId: id,
        type: 'priority_changed',
        description: `将优先级从"${priorityLabels[task?.priority || 'normal']}"改为"${priorityLabels[updates.priority]}"`,
        performedBy: state.currentUser.id,
        performedAt: Date.now(),
        previousValue: priorityLabels[task?.priority || 'normal'],
        newValue: priorityLabels[updates.priority]
      });
      
      const member = state.members.find(m => m.id === state.currentUser.id);
      channelActivity = {
        id: uuidv4(),
        channelId: task!.channelId,
        type: 'task_updated',
        description: `${member?.name || '成员'}更新了待办"${task?.title}"的优先级为"${priorityLabels[updates.priority]}"`,
        relatedTaskId: id,
        performedBy: state.currentUser.id,
        performedAt: Date.now()
      };
    }
    
    const newTasks = state.tasks.map((t) =>
      t.id === id
        ? { 
            ...t, 
            ...updates,
            completedAt: updates.status === 'completed' ? Date.now() : t.completedAt,
            activities: newActivities
          }
        : t
    );
    
    saveToStorage('tasks', newTasks);
    
    if (channelActivity) {
      const newChannelActivities = {
        ...state.channelActivities,
        [task!.channelId]: [...(state.channelActivities[task!.channelId] || []), channelActivity]
      };
      saveToStorage('channelActivities', newChannelActivities);
      return { tasks: newTasks, channelActivities: newChannelActivities };
    }
    
    return { tasks: newTasks };
  }),

  deleteTask: (id) => set((state) => {
    const newTasks = state.tasks.filter((t) => t.id !== id);
    saveToStorage('tasks', newTasks);
    return { tasks: newTasks };
  }),

  addTaskActivity: (taskId, activity) => set((state) => {
    const newActivity: TaskActivity = {
      ...activity,
      id: uuidv4(),
      taskId,
      performedAt: Date.now()
    };
    
    const task = state.tasks.find(t => t.id === taskId);
    
    const newTasks = state.tasks.map((t) =>
      t.id === taskId
        ? { ...t, activities: [...(t.activities || []), newActivity] }
        : t
    );
    
    saveToStorage('tasks', newTasks);
    
    if (task && activity.type === 'file_attached') {
      const member = state.members.find(m => m.id === activity.performedBy);
      const channelActivity: ChannelActivity = {
        id: uuidv4(),
        channelId: task.channelId,
        type: 'task_updated',
        description: `${member?.name || '成员'}为待办"${task.title}"添加了文件"${activity.metadata?.fileName || '附件'}"`,
        relatedTaskId: taskId,
        performedBy: activity.performedBy,
        performedAt: Date.now()
      };
      
      const newChannelActivities = {
        ...state.channelActivities,
        [task.channelId]: [...(state.channelActivities[task.channelId] || []), channelActivity]
      };
      saveToStorage('channelActivities', newChannelActivities);
      return { tasks: newTasks, channelActivities: newChannelActivities };
    }
    
    return { tasks: newTasks };
  }),

  linkMessageToTask: (taskId, messageId, channelId) => set((state) => {
    const message = state.messages[channelId]?.find(m => m.id === messageId);
    const channel = state.channels.find(c => c.id === channelId);
    const sender = state.members.find(m => m.id === message?.senderId);
    const task = state.tasks.find(t => t.id === taskId);
    
    if (!message || !channel) return state;
    
    const sourceMessageInfo = {
      messageId,
      channelId,
      channelName: channel.name,
      content: message.content,
      senderId: message.senderId,
      senderName: sender?.name || '未知',
      mentions: message.mentions,
      createdAt: message.createdAt
    };
    
    const newActivity: TaskActivity = {
      id: uuidv4(),
      taskId,
      type: 'message_linked',
      description: `关联了来自"${channel.name}"的消息: "${message.content?.substring(0, 50)}${message.content && message.content.length > 50 ? '...' : ''}"`,
      performedBy: state.currentUser.id,
      performedAt: Date.now(),
      metadata: { messageId, channelId, channelName: channel.name, messageContent: message.content }
    };
    
    const newTasks = state.tasks.map((t) =>
      t.id === taskId
        ? { 
            ...t, 
            linkedMessageId: messageId,
            activities: [...(t.activities || []), newActivity],
            sourceMessageInfo: t.sourceMessageInfo || sourceMessageInfo
          }
        : t
    );
    
    saveToStorage('tasks', newTasks);
    return { tasks: newTasks };
  }),

  updateMemberStatus: (memberId, status) => set((state) => {
    const newMembers = state.members.map((m) =>
      m.id === memberId
        ? { ...m, status, lastSeen: Date.now() }
        : m
    );
    const newCurrentUser = state.currentUser.id === memberId
      ? { ...state.currentUser, status, lastSeen: Date.now() }
      : state.currentUser;
    saveToStorage('members', newMembers);
    saveToStorage('currentUser', newCurrentUser);
    return {
      members: newMembers,
      currentUser: newCurrentUser
    };
  }),

  setSettings: (settings) => set((state) => {
    const newSettings = { ...state.settings, ...settings };
    saveToStorage('settings', newSettings);
    return { settings: newSettings };
  }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  resetToDemo: () => {
    localStorage.removeItem(STORAGE_PREFIX + 'channels');
    localStorage.removeItem(STORAGE_PREFIX + 'messages');
    localStorage.removeItem(STORAGE_PREFIX + 'files');
    localStorage.removeItem(STORAGE_PREFIX + 'tasks');
    localStorage.removeItem(STORAGE_PREFIX + 'members');
    localStorage.removeItem(STORAGE_PREFIX + 'currentUser');
    localStorage.removeItem(STORAGE_PREFIX + 'settings');
    localStorage.removeItem(STORAGE_PREFIX + 'channelActivities');
    
    set({
      currentUser: currentUser,
      currentChannel: null,
      channels: initialChannels,
      messages: initialMessages,
      members: initialMembers,
      files: initialFiles,
      tasks: initialTasks,
      settings: initialSettings,
      channelActivities: {}
    });
  }
}));
