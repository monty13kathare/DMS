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
