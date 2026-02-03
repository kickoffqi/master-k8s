# Argo CD App-of-Apps (master-k8s)

Problem we hit: editing a child Application manifest in Git does **not** automatically update the
Application object already created in the cluster (unless that Application is itself managed by Argo CD).

Solution: **App-of-Apps**.

## What this repo provides

- `infra/argocd/app-of-apps/root-app.yaml`: the root Application
- `infra/argocd/app-of-apps/kustomization.yaml`: lists child apps/addons

Child resources managed:
- `master-k8s-helm-dev` (main app)
- `argo-rollouts` addon
- `argocd-image-updater` addon
- `ImageUpdater` CR for `master-k8s-helm-dev` (requires secret `argocd/image-updater-git-creds`)

## Install

Apply the root app once:

```bash
kubectl apply -f infra/argocd/app-of-apps/root-app.yaml
```

After that, update child apps/addons only via Git.

## Notes

- If you previously created child apps manually, the root app will adopt/update them.
- Make sure required secrets exist (e.g., `argocd/image-updater-git-creds`).
