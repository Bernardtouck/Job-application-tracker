import API from "./axios";
import type { UserProfile, UpdateProfilePayload } from "../types/user.types";
 
/**
 * Get the authenticated user's profile
 */
export const getProfile = async (): Promise<UserProfile> => {
  const res = await API.get<UserProfile>("/users/profile");
  return res.data;
};
 
/**
 * Update username and/or avatar (base64)
 */
export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<UserProfile> => {
  const res = await API.put<UserProfile>("/users/profile", payload);
  return res.data;
};
 
/**
 * Convert a File to a base64 string for storage
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};