import { db, storage } from "../firebaseConfig";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { CommunityBook } from "../types";

const COLLECTION_NAME = "books";

/**
 * Uploads a file to Firebase Storage and saves metadata to Firestore
 */
export const uploadBookToCloud = async (
  file: File, 
  metadata: Partial<CommunityBook>,
  coverFile?: File
): Promise<void> => {
  try {
    // 1. Upload Book File to Storage
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${file.name}`;
    const storageRef = ref(storage, `library/${uniqueName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 2. Upload Cover Image (if provided)
    let coverUrl = '';
    if (coverFile) {
        const coverName = `covers/${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${coverFile.name}`;
        const coverRef = ref(storage, coverName);
        const coverSnapshot = await uploadBytes(coverRef, coverFile);
        coverUrl = await getDownloadURL(coverSnapshot.ref);
    }

    // 3. Determine Format (Enhanced with MIME check)
    const ext = file.name.split('.').pop()?.toLowerCase();
    const mime = file.type;
    let format: CommunityBook['format'] = 'other';
    
    if (mime === 'application/pdf' || ext === 'pdf') format = 'pdf';
    else if (mime === 'application/epub+zip' || ext === 'epub') format = 'epub';
    else if (mime === 'application/x-mobipocket-ebook' || ext === 'mobi') format = 'mobi';
    else if (mime === 'text/plain' || ext === 'txt') format = 'txt';

    // 4. Save Metadata to Firestore
    const bookData: Omit<CommunityBook, 'id'> = {
      title: metadata.title || file.name.replace(/\.[^/.]+$/, ""),
      url: downloadURL,
      uploadDate: Date.now(),
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      uploaderId: metadata.uploaderId!,
      uploaderName: metadata.uploaderName!,
      format: format,
      // Optional Metadata
      author: metadata.author || 'Unknown',
      genre: metadata.genre || 'General',
      description: metadata.description || '',
      isbn: metadata.isbn || '',
      year: metadata.year || '',
      language: metadata.language || 'English',
      tags: metadata.tags || [],
      coverUrl: coverUrl || metadata.coverUrl, // Allow coverUrl passed from generic placeholder if no file
      seriesName: metadata.seriesName || '',
      chapterCount: metadata.chapterCount || 0
    };

    await addDoc(collection(db, COLLECTION_NAME), bookData);

  } catch (error) {
    console.error("Error uploading book:", error);
    throw error;
  }
};

/**
 * Subscribes to the books collection for real-time updates
 */
export const subscribeToCommunityBooks = (
  onUpdate: (books: CommunityBook[]) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("uploadDate", "desc"));
  
  return onSnapshot(q, (querySnapshot) => {
    const books: CommunityBook[] = [];
    querySnapshot.forEach((doc) => {
      books.push({ id: doc.id, ...doc.data() } as CommunityBook);
    });
    onUpdate(books);
  });
};

/**
 * Delete a book from Cloud (Storage + Firestore)
 */
export const deleteBookFromCloud = async (book: CommunityBook) => {
  try {
    console.log("Attempting to delete book:", book.title);

    // 1. Attempt to delete Book File from Storage first
    // Only attempt if it looks like a Firebase Storage URL to avoid 'invalid-argument' errors
    if (book.url && book.url.includes("firebasestorage")) {
        try {
            const storageRef = ref(storage, book.url);
            await deleteObject(storageRef);
        } catch(e) {
            console.warn("File could not be deleted from storage (might not exist):", e);
        }
    } else {
        console.warn("Skipping storage delete for non-firebase URL:", book.url);
    }

    // 2. Delete Cover Image if it exists
    if (book.coverUrl && book.coverUrl.includes("firebasestorage")) {
         try {
             const coverRef = ref(storage, book.coverUrl);
             await deleteObject(coverRef);
         } catch(e) {
             console.warn("Cover could not be deleted:", e);
         }
    }

    // 3. Delete from Firestore (The Source of Truth)
    // This removes it from the UI
    await deleteDoc(doc(db, COLLECTION_NAME, book.id));
    console.log("Book successfully deleted from database.");

  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
};
