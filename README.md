# Document Management System (DMS)

A modern web application for uploading, managing, and searching documents efficiently. Built with **React**, **javaScript**, and **Vite**, this system provides an intuitive interface for users and robust features for admins.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Components](#components)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Unit Testing](#unit-testing)

---

## Features

- **User Authentication**: Login, signup, and token-based authentication.
- **File Upload**: Upload documents with metadata (category, subcategory, date, description).
- **File Search**: Search and filter documents by multiple criteria.
- **File Preview & Download**: Preview documents (PDF, images) and download them individually or as zip.
- **Admin Panel**: Manage users and documents.
- **Dashboard**: Provides an overview of uploaded files, recent activity, and statistics.
- **Header Navigation**: Global header with navigation links and logout button.
- **LocalStorage Support**: Offline support for certain operations.
- **Responsive UI**: Works on desktops, tablets, and mobile devices.

---

## Tech Stack

- **Frontend**: React + JavaScript + Vite
- **Routing**: React Router v7
- **State Management**: React Context API
- **UI Library**: Tailwind CSS
- **API Requests**: Axios
- **Testing**: Vitest + React Testing Library
- **File Handling**: JSZip, FileSaver
- **Version Control**: Git + GitHub

---

## Project Structure

DMS/
├── node_modules/ # Project dependencies (auto-generated)
├── public/ # Static assets served directly
├── src/ # Main source code
│ ├── api/ # API-related files
│ │ └── api.js # API configuration and calls
│ ├── assets/ # Static assets (images, fonts, etc.)
│ ├── components/ # React components
│ │ ├── **tests**/ # Component tests
│ │ │ ├── FileUpload.test.jsx
│ │ │ └── Login.test.jsx
│ │ ├── Admin.jsx # Admin component
│ │ ├── Dashboard.jsx # Dashboard component
│ │ ├── FileList.jsx # File list component
│ │ ├── FilePreviewModal.jsx # File preview modal component
│ │ ├── FileSearch.jsx # File search component
│ │ ├── FileUpload.jsx # File upload component
│ │ ├── Header.jsx # Header component
│ │ ├── Layout.jsx # Layout component
│ │ ├── Login.jsx # Login component
│ │ └── ProtectedRoute.jsx # Protected route component
│ ├── context/ # React context files
│ │ └── AuthContext.jsx # Authentication context
│ ├── App.css # Main application styles
│ ├── App.jsx # Root React component
│ ├── index.css # Global styles
│ ├── main.jsx # Application entry point
│ └── setupTests.js # Test configuration
├── .env # Environment variables
├── .gitignore # Git ignore rules
├── eslint.config.js # ESLint configuration
├── index.html # HTML template
├── package.json # Project dependencies and scripts
├── package-lock.json # Dependency lock file
├── README.md # Project documentation
└── vite.config.js # Vite configuration

## Components

### Core Components

- **App.jsx** - Root component that handles routing and application structure
- **Layout.jsx** - Main layout component with header and content area
- **Header.jsx** - Navigation header with user authentication status

### Authentication Components

- **Login.jsx** - User login form and authentication handling
- **ProtectedRoute.jsx** - Higher-order component for protecting routes
- **AuthContext.jsx** - React context for authentication state management

### File Management Components

- **Dashboard.jsx** - Main dashboard showing user files and actions
- **FileUpload.jsx** - Component for uploading files to the system
- **FileList.jsx** - Displays list of uploaded files with metadata
- **FileSearch.jsx** - Search functionality for finding files
- **FilePreviewModal.jsx** - Modal for previewing file contents
- **Admin.jsx** - Administrative interface for user management

## Installation
