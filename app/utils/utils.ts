/**
 * Formats a file size in bytes to a human-readable string (KB, MB, or GB)
 * @param bytes - The size in bytes
 * @returns A formatted string with the appropriate unit (KB, MB, or GB)
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  // Determine the appropriate unit
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Convert to the appropriate unit and format with 2 decimal places
  // If the result is a whole number, don't show decimal places
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  
  return `${formattedSize} ${sizes[i]}`;
}

export const generateUID = () => crypto.randomUUID();