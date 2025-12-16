// Shared API base URL configuration for the admin console
// Backend runs on port 3000, admin frontend on port 3001
const defaultBase = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:3000/api`
  : 'http://localhost:3000/api';

export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || defaultBase;


