import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  // screen: 'welcome' (1), 'member_login' (2), 'admin_login' (2.5), 'induction' (3), 'member_profile' (4), 'admin_dashboard' (5)
  const [currentScreen, setCurrentScreen] = useState('welcome');

  // Check existing session on load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.member) {
            setUser(data.member);
            setIsAdmin(Boolean(data.isAdmin));

            if (data.isAdmin) {
              setCurrentScreen('admin_dashboard');
            } else if (!data.member.has_acknowledged_welcome) {
              setCurrentScreen('induction');
            } else {
              setCurrentScreen('member_profile');
            }
          }
        }
      } catch (err) {
        console.warn('Session check note:', err);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const openMemberLogin = () => setCurrentScreen('member_login');
  const openAdminLogin = () => setCurrentScreen('admin_login');
  const backToWelcome = () => setCurrentScreen('welcome');

  // Member Login
  const loginMember = async (memberId, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: memberId,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Authentication failed. Please verify Member ID and Password.',
        };
      }

      setUser(data.member);
      setIsAdmin(false);

      if (!data.member.has_acknowledged_welcome) {
        setCurrentScreen('induction');
      } else {
        setCurrentScreen('member_profile');
      }

      return { success: true, member: data.member };
    } catch (err) {
      return {
        success: false,
        message: 'Network error communicating with Gotham security gateway.',
      };
    }
  };

  // Admin Login
  const loginAdmin = async (username, password) => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Invalid Admin credentials.',
        };
      }

      setUser(data.member);
      setIsAdmin(true);
      setCurrentScreen('admin_dashboard');

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: 'Network error communicating with Gotham admin gateway.',
      };
    }
  };

  // Acknowledge Induction Letter
  const acknowledgeWelcome = async () => {
    try {
      const res = await fetch('/api/auth/acknowledge-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.member) {
          setUser(data.member);
        }
      }
    } catch (err) {
      console.error('Error acknowledging induction:', err);
    } finally {
      setCurrentScreen('member_profile');
    }
  };

  // Re-read Induction Letter
  const viewWelcomeLetter = () => {
    setCurrentScreen('induction');
  };

  // Return to Profile from Induction Letter
  const returnToProfile = () => {
    setCurrentScreen('member_profile');
  };

  // Logout
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout note:', err);
    } finally {
      setUser(null);
      setIsAdmin(false);
      setCurrentScreen('welcome');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAdmin,
        loading,
        currentScreen,
        setCurrentScreen,
        openMemberLogin,
        openAdminLogin,
        backToWelcome,
        loginMember,
        loginAdmin,
        acknowledgeWelcome,
        viewWelcomeLetter,
        returnToProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
