import React, { createContext, useReducer, useEffect } from 'react';
import { authAPI, tokenHelper } from '../services/api';

// Create context
const AuthContext = createContext();

// Export the context for use in the hook
export { AuthContext };

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_INITIALIZING':
      return { ...state, isInitializing: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isInitializing: false };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'UPDATE_TOKENS':
      return { 
        ...state, 
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken 
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing tokens on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { accessToken, refreshToken } = tokenHelper.getTokens();
        const user = tokenHelper.getUser();
        
        if (accessToken && refreshToken && user) {
          dispatch({ 
            type: 'LOGIN_SUCCESS', 
            payload: { accessToken, refreshToken, user } 
          });
        } else {
          dispatch({ type: 'SET_INITIALIZING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        dispatch({ type: 'SET_INITIALIZING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Check if Super Admin exists
  const checkSuperAdminExists = async () => {
    try {
      const response = await authAPI.checkSuperAdminExists();
      return { 
        success: true, 
        exists: response.data.exists,
        data: response.data.data 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to check Super Admin status';
      return { success: false, error: errorMessage };
    }
  };

  // Super Admin registration (Step 1: Send OTP)
  const registerSuperAdmin = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.registerSuperAdmin(userData);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Super Admin registration (Step 2: Verify OTP and complete registration)
  const verifySuperAdminOTP = async (otpData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.verifySuperAdminOTP(otpData);
      const { user, accessToken, refreshToken } = response.data.data;
      
      tokenHelper.setTokens(accessToken, refreshToken);
      tokenHelper.setUser(user);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken, refreshToken } });
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'OTP verification failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Universal login for all user types
  const login = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.login(credentials);
      const { user, accessToken, refreshToken } = response.data.data;
      
      tokenHelper.setTokens(accessToken, refreshToken);
      tokenHelper.setUser(user);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, accessToken, refreshToken } });
      
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      
      // Check if it's an account activation error
      if (errorMessage.includes('not activated') || errorMessage.includes('activation')) {
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return { 
          success: false, 
          error: errorMessage, 
          needsActivation: true,
          email: credentials.email
        };
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Account activation for newly created users
  const activateAccount = async (activationData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.activateAccount(activationData);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Account activation failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Forgot password - send OTP
  const forgotPassword = async (email) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.forgotPassword({ email });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Reset password with OTP
  const resetPassword = async (resetData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authAPI.resetPassword(resetData);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = async () => {
    try {
      const { refreshToken } = tokenHelper.getTokens();
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenHelper.removeTokens();
      dispatch({ type: 'LOGOUT' });
      
      // Notify other tabs/windows
      window.dispatchEvent(new Event('logout'));
    }
  };

  // Generate project-specific token and redirect
  const accessProject = async (customProjectId) => {
    try {
      const response = await authAPI.generateProjectToken(customProjectId);
      const { redirectUrl, projectToken } = response.data.data;
      
      // Open project in new tab with token
      const finalUrl = `${redirectUrl}?access_token=${projectToken}&user_id=${state.user.id}&user_role=${state.user.role}&project_id=${customProjectId}`;
      window.open(finalUrl, '_blank');
      
      return { success: true, redirectUrl, token: projectToken };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to access project';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Helper functions for role checking
  const isSuperAdmin = () => {
    return state.user?.role === 'SUPER_ADMIN';
  };

  const isProjectAdmin = () => {
    return state.user?.role === 'ADMIN';
  };

  const isSubUser = () => {
    return state.user?.role === 'SUB_USER';
  };

  const getUserProjects = () => {
    return state.user?.projects || [];
  };

  const hasProjectAccess = (customProjectId) => {
    if (isSuperAdmin()) return true;
    return getUserProjects().some(p => p.customProjectId === customProjectId);
  };

  // Listen for logout events from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' && !e.newValue) {
        dispatch({ type: 'LOGOUT' });
      }
    };

    const handleLogoutEvent = () => {
      dispatch({ type: 'LOGOUT' });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout', handleLogoutEvent);
    };
  }, []);

  const value = {
    ...state,
    registerSuperAdmin,
    verifySuperAdminOTP,
    login,
    logout,
    forgotPassword,
    resetPassword,
    accessProject,
    clearError,
    isSuperAdmin,
    isProjectAdmin,
    isSubUser,
    getUserProjects,
    hasProjectAccess,
    activateAccount,
    checkSuperAdminExists,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 