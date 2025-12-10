import { LocalBook } from '../types';

const DB_NAME = 'BookifyDB';
const STORE_NAME = 'books';
const DB_VERSION = 1;

// Helper to open the database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create object store with 'id' as key
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        // Create index for querying by userId
        store.createIndex('userId', 'userId', { unique: false });
      }
    };
  });
};

/**
 * Saves a book to IndexedDB associated with a specific userId
 */
export const saveBookToStorage = async (book: LocalBook, userId: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      // Store the book object combined with the userId
      const request = store.put({ ...book, userId });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to save book to storage:", error);
    throw error;
  }
};

/**
 * Retrieves all books for a specific userId
 */
export const getBooksFromStorage = async (userId: string): Promise<LocalBook[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        // Results are the raw objects stored in IDB
        resolve(request.result as LocalBook[]);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to get books from storage:", error);
    return [];
  }
};

/**
 * Deletes a book by its ID
 */
export const deleteBookFromStorage = async (bookId: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(bookId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to delete book from storage:", error);
    throw error;
  }
};