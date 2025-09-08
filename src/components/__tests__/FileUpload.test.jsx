import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FileUpload from "../FileUpload";
import { documentAPI } from "../../api/api";

// Mock API
vi.mock("../../api/api", () => ({
    documentAPI: {
        uploadFile: vi.fn(),
    },
}));

const createFile = (name, type, content = "dummy") =>
    new File([content], name, { type });

describe("FileUpload Component", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it("renders form correctly", () => {
        render(<FileUpload />);
        expect(screen.getByRole("heading", { name: /upload document/i })).toBeInTheDocument();
        expect(screen.getByTestId("file-input")).toBeInTheDocument();
        expect(screen.getByLabelText(/Document Date/i)).toBeInTheDocument();
        expect(screen.getByTestId("category-select")).toBeInTheDocument();

        // subcategory only appears after selecting category
        fireEvent.change(screen.getByTestId("category-select"), { target: { value: "Company" } });
        expect(screen.getByTestId("subcategory-select")).toBeInTheDocument();
    });

    it("shows error if submitted without required fields", async () => {
        render(<FileUpload />);
        fireEvent.click(screen.getByRole("button", { name: /upload document/i }));
        await waitFor(() => {
            expect(screen.getByText(/please fill all required fields/i)).toBeInTheDocument();
        });
    });

    it("accepts a PDF file", async () => {
        render(<FileUpload />);
        const fileInput = screen.getByTestId("file-input");
        const file = createFile("test.pdf", "application/pdf");

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText(/test.pdf/i)).toBeInTheDocument();
        });
    });

    it("rejects invalid file type", async () => {
        render(<FileUpload />);
        const fileInput = screen.getByTestId("file-input");
        const file = createFile("test.exe", "application/x-msdownload");

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText(/only image and pdf files are allowed/i)).toBeInTheDocument();
        });
    });

    it("adds and removes tags", async () => {
        render(<FileUpload />);
        const tagInput = screen.getByPlaceholderText(/type tags/i);

        fireEvent.change(tagInput, { target: { value: "invoice," } });
        await waitFor(() => {
            expect(screen.getByText(/invoice/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/×/));
        await waitFor(() => {
            expect(screen.queryByText(/invoice/i)).not.toBeInTheDocument();
        });
    });

    it("submits successfully with backend success", async () => {
        documentAPI.uploadFile.mockResolvedValueOnce({ data: { success: true } });

        render(<FileUpload />);

        // Upload file
        const file = createFile("ok.pdf", "application/pdf");
        fireEvent.change(screen.getByTestId("file-input"), { target: { files: [file] } });

        // Select category + subcategory
        fireEvent.change(screen.getByTestId("category-select"), { target: { value: "Company" } });
        fireEvent.change(screen.getByTestId("subcategory-select"), { target: { value: "Contracts" } });

        fireEvent.click(screen.getByRole("button", { name: /upload document/i }));

        await waitFor(() => {
            expect(screen.getByText(/file uploaded successfully/i)).toBeInTheDocument();
        });
    });

    it("saves to localStorage if backend fails", async () => {
        documentAPI.uploadFile.mockRejectedValueOnce(new Error("Network error"));

        render(<FileUpload />);

        const file = new File(["dummy"], "offline.pdf", { type: "application/pdf" });
        fireEvent.change(screen.getByTestId("file-input"), { target: { files: [file] } });

        fireEvent.change(screen.getByTestId("category-select"), { target: { value: "Company" } });
        fireEvent.change(screen.getByTestId("subcategory-select"), { target: { value: "Contracts" } });

        fireEvent.click(screen.getByRole("button", { name: /upload document/i }));

        // Use function matcher to find text inside nested elements
        expect(
            await screen.findByText((content, element) =>
                content.includes("Document saved locally successfully")
            )
        ).toBeInTheDocument();

        const docs = JSON.parse(localStorage.getItem("documents"));
        expect(docs).toHaveLength(1);
        expect(docs[0].fileName).toBe("offline.pdf");
        expect(docs[0].major_head).toBe("Company");
        expect(docs[0].minor_head).toBe("Contracts");
    });

});
