export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getFileType = (fileName: string): 'image' | 'document' | 'archive' | 'other' => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
  
  if (imageExts.includes(ext)) return 'image';
  if (docExts.includes(ext)) return 'document';
  if (archiveExts.includes(ext)) return 'archive';
  return 'other';
};

export const getFileIcon = (type: 'image' | 'document' | 'archive' | 'other'): string => {
  const icons = {
    image: 'image',
    document: 'file-text',
    archive: 'archive',
    other: 'file'
  };
  return icons[type];
};

export const validateFile = (file: File, maxSize: number = 10485760): { valid: boolean; error?: string } => {
  if (file.size > maxSize) {
    return { valid: false, error: `文件大小超过限制（${formatFileSize(maxSize)}）` };
  }
  return { valid: true };
};
