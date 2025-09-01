"use client";
// File: components/AuthGuard.jsx (Client-side route protection)
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
       console.log("con xxxxxxx1");
      const token = localStorage.getItem('token');
      console.log("authTken",token);
      
      if (!token) {
        console.log("con xxxxxxx");
        router.replace('/LoginRegisterPage');
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
          router.replace('/LoginRegisterPage');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        router.replace('/LoginRegisterPage');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default AuthGuard;
