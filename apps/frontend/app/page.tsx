import Link from 'next/link';
import EventsList from './_components/EventsList';

export default function Home() {
  return (
    <div style={{ maxWidth: 880 }}>
      <h1 style={{ marginBottom: 6 }}>Event Studio V2</h1>
      <p style={{ marginTop: 0, color: '#555' }}>
        A simple frontend + API demo for learning Kubernetes (Ingress, probes, deployments, kustomize/helm/argocd).
      </p>

      <div style={{ display: 'flex', gap: 12, margin: '16px 0 24px' }}>
        <Link href="/events/new">Create a new event</Link>
        <a href="/api/healthz" target="_blank" rel="noreferrer">API health</a>
      </div>

      <h2 style={{ marginBottom: 12 }}>Events</h2>
      <EventsList />
    </div>
  );
}
