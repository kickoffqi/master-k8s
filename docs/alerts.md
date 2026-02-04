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

## Testing: High restart rate alert

The `MasterK8sContainerHighRestartRate` alert is based on `rate(kube_pod_container_status_restarts_total[5m])`.

### Notes about thresholds

- Production thresholds are typically conservative to avoid noise.
- For **training**, you may temporarily lower the threshold and/or the `for` duration to make it easier to trigger.

### Safe trigger (dev namespace)

Create a crash-looping Deployment:

```bash
kubectl -n master-k8s create deployment restart-test --image=busybox \
  -- /bin/sh -lc 'exit 1'

kubectl -n master-k8s get pods -w
```

Cleanup:

```bash
kubectl -n master-k8s delete deployment restart-test
```

Tip: If you need faster restarts for a demo, ensure the alert threshold is set to a lower value during the exercise.
