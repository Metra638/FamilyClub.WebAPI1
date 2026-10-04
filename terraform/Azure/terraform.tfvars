# RG
resource_group_name     = "rg-librellis"
resource_group_location = "eastus"

# Kubernetes
location                = "eastus"
aks_cluster_name        = "cluster-librellis"
kubernetes_version      = "1.36"
node_count              = 1
node_vm_size            = "Standard_D2pls_v5"
enable_auto_scaling     = false
min_node_count          = 1
max_node_count          = 1
vnet_subnet_id          = "/subscriptions/.../subnets/aks-subnet"
network_plugin          = "kubenet"
node_availability_zones = []
sku_tier                = "Free"
