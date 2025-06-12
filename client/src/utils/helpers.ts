export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (mimetype: string): string => {
  if (!mimetype) return '📁'; // 處理 undefined 或 null 的情況
  if (mimetype.startsWith('image/')) return '🖼️';
  if (mimetype.startsWith('video/')) return '🎥';
  if (mimetype.startsWith('audio/')) return '🎵';
  if (mimetype.includes('pdf')) return '📄';
  if (mimetype.includes('zip') || mimetype.includes('rar')) return '📦';
  if (mimetype.includes('text')) return '📝';
  return '📁';
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // 備用方法
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const generateRoomUrl = (roomId: string): string => {
  return `${window.location.origin}/room/${roomId}`;
};
