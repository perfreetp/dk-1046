import { Member, Channel, Message, FileItem, Task } from './types';

export const currentUser: Member = {
  id: 'user-1',
  name: '张三',
  position: '生产主管',
  department: '生产部',
  status: 'online',
  lastSeen: Date.now(),
  email: 'zhangsan@company.com'
};

export const mockMembers: Member[] = [
  currentUser,
  {
    id: 'user-2',
    name: '李四',
    position: '设备工程师',
    department: '技术部',
    status: 'online',
    lastSeen: Date.now(),
    email: 'lisi@company.com'
  },
  {
    id: 'user-3',
    name: '王五',
    position: '安全员',
    department: '安环部',
    status: 'busy',
    lastSeen: Date.now(),
    email: 'wangwu@company.com'
  },
  {
    id: 'user-4',
    name: '赵六',
    position: '质检员',
    department: '质量部',
    status: 'away',
    lastSeen: Date.now() - 1800000,
    email: 'zhaoliu@company.com'
  },
  {
    id: 'user-5',
    name: '钱七',
    position: '维修工',
    department: '维修部',
    status: 'offline',
    lastSeen: Date.now() - 3600000,
    email: 'qianqi@company.com'
  },
  {
    id: 'user-6',
    name: '孙八',
    position: '班组长',
    department: '生产部',
    status: 'online',
    lastSeen: Date.now(),
    email: 'sunba@company.com'
  }
];

export const mockChannels: Channel[] = [
  {
    id: 'channel-1',
    name: 'A生产线紧急维护',
    description: 'A生产线设备故障应急响应',
    category: 'emergency',
    members: ['user-1', 'user-2', 'user-3', 'user-6'],
    createdAt: Date.now() - 7200000,
    createdBy: 'user-1',
    isArchived: false,
    unreadCount: 3
  },
  {
    id: 'channel-2',
    name: '安全生产周报',
    description: '本周安全生产情况汇总',
    category: 'task',
    members: ['user-1', 'user-3'],
    createdAt: Date.now() - 86400000,
    createdBy: 'user-3',
    isArchived: false,
    unreadCount: 0
  },
  {
    id: 'channel-3',
    name: '设备保养计划',
    description: '下周设备保养工作安排',
    category: 'task',
    members: ['user-1', 'user-2', 'user-5'],
    createdAt: Date.now() - 172800000,
    createdBy: 'user-2',
    isArchived: false,
    unreadCount: 1
  },
  {
    id: 'channel-4',
    name: '员工培训讨论',
    description: '新员工培训相关问题讨论',
    category: 'general',
    members: ['user-1', 'user-3', 'user-4', 'user-6'],
    createdAt: Date.now() - 259200000,
    createdBy: 'user-1',
    isArchived: false,
    unreadCount: 0
  },
  {
    id: 'channel-5',
    name: '质量检查汇报',
    description: '产品质量检查结果讨论',
    category: 'task',
    members: ['user-1', 'user-4'],
    createdAt: Date.now() - 345600000,
    createdBy: 'user-4',
    isArchived: true,
    unreadCount: 0
  }
];

export const mockMessages: Record<string, Message[]> = {
  'channel-1': [
    {
      id: 'msg-1',
      channelId: 'channel-1',
      senderId: 'user-1',
      type: 'text',
      content: '各位，A生产线出现设备故障，需要紧急处理！',
      mentions: ['user-2', 'user-3'],
      readBy: ['user-1', 'user-2', 'user-3'],
      createdAt: Date.now() - 3600000
    },
    {
      id: 'msg-2',
      channelId: 'channel-1',
      senderId: 'user-2',
      type: 'text',
      content: '收到！我马上到现场查看。',
      mentions: [],
      readBy: ['user-1', 'user-2'],
      createdAt: Date.now() - 3500000
    },
    {
      id: 'msg-3',
      channelId: 'channel-1',
      senderId: 'user-3',
      type: 'text',
      content: '@李四 需要注意安全，带好防护装备',
      mentions: ['user-2'],
      readBy: ['user-1', 'user-2', 'user-3'],
      createdAt: Date.now() - 3400000
    },
    {
      id: 'msg-4',
      channelId: 'channel-1',
      senderId: 'user-2',
      type: 'image',
      content: '现场照片已上传',
      mentions: [],
      readBy: ['user-2'],
      createdAt: Date.now() - 3300000,
      attachmentUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23666" width="400" height="300"/%3E%3Ctext fill="white" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E设备故障现场%3C/text%3E%3C/svg%3E',
      attachmentName: 'equipment-fault.jpg'
    },
    {
      id: 'msg-5',
      channelId: 'channel-1',
      senderId: 'user-1',
      type: 'text',
      content: '李工检查结果如何？',
      mentions: ['user-2'],
      readBy: ['user-1'],
      createdAt: Date.now() - 600000
    }
  ],
  'channel-2': [
    {
      id: 'msg-6',
      channelId: 'channel-2',
      senderId: 'user-3',
      type: 'text',
      content: '本周安全生产情况：零事故，继续保持！',
      mentions: [],
      readBy: ['user-1', 'user-3'],
      createdAt: Date.now() - 43200000
    }
  ],
  'channel-3': [
    {
      id: 'msg-7',
      channelId: 'channel-3',
      senderId: 'user-2',
      type: 'text',
      content: '下周设备保养计划已制定完成，请各位查看。',
      mentions: [],
      readBy: ['user-1', 'user-2'],
      createdAt: Date.now() - 172800000
    }
  ]
};

export const mockFiles: FileItem[] = [
  {
    id: 'file-1',
    name: '设备故障报告.pdf',
    type: 'document',
    size: 2456789,
    channelId: 'channel-1',
    uploadedBy: 'user-2',
    uploadedAt: Date.now() - 3000000,
    distributeTo: ['user-1', 'user-3', 'user-6'],
    confirmedBy: ['user-1', 'user-3'],
    expiredAt: Date.now() + 2592000000,
    url: '/files/fault-report.pdf'
  },
  {
    id: 'file-2',
    name: '现场照片.zip',
    type: 'archive',
    size: 15678901,
    channelId: 'channel-1',
    uploadedBy: 'user-2',
    uploadedAt: Date.now() - 2700000,
    distributeTo: ['user-1', 'user-2', 'user-3', 'user-6'],
    confirmedBy: ['user-1'],
    expiredAt: Date.now() + 2592000000,
    url: '/files/photos.zip'
  },
  {
    id: 'file-3',
    name: '安全检查清单.xlsx',
    type: 'document',
    size: 124567,
    channelId: 'channel-2',
    uploadedBy: 'user-3',
    uploadedAt: Date.now() - 43200000,
    distributeTo: ['user-1', 'user-3'],
    confirmedBy: ['user-1', 'user-3'],
    expiredAt: Date.now() + 5184000000,
    url: '/files/checklist.xlsx'
  },
  {
    id: 'file-4',
    name: '设备外观.jpg',
    type: 'image',
    size: 3456789,
    channelId: 'channel-3',
    uploadedBy: 'user-2',
    uploadedAt: Date.now() - 86400000,
    distributeTo: ['user-1', 'user-2', 'user-5'],
    confirmedBy: [],
    expiredAt: Date.now() + 2592000000,
    url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%234a90e2" width="400" height="300"/%3E%3Ctext fill="white" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E设备图片%3C/text%3E%3C/svg%3E'
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    channelId: 'channel-1',
    title: '现场安全评估',
    description: '对故障现场进行安全评估，确保维修人员安全',
    assigneeId: 'user-3',
    priority: 'urgent',
    status: 'completed',
    dueDate: Date.now() - 1800000,
    createdAt: Date.now() - 3600000,
    completedAt: Date.now() - 2400000,
    activities: [
      {
        id: 'activity-1',
        taskId: 'task-1',
        type: 'created',
        description: '创建了任务',
        performedBy: 'user-3',
        performedAt: Date.now() - 3600000
      },
      {
        id: 'activity-2',
        taskId: 'task-1',
        type: 'completed',
        description: '将状态改为"已完成"',
        performedBy: 'user-3',
        performedAt: Date.now() - 2400000
      }
    ]
  },
  {
    id: 'task-2',
    channelId: 'channel-1',
    title: '故障设备维修',
    description: '李工负责维修A生产线的故障设备',
    assigneeId: 'user-2',
    priority: 'urgent',
    status: 'inProgress',
    dueDate: Date.now() + 7200000,
    createdAt: Date.now() - 3600000,
    activities: [
      {
        id: 'activity-3',
        taskId: 'task-2',
        type: 'created',
        description: '创建了任务',
        performedBy: 'user-2',
        performedAt: Date.now() - 3600000
      },
      {
        id: 'activity-4',
        taskId: 'task-2',
        type: 'status_changed',
        description: '将状态改为"进行中"',
        performedBy: 'user-2',
        performedAt: Date.now() - 1800000
      }
    ]
  },
  {
    id: 'task-3',
    channelId: 'channel-1',
    title: '维修报告撰写',
    description: '编写设备故障维修报告',
    assigneeId: 'user-2',
    priority: 'important',
    status: 'todo',
    dueDate: Date.now() + 86400000,
    createdAt: Date.now() - 1800000,
    activities: [
      {
        id: 'activity-5',
        taskId: 'task-3',
        type: 'created',
        description: '创建了任务',
        performedBy: 'user-2',
        performedAt: Date.now() - 1800000
      }
    ]
  },
  {
    id: 'task-4',
    channelId: 'channel-2',
    title: '安全培训安排',
    description: '安排下周安全培训课程',
    assigneeId: 'user-3',
    priority: 'important',
    status: 'todo',
    dueDate: Date.now() + 432000000,
    createdAt: Date.now() - 86400000,
    activities: [
      {
        id: 'activity-6',
        taskId: 'task-4',
        type: 'created',
        description: '创建了任务',
        performedBy: 'user-3',
        performedAt: Date.now() - 86400000
      }
    ]
  },
  {
    id: 'task-5',
    channelId: 'channel-3',
    title: '设备保养记录',
    description: '更新设备保养计划表',
    assigneeId: 'user-2',
    priority: 'normal',
    status: 'inProgress',
    dueDate: Date.now() + 172800000,
    createdAt: Date.now() - 172800000,
    activities: [
      {
        id: 'activity-7',
        taskId: 'task-5',
        type: 'created',
        description: '创建了任务',
        performedBy: 'user-2',
        performedAt: Date.now() - 172800000
      },
      {
        id: 'activity-8',
        taskId: 'task-5',
        type: 'status_changed',
        description: '将状态改为"进行中"',
        performedBy: 'user-2',
        performedAt: Date.now() - 86400000
      }
    ]
  }
];
