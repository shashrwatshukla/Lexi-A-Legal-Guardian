"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { 
  loginEmail, 
  signUpEmail, 
  loginWithGoogle, 
  sendReset,
  resendVerificationEmail
} from '../../lib/auth';
import VerificationModal from '../../components/auth/VerificationModal';
import SuccessModal from '../../components/auth/SuccessModal';
import AuthMethodModal from '../../components/auth/AuthMethodModal';
import CountryDropdown from '../../components/auth/CountryDropdown';

export default function AuthPage() {
  const router = useRouter();
  
  // Form states
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    username: '',
    name: '', 
    gender: '',
    dob: '',
    email: '', 
    region: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  
  // Modal states
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAuthMethodModal, setShowAuthMethodModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingSignupEmail, setPendingSignupEmail] = useState('');
  
  // Password states
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // ✅ Auth state listener
  useEffect(() => {
    let mounted = true;
    let authTimeout;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      
      console.log('🔐 [AUTH PAGE] Auth state changed:', user?.email || 'No user');
      
      if (user) {
        console.log('👤 [AUTH PAGE] User detected:', user.email);
        
        if (user.emailVerified) {
          console.log('✅ [AUTH PAGE] Email verified, redirecting to home');
          router.replace('/home');
        } else {
          console.log('⚠️ [AUTH PAGE] Email NOT verified, signing out');
          await signOut(auth);
          setAuthLoading(false);
        }
      } else {
        console.log('👤 [AUTH PAGE] No user, showing auth page');
        setAuthLoading(false);
      }
    });

    authTimeout = setTimeout(() => {
      if (mounted && authLoading) {
        console.log('⏱️ Auth check timeout');
        setAuthLoading(false);
      }
    }, 5000);
    
    return () => {
      mounted = false;
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, [router, authLoading]);

  // ✅ Password strength validation
  useEffect(() => {
    const password = signupData.password;
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [signupData.password]);

  const isPasswordValid = useCallback(() => {
    return Object.values(passwordStrength).every(Boolean);
  }, [passwordStrength]);

  // ✅ LOADING SCREEN
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <img src="/logo.png" alt="Lexi Logo" className="w-full h-full object-contain animate-pulse" />
          </div>
          <div className="text-black text-lg font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  // ✅ LOGIN HANDLER (NO 2FA)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('🔐 LOGIN STARTED');
    
    try {
      await loginEmail({ 
        email: loginData.email.trim(), 
        password: loginData.password 
      });
      
      const user = auth.currentUser;
      if (!user) throw new Error('Authentication failed');

      if (!user.emailVerified) {
        await signOut(auth);
        setVerificationEmail(loginData.email);
        setModalType('email-verification');
        setShowEmailVerificationModal(true);
        setLoading(false);
        return;
      }
      
      // ✅ No 2FA checks - direct login
      console.log('✅ LOGIN COMPLETE - Redirecting to home');
      setSuccessMessage('Welcome back!');
      setShowSuccessModal(true);
      setLoading(false);
      
      setTimeout(() => {
        router.replace('/home');
      }, 1500);
      
    } catch (err) {
      console.error('❌ LOGIN ERROR:', err);
      
      try {
        await signOut(auth);
      } catch (signOutErr) {
        console.error('Sign out error:', signOutErr);
      }
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.code === 'auth/user-not-found') errorMessage = 'No account found with this email.';
      else if (err.code === 'auth/wrong-password') errorMessage = 'Incorrect password.';
      else if (err.code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
      else if (err.code === 'auth/too-many-requests') errorMessage = 'Too many attempts. Please try again later.';
      else if (err.message) errorMessage = err.message;
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // ✅ SIGNUP HANDLER
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isPasswordValid()) {
      setError('Password does not meet security requirements');
      setLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const birthDate = new Date(signupData.dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 13) {
      setError('You must be at least 13 years old to sign up');
      setLoading(false);
      return;
    }

    try {
      const signupPromise = signUpEmail({
        username: signupData.name.trim(),
        email: signupData.email.trim(),
        password: signupData.password,
        uniqueUsername: signupData.username.trim().toLowerCase(),
        gender: signupData.gender,
        dob: signupData.dob,
        region: signupData.region.trim()
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signup is taking too long. Please try again.')), 15000)
      );
      
      await Promise.race([signupPromise, timeoutPromise]);
      
      setPendingSignupEmail(signupData.email);
      setShowAuthMethodModal(true);
      setLoading(false);
      
      setSignupData({ 
        username: '', name: '', gender: '', dob: '', email: '', region: '', password: '', confirmPassword: ''
      });
      
    } catch (err) {
      console.error('❌ Signup error:', err);
      
      let errorMessage = 'Signup failed. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please log in.';
        setIsSignUp(false);
        setLoginData({ email: signupData.email, password: '' });
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // ✅ AUTH METHOD SELECTION
  const handleAuthMethodSelect = async (method) => {
    setShowAuthMethodModal(false);
    setVerificationEmail(pendingSignupEmail);
    setModalType('email-verification');
    setShowEmailVerificationModal(true);
    await auth.signOut();
  };

  // ✅ GOOGLE SIGN-IN
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      await loginWithGoogle();
      setSuccessMessage('Welcome!');
      setShowSuccessModal(true);
      setLoading(false);
      setTimeout(() => router.replace('/home'), 1500);
    } catch (err) {
      console.error('❌ Google sign-in error:', err);
      setError(err.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  // ✅ FORGOT PASSWORD
  const handleForgotPassword = async () => {
    const email = loginData.email.trim();
    
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await sendReset(email);
      setVerificationEmail(email);
      setModalType('forgot-password');
      setShowEmailVerificationModal(true);
      setLoading(false);
    } catch (err) {
      console.error('❌ Reset error:', err);
      setError('Failed to send reset email.');
      setLoading(false);
    }
  };

  // ✅ RESEND EMAIL
  const handleResendEmail = async () => {
    try {
      await resendVerificationEmail();
      return true;
    } catch (err) {
      return false;
    }
  };

  // ✅ MODAL HANDLERS
  const handleEmailModalClose = () => {
    setShowEmailVerificationModal(false);
    if (modalType === 'email-verification') {
      setIsSignUp(false);
      setLoginData({ email: verificationEmail, password: '' });
    }
  };

  const handleAuthMethodModalClose = async () => {
    setShowAuthMethodModal(false);
    await auth.signOut();
  };

  // ✅ TOGGLE FORM
  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setLoginData({ email: '', password: '' });
    setSignupData({ 
      username: '', name: '', gender: '', dob: '', email: '', region: '', password: '', confirmPassword: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      
      {/* ===== CSS FIXES ===== */}
      <style jsx global>{`
        /* ✅ FIX: Remove autofill gray background */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active,
        select:-webkit-autofill,
        select:-webkit-autofill:hover,
        select:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: black !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        /* ✅ FIX: Better select dropdown styling */
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
          padding-right: 36px;
        }

        /* ✅ FIX: Date input cursor starts at day */
        input[type="date"]::-webkit-datetime-edit-day-field:focus,
        input[type="date"]::-webkit-datetime-edit-month-field:focus,
        input[type="date"]::-webkit-datetime-edit-year-field:focus {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }

        /* ✅ FIX: Better focus states */
        input:focus,
        select:focus {
          outline: none;
          border-color: black !important;
          ring: 1px solid black !important;
        }

        /* ✅ FIX: Smooth transitions */
        input, select, button {
          transition: all 0.2s ease-in-out;
        }

        /* ✅ CUSTOM SCROLLBAR */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db #f3f4f6;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      {/* ===== MODALS ===== */}
      <AuthMethodModal
        isOpen={showAuthMethodModal}
        onClose={handleAuthMethodModalClose}
        onSelectMethod={handleAuthMethodSelect}
        email={pendingSignupEmail}
      />

      <VerificationModal
        isOpen={showEmailVerificationModal}
        onClose={handleEmailModalClose}
        type={modalType}
        email={verificationEmail}
        onResend={handleResendEmail}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        message={successMessage}
      />

      {/* ===== LOGO ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10"
      >
        <button
          onClick={() => router.push('/intro')}
          className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 relative group-hover:scale-110 transition-transform duration-300">
            <img src="/logo.png" alt="Lexi Logo" className="w-full h-full object-contain" />
          </div>
          <span 
            className="text-black text-2xl sm:text-3xl group-hover:text-gray-700 transition-colors duration-300"
            style={{ 
              fontFamily: '"Inter", system-ui, sans-serif',
              fontWeight: 900,
              letterSpacing: '-0.02em'
            }}
          >
            Lexi
          </span>
        </button>
      </motion.div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[420px]">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white px-4 sm:px-6 py-4 flex flex-col" 
            style={{ 
              height: 'auto',
              maxHeight: '90vh',
              minHeight: '500px'
            }}
          >
            
            {/* HEADER */}
            <div className="flex-shrink-0 mb-4">
              <h1 className="text-[26px] sm:text-[28px] font-bold text-black mb-1.5 leading-tight">
                {isSignUp ? 'Stop signing blindly' : 'Ready to analyze?'}
              </h1>
              <p className="text-[13px] sm:text-[14px] leading-relaxed text-gray-700">
                {isSignUp ? 'Create your free account' : 'Log in to your account'}
              </p>
            </div>

            {/* GOOGLE BUTTON */}
            <div className="flex-shrink-0 mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 bg-white border border-gray-300 text-black font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-[13px] sm:text-[14px]">
                  {loading ? 'Please wait...' : 'Continue with Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative my-3 sm:my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>
            </div>
            
            {/* SCROLLABLE FORM */}
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? 'signup' : 'login'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={isSignUp ? handleSignup : handleLogin} className="space-y-2.5 sm:space-y-3">
                    
                    {isSignUp ? (
                      // ===== SIGNUP FORM =====
                      <>
                        {/* Username */}
                        <div>
                          <label className="block text-[11px] sm:text-[12px] font-bold text-gray-800 mb-1">
                            Username (unique) *
                          </label>
                          <input
                            type="text"
                            required
                            value={signupData.username}
                            onChange={(e) => setSignupData({...signupData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] sm:text-[14px] placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            placeholder="@username"
                            minLength={3}
                            maxLength={20}
                          />
                        </div>

                        {/* Name */}
                        <div>
                          <label className="block text-[11px] sm:text-[12px] font-bold text-gray-800 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={signupData.name}
                            onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] sm:text-[14px] placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            placeholder="John Doe"
                            minLength={2}
                          />
                        </div>

                        {/* Gender & DOB */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div>
                            <label className="block text-[11px] sm:text-[12px] font-bold text-gray-800 mb-1">
                              Gender *
                            </label>
                            <select
                              required
                              value={signupData.gender}
                              onChange={(e) => setSignupData({...signupData, gender: e.target.value})}
                              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] sm:text-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all cursor-pointer"
                            >
                              <option value="">Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="non-binary">Non-binary</option>
                              <option value="other">Other</option>
                              <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] sm:text-[12px] font-bold text-gray-800 mb-1">
                              Birth Date *
                            </label>
                            <input
                              type="date"
                              required
                              value={signupData.dob}
                              onChange={(e) => setSignupData({...signupData, dob: e.target.value})}
                              max={new Date().toISOString().split('T')[0]}
                              className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] sm:text-[14px] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-[11px] sm:text-[12px] font-bold text-gray-800 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={signupData.email}
                            onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] sm:text-[14px] placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            placeholder="name@example.com"
                          />
                        </div>

                        {/* ✅ Country Dropdown (NEW!) */}
                        <div>
                          <label className="block text-[11px] sm:text-[12px] font-bold text-gray-800 mb-1">
                            Region/Country *
                          </label>
                          <CountryDropdown
                            value={signupData.region}
                            onChange={(value) => setSignupData({...signupData, region: value})}
                            required
                          />
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-[11px] sm:text-[12px] font-bold text-gray-800 mb-1">
                            Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={signupData.password}
                              onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                              className="w-full px-3 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-black text-[13px] sm:text-[14px] placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                              placeholder="Create password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center"
                            >
                              {showPassword ? (
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          
                          {/* Password Requirements */}
                          {signupData.password && (
                            <div className="mt-2 space-y-0.5">
                              {[
                                { key: 'hasMinLength', text: 'At least 8 characters' },
                                { key: 'hasUpperCase', text: 'One uppercase letter' },
                                { key: 'hasLowerCase', text: 'One lowercase letter' },
                                { key: 'hasNumber', text: 'One number' },
                                { key: 'hasSpecialChar', text: 'One special character (!@#$%^&*)' }
                              ].map(req => (
                                <div key={req.key} className={`text-[10px] sm:text-[11px] flex items-center gap-1 ${passwordStrength[req.key] ? 'text-green-600' : 'text-gray-500'}`}>
                                  <span className="w-3">{passwordStrength[req.key] ? '✓' : '○'}</span>
                                  <span>{req.text}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-[11px] sm:text-[12px] font-bold text-gray-800 mb-1">
                            Confirm Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              value={signupData.confirmPassword}
                              onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                              className="w-full px-3 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-black text-[13px] sm:text-[14px] placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                              placeholder="Re-enter password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center"
                            >
                              {showConfirmPassword ? (
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          {signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
                            <p className="text-red-600 text-[10px] sm:text-[11px] mt-1 flex items-center gap-1">
                              <span>⚠️</span> Passwords do not match
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      // ===== LOGIN FORM =====
                      <>
                        {/* Email */}
                        <div>
                          <label className="block text-[11px] sm:text-[12px] font-bold text-gray-800 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            value={loginData.email}
                            onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-black text-[13px] sm:text-[14px] placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                            placeholder="name@example.com"
                          />
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-[11px] sm:text-[12px] font-bold text-gray-800 mb-1">
                            Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showLoginPassword ? "text" : "password"}
                              required
                              value={loginData.password}
                              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                              className="w-full px-3 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-black text-[13px] sm:text-[14px] placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                              placeholder="Enter password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center"
                            >
                              {showLoginPassword ? (
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={handleForgotPassword}
                            disabled={loading}
                            className="text-[11px] sm:text-[12px] font-semibold text-gray-700 hover:text-black hover:underline transition-all disabled:opacity-50"
                          >
                            Forgot password?
                          </button>
                        </div>
                      </>
                    )}

                    {/* Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 rounded-lg text-[11px] sm:text-[12px] bg-red-50 text-red-700 border border-red-100 flex items-start gap-2">
                            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || (isSignUp && (!isPasswordValid() || signupData.password !== signupData.confirmPassword))}
                      className="w-full py-2.5 sm:py-3 bg-black text-white font-semibold text-[13px] sm:text-[14px] rounded-lg hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 mt-4"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isSignUp ? 'Creating account...' : 'Logging in...'}
                        </span>
                      ) : (
                        isSignUp ? 'Create account' : 'Log in'
                      )}
                    </button>
                  </form>

                  {/* Toggle Form */}
                  <div className="mt-4 text-center text-[12px] sm:text-[13px]">
                    <span className="text-gray-600">
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    </span>
                    <button
                      type="button"
                      onClick={toggleForm}
                      disabled={loading}
                      className="text-black font-bold hover:underline disabled:opacity-50"
                    >
                      {isSignUp ? 'Log in' : 'Sign up'}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Terms - Fixed Bottom */}
            <div className="pt-3 mt-4 border-t border-gray-100 flex-shrink-0">
              <p className="text-center text-[10px] sm:text-[11px] text-gray-500 leading-relaxed">
                By continuing, you agree to our{' '}
                <button onClick={() => router.push('/terms')} className="text-gray-700 hover:text-black underline">
                  Terms
                </button>
                {' '}and{' '}
                <button onClick={() => router.push('/privacy')} className="text-gray-700 hover:text-black underline">
                  Privacy Policy
                </button>
              </p>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}