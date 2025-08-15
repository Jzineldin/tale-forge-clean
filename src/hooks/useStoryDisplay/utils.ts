
// Helper function to check if a string is a valid UUID or custom story ID
export const isValidUUID = (str: string): boolean => {
  // Accept both proper UUIDs and custom story IDs (like zvtsadn7t, rhvj3c76c)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const customIdRegex = /^[a-zA-Z0-9]{8,}$/; // At least 8 alphanumeric characters
  
  return uuidRegex.test(str) || customIdRegex.test(str);
};

// Helper function to check if a string is a proper UUID format
export const isProperUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};
