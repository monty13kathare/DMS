import { createContext, useState, useEffect } from "react";
import { authAPI } from "../api/api";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("authToken") || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // Keep token in localStorage in sync
    useEffect(() => {
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
    }, [token]);

    // Generate OTP
    const generateOTP = async (mobileNumber) => {
        try {
            setLoading(true);
            const res = await authAPI.generateOTP(mobileNumber);
            return res.data;
        } finally {
            setLoading(false);
        }
    };

    // Validate OTP → save token
    const validateOTP = async (mobileNumber, otp) => {
        try {
            setLoading(true);
            const res = await authAPI.validateOTP(mobileNumber, otp);
            if (res?.data?.token) {
                setToken(res.data.token);
                setUser({ mobile: mobileNumber });
            }
            return res.data;
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("authToken");
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                loading,
                generateOTP,
                validateOTP,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
