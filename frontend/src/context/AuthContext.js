import React, { createContext, useState } from 'react';
import api, { setAuthToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/login', { email, password });
            setUser(res.data);
            setAuthToken(res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, role, inviteCode) => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/register', { name, email, password, role, inviteCode });
            setUser(res.data);
            setAuthToken(res.data.token);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => { setUser(null); setAuthToken(null); };
    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, error, clearError }}>
            {children}
        </AuthContext.Provider>
    );
};
