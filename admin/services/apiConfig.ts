// Shared API base URL configuration for the admin console
const defaultBase = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:3001/api`
  : 'http://localhost:3001/api';

export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || defaultBase;


