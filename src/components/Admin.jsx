import { useState, useEffect } from 'react';

const Admin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('create'); // 'create' or 'manage'
    const [editingUser, setEditingUser] = useState(null);

    // Load users from localStorage on component mount
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        try {
            const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
            setUsers(storedUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            setUsers([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password || !mobileNumber) {
            setMessage({ type: 'error', text: 'Please fill all fields' });
            return;
        }

        if (mobileNumber.length < 10) {
            setMessage({ type: 'error', text: 'Mobile number must be at least 10 digits' });
            return;
        }

        setLoading(true);
        try {
            // Try backend API first

            if (response?.data?.success) {
                // Add to localStorage as fallback
                const newUser = {
                    id: Date.now().toString(),
                    username,
                    password,
                    mobileNumber,
                    createdAt: new Date().toISOString()
                };

                const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
                localStorage.setItem('users', JSON.stringify([...existingUsers, newUser]));

                setMessage({ type: 'success', text: 'User created successfully ✅' });
                setUsername('');
                setPassword('');
                setMobileNumber('');
                loadUsers(); // Refresh the user list
            } else {
                throw new Error(response.data?.message || 'Failed to create user');
            }
        } catch (error) {
            console.warn('Backend failed, using localStorage fallback', error);

            // Fallback to localStorage
            const newUser = {
                id: Date.now().toString(),
                username,
                password,
                mobileNumber,
                createdAt: new Date().toISOString()
            };

            const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
            localStorage.setItem('users', JSON.stringify([...existingUsers, newUser]));

            setMessage({ type: 'success', text: 'User created successfully (local storage) ✅' });
            setUsername('');
            setPassword('');
            setMobileNumber('');
            loadUsers();
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const updatedUsers = users.filter(user => user.id !== userId);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            setUsers(updatedUsers);
            setMessage({ type: 'success', text: 'User deleted successfully' });
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setUsername(user.username);
        setPassword(user.password);
        setMobileNumber(user.mobileNumber);
        setActiveTab('create');
    };

    const handleUpdateUser = (e) => {
        e.preventDefault();

        if (!username || !password || !mobileNumber) {
            setMessage({ type: 'error', text: 'Please fill all fields' });
            return;
        }

        const updatedUsers = users.map(user =>
            user.id === editingUser.id
                ? { ...user, username, password, mobileNumber }
                : user
        );

        localStorage.setItem('users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        setMessage({ type: 'success', text: 'User updated successfully ✅' });
        setEditingUser(null);
        setUsername('');
        setPassword('');
        setMobileNumber('');
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setUsername('');
        setPassword('');
        setMobileNumber('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Admin Panel
                    </h2>
                    <p className="text-gray-600 mt-2">Manage system users and permissions</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
                    <div className="flex border-b">
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'create'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {editingUser ? 'Edit User' : 'Create User'}
                        </button>
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'manage'
                                ? 'text-purple-600 border-b-2 border-purple-600'
                                : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Manage Users ({users.length})
                        </button>
                    </div>

                    {/* Create/Edit User Form */}
                    {activeTab === 'create' && (
                        <div className="p-6">
                            <form onSubmit={editingUser ? handleUpdateUser : handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Username</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition"
                                            placeholder="Enter username"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                        <input
                                            type="tel"
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 15))}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition"
                                            placeholder="Enter mobile number"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-purple-500 focus:outline-none transition"
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>

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
                                                {editingUser ? 'Updating...' : 'Creating...'}
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                {editingUser ? 'Update User' : 'Create User'}
                                            </span>
                                        )}
                                    </button>

                                    {editingUser && (
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>

                            {/* Message */}
                            {message.text && (
                                <div className={`mt-6 p-4 rounded-lg text-center ${message.type === "success"
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-red-100 text-red-700 border border-red-200"
                                    }`}
                                >
                                    {message.text}
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Management Dashboard */}
                    {activeTab === 'manage' && (
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800">System Users</h3>
                                <p className="text-sm text-gray-600">Manage all registered users in the system</p>
                            </div>

                            {users.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
                                    <p className="mt-1 text-gray-500">Get started by creating your first user.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl shadow-inner">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-700">{user.mobileNumber}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500">
                                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-3">
                                                            <button
                                                                onClick={() => handleEditUser(user)}
                                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="text-red-600 hover:text-red-800 font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Statistics Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">System Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-5 rounded-xl">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                                    <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Documents</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {JSON.parse(localStorage.getItem('documents') || '[]').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;