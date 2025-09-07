
const FilePreviewModal = ({ file, onClose }) => {
    if (!file) return null;

    const fileType = (file.fileType || "").toLowerCase();

    const renderPreview = () => {
        if (fileType === "application/pdf" || fileType === "pdf") {
            return (
                <iframe
                    src={file.file}
                    title={file.fileName}
                    className="w-full h-full rounded-lg"
                    frameBorder="0"
                />
            );
        } else if (fileType.startsWith("image/")) {
            return <img src={file.file} alt={file.fileName} className="w-full h-full object-contain rounded-lg" />;
        } else {
            return (
                <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-gray-600 text-xl font-semibold">No Preview Available</span>
                    <p className="text-gray-500 mt-2 text-center">This file type cannot be previewed in the browser</p>
                </div>
            );
        }
    };

    const getFileIcon = () => {
        if (fileType === "application/pdf" || fileType === "pdf") {
            return (
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">PDF</span>
                </div>
            );
        } else if (fileType.startsWith("image/")) {
            return (
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            );
        } else {
            return (
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center space-x-3">
                        {getFileIcon()}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">Document Preview</h3>
                            <p className="text-sm text-gray-600 truncate max-w-xs">{file.fileName || "Untitled"}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Preview */}
                        <div className="lg:col-span-2 border border-gray-200 rounded-xl overflow-hidden bg-gray-50" style={{ minHeight: "400px" }}>
                            {renderPreview()}
                        </div>

                        {/* Details */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5">
                                <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Document Details
                                </h4>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Name</p>
                                        <p className="font-medium text-gray-800 truncate">{file.fileName || "Untitled"}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Type</p>
                                        <p className="font-medium text-gray-800">{fileType || "Unknown"}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Category</p>
                                        <p className="font-medium text-gray-800">
                                            {file.major_head || "N/A"} / {file.minor_head || "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date</p>
                                        <p className="font-medium text-gray-800">{file.uploadDate || file.document_date || "N/A"}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Uploaded By</p>
                                        <p className="font-medium text-gray-800">{file.user_id || file.uploaded_by || "Unknown"}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Remarks</p>
                                        <p className="font-medium text-gray-800">{file.document_remarks || file.remarks || "N/A"}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tags</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {file.tags && file.tags.length > 0 ? (
                                                file.tags.map((tag, i) => (
                                                    <span key={i} className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                                                        {tag.tag_name || tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-sm">No tags</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 px-6 rounded-lg font-medium hover:shadow-md transition-shadow"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;