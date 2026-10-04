resource "azurerm_kubernetes_cluster" "this" {
  # Основные параметры
  name                = var.aks_cluster_name
  location            = azurerm_resource_group.azurerm-rg.location
  resource_group_name = azurerm_resource_group.azurerm-rg.name
  dns_prefix          = "${var.aks_cluster_name}-dns"
  kubernetes_version  = var.kubernetes_version

  # Тариф
  sku_tier = var.sku_tier

  # Приватный кластер
  private_cluster_enabled             = var.private_cluster_enabled
  private_cluster_public_fqdn_enabled = var.private_cluster_public_fqdn_enabled
  private_dns_zone_id                 = var.private_dns_zone_id

  # Идентичность
  identity {
    type = "SystemAssigned"
  }

  # Сетевой профиль
  network_profile {
    network_plugin    = var.network_plugin
    network_policy    = var.network_policy
    load_balancer_sku = "standard"
    outbound_type     = "loadBalancer"
    dns_service_ip    = "10.2.0.10"
    service_cidr      = "10.2.0.0/24"
    pod_cidr          = "10.244.0.0/16"
  }

  # RBAC и Azure AD
  role_based_access_control_enabled = true

  azure_active_directory_role_based_access_control {
    admin_group_object_ids = var.admin_group_object_ids
    azure_rbac_enabled     = true
  }

  # Мониторинг
  # oms_agent {
  #   log_analytics_workspace_id = var.log_analytics_workspace_id
  # }

  # Автообновление
  automatic_upgrade_channel = "stable"

  # Окно обслуживания
  maintenance_window {
    allowed {
      day   = "Sunday"
      hours = [2, 3, 4]
    }
  }

  # Жизненный цикл
  lifecycle {
    ignore_changes = [
      default_node_pool[0].node_count,
    ]
  }

  default_node_pool {
    name            = "system"
    vm_size         = var.node_vm_size
    node_count      = var.node_count
    vnet_subnet_id  = azurerm_subnet.aks.id
    type            = "VirtualMachineScaleSets"
    os_disk_size_gb = 30
    os_disk_type    = "Managed"
    max_pods        = 30

    # Автоскейлинг
    # min_count = var.min_node_count
    # max_count = var.max_node_count

    # Зоны доступности
    zones = var.node_availability_zones

    # Метки узлов
    node_labels = {
      "nodepool-type" = "system"
    }

    # Настройки обновления
    upgrade_settings {
      max_surge = "33%"
    }

    # Kubelet конфигурация
    kubelet_config {
      cpu_manager_policy      = "static"
      image_gc_high_threshold = 85
      image_gc_low_threshold  = 80
    }

    # Linux конфигурация
    linux_os_config {
      swap_file_size_mb             = 0
      transparent_huge_page_enabled = "always"
      transparent_huge_page_defrag  = "always"

      sysctl_config {
        fs_aio_max_nr    = 65536
        vm_max_map_count = 65530
      }
    }

    # Безопасность
    host_encryption_enabled = false
    fips_enabled            = false
    node_public_ip_enabled  = false
  }
}
