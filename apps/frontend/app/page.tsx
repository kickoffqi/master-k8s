import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

async function getEvents() {
  const res = await fetch(`${API}/events`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
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
