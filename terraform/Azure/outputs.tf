output "resource_group_name" {
  value = azurerm_resource_group.azurerm-rg.name
}

output "aks_cluster_name" {
  value = azurerm_kubernetes_cluster.this.name
}

output "aks_cluster_fqdn" {
  value = azurerm_kubernetes_cluster.this.fqdn
}

output "aks_kube_config" {
  value     = azurerm_kubernetes_cluster.this.kube_config_raw
  sensitive = true
}
