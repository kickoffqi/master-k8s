'use client';

import { useEffect, useMemo, useState } from 'react';

type Event = {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

function fmt(dt: string) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/events`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
      setEvents(await res.json());
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function onDelete(id: string) {
    if (!confirm('Delete this event?')) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`${API}/events/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error(`${res.status} ${await res.text()}`);
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  }

  const stats = useMemo(() => ({ count: events.length }), [events]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={refresh} disabled={loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
        <span style={{ color: '#555' }}>{stats.count} event(s)</span>
      </div>

      {error && (
        <div style={{ padding: 12, border: '1px solid #ffb3b3', background: '#fff3f3', borderRadius: 8 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {events.length === 0 ? (
        <div style={{ padding: 12, border: '1px dashed #ccc', borderRadius: 8, color: '#666' }}>
          No events yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {events.map((e) => (
            <div key={e.id} style={{ border: '1px solid #e6e6e6', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{e.title}</div>
                  {e.description ? (
                    <div style={{ marginTop: 6, color: '#444', whiteSpace: 'pre-wrap' }}>{e.description}</div>
                  ) : null}
                  <div style={{ marginTop: 10, color: '#666', fontSize: 13 }}>
                    <div>Start: {fmt(e.start_time)}</div>
                    <div>End: {fmt(e.end_time)}</div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => onDelete(e.id)}
                    disabled={busyId === e.id}
                    style={{ padding: '8px 12px', background: '#fff', border: '1px solid #d33', color: '#d33', borderRadius: 8 }}
                  >
                    {busyId === e.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
