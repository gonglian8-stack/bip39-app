'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

interface DailyRow { date: string; views: number; uniqueIPs: number }
interface CountryRow { country: string; views: number }
interface VisitorRow { time: string; ip: string; country: string; city: string; path: string; referer: string; ua: string }

const ADMIN_PASS = 'bip39admin';
const SB_URL = 'https://hevhrjnmymtgqdcbkhif.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhldmhyam5teW10Z3FkY2JraGlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU4NTg1NiwiZXhwIjoyMDkwMTYxODU2fQ.pv8adSuYcUyhBCfl-y-HgJDvKrYPDbeKQNEJyB0jP0I';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [days, setDays] = useState(7);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalViews, setTotalViews] = useState(0);
  const [uniqueIPs, setUniqueIPs] = useState(0);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [topCountries, setTopCountries] = useState<CountryRow[]>([]);
  const [recent, setRecent] = useState<VisitorRow[]>([]);

  const fetchStats = useCallback(async (numDays: number) => {
    setLoading(true);
    setError('');
    try {
      const sb = createClient(SB_URL, SB_KEY);
      const since = new Date(Date.now() - numDays * 86400000).toISOString();

      const { count } = await sb.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', since);
      setTotalViews(count || 0);

      const { data: rows } = await sb.from('page_views')
        .select('created_at, ip, country, city, path, user_agent, referer')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(2000);

      const ips = new Set((rows || []).map(r => r.ip));
      setUniqueIPs(ips.size);

      // Daily
      const dm: Record<string, { views: number; ips: Set<string> }> = {};
      for (const r of rows || []) {
        const d = r.created_at.slice(0, 10);
        if (!dm[d]) dm[d] = { views: 0, ips: new Set() };
        dm[d].views++;
        dm[d].ips.add(r.ip);
      }
      setDaily(Object.entries(dm).map(([date, v]) => ({ date, views: v.views, uniqueIPs: v.ips.size })).sort((a, b) => b.date.localeCompare(a.date)));

      // Countries
      const cm: Record<string, number> = {};
      for (const r of rows || []) { const c = r.country || 'Unknown'; cm[c] = (cm[c] || 0) + 1; }
      setTopCountries(Object.entries(cm).map(([country, views]) => ({ country, views })).sort((a, b) => b.views - a.views).slice(0, 20));

      // Recent
      setRecent((rows || []).slice(0, 50).map(r => ({
        time: r.created_at, ip: r.ip, country: r.country || '', city: r.city || '',
        path: r.path, referer: r.referer || '', ua: (r.user_agent || '').slice(0, 80),
      })));

      setAuthed(true);
    } catch {
      setError('Failed to fetch data. Check your key.');
    }
    setLoading(false);
  }, []);

  const login = () => {
    if (password !== ADMIN_PASS) { setError('密码错误'); return; }
    setAuthed(true);
    fetchStats(days);
  };

  useEffect(() => {
    if (authed) fetchStats(days);
  }, [days]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-4 md:p-8">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          <span className="text-indigo-400">BIP39.ai</span> Analytics
        </h1>

        {!authed && (
          <div className="bg-[#111827] rounded-lg p-6 max-w-md">
            <label className="block text-sm text-gray-400 mb-2">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              className="w-full bg-[#1e293b] border border-gray-700 rounded px-3 py-2 text-sm mb-3"
              placeholder="Enter password..."
            />
            <button onClick={login} disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-sm font-medium">
              {loading ? 'Loading...' : 'Login'}
            </button>
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        )}

        {authed && (
          <>
            <div className="flex gap-2 mb-6">
              {[1, 7, 30, 90].map(d => (
                <button key={d} onClick={() => setDays(d)}
                  className={`px-3 py-1.5 rounded text-sm ${days === d ? 'bg-indigo-600' : 'bg-[#1e293b] hover:bg-[#334155]'}`}
                >{d === 1 ? 'Today' : `${d} Days`}</button>
              ))}
              <button onClick={() => fetchStats(days)} className="px-3 py-1.5 rounded text-sm bg-[#1e293b] hover:bg-[#334155] ml-auto">Refresh</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Views" value={totalViews} />
              <StatCard label="Unique IPs" value={uniqueIPs} />
              <StatCard label="Today Views" value={daily[0]?.views || 0} />
              <StatCard label="Today IPs" value={daily[0]?.uniqueIPs || 0} />
            </div>

            {/* Bar chart */}
            <div className="bg-[#111827] rounded-lg p-4 mb-6">
              <h2 className="text-sm font-semibold text-gray-400 mb-3">Daily Views</h2>
              <div className="flex items-end gap-1 h-40">
                {daily.slice().reverse().map((d, i) => {
                  const max = Math.max(...daily.map(x => x.views), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] text-gray-500">{d.views}</span>
                      <div className="w-full bg-indigo-500 rounded-t min-h-[2px]" style={{ height: `${(d.views / max) * 100}%` }} />
                      <span className="text-[9px] text-gray-600">{d.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#111827] rounded-lg p-4">
                <h2 className="text-sm font-semibold text-gray-400 mb-3">Top Countries</h2>
                {topCountries.map((c, i) => (
                  <div key={i} className="flex justify-between text-sm py-0.5">
                    <span>{c.country}</span><span className="text-gray-400">{c.views}</span>
                  </div>
                ))}
                {topCountries.length === 0 && <p className="text-gray-500 text-sm">No data</p>}
              </div>
              <div className="bg-[#111827] rounded-lg p-4">
                <h2 className="text-sm font-semibold text-gray-400 mb-3">Daily Breakdown</h2>
                <table className="w-full text-sm">
                  <thead><tr className="text-gray-500"><th className="text-left">Date</th><th className="text-right">Views</th><th className="text-right">IPs</th></tr></thead>
                  <tbody>{daily.map((d, i) => (
                    <tr key={i} className="border-t border-gray-800"><td className="py-1">{d.date}</td><td className="text-right">{d.views}</td><td className="text-right text-gray-400">{d.uniqueIPs}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#111827] rounded-lg p-4">
              <h2 className="text-sm font-semibold text-gray-400 mb-3">Recent Visitors</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-500">
                    <th className="text-left p-1">Time</th><th className="text-left p-1">IP</th><th className="text-left p-1">Country</th>
                    <th className="text-left p-1">City</th><th className="text-left p-1">Path</th><th className="text-left p-1">Referer</th>
                  </tr></thead>
                  <tbody>{recent.map((r, i) => (
                    <tr key={i} className="border-t border-gray-800 hover:bg-[#1e293b]">
                      <td className="p-1 whitespace-nowrap">{new Date(r.time).toLocaleString()}</td>
                      <td className="p-1 font-mono">{r.ip}</td><td className="p-1">{r.country}</td>
                      <td className="p-1">{r.city}</td><td className="p-1">{r.path}</td>
                      <td className="p-1 max-w-[200px] truncate">{r.referer || '-'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-[#111827] rounded-lg p-4">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
    </div>
  );
}
