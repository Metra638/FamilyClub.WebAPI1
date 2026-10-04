resource "azurerm_virtual_network" "this" {
  name                = var.vnet_name
  location            = azurerm_resource_group.azurerm-rg.location
  resource_group_name = azurerm_resource_group.azurerm-rg.name
  address_space       = var.vnet_address_space
}

resource "azurerm_subnet" "aks" {
  name                 = var.aks_subnet_name
  resource_group_name  = azurerm_resource_group.azurerm-rg.name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = var.aks_subnet_address_prefixes
}

resource "azurerm_network_security_group" "aks" {
  name                = "${var.aks_cluster_name}-nsg"
  location            = azurerm_resource_group.azurerm-rg.location
  resource_group_name = azurerm_resource_group.azurerm-rg.name

  # Разрешаем входящий трафик от балансировщика Azure
  security_rule {
    name                       = "AllowLoadBalancerInbound"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "AzureLoadBalancer"
    destination_address_prefix = "*"
  }

  # Разрешаем трафик внутри VNet
  security_rule {
    name                       = "AllowVnetInbound"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "VirtualNetwork"
    destination_address_prefix = "VirtualNetwork"
  }

  # Запрещаем весь остальной входящий трафик из интернета
  security_rule {
    name                       = "DenyInternetInbound"
    priority                   = 4000
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "aks" {
  subnet_id                 = azurerm_subnet.aks.id
  network_security_group_id = azurerm_network_security_group.aks.id
}
