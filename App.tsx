import React, { useState, useEffect } from 'react';
import { User, AuthMethod, CommunityBook, AppView } from './types';
import { LoginScreen } from './components/LoginScreen';
import { Reader } from './components/Reader';
import { subscribeToCommunityBooks, deleteBookFromCloud } from './services/cloudService';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { MyLibraryView } from './components/MyLibraryView';
import { ProfileView } from './components/ProfileView';
import { UploadModal } from './components/UploadModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { Toast } from './components/Toast';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('home');

  // Cloud Library State
  const [communityBooks, setCommunityBooks] = useState<CommunityBook[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [readingBook, setReadingBook] = useState<CommunityBook | null>(null);
  
  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Delete State
  const [bookToDelete, setBookToDelete] = useState<CommunityBook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const isAnonymous = firebaseUser.isAnonymous;
        const name = firebaseUser.displayName || 
                    (firebaseUser.email ? firebaseUser.email.split('@')[0] : (isAnonymous ? 'Guest' : 'Member'));
        
        let method = AuthMethod.EMAIL;
        if (isAnonymous) method = AuthMethod.GUEST;
        else if (firebaseUser.providerData.some(p => p.providerId === 'google.com')) method = AuthMethod.GOOGLE;

        setUser({
          id: firebaseUser.uid,
          name: name,
          email: firebaseUser.email || undefined,
          avatar: firebaseUser.photoURL || undefined,
          authMethod: method
        });
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to Community Books (Real-time)
  useEffect(() => {
    if (user) {
      setLoadingLibrary(true);
      const unsubscribe = subscribeToCommunityBooks((books) => {
        setCommunityBooks(books);
        setLoadingLibrary(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleGuestAction = () => {
    setToast({ 
      message: "Guest accounts are read-only. Please sign in to download, upload, or save books.", 
      type: 'error' 
    });
  };

  const handleUploadClick = () => {
    if (user?.authMethod === AuthMethod.GUEST) {
      handleGuestAction();
      return;
    }
    setShowUploadModal(true);
  };

  const handleDeleteRequest = (e: React.MouseEvent, book: CommunityBook) => {
    e.stopPropagation();
    
    if (!user) return;
    
    // Normal Check: Only owner can delete
    if (user.id !== book.uploaderId) {
        alert("You can only delete books that you have uploaded.");
        return;
    }
    
    setBookToDelete(book);
  };
  
  const handleReaderDeleteRequest = (book: CommunityBook) => {
      setBookToDelete(book);
  };

  const confirmDelete = async () => {
      if (!bookToDelete) return;
      
      const deletedId = bookToDelete.id;
      setIsDeleting(true);
      
      try {
        setCommunityBooks(prev => prev.filter(b => b.id !== deletedId));

        if (readingBook?.id === deletedId) {
            setReadingBook(null);
        }

        await deleteBookFromCloud(bookToDelete);
        
        setBookToDelete(null);
        setToast({ message: "Book permanently deleted.", type: 'success' });
      } catch (err: any) {
        console.error(err);
        setToast({ message: "Failed to delete book. Please try again.", type: 'error' });
      } finally {
        setIsDeleting(false);
      }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUserUpdate = (updatedData: Partial<User>) => {
      if (user) {
          setUser({ ...user, ...updatedData });
      }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-600 w-8 h-8" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Upload Modal */}
      {showUploadModal && (
          <UploadModal 
             userId={user.id} 
             userName={user.name} 
             onClose={() => setShowUploadModal(false)}
             onSuccess={() => {
                setCurrentView('library');
                setToast({ message: "Book uploaded successfully!", type: 'success' });
             }} 
          />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={!!bookToDelete}
        bookTitle={bookToDelete?.title || ''}
        onConfirm={confirmDelete}
        onCancel={() => setBookToDelete(null)}
        isDeleting={isDeleting}
      />

      {/* Reader Modal */}
      {readingBook && (
        <Reader 
          book={readingBook} 
          onClose={() => setReadingBook(null)}
          onDelete={handleReaderDeleteRequest} 
        />
      )}

      {/* Main Header */}
      <Header 
          currentView={currentView}
          onChangeView={setCurrentView}
          user={user}
          onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          {/* Views */}
          {currentView === 'home' && (
              <HomeView 
                  books={communityBooks} 
                  loading={loadingLibrary}
                  currentUserId={user.id}
                  onRead={setReadingBook}
                  onDelete={handleDeleteRequest}
                  isGuest={user.authMethod === AuthMethod.GUEST}
                  onGuestAction={handleGuestAction}
              />
          )}

          {currentView === 'library' && (
              <MyLibraryView 
                  books={communityBooks}
                  currentUserId={user.id}
                  onRead={setReadingBook}
                  onDelete={handleDeleteRequest}
                  onUploadClick={handleUploadClick}
                  isGuest={user.authMethod === AuthMethod.GUEST}
                  onGuestAction={handleGuestAction}
              />
          )}

          {currentView === 'profile' && (
              <ProfileView 
                  user={user}
                  onUpdateUser={handleUserUpdate}
              />
          )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;