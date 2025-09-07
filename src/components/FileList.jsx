import React, { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const FileList = ({ files, loading, onSearch }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [downloadAllLoading, setDownloadAllLoading] = useState(false);
    const [downloadingFile, setDownloadingFile] = useState(null);

    const handlePreview = (file) => {
        setSelectedFile(file);
        setShowPreviewModal(true);
    };

    const handleDownload = async (fileId, fileName) => {
        setDownloadingFile(fileId);
        try {
            // Try backend download first
            if (response?.data?.success) {
                // Create a Blob URL and download
                const blobData = response.data.file;
                let blob;

                if (typeof blobData === "string" && blobData.startsWith("data:")) {
                    // Base64 from backend
                    const base64Data = blobData.split(",")[1];
                    const contentType = blobData.match(/data:(.*);base64,/)[1];
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    blob = new Blob([byteArray], { type: contentType });
                } else {
                    // Fallback if backend returns Blob
                    blob = new Blob([blobData]);
                }

                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = fileName || "document";
                link.click();
                URL.revokeObjectURL(link.href);
            }
        } catch (error) {
            console.warn("Backend download failed, using localStorage fallback", error);

            // Fallback: find file in localStorage
            const localDocs = JSON.parse(localStorage.getItem("documents")) || [];
            const localFile = localDocs.find((doc) => doc.id === fileId || doc.document_id === fileId);

            if (localFile) {
                const base64Data = localFile.file.split(",")[1];
                const contentType = localFile.fileType || "application/octet-stream";
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: contentType });

                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = localFile.fileName || "document";
                link.click();
                URL.revokeObjectURL(link.href);
            } else {
                alert("File not available to download.");
            }
        } finally {
            setDownloadingFile(null);
        }
    };

    const handleDownloadAll = async () => {
        setDownloadAllLoading(true);
        try {
            const fileIds = files.map((file) => file.id || file.document_id);

            let filesToDownload = [];

            try {
                // Try backend download
                const response = await documentAPI.downloadAllAsZip(fileIds);
                if (response?.data?.success) {
                    const element = document.createElement("a");
                    element.setAttribute("href", "#");
                    element.setAttribute("download", "documents.zip");
                    element.style.display = "none";
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                    return;
                }
            } catch (backendError) {
                console.warn("Backend not working, using localStorage fallback.", backendError);
                // Fallback: get files from localStorage
                const localDocs = JSON.parse(localStorage.getItem("documents")) || [];
                filesToDownload = localDocs.filter((doc) => fileIds.includes(doc.document_id) || fileIds.includes(doc.id));
            }

            if (filesToDownload.length > 0) {
                const zip = new JSZip();

                filesToDownload.forEach((doc) => {
                    // Convert Base64 dataURL to Blob
                    const base64Data = doc.file.split(",")[1];
                    const contentType = doc.fileType || doc.fileType || "application/octet-stream";
                    const byteCharacters = atob(base64Data);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: contentType });

                    const fileName = doc.fileName || `document-${doc.id || Date.now()}`;
                    zip.file(fileName, blob);
                });

                const zipBlob = await zip.generateAsync({ type: "blob" });
                saveAs(zipBlob, "documents.zip");
            } else {
                alert("No files available to download.");
            }
        } catch (error) {
            console.error("Download all error:", error);
        } finally {
            setDownloadAllLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (!files || files.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No documents found</h3>
                    <p className="mt-1 text-gray-500">No documents match your search criteria.</p>
                    <button
                        onClick={onSearch}
                        className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:shadow-md transition-shadow"
                    >
                        Try Another Search
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                        Search Results
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {files.length} document{files.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                <button
                    onClick={handleDownloadAll}
                    disabled={downloadAllLoading || files.length === 0}
                    className="mt-4 sm:mt-0 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-md transition-shadow disabled:opacity-75 flex items-center"
                >
                    {downloadAllLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Preparing ZIP...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download All as ZIP
                        </>
                    )}
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl shadow-inner">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {files.map((file) => {
                            const id = file.id || file.document_id;
                            const name = file.fileName || "Unnamed File";
                            const type = (file.fileType || "").toUpperCase() || "UNKNOWN";
                            const major = file.major_head || "-";
                            const minor = file.minor_head || "-";
                            const date = file.uploadDate || file.document_date || "N/A";
                            const tags = file.tags || [];

                            return (
                                <tr key={id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <span className="text-blue-600 font-medium">
                                                    {type === "PDF" ? "PDF" : type.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type === "PDF"
                                            ? "bg-red-100 text-red-800"
                                            : type.includes("IMAGE") || type.includes("PNG") || type.includes("JPG") || type.includes("JPEG")
                                                ? "bg-green-100 text-green-800"
                                                : "bg-blue-100 text-blue-800"
                                            }`}
                                        >
                                            {type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {major}/{minor}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {tags.slice(0, 3).map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium"
                                                >
                                                    {typeof tag === "string" ? tag : tag.tag_name}
                                                </span>
                                            ))}
                                            {tags.length > 3 && (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                                    +{tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handlePreview(file)}
                                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Preview
                                            </button>
                                            <button
                                                onClick={() => handleDownload(id, name)}
                                                disabled={downloadingFile === id}
                                                className="text-green-600 hover:text-green-800 font-medium flex items-center disabled:opacity-50"
                                            >
                                                {downloadingFile === id ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4 mr-1 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Downloading
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>


        </div>
    );
};

export default FileList;