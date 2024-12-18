import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BASE_URL = `http://127.0.0.1:5600`;

export const api = axios.create({
  baseURL: BASE_URL,
  responseType: "json",
  withCredentials: true,
});