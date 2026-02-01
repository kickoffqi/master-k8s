'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export default function NewEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function publish() {
    setStatus('publishing...');
    const now = new Date();
    const payload = {
      title,
      description,
      start_time: now.toISOString(),
      end_time: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    };

    const res = await fetch(`${API}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      setStatus(`failed: ${res.status} ${text}`);
      return;
    }

    setStatus('success');
  }

  return (
    <div>
      <h1>Create a new event</h1>
      <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%' }} />
        </label>
        <button onClick={publish} style={{ padding: 12 }}>Publish event</button>
        {status && <p>Status: {status}</p>}
      </div>
    </div>
  );
}
