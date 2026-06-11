import { create } from 'zustand';
import { Member, Channel, Message, FileItem, Task, AppSettings } from './types';
import { 
  mockMembers, 
  mockChannels, 
  mockMessages, 
  mockFiles, 
  mockTasks,
  currentUser 
} from './mockData';
import { v4 as uuidv4 } from 'uuid';

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
  
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  updateMemberStatus: (memberId: string, status: Member['status']) => void;
  
  setSettings: (settings: Partial<AppSettings>) => void;
  setConnectionStatus: (status: AppState['connectionStatus']) => void;
}

export const useStore = create<AppState>((set, get) => ({
  currentUser,
  currentChannel: null,
  channels: mockChannels,
  messages: mockMessages,
  members: mockMembers,
  files: mockFiles,
  tasks: mockTasks,
  settings: {
    offlineCacheSize: 500,
    autoCleanup: true,
    cleanupDays: 30,
    notifications: true
  },
  connectionStatus: 'connected',

  setCurrentChannel: (channel) => set({ currentChannel: channel }),

  addChannel: (channelData) => {
    const newChannel: Channel = {
      ...channelData,
      id: uuidv4(),
      createdAt: Date.now(),
      unreadCount: 0
    };
    set((state) => ({
      channels: [...state.channels, newChannel],
      currentChannel: newChannel
    }));
  },

  updateChannel: (id, updates) => set((state) => ({
    channels: state.channels.map((ch) =>
      ch.id === id ? { ...ch, ...updates } : ch
    ),
    currentChannel: state.currentChannel?.id === id
      ? { ...state.currentChannel, ...updates }
      : state.currentChannel
  })),

  deleteChannel: (id) => set((state) => ({
    channels: state.channels.filter((ch) => ch.id !== id),
    currentChannel: state.currentChannel?.id === id ? null : state.currentChannel
  })),

  joinChannel: (channelId, memberId) => set((state) => ({
    channels: state.channels.map((ch) =>
      ch.id === channelId && !ch.members.includes(memberId)
        ? { ...ch, members: [...ch.members, memberId] }
        : ch
    )
  })),

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
    set((state) => ({ files: [...state.files, newFile] }));
  },

  deleteFile: (id) => set((state) => ({
    files: state.files.filter((f) => f.id !== id)
  })),

  confirmFile: (fileId, userId) => set((state) => ({
    files: state.files.map((f) =>
      f.id === fileId && !f.confirmedBy.includes(userId)
        ? { ...f, confirmedBy: [...f.confirmedBy, userId] }
        : f
    )
  })),

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: Date.now()
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === id
        ? { 
            ...t, 
            ...updates,
            completedAt: updates.status === 'completed' ? Date.now() : t.completedAt
          }
        : t
    )
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),

  updateMemberStatus: (memberId, status) => set((state) => ({
    members: state.members.map((m) =>
      m.id === memberId
        ? { ...m, status, lastSeen: Date.now() }
        : m
    ),
    currentUser: state.currentUser.id === memberId
      ? { ...state.currentUser, status, lastSeen: Date.now() }
      : state.currentUser
  })),

  setSettings: (settings) => set((state) => ({
    settings: { ...state.settings, ...settings }
  })),

  setConnectionStatus: (status) => set({ connectionStatus: status })
}));
