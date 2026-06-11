export interface Member {
  id: string;
  name: string;
  position: string;
  department: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastSeen: number;
  avatar?: string;
  email: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  category: 'emergency' | 'task' | 'general';
  members: string[];
  createdAt: number;
  createdBy: string;
  isArchived: boolean;
  unreadCount: number;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  type: 'text' | 'voice' | 'image' | 'file';
  content: string;
  mentions: string[];
  readBy: string[];
  createdAt: number;
  attachmentUrl?: string;
  attachmentName?: string;
  duration?: number;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'archive' | 'other';
  size: number;
  channelId: string;
  uploadedBy: string;
  uploadedAt: number;
  distributeTo: string[];
  confirmedBy: string[];
  expiredAt: number;
  url: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  type: 'created' | 'status_changed' | 'assigned' | 'priority_changed' | 'file_attached' | 'message_linked' | 'completed' | 'updated';
  description: string;
  performedBy: string;
  performedAt: number;
  previousValue?: string;
  newValue?: string;
  metadata?: {
    fileId?: string;
    messageId?: string;
    channelId?: string;
  };
}

export interface Task {
  id: string;
  channelId: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: 'urgent' | 'important' | 'normal';
  status: 'todo' | 'inProgress' | 'completed';
  dueDate: number;
  createdAt: number;
  completedAt?: number;
  activities?: TaskActivity[];
  linkedMessageId?: string;
  linkedFileIds?: string[];
}

export interface AppSettings {
  offlineCacheSize: number;
  autoCleanup: boolean;
  cleanupDays: number;
  notifications: boolean;
}
