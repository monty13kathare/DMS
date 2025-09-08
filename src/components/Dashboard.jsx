import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { formatDate, getFileInfo } from "../util/helper";

const Dashboard = () => {
    const { recentFiles, recentFilesLoading, loadRecentFiles } =
        useContext(AuthContext);
    const [username, setUsername] = useState("");
    const [documents, setDocuments] = useState([]);


    useEffect(() => {
        loadRecentFiles();
    }, []);

    useEffect(() => {
        try {
            //Load logged-in user
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const loggedInUser = localStorage.getItem("authUser");

            if (loggedInUser) {
                setUsername(loggedInUser);
            } else if (users.length > 0) {
                setUsername(users[0].username);
            }

            // Load recent documents (last 5)
            const localDocs = JSON.parse(localStorage.getItem("documents")) || [];
            // Show most recent documents first
            const recentDocs = [...localDocs].reverse().slice(0, 5);
            setDocuments(recentDocs);
        } catch (error) {
            console.error("Error loading local data:", error);
        }
    }, []);



    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8  p-4 ">
                <div>
                    <div className="flex items-center justify-center text-2xl md:text-3xl font-bold">
                        <h1 className=" bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Welcome back, <span className="text-blue-600">{username || "Guest"}</span>
                        </h1>
                        <span>👋</span>
                    </div>

                    <p className="text-gray-600 mt-1">Here's what's happening with your documents today</p>
                </div>


            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm font-medium">Total Documents</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                        {recentFiles?.length || 0}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, recentFiles?.length * 5)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-purple-500">
                    <h3 className="text-gray-500 text-sm font-medium">Recent Activity</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                        {recentFiles?.length > 0 ? recentFiles?.length : "No"} recent files
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, recentFiles?.length * 5)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm font-medium">Storage</h3>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                        {recentFiles?.length * 2} MB
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, recentFiles.length * 5)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Upload Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg transform transition-transform hover:scale-105">
                    <div className="flex items-center mb-4">
                        <div className="bg-white text-purple-600 bg-opacity-20 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Upload Documents</h2>
                    <p className="text-blue-100 mb-4">
                        Add new documents with metadata and tags
                    </p>
                    <Link
                        to="/upload"
                        className="inline-block bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                    >
                        Upload Now
                    </Link>
                </div>

                {/* Search Card */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg transform transition-transform hover:scale-105">
                    <div className="flex items-center mb-4">
                        <div className="bg-white text-purple-600 bg-opacity-20 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Search Documents</h2>
                    <p className="text-purple-100 mb-4">
                        Find documents using advanced search filters
                    </p>
                    <Link
                        to="/search"
                        className="inline-block bg-white text-purple-600 py-2 px-4 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                    >
                        Search Now
                    </Link>
                </div>

                {/* Admin Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg transform transition-transform hover:scale-105">
                    <div className="flex items-center mb-4">
                        <div className="bg-white text-purple-600 bg-opacity-20 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Admin Panel</h2>
                    <p className="text-indigo-100 mb-4">
                        Manage users and system settings
                    </p>
                    <Link
                        to="/admin"
                        className="inline-block bg-white text-indigo-600 py-2 px-4 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                    >
                        Go to Admin
                    </Link>
                </div>
            </div>

            {/* Recent Docs */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Recent Documents</h2>
                    {recentFiles.length > 0 && (
                        <Link
                            to="/search"
                            className="text-sm text-blue-600 font-medium hover:underline"
                        >
                            View all
                        </Link>
                    )}
                </div>

                {recentFiles.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl shadow-inner">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentFiles.map((doc, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-blue-600 font-medium">
                                                        {getFileInfo(doc.file_url)?.name ? getFileInfo(doc.file_url)?.name?.charAt(0).toUpperCase() : 'D'}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {getFileInfo(doc.file_url)?.name || "Untitled"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {getFileInfo(doc.file_url)?.type?.toUpperCase() || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {doc.major_head}/{doc.minor_head}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(doc.document_date) || "N/A"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No documents yet</h3>
                        <p className="mt-1 text-gray-500">Get started by uploading your first document.</p>
                        <div className="mt-6">
                            <Link
                                to="/upload"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Upload Document
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;