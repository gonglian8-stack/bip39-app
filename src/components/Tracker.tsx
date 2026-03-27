'use client';

import { useEffect } from 'react';

const SB_URL = 'https://hevhrjnmymtgqdcbkhif.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhldmhyam5teW10Z3FkY2JraGlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODU4NTYsImV4cCI6MjA5MDE2MTg1Nn0.nu3Jn-B-sh2gxE0sgBS2YWQG4WQ-lW8IrCStTCQeP94';

export default function Tracker() {
  useEffect(() => {
    (async () => {
      try {
        // Get real IP and geo info
        const geo = await fetch('https://ipapi.co/json/').then(r => r.json()).catch(() => ({}));
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(SB_URL, SB_KEY);
        await sb.from('page_views').insert({
          path: window.location.pathname,
          ip: geo.ip || null,
          country: geo.country_name || geo.country || null,
          city: geo.city || null,
          referer: document.referrer || null,
          user_agent: navigator.userAgent,
        });
      } catch { /* silent */ }
    })();
  }, []);
  return null;
}
