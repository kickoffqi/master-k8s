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
  - `/` -> frontend
  - `/api/*` -> API (with rewrite to strip `/api`)
