export const getFileInfo = (url) => {
  const pathname = new URL(url).pathname;
  const fileName = pathname.substring(pathname.lastIndexOf("/") + 1);
  const ext = fileName.split(".").pop().toLowerCase();

  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  return {
    name: fileName,
    extension: ext,
    type: mimeTypes[ext] || "application/octet-stream",
  };
};

// Date Formate
export function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Check for invalid date
  if (isNaN(date)) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Date Formate
export const formatDateFunction = (date) => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// MinorHead Dummy Options Data
export const minorHeadOptions = {
  Personal: [
    "Aadhaar Card",
    "Resume",
    "PAN Card",
    "Driving License",
    "Passport",
    "Voter ID",
    "Medical Records",
    "Bank Statements",
    "Insurance Policies",
    "Property Documents",
    "Education Certificates",
  ],
  Professional: [
    "HR Policies",
    "Offer Letters",
    "Employee Contracts",
    "Salary Slips",
    "Performance Reviews",
    "Leave Applications",
    "Training Certificates",
    "Project Reports",
    "Meeting Minutes",
    "Expense Reports",
  ],
  Company: [
    "Work Orders",
    "Invoices",
    "Purchase Orders",
    "Tax Returns",
    "Audit Reports",
    "Contracts & Agreements",
    "Compliance Certificates",
    "Board Resolutions",
    "Legal Notices",
    "Annual Reports",
  ],
};

// Define mapping for labels
export const labelMap = {
  Personal: "Document Type",
  Professional: "Department / Subcategory",
  Company: "Business Document",
};
