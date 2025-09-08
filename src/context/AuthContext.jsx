import { createContext, useState, useEffect } from "react";
import { authAPI, documentAPI } from "../api/api";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("authToken") || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tags, setTags] = useState([]);
    const [recentFiles, setRecentFiles] = useState([]);
    const [recentFilesLoading, setRecentFilesLoading] = useState(false);

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

    // Load recent files
    const loadRecentFiles = async () => {
        try {
            setRecentFilesLoading(true);
            const payload = {
                start: 0,
                length: 10,
                search: { value: "" },
                major_head: "",
                minor_head: "",
                from_date: "",
                to_date: "",
                tags: [],
                uploaded_by: "",
            };

            const res = await documentAPI.searchDocuments(payload);
            if (res?.data?.data) {
                const sorted = res.data.data.sort(
                    (a, b) => new Date(b.upload_time) - new Date(a.upload_time)
                );
                setRecentFiles(sorted.slice(0, 5)); // latest 5
            } else {
                setRecentFiles([]);
            }
        } catch (err) {
            console.error("Error fetching recent files:", err);
            setRecentFiles([]);
        } finally {
            setRecentFilesLoading(false);
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
                recentFiles,
                recentFilesLoading,
                loadRecentFiles,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
