// utils/idGenerator.js
import { customAlphabet } from "nanoid";

// Create a custom nanoid function that only uses alphanumeric characters (uppercase + numbers)
// This will be safer for IDs that might be used in URLs or database queries

const generateSafeId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  8
);

// Create more specific ID generators with semantic names

export const generateOrderId = () => generateSafeId();

export { generateSafeId };
