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

Start a shell with the `ops-readonly` SA:

```bash
kubectl -n master-k8s run -it --rm ops-shell \
  --image=bitnami/kubectl:latest \
  --serviceaccount=ops-readonly \
  --restart=Never -- sh

# inside:
kubectl get pods
kubectl get svc
kubectl get ingress
kubectl auth can-i delete pods  # should be no
```
