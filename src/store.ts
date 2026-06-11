import { create } from 'zustand';
import { Member, Channel, Message, FileItem, Task, AppSettings, TaskActivity } from './types';
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
  
  setCurrentChannel: (channel: Channel | null) => void;
  addChannel: (channel: Omit<Channel, 'id' | 'createdAt' | 'unreadCount'>) => void;
  updateChannel: (id: string, updates: Partial<Channel>) => void;
  deleteChannel: (id: string) => void;
  joinChannel: (channelId: string, memberId: string) => void;
  
  addMessage: (message: Omit<Message, 'id' | 'createdAt' | 'readBy'>) => void;
  markAsRead: (messageId: string, channelId: string, userId: string) => void;
  
  addFile: (file: Omit<FileItem, 'id' | 'uploadedAt'>) => void;
  deleteFile: (id: string) => void;
  confirmFile: (fileId: string, userId: string) => void;
  cleanupExpiredFiles: () => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'activities'>) => void;
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
    saveToStorage('channels', newChannels);
    saveToStorage('messages', newMessages);
    return {
      channels: newChannels,
      messages: newMessages,
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
    const newMessage: Message = {
      ...messageData,
      id: uuidv4(),
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
    const newFiles = state.files.map((f) =>
      f.id === fileId && !f.confirmedBy.includes(userId)
        ? { ...f, confirmedBy: [...f.confirmedBy, userId] }
        : f
    );
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
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: Date.now(),
      activities: [{
        id: uuidv4(),
        taskId: '',
        type: 'created',
        description: `创建了任务`,
        performedBy: taskData.assigneeId,
        performedAt: Date.now()
      }]
    };
    newTask.activities![0].taskId = newTask.id;
    
    set((state) => {
      const newTasks = [...state.tasks, newTask];
      saveToStorage('tasks', newTasks);
      return { tasks: newTasks };
    });
    
    return newTask.id;
  },

  updateTask: (id, updates) => set((state) => {
    const task = state.tasks.find(t => t.id === id);
    const newActivities = [...(task?.activities || [])];
    
    if (updates.status && updates.status !== task?.status) {
      const statusLabels: Record<string, string> = {
        'todo': '待处理',
        'inProgress': '进行中',
        'completed': '已完成'
      };
      newActivities.push({
        id: uuidv4(),
        taskId: id,
        type: updates.status === 'completed' ? 'completed' : 'status_changed',
        description: `将状态改为"${statusLabels[updates.status]}"`,
        performedBy: state.currentUser.id,
        performedAt: Date.now()
      });
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
    
    const newTasks = state.tasks.map((t) =>
      t.id === taskId
        ? { ...t, activities: [...(t.activities || []), newActivity] }
        : t
    );
    saveToStorage('tasks', newTasks);
    return { tasks: newTasks };
  }),

  linkMessageToTask: (taskId, messageId, channelId) => set((state) => {
    const message = state.messages[channelId]?.find(m => m.id === messageId);
    const channel = state.channels.find(c => c.id === channelId);
    const sender = state.members.find(m => m.id === message?.senderId);
    
    const newActivity: TaskActivity = {
      id: uuidv4(),
      taskId,
      type: 'message_linked',
      description: `关联了来自"${channel?.name}"的消息: "${message?.content?.substring(0, 50)}${message?.content && message.content.length > 50 ? '...' : ''}"`,
      performedBy: state.currentUser.id,
      performedAt: Date.now(),
      metadata: { messageId, channelId }
    };
    
    const newTasks = state.tasks.map((t) =>
      t.id === taskId
        ? { 
            ...t, 
            linkedMessageId: messageId,
            activities: [...(t.activities || []), newActivity]
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
    
    set({
      currentUser: currentUser,
      currentChannel: null,
      channels: initialChannels,
      messages: initialMessages,
      members: initialMembers,
      files: initialFiles,
      tasks: initialTasks,
      settings: initialSettings
    });
  }
}));
