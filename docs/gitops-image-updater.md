# GitOps: Argo CD Image Updater (write-back to Git)

Goal: automatically update image tags in this repo (e.g. `dev` → `sha-...`) and let Argo CD sync.

We install **argocd-image-updater** and configure it on the `master-k8s` Argo CD Application.

## Install (managed by Argo CD)

```bash
kubectl apply -f infra/argocd/addons/argocd-image-updater/app.yaml
```

## How it updates this repo

Both Argo CD Application manifests are annotated:
- `infra/argocd/app-kustomize-dev.yaml` → writes back to **kustomize** (`infra/kustomize/overlays/dev/kustomization.yaml`)
- `infra/argocd/app-helm-dev.yaml` → writes back to **helm values** (`infra/helm/master-k8s/values.yaml`)

It watches these images:
- `ghcr.io/kickoffqi/master-k8s-api`
- `ghcr.io/kickoffqi/master-k8s-frontend`

Allowed tags: `sha-...` only.

## Verify

```bash
kubectl -n argocd get pods
kubectl -n argocd logs deploy/argocd-image-updater --tail=200

git log -n 5 --oneline
```
