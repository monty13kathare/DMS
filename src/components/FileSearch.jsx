import { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FileList from "./FileList";
import { documentAPI } from "../api/api";

const FileSearch = () => {
    const [filters, setFilters] = useState({
        major_head: "",
        minor_head: "",
        from_date: null,
        to_date: null,
        tags: [],
        inputTag: "",
        uploaded_by: "",
        search: "",
    });

    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");

    const minorHeadOptions = {
        Personal: ["John", "Tom", "Emily", "Sarah", "Michael", "Jessica"],
        Professional: ["Accounts", "HR", "IT", "Finance", "Marketing", "Operations"],
        Company: ["Work Order", "Invoice", "Contracts"],
    };

    // Get all documents from localStorage
    const getAllDocuments = () => {
        return JSON.parse(localStorage.getItem("documents")) || [];
    };

    // Validate date range
    const validateDates = () => {
        if (filters.from_date && filters.to_date && filters.from_date > filters.to_date) {
            setError("From date cannot be after to date");
            return false;
        }
        setError("");
        return true;
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            ...(name === "major_head" && { minor_head: "" }) // Reset minor head when major changes
        }));
    };

    // Handle date changes
    const handleDateChange = (name, date) => {
        setFilters(prev => ({ ...prev, [name]: date }));
    };

    // Handle tag operations
    const handleTagInput = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, inputTag: value }));
    };

    const addTags = () => {
        if (!filters.inputTag.trim()) return;

        const newTags = filters.inputTag
            .split(/[,\s]+/)
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .map(tag => ({ tag_name: tag }));

        if (newTags.length > 0) {
            const uniqueNewTags = newTags.filter(tag =>
                !filters.tags.some(existingTag =>
                    existingTag.tag_name.toLowerCase() === tag.tag_name.toLowerCase()
                )
            );

            setFilters(prev => ({
                ...prev,
                tags: [...prev.tags, ...uniqueNewTags],
                inputTag: ""
            }));
        }
    };

    const removeTag = (tagToRemove) => {
        setFilters(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t.tag_name !== tagToRemove)
        }));
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTags();
        }
    };

    // Filter documents based on criteria
    const filterDocuments = (docs, filters) => {
        return docs.filter(doc => {
            // Major head filter
            if (filters.major_head && doc.major_head !== filters.major_head) return false;

            // Minor head filter
            if (filters.minor_head && doc.minor_head !== filters.minor_head) return false;

            // Date range filter
            const docDate = new Date(doc.document_date || doc.uploadDate);
            if (filters.from_date && docDate < filters.from_date) return false;
            if (filters.to_date && docDate > filters.to_date) return false;

            // Uploaded by filter
            if (filters.uploaded_by && doc.uploaded_by !== filters.uploaded_by) return false;

            // Tags filter
            if (filters.tags.length > 0) {
                const docTags = doc.tags || [];
                const hasMatchingTag = filters.tags.some(filterTag =>
                    docTags.some(docTag =>
                        (typeof docTag === "string" ? docTag : docTag.tag_name) === filterTag.tag_name
                    )
                );
                if (!hasMatchingTag) return false;
            }

            // Search text filter
            if (filters.search) {
                const searchVal = filters.search.toLowerCase();
                const matchesTitle = doc.title?.toLowerCase().includes(searchVal);
                const matchesDescription = doc.description?.toLowerCase().includes(searchVal);
                const matchesFileName = doc.fileName?.toLowerCase().includes(searchVal);

                if (!matchesTitle && !matchesDescription && !matchesFileName) return false;
            }

            return true;
        });
    };

    // Search function with fallback to localStorage
    const handleSearch = async () => {
        if (!validateDates()) return;

        setLoading(true);
        setSearched(true);

        try {
            // Format dates for API
            const fromDate = filters.from_date ? filters.from_date.toISOString().split('T')[0] : "";
            const toDate = filters.to_date ? filters.to_date.toISOString().split('T')[0] : "";

            // Prepare API payload with proper formatting
            const apiPayload = {
                major_head: filters.major_head || "",
                minor_head: filters.minor_head || "",
                from_date: fromDate,
                to_date: toDate,
                tags: (filters.tags || []).map(tag => ({ tag_name: tag })),
                uploaded_by: filters.uploaded_by || "",
                length: filters.length || 10,
                search: filters.search || ""
            };

            // Call the API
            const response = await documentAPI.searchDocuments(apiPayload);
            // Set results from API response
            setSearchResults(response.data?.data || []);
        } catch (err) {
            console.error("Search API error, falling back to localStorage:", err);

            // Fallback to localStorage search
            try {
                const allDocs = getAllDocuments();
                const filteredDocs = filterDocuments(allDocs, filters);
                setSearchResults(filteredDocs);
                setError("API search failed. Showing results from local storage.");
            } catch (fallbackErr) {
                console.error("Local storage search error:", fallbackErr);
                setError("Failed to search documents. Please try again.");
                setSearchResults([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Reset all filters
    const handleReset = () => {
        setFilters({
            major_head: "",
            minor_head: "",
            from_date: null,
            to_date: null,
            tags: [],
            inputTag: "",
            uploaded_by: "",
            search: "",
        });
        setSearchResults([]);
        setSearched(false);
        setError("");
    };

    // Get all files without filtering
    const handleGetAllFiles = () => {
        setLoading(true);
        setSearched(true);

        setTimeout(() => {
            try {
                const allDocs = getAllDocuments();
                setSearchResults(allDocs);
            } catch (err) {
                console.error("Error getting files:", err);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Document Search
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Find documents using advanced filters
                    </p>
                </div>

                {/* Search Panel */}
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                name="major_head"
                                value={filters.major_head}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Categories</option>
                                <option value="Personal">Personal</option>
                                <option value="Professional">Professional</option>
                                <option value="Company">Company</option>
                            </select>
                        </div>

                        {/* Subcategory */}
                        {filters.major_head && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {filters.major_head === "Personal" ? "Name" : "Department"}
                                </label>
                                <select
                                    name="minor_head"
                                    value={filters.minor_head}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All {filters.major_head === "Personal" ? "Names" : "Departments"}</option>
                                    {minorHeadOptions[filters.major_head]?.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                From Date
                            </label>
                            <DatePicker
                                selected={filters.from_date}
                                dateFormat="dd/MM/yyyy"
                                onChange={date => handleDateChange("from_date", date)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholderText="Select start date"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                To Date
                            </label>
                            <DatePicker
                                selected={filters.to_date}
                                dateFormat="dd/MM/yyyy"
                                onChange={date => handleDateChange("to_date", date)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholderText="Select end date"
                            />
                        </div>

                        {/* Uploaded By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Uploaded By
                            </label>
                            <input
                                type="text"
                                name="uploaded_by"
                                value={filters.uploaded_by}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter uploader name"
                            />
                        </div>

                        {/* Search Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search Text
                            </label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search by title, description or filename"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                        </label>
                        <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">
                                Add tags separated by commas or spaces
                            </p>
                            <div className="flex flex-wrap gap-1 mb-2">
                                {filters.tags.map(tag => (
                                    <span
                                        key={tag.tag_name}
                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center text-xs"
                                    >
                                        {tag.tag_name}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag.tag_name)}
                                            className="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                                        >
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={filters.inputTag}
                                onChange={handleTagInput}
                                onKeyPress={handleKeyPress}
                                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Type tags (separate with commas or spaces)..."
                            />
                            <button
                                type="button"
                                onClick={addTags}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-3 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? "Searching..." : "Search Documents"}
                        </button>

                        <button
                            onClick={handleGetAllFiles}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition disabled:opacity-50"
                        >
                            {loading ? "Loading..." : "Get All Files"}
                        </button>

                        <button
                            onClick={handleReset}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-100 transition"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Results */}
                {searched && (
                    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {searchResults.length} document{searchResults.length !== 1 ? 's' : ''} found
                        </h3>

                        {searchResults.length > 0 ? (
                            <FileList files={searchResults} />
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                                <svg className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p>No documents match your search criteria</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileSearch;