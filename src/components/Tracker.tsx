'use client';

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Tracker() {
  useEffect(() => {
    supabase.from('page_views').insert({
      path: window.location.pathname,
      referer: document.referrer || null,
      user_agent: navigator.userAgent,
    }).then(() => {});
  }, []);
  return null;
}
