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
- [Live Demo](#live-link)

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

```
DMS/
├── node_modules/                   # Project dependencies
├── public/                         # Static assets
├── src/
│ ├── api/
│ │ └── api.js                      # Axios instance for API calls
│ ├── assets/                        # Images, icons, fonts
│ ├── components/
│ │ ├── tests/                       # Unit tests for components
│ │ │ ├── FileUpload.test.jsx
│ │ │ └── Login.test.jsx
│ │ ├── Admin.jsx
│ │ ├── Dashboard.jsx
│ │ ├── FileList.jsx
│ │ ├── FilePreviewModal.jsx
│ │ ├── FileSearch.jsx
│ │ ├── FileUpload.jsx
│ │ ├── Header.jsx
│ │ ├── Layout.jsx
│ │ ├── Login.jsx
│ │ └── ProtectedRoute.jsx
│ ├── context/
│ │ └── AuthContext.jsx             # Authentication state
│ ├── App.css
│ ├── App.jsx                        # Root component
│ ├── index.css
│ ├── main.jsx                        # Entry point
│ └── setupTests.js                   # Testing setup
├── .env                             # Environment variables
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js

```

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

Follow these steps to set up the project locally:

1. Clone the repository

```
git clone https://github.com/monty13kathare/DMS.git

```

2. Install dependencies

```
npm install
```

3. Set up environment variables
   Create a .env file in the root directory and add any necessary environment variables. Example:

```
VITE_API_BASE_URL=https://apis.allsoft.co/api/documentManagement
```

4. Start the development server

```
npm run dev
```

## Running the Project

After installation:

```
npm run dev
```

## Unit Testing

This project uses Vitest and React Testing Library for unit testing.

1. Run tests

```
npm run test
```

## Live Demo - [Link DMS Project](https://dms-vigd.vercel.app/login)
