variable "vnet_name" {
  description = "Имя виртуальной сети"
  type        = string
  default     = "vnet-aks"
}

variable "vnet_address_space" {
  description = "Диапазон адресов для VNet"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "aks_subnet_name" {
  description = "Имя подсети для AKS"
  type        = string
  default     = "snet-aks"
}

variable "aks_subnet_address_prefixes" {
  description = "Диапазон адресов для подсети AKS"
  type        = list(string)
  default     = ["10.0.1.0/24"]
}
