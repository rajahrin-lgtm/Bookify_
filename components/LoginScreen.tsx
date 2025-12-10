import React, { useState } from 'react';
import { Button } from './Button';
import { BookOpen, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { auth } from '../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously
} from 'firebase/auth';

interface LoginScreenProps {
  onLogin?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: any) => {
    // Only log actual errors, not user mistakes (wrong password)
    const expectedErrors = ['auth/invalid-credential', 'auth/user-not-found', 'auth/wrong-password'];
    if (!expectedErrors.includes(err.code)) {
        console.error("Auth Error:", err);
    }

    if (err.code === 'auth/invalid-email') {
      setError("Invalid email address.");
    } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      setError("Incorrect email or password.");
    } else if (err.code === 'auth/invalid-credential') {
      // This is the generic error for Email Enumeration Protection
      setError("Incorrect email or password. If you haven't created an account yet, please Sign Up.");
    } else if (err.code === 'auth/email-already-in-use') {
      setError("Email is already registered. Please Sign In.");
    } else if (err.code === 'auth/weak-password') {
      setError("Password should be at least 6 characters.");
    } else {
      setError(err.message || "Authentication failed. Please try again.");
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      handleError(err);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      handleError(err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Side - Brand & Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-900 relative flex-col justify-between p-12 text-white overflow-hidden">
         {/* Background Pattern */}
         <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                   <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
         </div>
         
         {/* Abstract Shapes */}
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-600 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[100px] opacity-30 animate-pulse delay-500"></div>

         <div className="relative z-10 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-8">
               <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <BookOpen className="w-6 h-6 text-brand-200" />
               </div>
               <span className="font-serif text-2xl font-bold tracking-tight">Bookify</span>
            </div>
            
            <h1 className="font-serif text-5xl font-bold leading-tight mb-6">
               Your digital sanctuary for <span className="text-brand-300">knowledge</span> and <span className="text-brand-300">stories</span>.
            </h1>
            <p className="text-brand-100 text-lg max-w-md leading-relaxed">
               Discover, read, and share books with a community of readers. Powered by AI to help you find your next great adventure.
            </p>
         </div>

         <div className="relative z-10 flex gap-4 text-sm font-medium text-brand-200 animate-fade-in-up delay-200">
             <span>© 2024 Bookify</span>
             <span>•</span>
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
         </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50 lg:bg-white">
         <div className="max-w-md w-full animate-fade-in-up delay-100">
            <div className="bg-white lg:bg-transparent p-8 lg:p-0 rounded-2xl shadow-xl lg:shadow-none">
               <div className="mb-10">
                  <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">
                     {isSignUp ? 'Join the community' : 'Welcome back'}
                  </h2>
                  <p className="text-slate-500">
                     {isSignUp ? 'Start your reading journey today.' : 'Please enter your details to sign in.'}
                  </p>
               </div>

               {error && (
                  <div className="mb-6 bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-start gap-2 animate-scale-in">
                     <span className="mt-0.5 block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                     {error}
                  </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                     <label className="block text-sm font-semibold text-slate-700">Email</label>
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                           <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                        </div>
                        <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           required
                           className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 placeholder-slate-400 transition-all bg-slate-50 focus:bg-white"
                           placeholder="name@example.com"
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="block text-sm font-semibold text-slate-700">Password</label>
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                           <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                        </div>
                        <input
                           type="password"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           required
                           minLength={6}
                           className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 placeholder-slate-400 transition-all bg-slate-50 focus:bg-white"
                           placeholder="••••••••"
                        />
                     </div>
                  </div>

                  <Button 
                     type="submit"
                     variant="primary" 
                     className="w-full justify-center py-3.5 text-base shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:-translate-y-0.5 active:translate-y-0"
                     isLoading={isLoading}
                  >
                     {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
               </form>

               <div className="mt-8">
                  <div className="relative">
                     <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                     </div>
                     <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
                     </div>
                  </div>

                  <div className="mt-6">
                     <button
                        onClick={handleGuestLogin}
                        type="button"
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200"
                        disabled={isLoading}
                     >
                        <User className="h-5 w-5 text-slate-900 mr-2" />
                        Guest Access
                     </button>
                  </div>
               </div>

               <div className="mt-8 text-center">
                  <button 
                     onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                        setEmail('');
                        setPassword('');
                     }}
                     className="text-sm text-slate-600 hover:text-brand-600 font-medium transition-colors"
                  >
                     {isSignUp ? 'Already have an account?' : "Don't have an account?"} <span className="text-brand-600 hover:underline">{isSignUp ? 'Sign in' : 'Sign up'}</span>
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};