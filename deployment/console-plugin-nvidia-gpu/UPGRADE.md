# Upgrading to Console Plugin NVIDIA GPU 1.0.0

This guide helps you upgrade from version 0.x to 1.0.0, which includes breaking changes.

---

## Overview

Version 1.0.0 introduces significant improvements:
- ✅ **Automatic plugin enablement** - No manual `oc patch` commands needed
- ✅ **OpenShift 4.19+ compatibility** with PatternFly v6
- ✅ **High availability by default** (2 replicas)
- ✅ **ServiceAccount best practices**
- ✅ **Aligned with official OpenShift plugin template**

---

## Breaking Changes

### 1. Minimum OpenShift Version

**Old:** OpenShift 4.12+  
**New:** OpenShift 4.19+

**Why:** PatternFly v6 and updated console plugin SDK require OpenShift 4.19+

**Action Required:**
```bash
# Verify your OpenShift version
oc version
# Should show 4.19 or higher
```

---

### 2. Values Structure Changed

All plugin configuration has moved under the `plugin:` key for consistency with the official template.

#### Mapping Table

| Old (0.x) | New (1.0.0) | Notes |
|-----------|-------------|-------|
| `replicaCount` | `plugin.replicas` | Default changed: 1 → 2 |
| `image.repository` | `plugin.image` | |
| `image.pullPolicy` | `plugin.imagePullPolicy` | |
| `image.tag` | `image.tag` | Unchanged |
| `imagePullSecrets` | `plugin.imagePullSecrets` | |
| `resources` | `plugin.resources` | |
| `nodeSelector` | `plugin.nodeSelector` | |
| `tolerations` | `plugin.tolerations` | |
| `affinity` | `plugin.affinity` | |
| `podAnnotations` | `plugin.podAnnotations` | |
| `podSecurityContext` | `plugin.podSecurityContext` | |
| `containerSecurityContext` | `plugin.containerSecurityContext` | |

#### Example Migration

**Old values.yaml (0.x):**
```yaml
replicaCount: 1

image:
  repository: quay.io/my-org/console-plugin-nvidia-gpu
  pullPolicy: Always
  tag: "v0.2.5"

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 50m
    memory: 128Mi

nodeSelector:
  gpu: "nvidia"

tolerations:
  - key: nvidia.com/gpu
    operator: Exists
```

**New values.yaml (1.0.0):**
```yaml
plugin:
  image: quay.io/my-org/console-plugin-nvidia-gpu
  imagePullPolicy: Always
  replicas: 1  # Explicitly set to 1 if you don't want HA
  
  resources:
    limits:
      cpu: 200m
      memory: 256Mi
    requests:
      cpu: 50m
      memory: 128Mi
  
  nodeSelector:
    gpu: "nvidia"
  
  tolerations:
    - key: nvidia.com/gpu
      operator: Exists

image:
  tag: "v1.0.0"
```

---

### 3. Default Replicas Changed

**Old:** 1 replica  
**New:** 2 replicas (for high availability)

**Why:** Better reliability and zero-downtime updates in production

**Action Required:**
- If you want to keep 1 replica, explicitly set `plugin.replicas: 1`
- For production, we recommend keeping the default of 2

---

### 4. Auto-Enablement Feature

**Old:** Manual plugin enablement required after installation  
**New:** Automatic enablement via post-install Helm hook

**Why:** Better user experience, fewer manual steps

**What This Means:**
- The plugin now automatically enables itself after `helm install` or `helm upgrade`
- You can disable this with `plugin.jobs.patchConsoles.enabled: false`

**Note:** If you were using custom scripts to enable the plugin, you may need to adjust them.

---

## Step-by-Step Upgrade Guide

### Prerequisites

1. ✅ OpenShift 4.19 or higher
2. ✅ NVIDIA GPU Operator installed
3. ✅ Helm 3.x installed
4. ✅ Cluster admin access (for auto-enablement job)

---

### Step 1: Review Your Current Configuration

Export your current Helm values:

```bash
helm get values -n nvidia-gpu-operator console-plugin-nvidia-gpu > old-values.yaml
```

Review what you've customized:

```bash
cat old-values.yaml
```

---

### Step 2: Convert to New Values Format

Create a new `values.yaml` file with the migrated structure:

```bash
cat > new-values.yaml << 'EOF'
plugin:
  # Copy your image settings here
  image: quay.io/edge-infrastructure/console-plugin-nvidia-gpu
  imagePullPolicy: IfNotPresent
  
  # Copy your replica count (or use default of 2)
  replicas: 2
  
  # Copy your resources (if customized)
  resources:
    requests:
      cpu: 10m
      memory: 50Mi
  
  # Copy nodeSelector, tolerations, affinity if you had them
  nodeSelector: {}
  tolerations: []
  affinity: {}
  
  # Auto-enablement (new feature, enabled by default)
  jobs:
    patchConsoles:
      enabled: true

# Image tag (if you were using a specific version)
image:
  tag: ""
EOF
```

Use the [Mapping Table](#mapping-table) above to convert each setting.

---

### Step 3: Test the New Configuration

Render the templates locally to verify:

```bash
helm template console-plugin-nvidia-gpu \
  deployment/console-plugin-nvidia-gpu \
  -f new-values.yaml \
  --namespace nvidia-gpu-operator
```

Check:
- ✅ Correct image and tag
- ✅ Correct replica count
- ✅ Resources, nodeSelector, tolerations are correct
- ✅ ServiceAccount is created
- ✅ Auto-enablement job is present (if enabled)

---

### Step 4: Backup Current Deployment

Before upgrading, save the current state:

```bash
# Backup current deployment
kubectl -n nvidia-gpu-operator get deployment \
  -l app.kubernetes.io/name=console-plugin-nvidia-gpu \
  -o yaml > backup-deployment.yaml

# Backup ConsolePlugin resource
oc get consoleplugin console-plugin-nvidia-gpu -o yaml > backup-consoleplugin.yaml
```

---

### Step 5: Perform the Upgrade

#### Option A: Upgrade from Helm Repository (Recommended)

```bash
# Update Helm repository
helm repo update rh-ecosystem-edge

# Upgrade to 1.0.0
helm upgrade -n nvidia-gpu-operator console-plugin-nvidia-gpu \
  rh-ecosystem-edge/console-plugin-nvidia-gpu \
  --version 1.0.0 \
  -f new-values.yaml
```

#### Option B: Upgrade from Local Chart

```bash
helm upgrade -n nvidia-gpu-operator console-plugin-nvidia-gpu \
  ./deployment/console-plugin-nvidia-gpu \
  -f new-values.yaml
```

---

### Step 6: Verify the Upgrade

#### Check Deployment Status

```bash
# Check pods are running
kubectl -n nvidia-gpu-operator get pods \
  -l app.kubernetes.io/name=console-plugin-nvidia-gpu

# Should show 2 pods (or your configured replica count) in Running state
```

#### Verify Auto-Enablement

```bash
# Check if plugin was automatically enabled
oc get consoles.operator.openshift.io cluster \
  -o jsonpath='{.spec.plugins}' | grep console-plugin-nvidia-gpu

# Should include "console-plugin-nvidia-gpu"
```

#### Check Plugin in Console

1. Open OpenShift web console
2. Navigate to **Overview** → **Cluster**
3. Look for **GPU** metrics and cards
4. Navigate to **Compute** → **GPUs** (if you have GPU nodes)

---

### Step 7: Update DCGM Metrics ConfigMap

Ensure the DCGM Exporter is using the correct ConfigMap:

```bash
oc patch clusterpolicies.nvidia.com gpu-cluster-policy \
  --patch '{ "spec": { "dcgmExporter": { "config": { "name": "console-plugin-nvidia-gpu" } } } }' \
  --type=merge
```

---

## Rollback Procedure

If you encounter issues, you can rollback:

### Quick Rollback

```bash
# Rollback to previous release
helm rollback -n nvidia-gpu-operator console-plugin-nvidia-gpu

# Or specify a specific revision
helm history -n nvidia-gpu-operator console-plugin-nvidia-gpu
helm rollback -n nvidia-gpu-operator console-plugin-nvidia-gpu <REVISION>
```

### Manual Rollback

If Helm rollback doesn't work:

```bash
# Restore from backup
kubectl apply -f backup-deployment.yaml
kubectl apply -f backup-consoleplugin.yaml

# Manually enable the plugin (if auto-enablement was the issue)
oc patch consoles.operator.openshift.io cluster \
  --patch '{ "spec": { "plugins": ["console-plugin-nvidia-gpu"] } }' \
  --type=merge
```

---

## New Features in 1.0.0

### Automatic Plugin Enablement

The plugin now enables itself automatically! No more manual `oc patch` commands.

**To disable auto-enablement:**

```yaml
plugin:
  jobs:
    patchConsoles:
      enabled: false
```

Then manually enable:

```bash
oc patch consoles.operator.openshift.io cluster \
  --patch '{ "spec": { "plugins": ["console-plugin-nvidia-gpu"] } }' \
  --type=merge
```

### ServiceAccount Support

The plugin now uses dedicated ServiceAccounts:
- `console-plugin-nvidia-gpu` - For plugin pods
- `console-plugin-nvidia-gpu-patcher` - For auto-enablement job

This follows Kubernetes best practices and improves security.

### High Availability by Default

Default replicas increased to 2 for:
- Zero-downtime updates
- Better reliability
- Load distribution

---

## Troubleshooting

### Issue: "forbidden: User cannot patch resource consoles"

**Cause:** The auto-enablement job requires cluster-admin permissions.

**Solution:**
1. Ensure the patcher ServiceAccount has proper RBAC (check ClusterRole and ClusterRoleBinding were created)
2. Or disable auto-enablement and enable manually:
   ```yaml
   plugin:
     jobs:
       patchConsoles:
         enabled: false
   ```

### Issue: Old values.yaml doesn't work

**Cause:** Values structure changed in 1.0.0.

**Solution:** Migrate your values using the [Mapping Table](#mapping-table) and [Example Migration](#example-migration) above.

### Issue: Plugin shows blank/white screen

**Cause:** PatternFly v6 requires OpenShift 4.19+.

**Solution:** Upgrade OpenShift to 4.19 or higher.

### Issue: Replicas showing 2 but I configured 1

**Cause:** Default changed from 1 to 2.

**Solution:** Explicitly set in your values:
```yaml
plugin:
  replicas: 1
```

### Issue: GPU metrics not showing

**Cause:** DCGM Exporter ConfigMap not configured.

**Solution:**
```bash
oc patch clusterpolicies.nvidia.com gpu-cluster-policy \
  --patch '{ "spec": { "dcgmExporter": { "config": { "name": "console-plugin-nvidia-gpu" } } } }' \
  --type=merge
```

---

## Migration Checklist

Use this checklist to ensure a smooth upgrade:

- [ ] Verify OpenShift version is 4.19+
- [ ] Export current Helm values
- [ ] Convert values to new structure
- [ ] Test new values with `helm template`
- [ ] Backup current deployment and ConsolePlugin
- [ ] Perform Helm upgrade
- [ ] Verify pods are running (2 replicas by default)
- [ ] Verify plugin is automatically enabled
- [ ] Check plugin in web console
- [ ] Update DCGM Exporter ConfigMap
- [ ] Test GPU metrics are showing
- [ ] Remove old values.yaml backup files

---

## Getting Help

If you encounter issues during upgrade:

1. **Check Logs:**
   ```bash
   kubectl -n nvidia-gpu-operator logs -l app.kubernetes.io/name=console-plugin-nvidia-gpu
   ```

2. **Check Auto-Enablement Job:**
   ```bash
   kubectl -n nvidia-gpu-operator get jobs
   kubectl -n nvidia-gpu-operator logs job/console-plugin-nvidia-gpu-patcher
   ```

3. **Open an Issue:**
   - GitHub: https://github.com/rh-ecosystem-edge/console-plugin-nvidia-gpu/issues
   - Include: OpenShift version, Helm version, error messages, logs

4. **Review Documentation:**
   - Chart README: `deployment/console-plugin-nvidia-gpu/README.md`
   - Main README: `README.md`

---

## What's Next?

After successfully upgrading to 1.0.0:

1. **Monitor the Plugin** - Check metrics and logs for a few days
2. **Test GPU Features** - Verify all GPU monitoring works correctly
3. **Update Your CI/CD** - Update any automation to use new values structure
4. **Document Your Changes** - Keep notes on your customizations for future upgrades

---

**Congratulations!** You've successfully upgraded to Console Plugin NVIDIA GPU 1.0.0 with PatternFly v6 and OpenShift 4.19+ support! 🎉

