# Argo Rollouts (master-k8s)

Goal: use **Argo Rollouts** to control deployment strategy and rollback (canary).

## 1) Install Argo Rollouts (via Argo CD)

```bash
kubectl apply -f infra/argocd/addons/argo-rollouts/app.yaml
```

Wait:
```bash
kubectl -n argo-rollouts get pods
```

## 2) Enable Rollouts for this app (Helm)

This repo supports toggling between Kubernetes `Deployment` and Argo `Rollout`.

Set in `infra/helm/master-k8s/values.yaml`:

```yaml
rollouts:
  enabled: true
```

Or with Helm:
```bash
helm upgrade --install master-k8s ./infra/helm/master-k8s \
  -n master-k8s --create-namespace \
  --set rollouts.enabled=true
```

## 3) Observe rollout progress

```bash
kubectl -n master-k8s get rollout
kubectl -n master-k8s describe rollout events-frontend
kubectl -n master-k8s describe rollout events-api
```

Optional: install kubectl plugin (nice UI):
- https://argo-rollouts.readthedocs.io/en/stable/installation/#kubectl-plugin-installation

Then:
```bash
kubectl argo rollouts get rollout events-frontend -n master-k8s
```

## 4) Rollback

If a canary is unhealthy, you can abort/rollback:

```bash
kubectl -n master-k8s argo rollouts abort events-frontend   # if plugin installed
# or without plugin:
kubectl -n master-k8s patch rollout events-frontend --type merge -p '{"spec":{"abort":true}}'
```

To rollback to previous revision:
```bash
# plugin way:
kubectl argo rollouts undo events-frontend -n master-k8s
```

## Notes

- This initial setup uses a canary strategy **without traffic routing** (simpler). It still demonstrates progressive rollout and rollback.
- Next step: integrate nginx traffic routing for real % traffic split (requires stable/canary services + ingress annotations).

## Why the Argo Rollouts addon may show OutOfSync

ArgoCD often reports CRDs as **OutOfSync** because the Kubernetes API server mutates CRD objects
(default values, ordering, status fields, conversion webhook fields).

In this repo, the addon Application includes `ignoreDifferences` for CRDs to prevent permanent drift.
