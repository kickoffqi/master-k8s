# Week 3: App metrics (/metrics) + ServiceMonitor + Grafana dashboard

This repo exposes **Prometheus metrics** from the FastAPI service at `/metrics` and configures
kube-prometheus-stack to scrape it.

## What was added

- FastAPI `/metrics` endpoint (prometheus-fastapi-instrumentator)
- Helm chart creates:
  - `ServiceMonitor` in `monitoring` namespace
  - Grafana dashboard ConfigMap in `monitoring` namespace

## Verify

1) Confirm the API exposes metrics:

```bash
kubectl -n master-k8s port-forward svc/events-api 8000:8000
curl -s http://localhost:8000/metrics | head
```

2) In Prometheus UI, search for metrics:

- `http_requests_total`
- `http_request_duration_seconds_bucket`

3) In Grafana, look for dashboard: **Master K8s API (FastAPI)**

## Notes

- The ServiceMonitor uses label `release: monitoring` to match the Prometheus instance from kube-prometheus-stack.
- If the dashboard doesn't show up, check Grafana sidecar and ConfigMap labels.
