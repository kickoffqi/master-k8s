# GitOps: Argo CD Image Updater (CRD-based) + Git write-back

This repo uses **Argo CD Image Updater v1.x** (CRD-based).

High level:

1) Install the Image Updater controller (in `argocd` namespace)
2) Create an `ImageUpdater` custom resource that targets your Argo CD Application
3) Image Updater will commit tag changes back to Git (`values.yaml` for Helm)
4) Argo CD auto-sync deploys the new images

---

## 1) Install the controller (managed by Argo CD)

```bash
kubectl apply -f infra/argocd/addons/argocd-image-updater/app.yaml
```

Check:
```bash
kubectl -n argocd get pods | grep image-updater
kubectl -n argocd logs deploy/argocd-image-updater-controller --tail=120
```

---

## 2) Create Git credentials secret (write access)

Image Updater needs repo write access to commit changes.

Create a secret in `argocd` namespace:

```bash
kubectl -n argocd create secret generic image-updater-git-creds \
  --from-literal=username=x-access-token \
  --from-literal=password=<YOUR_GITHUB_PAT>
```

The GitHub PAT must have **Contents: Read/Write** access to this repo.

---

## 3) Create the ImageUpdater CR (Helm write-back)

```bash
kubectl apply -f infra/argocd/image-updater/master-k8s-helm-dev.yaml
```

This will update **`infra/helm/master-k8s/values.yaml`** by committing new tags.

---

## 4) Test end-to-end

1) Push a commit to `main` that changes the app (or `--allow-empty`) to trigger GitHub Actions.
2) Wait for new images to be pushed to GHCR (tags `sha-...`).
3) Watch Image Updater logs:

```bash
kubectl -n argocd logs deploy/argocd-image-updater-controller -f
```

4) Verify a new commit appears in GitHub updating `values.yaml`.
5) Argo CD should auto-sync and your deployments should pick up the new sha tags.

---

## Notes

- This repo filters tags to `sha-...` only.
- We intentionally do **not** use the legacy annotation-based configuration (v0.x).
