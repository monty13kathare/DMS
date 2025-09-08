import { createContext, useState, useEffect } from "react";
import { authAPI, documentAPI } from "../api/api";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("authToken") || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState([]);

    // Keep token in localStorage in sync
    useEffect(() => {
        if (token) {
            localStorage.setItem("authToken", token);
        } else {
            localStorage.removeItem("authToken");
        }
    }, [token]);


    // Load All Tags
    useEffect(() => {
        const loadTags = async () => {
            try {
                const res = await documentAPI.getAllTags();
                if (res.data?.status) {
                    const normalized = res.data.data.map((t) => ({
                        tag_name: t.label || t.tag_name || t,
                    }));
                    setTags(normalized);
                }
            } catch (err) {
                console.error("Failed to load tags:", err);
            }
        };

        loadTags();
    }, []);

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

    //Add Tags function
    const addTag = (newTag) => {
        if (!tags.some((t) => t.tag_name.toLowerCase() === newTag.tag_name.toLowerCase())) {
            setTags((prev) => [...prev, newTag]);
        }
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
                tags,
                setTags,
                addTag,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
