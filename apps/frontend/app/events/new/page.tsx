'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export default function NewEvent() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => title.trim().length > 0, [title]);

  async function publish() {
    if (!canSubmit) {
      setStatus('Title is required.');
      return;
    }

    setSubmitting(true);
    setStatus(null);

    const now = new Date();
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      start_time: now.toISOString(),
      end_time: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    };

    try {
      const res = await fetch(`${API}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        setStatus(`Failed: ${res.status} ${text}`);
        return;
      }

      setStatus('Created! Redirecting…');
      router.push('/');
      router.refresh();
    } catch (e: any) {
      setStatus(`Failed: ${e?.message || 'network error'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Create a new event</h1>
      <p style={{ color: '#555' }}>Fill the details and publish to the catalog.</p>

      <div style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Title <span style={{ color: '#d33' }}>*</span></span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Kubernetes Workshop"
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this event about?"
            rows={5}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
          />
        </label>

        <button
          onClick={publish}
          disabled={!canSubmit || submitting}
          style={{
            padding: 12,
            borderRadius: 10,
            border: '1px solid #111',
            background: submitting ? '#ddd' : '#111',
            color: submitting ? '#333' : '#fff',
            cursor: submitting ? 'default' : 'pointer',
          }}
        >
          {submitting ? 'Publishing…' : 'Publish event'}
        </button>

        {status && (
          <div style={{ padding: 12, borderRadius: 10, background: '#f6f6f6' }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
