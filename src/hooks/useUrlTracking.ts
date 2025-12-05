import { useCallback } from 'react';
import { trackUrlAccess } from '../lib/api';

interface UseUrlTrackingProps {
  identifier: string;
  conversationToken?: string | null;
  accessToken?: string | null;
}

export const useUrlTracking = ({ identifier, conversationToken, accessToken }: UseUrlTrackingProps) => {
  const trackUrl = useCallback(async (url: string) => {
    if (!conversationToken || !accessToken) {
      console.warn('[URL Tracking] Missing conversation token or access token');
      return;
    }

    try {
      console.log('[URL Tracking] Tracking URL access:', {
        url,
        conversationToken,
        identifier,
      });
      
      await trackUrlAccess(identifier, conversationToken, url, accessToken);
      
      console.log('[URL Tracking] URL access tracked successfully');
    } catch (error) {
      console.error('[URL Tracking] Failed to track URL access:', error);
    }
  }, [identifier, conversationToken, accessToken]);

  return { trackUrl };
};