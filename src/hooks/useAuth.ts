'use client';

import { useAuth as useAuthContext } from '@/context/AuthContext';

// Re-exporting the useAuth hook for easier imports
export const useAuth = useAuthContext;