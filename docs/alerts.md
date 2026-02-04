# Alerts (Week 3): PrometheusRule

This repo adds a small set of custom alerts via a `PrometheusRule`.

## Where it lives

- Manifest: `infra/argocd/addons/monitoring-rules/prometheusrule-master-k8s.yaml`
- Argo CD app: `infra/argocd/addons/monitoring-rules/app.yaml`

## Notes

- Labels include `release: monitoring` so the kube-prometheus-stack Prometheus instance loads the rule.
- These alerts focus on Kubernetes signals (no app `/metrics` required).

## How to verify

1) In Prometheus UI (port-forward), open **Alerts** and search for `MasterK8s`.
2) Or query for the alert series:

```promql
ALERTS{alertname=~"MasterK8s.*"}
```

## Fault injection (safe)

To intentionally trigger CrashLoopBackOff in dev namespace (temporary):

```bash
kubectl -n master-k8s run crashloop --image=busybox --restart=Never -- /bin/sh -lc 'exit 1'
```

Then watch:
```bash
kubectl -n master-k8s get pods
```

Delete when done:
```bash
kubectl -n master-k8s delete pod crashloop
```
