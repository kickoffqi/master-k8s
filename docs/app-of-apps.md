# Argo CD App-of-Apps (master-k8s)

Problem we hit: editing a child Application manifest in Git does **not** automatically update the
Application object already created in the cluster (unless that Application is itself managed by Argo CD).

Solution: **App-of-Apps**.

## This repo's structure

We keep **two** roots so dev/prod can track different Git revisions:

- **Dev root:** `infra/argocd/app-of-apps-dev/root-app.yaml` → tracks `dev`
- **Prod root:** `infra/argocd/app-of-apps-prod/root-app.yaml` → tracks `main`

Each root uses a local `kustomization.yaml` and vendors child YAMLs under `children/`.
This is required because Argo CD runs `kustomize build` with security restrictions (no `../` references).

## What each root manages

### Dev root (`master-k8s-root-dev`)
- `master-k8s-helm-dev` (main dev app)
- `argo-rollouts` addon
- `argocd-image-updater` addon
- `ImageUpdater` CR for `master-k8s-helm-dev` (requires secret `argocd/image-updater-git-creds`)

### Prod root (`master-k8s-root-prod`)
- `master-k8s-helm-prod` (prod app)

> We intentionally do **not** manage shared addons twice. Addons are cluster-scoped and should be installed once.

## Install

Apply each root once:

```bash
kubectl apply -f infra/argocd/app-of-apps-dev/root-app.yaml
kubectl apply -f infra/argocd/app-of-apps-prod/root-app.yaml
```

After that, manage changes via Git.
