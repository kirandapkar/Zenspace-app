import { FileData } from '../types';

export const processFile = (file: File): Promise<FileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,") to get raw base64
      const base64 = base64String.split(',')[1];
      resolve({
        base64,
        mimeType: file.type,
        previewUrl: base64String
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
