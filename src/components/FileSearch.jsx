import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FileList from "./FileList";

const FileSearch = () => {
    const [filters, setFilters] = useState({
        major_head: "",
        minor_head: "",
        from_date: null,
        to_date: null,
        tags: [],
        inputTag: "",
        uploaded_by: "",
        start: 0,
        length: 10,
        filterId: "",
        search: { value: "" },
    });

    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [errors, setErrors] = useState({});

    const minorHeadOptions = {
        Personal: ["John", "Tom", "Emily", "Sarah", "Michael", "Jessica"],
        Professional: [
            "Accounts",
            "HR",
            "IT",
            "Finance",
            "Marketing",
            "Operations",
        ],
        Company: ["Work Order", "Invoice", "Contracts"],
    };

    // Input validation
    const validateForm = () => {
        const newErrors = {};

        // Validate date range
        if (
            filters.from_date &&
            filters.to_date &&
            filters.from_date > filters.to_date
        ) {
            newErrors.dateRange = "From date cannot be after to date";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Clear errors when inputs change
    useEffect(() => {
        setErrors({});
    }, [filters.from_date, filters.to_date]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "searchValue") {
            setFilters((prev) => ({
                ...prev,
                search: { value },
            }));
        } else {
            setFilters((prev) => ({
                ...prev,
                [name]: value,
                ...(name === "major_head" && { minor_head: "" }),
            }));
        }
    };

    const handleDateChange = (name, date) => {
        setFilters((prev) => ({
            ...prev,
            [name]: date,
        }));
    };

    const handleTagInputChange = (e) => {
        const value = e.target.value;
        setFilters((prev) => ({ ...prev, inputTag: value }));

        // Auto-add tags when comma or space is entered
        if (value.endsWith(",") || value.endsWith(" ")) {
            const tagToAdd = value.slice(0, -1).trim();
            if (tagToAdd) {
                // Check for duplicates
                if (
                    !filters.tags.some(
                        (tag) => tag.tag_name.toLowerCase() === tagToAdd.toLowerCase()
                    )
                ) {
                    setFilters((prev) => ({
                        ...prev,
                        tags: [...prev.tags, { tag_name: tagToAdd }],
                        inputTag: "",
                    }));
                } else {
                    setFilters((prev) => ({ ...prev, inputTag: "" }));
                }
            }
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFilters((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t.tag_name !== tagToRemove),
        }));
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleAddTag = () => {
        if (!filters.inputTag.trim()) return;

        // Split tags by comma and trim whitespace
        const newTags = filters.inputTag
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
            .map((tag) => ({ tag_name: tag }));

        if (newTags.length > 0) {
            // Filter out duplicates
            const uniqueNewTags = newTags.filter(
                (tag) =>
                    !filters.tags.some(
                        (existingTag) =>
                            existingTag.tag_name.toLowerCase() === tag.tag_name.toLowerCase()
                    )
            );

            setFilters((prev) => ({
                ...prev,
                tags: [...prev.tags, ...uniqueNewTags],
                inputTag: "",
            }));
        }
    };

    // Optimized search function with localStorage caching
    const handleSearch = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setSearched(true);

        try {
            // Try API call first
            // const response = await documentAPI.searchDocuments(filters);
            // setSearchResults(response.data?.data || response.data || []);

            // For demo purposes, using localStorage data
            const localDocs = JSON.parse(localStorage.getItem("documents")) || [];
            const results = filterLocalDocuments(localDocs, filters);
            setSearchResults(results);
        } catch (error) {
            console.warn("Backend not available, using localStorage fallback", error);

            // Use localStorage data with optimized filtering
            const localDocs = JSON.parse(localStorage.getItem("documents")) || [];
            const results = filterLocalDocuments(localDocs, filters);
            setSearchResults(results);
        } finally {
            setLoading(false);
        }
    };

    // Optimized local document filtering
    const filterLocalDocuments = (docs, filters) => {
        return docs.filter((doc) => {
            // Major head filter
            if (filters.major_head && doc.major_head !== filters.major_head)
                return false;

            // Minor head filter
            if (filters.minor_head && doc.minor_head !== filters.minor_head)
                return false;

            // Date range filter
            const docDate = new Date(doc.document_date || doc.uploadDate);
            if (filters.from_date && docDate < filters.from_date) return false;
            if (filters.to_date && docDate > filters.to_date) return false;

            // Uploaded by filter
            if (filters.uploaded_by && doc.uploaded_by !== filters.uploaded_by)
                return false;

            // Tags filter
            if (filters.tags.length > 0) {
                const docTags = doc.tags || [];
                const hasMatchingTag = filters.tags.some((filterTag) =>
                    docTags.some(
                        (docTag) =>
                            (typeof docTag === "string" ? docTag : docTag.tag_name) ===
                            filterTag.tag_name
                    )
                );
                if (!hasMatchingTag) return false;
            }

            // Search text filter
            if (filters.search.value) {
                const searchVal = filters.search.value.toLowerCase();
                const matchesTitle = doc.title?.toLowerCase().includes(searchVal);
                const matchesDescription = doc.description
                    ?.toLowerCase()
                    .includes(searchVal);
                const matchesFileName = doc.fileName?.toLowerCase().includes(searchVal);

                if (!matchesTitle && !matchesDescription && !matchesFileName)
                    return false;
            }

            return true;
        });
    };

    const handleReset = () => {
        setFilters({
            major_head: "",
            minor_head: "",
            from_date: null,
            to_date: null,
            tags: [],
            inputTag: "",
            uploaded_by: "",
            start: 0,
            length: 10,
            filterId: "",
            search: { value: "" },
        });
        setSearchResults([]);
        setSearched(false);
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Search Documents
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Find documents using advanced filters
                    </p>
                </div>

                {/* Search Panel */}
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <select
                                name="major_head"
                                value={filters.major_head}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition"
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
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition"
                                >
                                    <option value="">
                                        All{" "}
                                        {filters.major_head === "Personal"
                                            ? "Names"
                                            : "Departments"}
                                    </option>
                                    {minorHeadOptions[filters.major_head]?.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
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
                                selected={filters.from_date}
                                onChange={(date) => handleDateChange("from_date", date)}
                                selectsStart
                                startDate={filters.from_date}
                                endDate={filters.to_date}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition"
                                placeholderText="Select start date"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                To Date
                            </label>
                            <DatePicker
                                selected={filters.to_date}
                                onChange={(date) => handleDateChange("to_date", date)}
                                selectsEnd
                                startDate={filters.from_date}
                                endDate={filters.to_date}
                                minDate={filters.from_date}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition"
                                placeholderText="Select end date"
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
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition"
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
                                name="searchValue"
                                value={filters.search.value}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition"
                                placeholder="Search by title, description or filename"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="mt-6 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Tags
                        </label>
                        <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-2">
                                Type tags separated by commas or spaces (they will be added
                                automatically)
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {filters.tags.map((tag) => (
                                    <span
                                        key={tag.tag_name}
                                        className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-1 rounded-full flex items-center text-sm font-medium"
                                    >
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
                                {filters.tags.length === 0 && (
                                    <span className="text-xs text-gray-400 italic">
                                        No tags added yet
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={filters.inputTag}
                                onChange={handleTagInputChange}
                                onKeyPress={handleKeyPress}
                                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition"
                                placeholder="Type tags (separate with commas or spaces)..."
                            />
                        </div>
                    </div>

                    {/* Validation Error */}
                    {errors.dateRange && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
                            {errors.dateRange}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-75 disabled:transform-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Searching...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="mr-2 h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    Search Documents
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Results */}
                {searched && (
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Search Results ({searchResults.length} documents found)
                        </h3>

                        {searchResults.length > 0 ? (
                            <FileList files={searchResults} />
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 mx-auto text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <p className="mt-2">No documents match your search criteria</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileSearch;
