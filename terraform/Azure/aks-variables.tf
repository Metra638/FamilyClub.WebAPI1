variable "location" {
  description = "Регион Azure"
  type        = string
}

variable "aks_cluster_name" {
  description = "Имя кластера AKS"
  type        = string
}

variable "kubernetes_version" {
  description = "Версия Kubernetes"
  type        = string
  default     = "1.30"
}

variable "sku_tier" {
  description = "Тариф"
  type        = string
}

variable "node_count" {
  description = "Количество узлов в системном пуле"
  type        = number
  default     = 1
}

variable "node_vm_size" {
  description = "Размер VM для узлов"
  type        = string
  default     = "D2pls_v5"
}

variable "enable_auto_scaling" {
  description = "Включить автоскейлинг для системного пула"
  type        = bool
  default     = false
}

variable "min_node_count" {
  description = "Минимальное количество узлов (для автоскейлинга)"
  type        = number
  default     = 1
}

variable "max_node_count" {
  description = "Максимальное количество узлов (для автоскейлинга)"
  type        = number
  default     = 3
}

variable "vnet_subnet_id" {
  description = "ID подсети для AKS"
  type        = string
}

# variable "log_analytics_workspace_id" {
#   description = "ID Log Analytics Workspace для мониторинга"
#   type        = string
#   default     = null
# }

variable "admin_group_object_ids" {
  description = "Список ID групп Azure AD для администраторов"
  type        = list(string)
  default     = []
}

variable "private_cluster_enabled" {
  description = "Включить приватный кластер"
  type        = bool
  default     = false
}

variable "private_cluster_public_fqdn_enabled" {
  description = "Включить публичный FQDN для приватного кластера"
  type        = bool
  default     = false
}

variable "private_dns_zone_id" {
  description = "ID приватной DNS-зоны (или 'System')"
  type        = string
  default     = null
}

variable "network_plugin" {
  description = "Сетевой плагин: kubenet или azure"
  type        = string
  default     = "kubenet"
}

variable "network_policy" {
  description = "Сетевая политика: calico, azure, cilium"
  type        = string
  default     = null
}

variable "node_availability_zones" {
  description = "Зоны доступности для узлов (пустой список = без зон)"
  type        = list(string)
  default     = []
}
