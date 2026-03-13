import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type ActionType = 'search' | 'view_property' | 'click_whatsapp' | 'filter_used' | 'update_price';

export const useTracker = () => {
  const track = useCallback((actionType: ActionType, metadata: Record<string, any> = {}) => {
    const executeTrack = async () => {
      try {
        const { error } = await supabase
          .from('activity_logs')
          .insert([
            {
              role: 'anonymous', // For MVP, assume anonymous unless tracked otherwise
              action_type: actionType,
              metadata: metadata,
            }
          ]);
        if (error) {
           console.error("[Tracker Error]:", error.message);
        }
      } catch (err: any) {
        console.error("[Tracker Exception]:", err);
      }
    };
    
    // Fire and forget
    executeTrack();
  }, []);

  return { track };
};
