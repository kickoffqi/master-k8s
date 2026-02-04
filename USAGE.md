# Usage: master-k8s (AKS + Ingress)

This repo provides **the same app deployed 3 ways**:

- Kustomize (recommended for learning): `infra/kustomize`
- Helm: `infra/helm/master-k8s`
- Argo CD (GitOps): `infra/argocd`

## Prereqs

- AKS cluster (your landingzone)
- kubectl configured (`az aks get-credentials ...`)
- ingress-nginx installed

Install ingress-nginx:
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace
kubectl -n ingress-nginx get svc ingress-nginx-controller -o wide
```

Take the EXTERNAL-IP and map it in /etc/hosts:
```
<EXTERNAL-IP> master.local
```

## Deploy with Kustomize

```bash
kubectl apply -k infra/kustomize/overlays/dev
kubectl -n master-k8s get pods
kubectl -n master-k8s get ingress -o wide
```

Test:
- Frontend: http://master.local/
- API: http://master.local/api/healthz
- Create event: http://master.local/events/new

## Deploy with Helm

```bash
helm upgrade --install master-k8s ./infra/helm/master-k8s \
  --namespace master-k8s --create-namespace
```

## Deploy with Argo CD

Apply ONE of these:

Kustomize app:
```bash
kubectl apply -f infra/argocd/app-kustomize-dev.yaml
```

Helm app:
```bash
kubectl apply -f infra/argocd/app-helm-dev.yaml
```

## Notes

- The API is in-memory (no database). Restarting the API pod clears data.
- The Ingress routes:

> Note: we use **two** Ingress resources so we can apply rewrite only to /api without breaking frontend routes (e.g. /events/new).
  - `/` -> frontend
  - `/api/*` -> API (with rewrite to strip `/api`)

## Upgrading from earlier versions

If you deployed an earlier version that created a single Ingress named `events`, newer versions split Ingress into:
- `events` (API only, with `/api` rewrite)
- `events-frontend` (frontend, no rewrite)

This update is designed to be applied in-place. If you still get an Ingress conflict, delete the old one once:
```bash
kubectl -n master-k8s delete ingress events || true
kubectl apply -k infra/kustomize/overlays/dev
```

## Runbooks / Learning notes

- Ingress/AKS troubleshooting: `docs/runbook-aks-ingress.md`
- GitOps image automation: `docs/gitops-image-updater.md`

## RBAC

See: `docs/rbac.md`

## Helm vs Kustomize (avoid GitOps confusion)

This repo supports **two** deployment styles:

- **Helm**: `infra/helm/master-k8s`
- **Kustomize**: `infra/kustomize/overlays/dev`

If you are using **Argo CD**, it will only sync the path configured in the Argo CD Application.

Common mistake (we hit it): changing Kustomize manifests while Argo CD is tracking the Helm app (or vice versa).

### Quick rule

- Using **Argo CD app `master-k8s-helm-dev`** → make changes under `infra/helm/master-k8s` (e.g. `values.yaml`, templates)
- Using **Argo CD app `master-k8s-kustomize-dev`** → make changes under `infra/kustomize` (base/overlays)

Tip: keep only one of the apps enabled at a time to avoid double-managing the same resources.

## Argo Rollouts

See: `docs/argo-rollouts.md`

## Argo CD App-of-Apps

See: `docs/app-of-apps.md`

## Production (pinned version tags)

- Helm values:
  - Dev: `infra/helm/master-k8s/values-dev.yaml`
  - Prod: `infra/helm/master-k8s/values-prod.yaml`
- Argo CD app (prod): `infra/argocd/app-helm-prod.yaml`
- Promotion flow: `docs/prod-promotion.md`

## Argo CD App-of-Apps (dev/prod roots)

- Dev root app: `infra/argocd/app-of-apps-dev/root-app.yaml`
- Prod root app: `infra/argocd/app-of-apps-prod/root-app.yaml`

See: `docs/app-of-apps.md`

## Observability (Prometheus + Grafana)

See: `docs/observability-prom-grafana.md`

## Alerts (PrometheusRule)

See: `docs/alerts.md`

## Resource requests/limits

This chart sets default CPU/memory requests and limits for API and frontend.

- Without requests/limits, pods run as **BestEffort** and can be evicted first under pressure.
- Requests influence scheduling & capacity planning.

Defaults are defined in:
- `infra/helm/master-k8s/values.yaml`
- `infra/helm/master-k8s/values-dev.yaml`
- `infra/helm/master-k8s/values-prod.yaml`
