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

## Argo CD note: CRDs may fail with "metadata.annotations too long"

Prometheus Operator CRDs are large. If Argo CD applies them using client-side apply, it may attempt to
store the full object in the `kubectl.kubernetes.io/last-applied-configuration` annotation and hit the
262144 byte limit.

This repo sets these sync options on the monitoring Application:
- `ServerSideApply=true` (avoids the large last-applied annotation)
- `Replace=true` (helps recover from partially-applied CRDs)

## Troubleshooting: "monitoring-kube-prometheus-admission already exists"

The kube-prometheus-stack chart can create admission webhook patch jobs and associated RBAC.
In GitOps workflows, these hook resources can get stuck and cause repeated "already exists" errors.

This repo disables Prometheus Operator admission webhooks:

- `prometheusOperator.admissionWebhooks.enabled=false`
- `prometheusOperator.admissionWebhooks.patch.enabled=false`

If you still have leftover RBAC objects from a failed install, delete them once:

```bash
kubectl delete clusterrole monitoring-kube-prometheus-admission || true
kubectl delete clusterrolebinding monitoring-kube-prometheus-admission || true
kubectl -n monitoring delete role monitoring-kube-prometheus-admission || true
kubectl -n monitoring delete rolebinding monitoring-kube-prometheus-admission || true
```
