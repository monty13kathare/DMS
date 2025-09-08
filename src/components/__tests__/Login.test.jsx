import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "../Login";
import { AuthContext } from "../../context/AuthContext";

// Default provider props
const defaultProviderProps = {
    generateOTP: vi.fn(),
    validateOTP: vi.fn(),
    loading: false,
    token: null,
    isAuthenticated: false,
};

// Helper to render with context
const renderWithContext = (ui, providerProps = {}) => {
    return render(
        <BrowserRouter>
            <AuthContext.Provider value={{ ...defaultProviderProps, ...providerProps }}>
                {ui}
            </AuthContext.Provider>
        </BrowserRouter>
    );
};

describe("Login Component", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it("renders registration form by default", () => {
        renderWithContext(<Login />);

        expect(screen.getByText(/Admin Registration/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Mobile Number/i)).toBeInTheDocument();
    });

    it("shows error if username is empty on register", async () => {
        renderWithContext(<Login />);

        fireEvent.click(screen.getByRole("button", { name: /Register/i }));

        expect(await screen.findByText(/Username is required/i)).toBeInTheDocument();
    });

    it("navigates to mobile step after successful registration", async () => {
        renderWithContext(<Login />);

        fireEvent.change(screen.getByLabelText(/Username/i), {
            target: { value: "John" },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: "password123" },
        });
        fireEvent.change(screen.getByLabelText(/Mobile Number/i), {
            target: { value: "9876543210" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Register/i }));

        expect(await screen.findByText(/Secure Login/i)).toBeInTheDocument();
    });

    it("validates OTP correctly", async () => {
        const providerProps = {
            generateOTP: vi.fn(() => Promise.resolve({ status: true })),
            validateOTP: vi.fn(() => Promise.resolve({ token: "fake_token" })),
        };

        localStorage.setItem(
            "users",
            JSON.stringify([
                { username: "John", password: "password123", mobileNumber: "9876543210" },
            ])
        );

        renderWithContext(<Login />, providerProps);

        // Go to login page
        fireEvent.click(screen.getByText(/Login here/i));

        const mobileInput = await screen.findByPlaceholderText(/Enter registered mobile number/i);
        fireEvent.change(mobileInput, { target: { value: "9876543210" } });

        fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));

        expect(await screen.findByText(/Verify Identity/i)).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Enter 6-digit code/i), {
            target: { value: "123456" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Verify & Login/i }));

        await waitFor(() => {
            expect(localStorage.getItem("authToken")).toBeTruthy();
        });
    });
});
