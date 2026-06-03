locals {
  app_name = "catchthevibe-${var.environment}"
}

data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}

resource "azurerm_container_registry" "main" {
  name                = "acrcatchthevibe${var.environment}"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  sku                 = "Standard"
  admin_enabled       = false
}

resource "azurerm_user_assigned_identity" "acr_pull" {
  name                = "${local.app_name}-acr-pull"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
}

resource "azurerm_service_plan" "main" {
  name                = "${local.app_name}-plan"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_sku
}

resource "azurerm_linux_web_app" "main" {
  name                = local.app_name
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  https_only          = true

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.acr_pull.id]
  }

  site_config {
    always_on                                     = var.app_service_sku != "F1"
    container_registry_use_managed_identity       = true
    container_registry_managed_identity_client_id = azurerm_user_assigned_identity.acr_pull.client_id
  }

  app_settings = {
    WEBSITES_PORT = "80"
  }

  lifecycle {
    ignore_changes = [site_config[0].application_stack]
  }
}

resource "azurerm_role_assignment" "acr_pull" {
  scope                = azurerm_container_registry.main.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.acr_pull.principal_id
}

resource "azapi_resource" "main_container" {
  type      = "Microsoft.Web/sites/sitecontainers@2024-04-01"
  name      = "catchthevibe"
  parent_id = azurerm_linux_web_app.main.id

  body = {
    properties = {
      image      = "${azurerm_container_registry.main.login_server}/catchthevibe:${var.container_image_tag}"
      isMain     = true
      targetPort = "80"
      authType                    = "UserAssigned"
      userManagedIdentityClientId = azurerm_user_assigned_identity.acr_pull.client_id
    }
  }

  depends_on = [azurerm_role_assignment.acr_pull]
}

resource "azapi_resource" "test_sidecar" {
  type      = "Microsoft.Web/sites/sitecontainers@2024-04-01"
  name      = "test-sidecar"
  parent_id = azurerm_linux_web_app.main.id

  body = {
    properties = {
      image      = "docker.io/hashicorp/http-echo:latest"
      isMain     = false
      targetPort = "5678"
      authType   = "Anonymous"
      environmentVariables = [
        {
          name  = "ECHO_TEXT"
          value = "sidecar-ok"
        }
      ]
    }
  }

  depends_on = [azapi_resource.main_container]
}
