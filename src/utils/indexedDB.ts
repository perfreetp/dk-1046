const DB_NAME = 'EmergencyAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'audioMessages';

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveAudio(id: string, audioBlob: Blob, metadata: { messageId: string; channelId: string; duration: number }): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.put({
        id,
        blob: audioBlob,
        ...metadata,
        savedAt: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAudio(id: string): Promise<{ blob: Blob; url: string } | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        if (request.result) {
          const url = URL.createObjectURL(request.result.blob);
          resolve({ blob: request.result.blob, url });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAudioUrls(): Promise<Record<string, string>> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const urls: Record<string, string> = {};
        if (request.result) {
          request.result.forEach((item: any) => {
            urls[item.id] = URL.createObjectURL(item.blob);
          });
        }
        resolve(urls);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAudio(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageUsage(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let totalSize = 0;
        if (request.result) {
          request.result.forEach((item: any) => {
            if (item.blob) {
              totalSize += item.blob.size;
            }
          });
        }
        resolve(totalSize);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDBManager = new IndexedDBManager();

export const saveVoiceMessage = async (
  messageId: string,
  audioBlob: Blob,
  channelId?: string,
  duration?: number
): Promise<void> => {
  await indexedDBManager.saveAudio(messageId, audioBlob, {
    messageId,
    channelId: channelId || '',
    duration: duration || 0
  });
};

export const getVoiceMessage = async (messageId: string): Promise<{ blob: Blob; url: string } | null> => {
  return await indexedDBManager.getAudio(messageId);
};
