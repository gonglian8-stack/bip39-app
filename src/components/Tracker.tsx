'use client';

import { useEffect } from 'react';

export default function Tracker() {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    import('@supabase/supabase-js').then(({ createClient }) => {
      const sb = createClient(url, key);
      sb.from('page_views').insert({
        path: window.location.pathname,
        referer: document.referrer || null,
        user_agent: navigator.userAgent,
      }).then(() => {});
    });
  }, []);
  return null;
}
