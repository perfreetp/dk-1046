# 局域网应急协同桌面客户端 - 技术架构文档

## 1. 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                    表现层 (UI Layer)                     │
│  React 18 + TailwindCSS + Lucide React Icons           │
├─────────────────────────────────────────────────────────┤
│                    状态管理层                            │
│  React Context + useReducer (全局状态)                  │
├─────────────────────────────────────────────────────────┤
│                    业务逻辑层                            │
│  自定义 Hooks (useChannel, useMessage, useFile等)       │
├─────────────────────────────────────────────────────────┤
│                    数据访问层                            │
│  LocalStorage / IndexedDB (离线存储)                   │
├─────────────────────────────────────────────────────────┤
│                    工具函数层                            │
│  语音录制 / 文件处理 / 数据导出 / 缓存管理               │
└─────────────────────────────────────────────────────────┘
```

## 2. 技术栈选择

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2.0 | UI框架 |
| Vite | 5.0.0 | 构建工具 |
| TailwindCSS | 3.4.0 | 样式框架 |
| Lucide React | 最新版 | 图标库 |
| date-fns | 最新版 | 日期处理 |
| uuid | 最新版 | ID生成 |

## 3. 路由定义

| 路由 | 组件 | 功能 |
|------|------|------|
| / | 重定向到 /channels | 首页 |
| /channels | ChannelList | 频道列表与消息面板 |
| /files | FileBox | 文件箱管理 |
| /members | MemberStatus | 人员状态监控 |
| /kanban | EventKanban | 事件看板 |

## 4. 组件结构

```
src/
├── components/
│   ├── layout/
│   │   ├── TopBar.jsx          # 顶部工具栏
│   │   ├── Sidebar.jsx         # 左侧导航栏
│   │   └── StatusBar.jsx       # 底部状态栏
│   ├── channels/
│   │   ├── ChannelList.jsx     # 频道列表
│   │   ├── ChannelItem.jsx     # 频道项
│   │   └── CreateChannel.jsx  # 创建频道弹窗
│   ├── messages/
│   │   ├── MessagePanel.jsx    # 消息面板
│   │   ├── MessageInput.jsx    # 消息输入框
│   │   ├── MessageItem.jsx     # 消息项
│   │   └── VoiceRecorder.jsx   # 语音录制
│   ├── files/
│   │   ├── FileBox.jsx         # 文件箱
│   │   ├── FileItem.jsx        # 文件项
│   │   └── FileUploader.jsx    # 文件上传器
│   ├── members/
│   │   ├── MemberList.jsx      # 成员列表
│   │   ├── MemberItem.jsx      # 成员项
│   │   └── MemberDetail.jsx    # 成员详情
│   └── kanban/
│       ├── KanbanBoard.jsx     # 看板面板
│       ├── KanbanColumn.jsx    # 看板列
│       ├── KanbanCard.jsx      # 看板卡片
│       └── TaskDetail.jsx      # 任务详情
├── context/
│   ├── AppContext.jsx          # 全局上下文
│   └── ChannelContext.jsx      # 频道上下文
├── hooks/
│   ├── useChannels.js          # 频道管理
│   ├── useMessages.js          # 消息管理
│   ├── useFiles.js             # 文件管理
│   ├── useMembers.js           # 成员管理
│   └── useTasks.js             # 任务管理
├── utils/
│   ├── storage.js              # 本地存储
│   ├── fileUtils.js            # 文件处理
│   ├── audioUtils.js           # 音频处理
│   └── exportUtils.js          # 导出功能
├── data/
│   └── mockData.js             # 模拟数据
├── App.jsx                     # 应用入口
├── main.jsx                    # React渲染入口
└── index.css                   # 全局样式
```

## 5. 数据模型

### 5.1 数据实体

```javascript
// 频道
Channel {
  id: string,
  name: string,
  description: string,
  category: 'emergency' | 'task' | 'general',
  members: string[],           // 成员ID列表
  createdAt: timestamp,
  createdBy: string,
  isArchived: boolean,
  unreadCount: number
}

// 消息
Message {
  id: string,
  channelId: string,
  senderId: string,
  type: 'text' | 'voice' | 'image' | 'file',
  content: string,             // 文本内容或文件URL
  mentions: string[],          // @提及的用户ID
  readBy: string[],            // 已读用户ID列表
  createdAt: timestamp,
  attachmentUrl?: string,
  attachmentName?: string,
  duration?: number            // 语音时长（秒）
}

// 成员
Member {
  id: string,
  name: string,
  position: string,
  department: string,
  status: 'online' | 'offline' | 'busy' | 'away',
  lastSeen: timestamp,
  avatar?: string,
  email: string
}

// 文件
File {
  id: string,
  name: string,
  type: 'image' | 'document' | 'archive' | 'other',
  size: number,
  channelId: string,
  uploadedBy: string,
  uploadedAt: timestamp,
  distributeTo: string[],      // 分发对象
  confirmedBy: string[],        // 已确认接收
  expiredAt: timestamp,
  url: string
}

// 任务
Task {
  id: string,
  channelId: string,
  title: string,
  description: string,
  assigneeId: string,
  priority: 'urgent' | 'important' | 'normal',
  status: 'todo' | 'inProgress' | 'completed',
  dueDate: timestamp,
  createdAt: timestamp,
  completedAt?: timestamp
}
```

### 5.2 存储策略

```javascript
// LocalStorage 结构
{
  "emergency_channels": [...],      // 频道列表
  "emergency_messages": {...},      // 消息映射 {channelId: [...]}
  "emergency_files": [...],         // 文件列表
  "emergency_tasks": [...],          // 任务列表
  "emergency_members": [...],       // 成员列表
  "emergency_user": {...},          // 当前用户信息
  "emergency_settings": {...}       // 用户设置
}

// IndexedDB 表
{
  "fileCache": {...},               // 文件缓存
  "messageCache": {...},            // 消息缓存
  "offlineQueue": [...]             // 离线操作队列
}
```

## 6. 核心功能实现

### 6.1 语音录制
- 使用 Web Audio API 获取音频流
- MediaRecorder API 录制音频
- 转换为 Blob 对象存储
- 支持录音时长显示和预览播放

### 6.2 文件上传
- 拖拽上传和点击上传
- 文件类型和大小验证
- 进度条显示
- 压缩图片自动优化

### 6.3 离线缓存
- IndexedDB 存储二进制文件
- 缓存策略：LRU淘汰
- 存储空间限制设置
- 过期文件自动清理

### 6.4 数据导出
- 聊天记录导出为 JSON/TXT
- 文件列表导出为 CSV
- 归档文件打包下载（ZIP）

## 7. 状态管理

```javascript
// AppContext 全局状态
{
  currentUser: Member,
  currentChannel: Channel | null,
  channels: Channel[],
  unreadChannels: Set<string>,
  settings: {
    offlineCacheSize: number,       // MB
    autoCleanup: boolean,
    cleanupDays: number,
    notifications: boolean
  },
  connectionStatus: 'connected' | 'disconnected' | 'syncing'
}

// Reducer 动作
SET_USER,
SET_CHANNEL,
ADD_CHANNEL,
UPDATE_CHANNEL,
DELETE_CHANNEL,
ADD_MESSAGE,
MARK_READ,
ADD_FILE,
DELETE_FILE,
UPDATE_TASK,
ADD_TASK,
UPDATE_MEMBER_STATUS,
SET_SETTINGS
```

## 8. UI状态管理

```javascript
// 组件本地状态
MessagePanel: {
  inputValue: string,
  isRecording: boolean,
  showMentionPopup: boolean,
  mentionQuery: string
}

FileBox: {
  filterType: 'all' | 'image' | 'document' | 'archive',
  searchQuery: string,
  selectedFiles: Set<string>
}

KanbanBoard: {
  draggedTask: Task | null,
  showTaskDetail: boolean,
  currentTask: Task | null
}
```

## 9. 性能优化

- React.memo 缓存纯展示组件
- useMemo/useCallback 避免不必要渲染
- 虚拟列表（react-window）处理长消息列表
- 图片懒加载
- 防抖/节流搜索输入

## 10. 响应式断点

```css
/* TailwindCSS 断点 */
sm: 640px    /* 小平板 */
md: 768px    /* 平板 */
lg: 1024px   /* 小桌面 */
xl: 1280px   /* 桌面 */
2xl: 1536px  /* 大桌面 */

/* 布局切换点 */
- 1280px+: 完整三栏布局
- 1024-1279px: 紧凑两栏布局
- 768-1023px: 单栏 + 抽屉导航
- <768px: 全屏单栏 + 底部导航
```
