# RBAC + Namespace isolation (master-k8s)

This app does **not** require Kubernetes API access at runtime. As a best practice, we:

- Create a dedicated ServiceAccount per workload
- Disable service account token mounting (prevents accidental in-cluster API access)

Additionally, we include an optional `ops-readonly` ServiceAccount + Role/RoleBinding for learning/debugging.

## What is created

In namespace `master-k8s`:
- ServiceAccounts:
  - `events-api` (workload)
  - `events-frontend` (workload)
  - `ops-readonly` (demo)
- Role/RoleBinding:
  - `ops-readonly` can `get/list/watch` pods, logs, services, endpoints, deployments, ingresses

## Verify

```bash
kubectl -n master-k8s get sa
kubectl -n master-k8s get role,rolebinding

# Confirm pods use the intended service accounts
kubectl -n master-k8s get pod -l app=events-api -o jsonpath='{.items[0].spec.serviceAccountName}{"\n"}'
kubectl -n master-k8s get pod -l app=events-frontend -o jsonpath='{.items[0].spec.serviceAccountName}{"\n"}'
```

## Test the read-only permissions

### Option A (newer kubectl): use `--overrides`

Recent kubectl versions have reduced/changed support for `kubectl run --serviceaccount`.
This pattern works reliably:

```bash
kubectl -n master-k8s run -it --rm ops-shell \
  --image=bitnami/kubectl:latest \
  --restart=Never \
  --overrides='{ "spec":{ "serviceAccountName":"ops-readonly", "automountServiceAccountToken": true, "containers":[{ "name":"ops-shell", "image":"bitnami/kubectl:latest", "command":["/bin/sh"], "tty": true, "stdin": true }] } }'

# inside:
kubectl get pods
kubectl get svc
kubectl get ingress
kubectl auth can-i delete pods  # should be no
```

### Option B: apply a debug Pod YAML

If you prefer a file:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ops-shell
  namespace: master-k8s
spec:
  serviceAccountName: ops-readonly
  automountServiceAccountToken: true
  containers:
    - name: ops-shell
      image: bitnami/kubectl:latest
      command: ["/bin/sh"]
      tty: true
      stdin: true
```

Apply and exec:

```bash
kubectl apply -f ops-shell.yaml
kubectl -n master-k8s exec -it ops-shell -- sh
```

---

## GitOps note (Helm vs Kustomize)

If your cluster is deployed via **Argo CD**, make sure you're editing the manifests that Argo CD is actually tracking:

- Argo CD `master-k8s-helm-dev` → edit Helm files (`infra/helm/master-k8s/...`)
- Argo CD `master-k8s-kustomize-dev` → edit Kustomize files (`infra/kustomize/...`)
