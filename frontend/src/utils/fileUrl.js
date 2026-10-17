/**
 * Returns full backend URL for deliverable files stored in uploads
 */
export const getFileUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const backendBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

/**
 * Checks if the file is a PDF
 */
export const isPdfFile = (url = "", name = "") => {
  const combined = `${url} ${name}`.toLowerCase();
  return combined.includes(".pdf");
};

/**
 * Checks if the file is an Image
 */
export const isImageFile = (url = "", name = "") => {
  const combined = `${url} ${name}`.toLowerCase();
  return (
    combined.includes(".png") ||
    combined.includes(".jpg") ||
    combined.includes(".jpeg") ||
    combined.includes(".webp") ||
    combined.includes(".gif")
  );
};
