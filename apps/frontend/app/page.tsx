import Link from 'next/link';

// Server-side: use cluster DNS to talk to API directly.
// Client-side (forms etc.): use NEXT_PUBLIC_API_BASE_URL which should be "/api" via Ingress.
const SERVER_API = process.env.API_BASE_URL || 'http://events-api:8000';

async function getEvents() {
  try {
    const res = await fetch(`${SERVER_API}/events`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const events = await getEvents();
  return (
    <div>
      <h1>Event Studio</h1>
      <p><Link href="/events/new">Create a new event</Link></p>
      <h2>Events</h2>
      <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 8 }}>
        {JSON.stringify(events, null, 2)}
      </pre>
    </div>
  );
}
