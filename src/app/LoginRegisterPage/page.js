"use client"
import React, { useState, useEffect } from 'react';
import { Phone, Mail, User, Eye, EyeOff, ArrowLeft, CheckCircle, Shield, Timer, Sparkles, Lock, KeyRound } from 'lucide-react';
import { useRouter } from "next/navigation"; 
function LoginRegisterPage() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [step, setStep] = useState('form'); // 'form', 'registerOtp', 'forgotPassword', 'resetOtp', 'resetPassword', 'success'
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    otp: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [otpTimer, setOtpTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpInputRefs = React.useRef([]);
  const [forgotPasswordPhone, setForgotPasswordPhone] = useState('');
  const router = useRouter();
  // Timer for OTP countdown
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
    
    // Update formData
    setFormData(prev => ({ ...prev, otp: newOtpValues.join('') }));
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };
   

  const handleLogin = async () => {
  setErrors({});

  // Validate phone
  if (!validatePhone(formData.phone)) {
    setErrors({ phone: 'Please enter a valid 10-digit mobile number' });
    return;
  }

  // Validate password
  if (!formData.password) {
    setErrors({ password: 'Password is required' });
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: formData.phone,
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setStep('success');

      // ✅ Save token in both memory & localStorage
      window.authToken = data.token;
      localStorage.setItem('token', data.token);
       router.push("/Home");

    } else {
      setErrors({ general: data.message || 'Login failed' });
    }
  } catch (error) {
    setErrors({ general: 'Network error. Please try again.' });
  } finally {
    setIsLoading(false);
  }
};


  const handleRegisterSendOtp = async () => {
    setErrors({});
    
    // Validate all fields except OTP
    const validationErrors = {};
    
    if (!formData.name.trim()) {
      validationErrors.name = 'Name is required';
    }
    
    if (!validatePhone(formData.phone)) {
      validationErrors.phone = 'Please enter a valid 10-digit mobile number';
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      validationErrors.email = 'Please enter a valid email address';
    }
    
    if (!validatePassword(formData.password)) {
      validationErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-otp.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStep('registerOtp');
        setOtpTimer(60);
        setOtpValues(['', '', '', '', '', '']);
        setFormData(prev => ({ ...prev, otp: '' }));
      } else {
        setErrors({ general: data.message || 'Failed to send OTP' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterComplete = async () => {
    setErrors({});
    
    if (formData.otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit OTP' });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          otp: formData.otp
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStep('success');
        window.authToken = data.token;
      } else {
        setErrors({ general: data.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrors({});
    
    if (!validatePhone(forgotPasswordPhone)) {
      setErrors({ phone: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: forgotPasswordPhone })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStep('resetOtp');
        setOtpTimer(60);
      } else {
        setErrors({ general: data.message || 'Failed to send reset code' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetOtp = async () => {
    if (formData.otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit code' });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: forgotPasswordPhone,
          otp: formData.otp
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStep('resetPassword');
      } else {
        setErrors({ otp: data.message || 'Invalid or expired code' });
      }
    } catch (error) {
      setErrors({ otp: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrors({});
    
    if (!validatePassword(formData.newPassword)) {
      setErrors({ newPassword: 'Password must be at least 6 characters' });
      return;
    }
    
    if (formData.newPassword !== formData.confirmNewPassword) {
      setErrors({ confirmNewPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: forgotPasswordPhone,
          otp: formData.otp,
          newPassword: formData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStep('success');
      } else {
        setErrors({ general: data.message || 'Password reset failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: step === 'registerOtp' ? formData.phone : forgotPasswordPhone
        })
      });
      
      if (response.ok) {
        setOtpTimer(60);
        setOtpValues(['', '', '', '', '', '']);
        setFormData(prev => ({ ...prev, otp: '' }));
      } else {
        const data = await response.json();
        setErrors({ general: data.message || 'Failed to resend OTP' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      phone: '',
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      otp: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setOtpValues(['', '', '', '', '', '']);
    setStep('form');
    setErrors({});
    setOtpTimer(0);
    setForgotPasswordPhone('');
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const goToForgotPassword = () => {
    setStep('forgotPassword');
    setErrors({});
  };

  return (
    <div className="min-h-screen flex"style={{background: 'linear-gradient(135deg, rgba(62, 94, 132, 0.9) 0%, rgba(62, 94, 132, 0.8) 100%)'}}>
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 z-10" style={{background: 'linear-gradient(135deg, #9CC4DC 0%, #B8D4E8 50%, #9CC4DC 100%)'}}></div>
        <div 
          className="w-full h-full bg-cover bg-center transform hover:scale-105 transition-transform duration-700"
          style={{
            backgroundImage: `url('/api/placeholder/800/600')`
          }}
        ></div>
        
        {/* Overlay Content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center max-w-lg">
            <div className="mb-8">
              <div className=" flex flex-col text-5xl font-bold mb-4 flex items-center justify-center space-x-3">
                    <img className="w-60 h-" src="/floresta wud logo 2.png"></img>
                {/* <span className="bg-[#3E5E84] mt-10 bg-clip-text text-transparent">
                  florestawud
                </span> */}
              </div>
              <p className="text-xl text-[#3E5E84] font-light">
                Transform Your Home with Premium Furniture
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="text-[#3E5E84] w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-[#3E5E84]">Secure Shopping</h3>
                  <p className=" text-sm text-[#3E5E84]">Safe & encrypted transactions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles className="text-[#3E5E84] w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-[#3E5E84]">Premium Quality</h3>
                  <p className="text-[#3E5E84] text-sm">Handcrafted wooden furniture</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          {step !== 'form' && step !== 'success' && (
            <button
              onClick={() => {
                if (step === 'forgotPassword') setStep('form');
                else if (step === 'resetOtp') setStep('forgotPassword');
                else if (step === 'resetPassword') setStep('resetOtp');
                else if (step === 'registerOtp') setStep('form');
                else resetForm();
              }}
              className="mb-6 flex items-center space-x-2 text-gray-600 transition-colors"
              style={{'&:hover': {color: '#3E5E84'}}}
              onMouseEnter={(e) => e.target.style.color = '#3E5E84'}
              onMouseLeave={(e) => e.target.style.color = '#6B7280'}
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
          )}

          {/* Tab Switcher */}
          {step === 'form' && (
            <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
              <button
                onClick={() => switchTab('login')}
                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'bg-white shadow-md transform scale-105'
                    : 'text-gray-600'
                }`}
                style={activeTab === 'login' ? {color: '#3E5E84'} : {}}
                onMouseEnter={(e) => !activeTab === 'login' && (e.target.style.color = '#3E5E84')}
                onMouseLeave={(e) => !activeTab === 'login' && (e.target.style.color = '#6B7280')}
              >
                Login
              </button>
              <button
                onClick={() => switchTab('register')}
                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all duration-300 ${
                  activeTab === 'register'
                    ? 'bg-white shadow-md transform scale-105'
                    : 'text-gray-600'
                }`}
                style={activeTab === 'register' ? {color: '#3E5E84'} : {}}
                onMouseEnter={(e) => !activeTab === 'register' && (e.target.style.color = '#3E5E84')}
                onMouseLeave={(e) => !activeTab === 'register' && (e.target.style.color = '#6B7280')}
              >
                Register
              </button>
            </div>
          )}  

          {/* Form Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 'form' && `Welcome ${activeTab === 'login' ? 'Back!' : 'to florestawud'}`}
              {step === 'registerOtp' && 'Verify Your Number'}
              {step === 'forgotPassword' && 'Forgot Password?'}
              {step === 'resetOtp' && 'Enter Reset Code'}
              {step === 'resetPassword' && 'Set New Password'}
              {step === 'success' && 'Success!'}
            </h1>
            <p className="text-gray-600">
              {step === 'form' && `${activeTab === 'login' ? 'Login to your account' : 'Create your new account'}`}
              {step === 'registerOtp' && `We've sent a 6-digit OTP to +91 ${formData.phone}`}
              {step === 'forgotPassword' && 'Enter your mobile number to reset password'}
              {step === 'resetOtp' && `We've sent a 6-digit code to +91 ${forgotPasswordPhone}`}
              {step === 'resetPassword' && 'Enter your new password'}
              {step === 'success' && 'Operation completed successfully!'}
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Login/Register Form */}
          {step === 'form' && (
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                activeTab === 'login' ? handleLogin() : handleRegisterSendOtp();
              }} 
              className="space-y-6"
            >
              {/* Name Field (Register Only) */}
              {activeTab === 'register' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 ${
                        errors.name 
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : 'border-gray-300 focus:ring-2'
                      }`}
                      style={!errors.name ? {'&:focus': {borderColor: '#3E5E84', ringColor: 'rgba(62, 94, 132, 0.2)'}} : {}}
                      onFocus={(e) => !errors.name && (e.target.style.borderColor = '#3E5E84')}
                      onBlur={(e) => !errors.name && (e.target.style.borderColor = '#D1D5DB')}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
              )}

              {/* Phone Number Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Number *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-2" />
                    <span className="text-sm">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={`w-full pl-20 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 ${
                      errors.phone 
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-2'
                    }`}
                    onFocus={(e) => !errors.phone && (e.target.style.borderColor = '#3E5E84')}
                    onBlur={(e) => !errors.phone && (e.target.style.borderColor = '#D1D5DB')}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              {/* Email Field (Register Only - Optional) */}
              {activeTab === 'register' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 ${
                        errors.email 
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : 'border-gray-300 focus:ring-2'
                      }`}
                      onFocus={(e) => !errors.email && (e.target.style.borderColor = '#3E5E84')}
                      onBlur={(e) => !errors.email && (e.target.style.borderColor = '#D1D5DB')}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-11 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-2'
                    }`}
                    onFocus={(e) => !errors.password && (e.target.style.borderColor = '#3E5E84')}
                    onBlur={(e) => !errors.password && (e.target.style.borderColor = '#D1D5DB')}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              {/* Confirm Password Field (Register Only) */}
              {activeTab === 'register' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-11 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 ${
                        errors.confirmPassword 
                          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                          : 'border-gray-300 focus:ring-2'
                      }`}
                      onFocus={(e) => !errors.confirmPassword && (e.target.style.borderColor = '#3E5E84')}
                      onBlur={(e) => !errors.confirmPassword && (e.target.style.borderColor = '#D1D5DB')}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </div>
              )}

              {/* Forgot Password Link (Login Only) */}
              {activeTab === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={goToForgotPassword}
                    className="text-sm font-medium transition-colors"
                    style={{color: '#3E5E84'}}
                    onMouseEnter={(e) => e.target.style.color = '#2A4A6B'}
                    onMouseLeave={(e) => e.target.style.color = '#3E5E84'}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 px-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                style={{
                  background: 'linear-gradient(135deg, #3E5E84 0%, #4A6B91 100%)',
                  boxShadow: '0 4px 15px rgba(62, 94, 132, 0.3)'
                }}
                onMouseEnter={(e) => !isLoading && (e.target.style.background = 'linear-gradient(135deg, #2A4A6B 0%, #3E5E84 100%)')}
                onMouseLeave={(e) => !isLoading && (e.target.style.background = 'linear-gradient(135deg, #3E5E84 0%, #4A6B91 100%)')}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{activeTab === 'login' ? 'Signing In...' : 'Sending OTP...'}</span>
                  </>
                ) : (
                  <span>{activeTab === 'login' ? 'Sign In' : 'Send OTP'}</span>
                )}
              </button>
            </form>
          )}

          {/* Register OTP Verification Form */}
          {step === 'registerOtp' && (
            <form onSubmit={(e) => { e.preventDefault(); handleRegisterComplete(); }} className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-center space-x-3">
                  {otpValues.map((value, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      value={value}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none transition-all duration-300"
                      style={{'&:focus': {borderColor: '#3E5E84', ringColor: 'rgba(62, 94, 132, 0.2)', ring: '2px'}}}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3E5E84';
                        e.target.style.boxShadow = '0 0 0 2px rgba(62, 94, 132, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D1D5DB';
                        e.target.style.boxShadow = 'none';
                      }}
                      maxLength="1"
                    />
                  ))}
                </div>
                {errors.otp && <p className="text-red-500 text-sm text-center">{errors.otp}</p>}
              </div>

              {/* Timer and Resend */}
              <div className="text-center">
                {otpTimer > 0 ? (
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Timer size={16} />
                    <span>Resend OTP in {otpTimer}s</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={isLoading}
                    className="font-medium underline disabled:opacity-50 transition-colors"
                    style={{color: '#3E5E84'}}
                    onMouseEnter={(e) => !isLoading && (e.target.style.color = '#2A4A6B')}
                    onMouseLeave={(e) => !isLoading && (e.target.style.color = '#3E5E84')}
                  >
                    {isLoading ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 px-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                style={{
                  background: 'linear-gradient(135deg, #3E5E84 0%, #4A6B91 100%)',
                  boxShadow: '0 4px 15px rgba(62, 94, 132, 0.3)'
                }}
                onMouseEnter={(e) => !isLoading && (e.target.style.background = 'linear-gradient(135deg, #2A4A6B 0%, #3E5E84 100%)')}
                onMouseLeave={(e) => !isLoading && (e.target.style.background = 'linear-gradient(135deg, #3E5E84 0%, #4A6B91 100%)')}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Completing Registration...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Complete Registration</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {step === 'forgotPassword' && (
            <form onSubmit={(e) => { e.preventDefault(); handleForgotPassword(); }} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Number *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-2" />
                    <span className="text-sm">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={forgotPasswordPhone}
                    onChange={(e) => {
                      setForgotPasswordPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    className={`w-full pl-20 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 ${
                      errors.phone 
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-2'
                    }`}
                    onFocus={(e) => !errors.phone && (e.target.style.borderColor = '#3E5E84')}
                    onBlur={(e) => !errors.phone && (e.target.style.borderColor = '#D1D5DB')}
                    placeholder="Enter your mobile number"
                    maxLength="10"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 px-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                style={{
                  background: 'linear-gradient(135deg, #3E5E84 0%, #4A6B91 100%)',
                  boxShadow: '0 4px 15px rgba(62, 94, 132, 0.3)'
                }}
                onMouseEnter={(e) => !isLoading && (e.target.style.background = 'linear-gradient(135deg, #2A4A6B 0%, #3E5E84 100%)')}
                onMouseLeave={(e) => !isLoading && (e.target.style.background = 'linear-gradient(135deg, #3E5E84 0%, #4A6B91 100%)')}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={20} />
                    <span>Send Reset Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Reset OTP Verification Form */}
          {step === 'resetOtp' && (
            <form onSubmit={(e) => { e.preventDefault(); verifyResetOtp(); }} className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-center space-x-3">
                  {otpValues.map((value, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      type="text"
                      value={value}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none transition-all duration-300"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3E5E84';
                        e.target.style.boxShadow = '0 0 0 2px rgba(62, 94, 132, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D1D5DB';
                        e.target.style.boxShadow = 'none';
                      }}
                      maxLength="1"
                    />
                  ))}
                </div>
                {errors.otp && <p className="text-red-500 text-sm text-center">{errors.otp}</p>}
              </div>

              {/* Timer and Resend */}
              <div className="text-center">
                {otpTimer > 0 ? (
                  <div className="flex items-center justify-center space-x-2 text-gray-600">
                    <Timer size={16} />
                    <span>Resend code in {otpTimer}s</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={isLoading}
                    className="font-medium underline disabled:opacity-50 transition-colors"
                    style={{color: '#3E5E84'}}
                    onMouseEnter={(e) => !isLoading && (e.target.style.color = '#2A4A6B')}
                    onMouseLeave={(e) => !isLoading && (e.target.style.color = '#3E5E84')}
                  >
                    {isLoading ? 'Sending...' : 'Resend Code'}
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 px-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                style={{
                  background: 'linear-gradient(135deg, #3E5E84 0%, #4A6B91 100%)',
                  boxShadow: '0 4px 15px rgba(62, 94, 132, 0.3)'
                }}
                onMouseEnter={(e) => !isLoading && (e.target.style.background = 'linear-gradient(135deg, #2A4A6B 0%, #3E5E84 100%)')}
                onMouseLeave={(e) => !isLoading && (e.target.style.background = 'linear-gradient(135deg, #3E5E84 0%, #4A6B91 100%)')}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Verify Code</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {step === 'resetPassword' && (
            <form onSubmit={(e) => { e.preventDefault(); handlePasswordReset(); }} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className={`w-full pl-11 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 ${
                      errors.newPassword 
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-2'
                    }`}
                    onFocus={(e) => !errors.newPassword && (e.target.style.borderColor = '#3E5E84')}
                    onBlur={(e) => !errors.newPassword && (e.target.style.borderColor = '#D1D5DB')}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={formData.confirmNewPassword}
                    onChange={(e) => handleInputChange('confirmNewPassword', e.target.value)}
                    className={`w-full pl-11 pr-12 py-3 border-2 rounded-lg focus:outline-none transition-all duration-300 ${
                      errors.confirmNewPassword 
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-2'
                    }`}
                    onFocus={(e) => !errors.confirmNewPassword && (e.target.style.borderColor = '#3E5E84')}
                    onBlur={(e) => !errors.confirmNewPassword && (e.target.style.borderColor = '#D1D5DB')}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmNewPassword && <p className="text-red-500 text-sm">{errors.confirmNewPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 px-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                style={{
                  background: 'linear-gradient(135deg, #3E5E84 0%, #4A6B91 100%)',
                  boxShadow: '0 4px 15px rgba(62, 94, 132, 0.3)'
                }}
                onMouseEnter={(e) => !isLoading && (e.target.style.background = 'linear-gradient(135deg, #2A4A6B 0%, #3E5E84 100%)')}
                onMouseLeave={(e) => !isLoading && (e.target.style.background = 'linear-gradient(135deg, #3E5E84 0%, #4A6B91 100%)')}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Success Screen */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">All Done!</h2>
              <p className="text-gray-600">
                {activeTab === 'register' || step === 'registerOtp' 
                  ? 'Your account has been created successfully!' 
                  : 'You can now log in with your new credentials.'}
              </p>
              <button
                onClick={resetForm}
                className="w-full text-white py-3 px-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #3E5E84 0%, #4A6B91 100%)',
                  boxShadow: '0 4px 15px rgba(62, 94, 132, 0.3)'
                }}
                onMouseEnter={(e) => (e.target.style.background = 'linear-gradient(135deg, #2A4A6B 0%, #3E5E84 100%)')}
                onMouseLeave={(e) => (e.target.style.background = 'linear-gradient(135deg, #3E5E84 0%, #4A6B91 100%)')}
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginRegisterPage;