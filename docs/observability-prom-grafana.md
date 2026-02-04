# Observability (Week 3): Prometheus + Grafana

This repo installs **kube-prometheus-stack** via Argo CD.

## Install (dev)

If you use App-of-Apps dev root, add-on is managed automatically.
Otherwise, apply directly:

```bash
kubectl apply -f infra/argocd/addons/monitoring/app.yaml
```

Wait:
```bash
kubectl -n monitoring get pods
```

## Access

### Grafana

```bash
kubectl -n monitoring port-forward svc/monitoring-grafana 3000:80
```

Open: http://localhost:3000

- user: `admin`
- password: `changeme` (see `infra/argocd/addons/monitoring/app.yaml`)

### Prometheus

```bash
kubectl -n monitoring port-forward svc/monitoring-kube-prometheus-prometheus 9090:9090
```

Open: http://localhost:9090

### Alertmanager

```bash
kubectl -n monitoring port-forward svc/monitoring-kube-prometheus-alertmanager 9093:9093
```

Open: http://localhost:9093

## What you should learn

- Cluster-level signals: node/pod CPU & memory, restarts, readiness failures
- K8s object metrics: deployments/rollouts status via kube-state-metrics
- Build basic alerts and understand why they fire

## Next steps

- Add application-level `/metrics` for FastAPI + ServiceMonitor
- Add alert rules for:
  - PodCrashLooping
  - PodNotReady
  - Ingress 5xx rate
  - Rollout stuck/aborted
