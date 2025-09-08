import { useState, useMemo, useEffect, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FileList from "./FileList";
import { documentAPI } from "../api/api";
import { AuthContext } from "../context/AuthContext";

const FileSearch = () => {
    const { tags: suggestedTags, addTag } = useContext(AuthContext);

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
    const [documentToDate, setDocumentToDate] = useState(new Date());
    const [documentFromDate, setDocumentFromDate] = useState(new Date());

    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");
    const [inputTag, setInputTag] = useState("");
    const [tags, setTags] = useState([]);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);

    const minorHeadOptions = {
        Personal: ["John", "Tom", "Emily", "Sarah", "Michael", "Jessica"],
        Professional: ["Accounts", "HR", "IT", "Finance", "Marketing", "Operations"],
        Company: ["Work Order", "Invoice", "Contracts"],
    };

    // Date Formate
    const formatDate = (date) => {
        if (!date) return "";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    console.log('suggestedTags', suggestedTags)



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



    // Handle tag operations
    const handleTagInput = (e) => {
        const value = e.target.value;
        setFilters(prev => ({ ...prev, inputTag: value }));
        setShowTagSuggestions(true);
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
        addTag(tagObj);
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

            // Prepare API payload with proper formatting
            const apiPayload = {
                major_head: filters.major_head || "",
                minor_head: filters.minor_head || "",
                from_date: formatDate(documentFromDate) || "",
                to_date: formatDate(documentToDate) || "",
                start: 0,
                tags: tags.map(tag => (tag)) || "",
                uploaded_by: filters.uploaded_by || "",
                length: filters.length || 10,
                search: {
                    value: filters.search || ""
                }
            };
            console.log('apiPayload', apiPayload)
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
            tags: [],
            inputTag: "",
            uploaded_by: "",
            search: "",
            from_date: null,
            to_date: null,
        });
        setDocumentFromDate(null);
        setDocumentToDate(null)
        setSearchResults([]);
        setSearched(false);
        setError("");
        setShowTagSuggestions(false);
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        Document Search
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Find documents quickly using our advanced search filters and tag suggestions
                    </p>
                </div>

                {/* Search Panel */}
                <div className="bg-white p-5 md:p-7 rounded-xl shadow-lg mb-8 border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                        Search Filters
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {/* Category */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <select
                                name="major_head"
                                value={filters.major_head}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="">All Categories</option>
                                <option value="Personal">Personal</option>
                                <option value="Professional">Professional</option>
                                <option value="Company">Company</option>
                            </select>
                        </div>

                        {/* Subcategory */}
                        {filters.major_head && (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {filters.major_head === "Personal" ? "Name" : "Department"}
                                </label>
                                <select
                                    name="minor_head"
                                    value={filters.minor_head}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    <option value="">All {filters.major_head === "Personal" ? "Names" : "Departments"}</option>
                                    {minorHeadOptions[filters.major_head]?.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Date Range */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                From Date
                            </label>
                            <DatePicker
                                selected={documentFromDate}
                                dateFormat="dd/MM/yyyy"
                                onChange={(date) => setDocumentFromDate(date)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholderText="Select start date"
                                isClearable
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                To Date
                            </label>
                            <DatePicker
                                selected={documentToDate}
                                dateFormat="dd/MM/yyyy"
                                onChange={(date) => setDocumentToDate(date)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholderText="Select end date"
                                isClearable
                            />
                        </div>

                        {/* Uploaded By */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Uploaded By
                            </label>
                            <input
                                type="text"
                                name="uploaded_by"
                                value={filters.uploaded_by}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter uploader name"
                            />
                        </div>

                        {/* Search Text */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Search Text
                            </label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Search by title, description or filename"
                            />
                        </div>
                    </div>



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

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-5 border-t border-gray-200">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Search Documents
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleGetAllFiles}
                            disabled={loading}
                            className="px-5 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Get All Files
                        </button>

                        <button
                            onClick={handleReset}
                            className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset
                        </button>
                    </div>
                </div>

                {/* Results */}
                {searched && (
                    <div className="bg-white p-5 md:p-7 rounded-xl shadow-lg border border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {searchResults.length} document{searchResults.length !== 1 ? 's' : ''} found
                        </h3>

                        {searchResults.length > 0 ? (
                            <FileList files={searchResults} />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <svg className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-lg">No documents match your search criteria</p>
                                <p className="text-sm mt-2">Try adjusting your filters or search terms</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileSearch;