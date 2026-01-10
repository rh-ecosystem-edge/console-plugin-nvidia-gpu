export const getGPUPodsQuery = (project: string) =>
  `count((kube_pod_status_phase > 0) * on(pod) group_left(gpu,device,instance,modelName) label_replace(DCGM_FI_DEV_GPU_UTIL{exported_pod=~".+", exported_namespace="${project}"}, "pod", "$1", "exported_pod", "(.*)"))`;
