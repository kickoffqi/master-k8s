# Promotion flow: dev -> prod (version tags)

Goal: keep **prod** audit-friendly by pinning images to **version tags** (e.g. `v0.1.0`).

## Summary

- Dev work happens on branch `dev`.
- Prod deployment tracks branch `main`.
- Release images are built/pushed when you create a Git tag `vX.Y.Z` on `main`.
- `values-prod.yaml` pins `images.*.tag` to that release tag.

## Recommended workflow

1) Develop and test on `dev` (ArgoCD app `master-k8s-helm-dev`).
2) Open PR `dev -> main`.
3) Merge to `main` after review.
4) Create a release tag on `main`:

```bash
git checkout main
git pull
# choose a semantic version
git tag v0.1.0
git push origin v0.1.0
```

5) Wait for GitHub Actions (tag build) to push images:
- `ghcr.io/kickoffqi/master-k8s-api:v0.1.0`
- `ghcr.io/kickoffqi/master-k8s-frontend:v0.1.0`

6) Update `values-prod.yaml` (on `main`) to that version tag (if not already), then ArgoCD prod app will deploy.

## Notes

- Keep prod on `main` (or tags) for stable, auditable history.
- If you want *automatic* prod upgrades, use image-updater on prod too, but it reduces control.
