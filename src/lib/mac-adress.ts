// // MAC Address Detection Utility (lib/mac-address.ts)
// export const getMacAddress = async (): Promise<string> => {
//   // Browser-based MAC address detection
//   if (navigator.platform) {
//     // This is a simplified approach. Real-world implementation would be more complex
//     return crypto.randomUUID(); // Fallback to a unique identifier
//   }

//   // For mobile/native environments, you'd use platform-specific APIs
//   throw new Error("MAC Address detection not supported");
// };

export const getMacAddress = async (): Promise<string> => {
  try {
    const response = await fetch("https://api64.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Failed to fetch IP address", error);
    return crypto.randomUUID(); // Fallback to unique identifier
  }
};
