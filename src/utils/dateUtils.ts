import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  
  if (isToday(date)) {
    return format(date, 'HH:mm');
  }
  
  if (isYesterday(date)) {
    return `昨天 ${format(date, 'HH:mm')}`;
  }
  
  return format(date, 'MM/DD HH:mm');
};

export const formatDate = (timestamp: number): string => {
  return format(new Date(timestamp), 'yyyy年MM月dd日', { locale: zhCN });
};

export const formatDateTime = (timestamp: number): string => {
  return format(new Date(timestamp), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
};

export const formatRelativeTime = (timestamp: number): string => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: zhCN });
};

export const formatTaskDueDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `已逾期 ${Math.abs(diffDays)} 天`;
  }
  if (diffDays === 0) {
    return '今天截止';
  }
  if (diffDays === 1) {
    return '明天截止';
  }
  return `${diffDays}天后截止`;
};
