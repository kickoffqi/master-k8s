# AKS + Ingress Troubleshooting Runbook (v1)

Copy/paste friendly checks for **AKS + ingress-nginx + GitOps**.

## Top 6 commands (start here)

```bash
kubectl -n master-k8s get pods -o wide
kubectl -n master-k8s get svc -o wide
kubectl -n master-k8s get ingress -o wide
kubectl -n master-k8s get endpoints -o wide
kubectl -n ingress-nginx get pods -o wide
kubectl -n ingress-nginx logs deploy/ingress-nginx-controller --tail=200
```

## Symptom → Root cause → Fix

### A) Ingress returns **503**
**Almost always:** Service has **no ready endpoints**.

```bash
kubectl -n master-k8s get endpoints events-frontend -o wide
kubectl -n master-k8s get endpoints events-api -o wide
kubectl -n master-k8s get pods -o wide
kubectl -n master-k8s describe pod -l app=events-frontend
kubectl -n master-k8s describe pod -l app=events-api
```

Fix checklist:
- `ImagePullBackOff` → wrong tag / GHCR permissions / missing imagePullSecret
- `CrashLoopBackOff` → `kubectl logs ... --previous`
- `Readiness probe failed` → probe path returning 500/timeout
- selector mismatch → Service selector vs pod labels

### B) Ingress returns **404**
Ingress rules don't match host/path.

```bash
kubectl -n master-k8s describe ingress events
kubectl -n master-k8s describe ingress events-frontend
```

### C) `/events/new` shows the home page
This happens if you accidentally apply a **rewrite** to frontend routes.

Correct pattern (what this repo uses):
- `Ingress/events` handles `/api...` and strips `/api` via rewrite
- `Ingress/events-frontend` handles `/` with no rewrite

### D) Frontend keeps restarting; probes show **HTTP 500**
If you probe `/`, SSR errors can make health checks fail.

Fix: probe `/healthz` (dedicated endpoint).

```bash
kubectl -n master-k8s describe pod -l app=events-frontend
kubectl -n master-k8s logs deploy/events-frontend --previous --tail=200
kubectl -n master-k8s exec -it deploy/events-frontend -- sh -lc 'wget -qO- http://127.0.0.1:3000/healthz'
```

### E) Public IP exists, but laptop cannot connect
Start with raw TCP:

```bash
nc -vz <EXTERNAL-IP> 80
```

If **timeout**:
- check Azure LB rules/probes
- check NSG/UDR

---

## Useful one-liners

```bash
# what image is running?
kubectl -n master-k8s get deploy events-frontend -o=jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'
kubectl -n master-k8s get deploy events-api -o=jsonpath='{.spec.template.spec.containers[0].image}{"\n"}'

# force refresh
kubectl -n master-k8s rollout restart deploy/events-frontend
kubectl -n master-k8s rollout restart deploy/events-api
```
