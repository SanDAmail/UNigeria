import { Message } from '../types';

const DB_NAME = 'UNigeriaDB';
const DB_VERSION = 1;
const CHAT_HISTORY_STORE = 'chatHistories';

let db: IDBDatabase;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Error opening DB');
      reject('Error opening DB');
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(CHAT_HISTORY_STORE)) {
        dbInstance.createObjectStore(CHAT_HISTORY_STORE, { keyPath: 'id' });
      }
    };
  });
};

export const getChatHistory = async (chatId: string): Promise<Message[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHAT_HISTORY_STORE], 'readonly');
    const store = transaction.objectStore(CHAT_HISTORY_STORE);
    const request = store.get(chatId);

    request.onerror = () => {
      reject('Error fetching chat history');
    };
    
    request.onsuccess = () => {
      resolve(request.result ? request.result.messages : []);
    };
  });
};

export const saveChatHistory = async (chatId: string, messages: Message[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHAT_HISTORY_STORE], 'readwrite');
    const store = transaction.objectStore(CHAT_HISTORY_STORE);
    const request = store.put({ id: chatId, messages });
    
    request.onerror = () => {
      reject('Error saving chat history');
    };

    request.onsuccess = () => {
      resolve();
    };
  });
};

export const clearChatHistory = async (chatId: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CHAT_HISTORY_STORE], 'readwrite');
    const store = transaction.objectStore(CHAT_HISTORY_STORE);
    const request = store.delete(chatId);
    
    request.onerror = () => {
      reject('Error clearing chat history');
    };

    request.onsuccess = () => {
      resolve();
    };
  });
};