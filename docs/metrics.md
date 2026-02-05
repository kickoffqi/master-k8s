# Week 3: App metrics (/metrics) + ServiceMonitor + Grafana dashboard

## Overview

- FastAPI exposes Prometheus metrics at `/metrics`.
- Monitoring integration (ServiceMonitor + Grafana dashboard) is deployed as a **monitoring addon**.

Why addon?

Because both dev and prod apps share the `monitoring` namespace. If the app Helm chart created
ServiceMonitors/dashboards directly, dev and prod ArgoCD apps would fight over the same resources.

## Components

- App metrics endpoint: `apps/api/main.py` (`/metrics`)
- Addon manifests:
  - `infra/argocd/addons/monitoring-app-metrics/`
    - `ServiceMonitor/master-k8s-api-dev` (scrapes namespace `master-k8s`)
    - `ServiceMonitor/master-k8s-api-prod` (scrapes namespace `master-k8s-prod`)
    - `ConfigMap/grafana-dashboard-master-k8s-api` (dashboard)

## Verify

1) Check API metrics:

```bash
kubectl -n master-k8s port-forward svc/events-api 8000:8000
curl -s http://localhost:8000/metrics | head
```

2) Check ServiceMonitors:

```bash
kubectl -n monitoring get servicemonitor | grep master-k8s-api
```

3) In Prometheus UI, search for:
- `http_requests_total`
- `http_request_duration_seconds_bucket`

4) In Grafana, look for dashboard: **Master K8s API (FastAPI)** and switch namespace variable.
