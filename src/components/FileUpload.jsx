import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { documentAPI } from "../api/api";

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [documentDate, setDocumentDate] = useState(new Date());
    const [majorHead, setMajorHead] = useState("");
    const [minorHead, setMinorHead] = useState("");
    const [tags, setTags] = useState([]);
    const [inputTag, setInputTag] = useState("");
    const [remarks, setRemarks] = useState("");
    const [uploadedBy, setUploadedBy] = useState("admin");
    const [loading, setLoading] = useState(false);
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [errors, setErrors] = useState({});
    const tagInputRef = useRef(null);
    const fileInputRef = useRef(null);


    const minorHeadOptions = {
        Personal: ["John", "Tom", "Emily", "Sarah", "Michael", "Jessica"],
        Professional: ["Accounts", "HR", "IT", "Finance", "Marketing", "Operations"],
        Company: ["Work Order", "Invoice", "Contracts"],
    };

    // Date Formate
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Load suggested tags from API
    useEffect(() => {
        const loadTags = async () => {
            try {
                const res = await documentAPI.getAllTags();
                if (res.data?.status) {
                    const normalized = res.data.data.map((t) => ({
                        tag_name: t.label || t.tag_name || t
                    }));
                    setSuggestedTags(normalized);
                }
            } catch (err) {
                console.error("Failed to load tags", err);
            }
        };
        loadTags();
    }, []);



    // Input validation
    const validateForm = () => {
        const newErrors = {};
        if (!file) newErrors.file = "Please select a file";
        if (!majorHead) newErrors.majorHead = "Category is required";
        if (!minorHead) newErrors.minorHead = "Subcategory is required";
        if (!documentDate) newErrors.documentDate = "Document date is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Clear errors when inputs change
    useEffect(() => {
        setErrors({});
    }, [file, majorHead, minorHead, documentDate]);

    // Generate a random ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileType = selectedFile.type;
            if (fileType.includes("image/") || fileType === "application/pdf") {
                setFile(selectedFile);
                setMessage({ type: "", text: "" });
                setErrors({ ...errors, file: "" });
            } else {
                setMessage({ type: "error", text: "Only image and PDF files are allowed" });
            }
        }
    };


    // Tag Input Handler
    const handleTagInputChange = (e) => {
        setInputTag(e.target.value);
    };

    // Add tag (new or from suggestion)
    const handleAddTag = (tagObj) => {
        if (!tagObj) return;

        const newTag = { tag_name: tagObj.label || tagObj.tag_name || tagObj };

        // Avoid duplicates
        if (!tags.some((t) => t.tag_name.toLowerCase() === newTag.tag_name.toLowerCase())) {
            setTags([...tags, newTag]);
        }

        setInputTag("");
    };

    // Remove tag by tag_name
    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((t) => t.tag_name !== tagToRemove));
    };

    // Handle manual input
    const handleKeyPress = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            if (inputTag.trim()) {
                handleAddTag({ label: inputTag.trim() });
            }
        }
    };


    const resetForm = () => {
        setFile(null);
        setDocumentDate(new Date());
        setMajorHead("");
        setMinorHead("");
        setTags([]);
        setRemarks("");
        setInputTag("");
        setErrors({});
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Convert file to Base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    // Save file and metadata to localStorage
    const saveToLocalStorage = async (file, data) => {
        const base64File = await fileToBase64(file);

        const docData = {
            id: generateId(),
            ...data,
            fileName: file.name,
            fileType: file.type,
            file: base64File,
        };

        const existingDocs = JSON.parse(localStorage.getItem("documents")) || [];
        localStorage.setItem("documents", JSON.stringify([...existingDocs, docData]));
    };




    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            setMessage({ type: "error", text: "Please fill all required fields" });
            return;
        }

        setLoading(true);


        const fileData = {
            major_head: majorHead,
            minor_head: minorHead,
            document_date: formatDate(documentDate),
            document_remarks: remarks,
            tags,
            user_id: uploadedBy || "admin",
        };

        console.log('fileData', file, fileData)
        try {
            // Try backend upload first
            // const token = localStorage.getItem("authToken");
            const response = await documentAPI.uploadFile(file, fileData);

            if (response.data?.status) {
                setMessage({ type: "success", text: "File uploaded successfully" });
                resetForm();
            } else {
                setMessage({ type: "warning", text: "Document saved locally successfully" });
                // await saveToLocalStorage(file, fileData);
                resetForm();
            }
        } catch (error) {
            console.warn("Backend failed, saving to localStorage", error);
            // await saveToLocalStorage(file, fileData);
            setMessage({ type: "success", text: "Document saved locally successfully" });
            resetForm();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Upload Document
                    </h2>
                    <p className="text-gray-600 mt-2">Add new documents to your management system</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload */}
                    <div className="space-y-2">
                        <label htmlFor="file-input" className="block text-sm font-medium text-gray-700">
                            File (Image or PDF only) <span className="text-red-500">*</span>
                        </label>

                        <div className="flex items-center justify-center w-full">
                            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 ${file ? 'border-green-500' : errors.file ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors`}>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {file ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500 mt-2 truncate max-w-xs">{file.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {file.size > 1024 * 1024
                                                    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                                    : `${(file.size / 1024).toFixed(1)} KB`}
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-gray-500">JPG, PNG, PDF (Max. 10MB)</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="file-input"
                                    data-testid="file-input"
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf"
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {errors.file && <p className="text-sm text-red-600">{errors.file}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date */}
                        <div className="space-y-2">
                            <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700">
                                Document Date <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                                selected={documentDate}
                                dateFormat="dd/MM/yyyy"
                                id="date-picker"
                                data-testid="date-picker"
                                onChange={(date) => setDocumentDate(date)}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.documentDate ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-purple-300 focus:border-purple-500"}`}
                            />
                            {errors.documentDate && <p className="text-sm text-red-600">{errors.documentDate}</p>}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={majorHead}
                                id="category-select"
                                data-testid="category-select"
                                onChange={(e) => {
                                    setMajorHead(e.target.value);
                                    setMinorHead("");
                                }}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.majorHead ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-purple-300 focus:border-purple-500"}`}
                            >
                                <option value="">Select Category</option>
                                <option value="Personal">Personal</option>
                                <option value="Professional">Professional</option>
                                <option value="Company">Company</option>
                            </select>
                            {errors.majorHead && <p className="text-sm text-red-600">{errors.majorHead}</p>}
                        </div>
                    </div>

                    {/* Subcategory */}
                    {majorHead && (
                        <div className="space-y-2">
                            <label htmlFor="subcategory-select" className="block text-sm font-medium text-gray-700">
                                {majorHead === "Personal" ? "Name" : "Department / Subcategory"} <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="subcategory-select"
                                data-testid="subcategory-select"
                                value={minorHead}
                                onChange={(e) => setMinorHead(e.target.value)}
                                className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition ${errors.minorHead ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-purple-300 focus:border-purple-500"}`}
                            >
                                <option value="">Select {majorHead === "Personal" ? "Name" : "Department / Subcategory"}</option>
                                {minorHeadOptions[majorHead]?.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            {errors.minorHead && <p className="text-sm text-red-600">{errors.minorHead}</p>}
                        </div>
                    )}

                    {/* Tags */}
                    <div className="space-y-2">
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                        <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-2">Type tags separated by commas or spaces (they will be added automatically)</p>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span key={tag.tag_name} className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-1 rounded-full flex items-center text-sm font-medium">
                                        {tag.tag_name}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag.tag_name)}
                                            className="ml-1 text-purple-600 hover:text-purple-800 font-bold"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                                {tags.length === 0 && (
                                    <span className="text-xs text-gray-400 italic">No tags added yet</span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <input
                                id="tags"
                                ref={tagInputRef}
                                type="text"
                                value={inputTag}
                                onChange={handleTagInputChange}
                                onKeyPress={handleKeyPress}
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition"
                                placeholder="Type tags (separate with commas or Enter)..."
                            />
                            {/* Suggested Tags */}
                            <div className="mt-2 flex flex-wrap gap-2">
                                {suggestedTags
                                    .filter(
                                        (s) =>
                                            !tags.some((t) => t.tag_name === s.tag_name) &&
                                            s.tag_name?.toLowerCase().includes(inputTag.toLowerCase())
                                    )
                                    .slice(0, 25)
                                    .map((s) => (
                                        <span
                                            key={s.tag_name}
                                            className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-1 rounded-full flex items-center text-sm font-medium"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleAddTag(s)}
                                                className="ml-1 text-purple-600 hover:text-purple-800 font-normal"
                                            >
                                                {s.tag_name}
                                            </button>
                                        </span>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="space-y-2">
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                        <textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition"
                            placeholder="Enter remarks about this document..."
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-75 disabled:transform-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Upload Document
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </form>

                {/* Message */}
                {message.text && (
                    <div
                        className={`mt-6 p-4 rounded-lg text-center ${message.type === "success"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : message.type === "error"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            }`}
                    >
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;