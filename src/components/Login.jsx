import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const authToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpcF9hZGRyZXNzIjoiMTA2LjIxOS45MS4xMTciLCJ1bmlxdWVfaWQiOiI5Mzk5OTc1NjQ4IiwidXNlcl9uYW1lIjoiOTM5OTk3NTY0OCIsImFjY2Vzc190eXBlIjoiZW1wIiwibW9iaWxlIjoiOTM5OTk3NTY0OCIsImNsaWVudF9pZCI6ImFsbHNvZnQiLCJleHAiOjE3NTk5MTUyNTR9.DYruei7nb7rRH6f7-iUjkyB_6RwLcmJCApWbq84Vgns"

// Helper: get users from localStorage
const getUsers = () => JSON.parse(localStorage.getItem("users")) || [];

// Helper: save users to localStorage
const saveUsers = (users) => localStorage.setItem("users", JSON.stringify(users));

const Login = () => {
    const navigate = useNavigate();
    const { generateOTP, validateOTP } = useContext(AuthContext);

    const [step, setStep] = useState("register"); // register | mobile | otp
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("");


    // Input validation
    const validateInputs = () => {
        const newErrors = {};

        if (step === "register") {
            if (!username.trim()) newErrors.username = "Username is required";
            else if (username.length < 3)
                newErrors.username = "Username must be at least 3 characters";

            if (!password) newErrors.password = "Password is required";
            else if (password.length < 6)
                newErrors.password = "Password must be at least 6 characters";

            if (!mobileNumber.trim())
                newErrors.mobileNumber = "Mobile number is required";
            else if (!/^[0-9]{10,15}$/.test(mobileNumber))
                newErrors.mobileNumber = "Enter a valid mobile number";
        } else if (step === "mobile") {
            if (!mobileNumber.trim())
                newErrors.mobileNumber = "Mobile number is required";
            else if (!/^[0-9]{10,15}$/.test(mobileNumber))
                newErrors.mobileNumber = "Enter a valid mobile number";
        } else if (step === "otp") {
            if (!otp.trim()) newErrors.otp = "OTP is required";
            else if (!/^[0-9]{6}$/.test(otp)) newErrors.otp = "OTP must be 6 digits";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };



    // Registration 
    const handleRegister = () => {
        if (!validateInputs()) return;

        const users = getUsers();

        //Check username already exists
        if (users.find((u) => u.username === username)) {
            setMessage({ type: "error", text: "Username already exists!" });
            return;
        }

        //Check mobile number already exists
        if (users.find((u) => u.mobileNumber === mobileNumber)) {
            setMessage({ type: "error", text: "This mobile number is already registered!" });
            return;
        }

        //If unique, save new user
        users.push({ username, password, mobileNumber });
        saveUsers(users);

        setMessage({ type: "success", text: "User registered successfully!" });
        setStep("mobile");
    };


    // Send OTP
    const handleSendOTP = async () => {
        if (!validateInputs()) return;

        try {
            const users = getUsers();
            if (!users.find(u => u.mobileNumber === mobileNumber)) {
                setMessage({ type: "error", text: "Mobile number not registered!" });
                return;
            }
            // Call context API to generate OTP
            const res = await generateOTP(mobileNumber);
            if (res.status) {  // Adjust based on your API response
                setStep("otp");
                setMessage({ type: "success", text: "OTP Sent to your mobile" });
            } else {
                setMessage({ type: "error", text: res.message || "Failed to send OTP" });
            }
        } catch {
            setMessage({ type: "error", text: "Server error. Please try again." });
        }
    };



    // Validate OTP
    const handleValidateOTP = async () => {
        if (!validateInputs()) return;

        try {
            const res = await validateOTP(mobileNumber, otp);
            if (res?.data?.token || otp === "123456") {
                localStorage.setItem("authToken", res?.data?.token || authToken);
                setMessage({ type: "success", text: "Login successful 🎉" });
                navigate('/')

            } else {
                setMessage({ type: "error", text: res.message || "Invalid OTP" });
            }
        } catch {
            setMessage({ type: "error", text: "Something went wrong. Please try again." });
        }
    };



    // // Navigation between steps
    const goToStep = (targetStep) => {
        setStep(targetStep);
        setMessage({ type: "", text: "" });
        setErrors({});
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        DMS
                    </h2>
                    <p className="text-gray-500 mt-2">
                        {step === "register"
                            ? "Admin Registration"
                            : step === "mobile"
                                ? "Secure Login"
                                : "Verify Identity"}
                    </p>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center">
                        <div className={`flex flex-col items-center ${step !== "register" ? "text-purple-600" : "text-gray-400"}`}>
                            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === "register" ? "bg-gray-200" : "bg-purple-100"}`}>
                                <span className={`${step !== "register" ? "text-white bg-purple-600 rounded-full h-6 w-6 flex items-center justify-center text-xs" : "text-gray-500"}`}>
                                    1
                                </span>
                            </div>
                            <span className="text-xs mt-1">Register</span>
                        </div>

                        <div className={`h-1 w-10 mx-1 ${step !== "register" ? "bg-purple-600" : "bg-gray-300"}`}></div>

                        <div className={`flex flex-col items-center ${step === "otp" ? "text-purple-600" : step === "mobile" ? "text-blue-600" : "text-gray-400"}`}>
                            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === "mobile" || step === "otp" ? "bg-blue-100" : "bg-gray-200"}`}>
                                <span className={`${step === "otp" ? "text-white bg-purple-600 rounded-full h-6 w-6 flex items-center justify-center text-xs" : step === "mobile" ? "text-blue-600" : "text-gray-500"}`}>
                                    2
                                </span>
                            </div>
                            <span className="text-xs mt-1">Verify</span>
                        </div>

                        <div className={`h-1 w-10 mx-1 ${step === "otp" ? "bg-purple-600" : step === "mobile" ? "bg-blue-300" : "bg-gray-300"}`}></div>

                        <div className={`flex flex-col items-center ${step === "otp" ? "text-purple-600" : "text-gray-400"}`}>
                            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step === "otp" ? "bg-purple-100" : "bg-gray-200"}`}>
                                <span className={`${step === "otp" ? "text-white bg-purple-600 rounded-full h-6 w-6 flex items-center justify-center text-xs" : "text-gray-500"}`}>
                                    3
                                </span>
                            </div>
                            <span className="text-xs mt-1">Login</span>
                        </div>
                    </div>
                </div>

                {/* Registration Page */}
                {step === "register" && (
                    <>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.username ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-purple-300 focus:border-purple-500"}`}
                                />
                                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Create password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.password ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-purple-300 focus:border-purple-500"}`}
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            <div>
                                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input
                                    id="mobileNumber"
                                    type="tel"
                                    placeholder="Enter mobile number"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.mobileNumber ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-purple-300 focus:border-purple-500"}`}
                                />
                                {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>}
                            </div>

                            <button
                                onClick={handleRegister}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Register
                            </button>
                        </div>

                        <p className="text-center mt-6 text-sm text-gray-600">
                            Already have an account?{" "}
                            <button
                                onClick={() => goToStep("mobile")}
                                className="text-purple-600 font-semibold hover:underline"
                            >
                                Login here
                            </button>
                        </p>
                    </>
                )}

                {/*Login Page (Send OTP) */}
                {step === "mobile" && (
                    <>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input
                                    id="mobileNumber"
                                    type="tel"
                                    placeholder="Enter registered mobile number"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.mobileNumber ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300 focus:border-blue-500"}`}
                                />
                                {errors.mobileNumber && <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>}
                            </div>

                            <button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-75 disabled:transform-none disabled:hover:shadow-md"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending OTP...
                                    </span>
                                ) : "Send OTP"}
                            </button>
                        </div>

                        <p className="text-center mt-6 text-sm text-gray-600">
                            Don't have an account?{" "}
                            <button
                                onClick={() => goToStep("register")}
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Register here
                            </button>
                        </p>
                    </>
                )}

                {/* OTP Page */}
                {step === "otp" && (
                    <>
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">We've sent a verification code to</p>
                                <p className="font-medium">{mobileNumber}</p>
                            </div>

                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
                                <input
                                    id="otp"
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition text-center text-xl tracking-widest ${errors.otp ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-purple-300 focus:border-purple-500"}`}
                                />
                                {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}

                                <p className="text-sm text-gray-500 mt-2 text-center">
                                    For testing, use <span className="font-mono bg-gray-100 px-2 py-1 rounded">123456</span>
                                </p>
                            </div>

                            <button
                                onClick={handleValidateOTP}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-75 disabled:transform-none disabled:hover:shadow-md"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : "Verify & Login"}
                            </button>

                            <div className="text-center">
                                <button
                                    onClick={handleSendOTP}
                                    className="text-sm text-purple-600 font-medium hover:underline"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </div>

                        <p className="text-center mt-6 text-sm text-gray-600">
                            Want to change number?{" "}
                            <button
                                onClick={() => goToStep("mobile")}
                                className="text-purple-600 font-semibold hover:underline"
                            >
                                Go back
                            </button>
                        </p>
                    </>
                )}

                {/* Message */}
                {message.text && (
                    <div
                        className={`mt-6 p-3 rounded-lg text-center ${message.type === "success"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                            }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;