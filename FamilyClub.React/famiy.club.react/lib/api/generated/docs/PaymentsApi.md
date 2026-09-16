# PaymentsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiPaymentsCheckoutSessionPost**](PaymentsApi.md#apipaymentscheckoutsessionpost) | **POST** /api/Payments/checkout-session |  |
| [**apiPaymentsWebhookPost**](PaymentsApi.md#apipaymentswebhookpost) | **POST** /api/Payments/webhook |  |



## apiPaymentsCheckoutSessionPost

> apiPaymentsCheckoutSessionPost(checkoutSessionRequest)



### Example

```ts
import {
  Configuration,
  PaymentsApi,
} from '';
import type { ApiPaymentsCheckoutSessionPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new PaymentsApi();

  const body = {
    // CheckoutSessionRequest (optional)
    checkoutSessionRequest: ...,
  } satisfies ApiPaymentsCheckoutSessionPostRequest;

  try {
    const data = await api.apiPaymentsCheckoutSessionPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **checkoutSessionRequest** | [CheckoutSessionRequest](CheckoutSessionRequest.md) |  | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`, `text/json`, `application/*+json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiPaymentsWebhookPost

> apiPaymentsWebhookPost()



### Example

```ts
import {
  Configuration,
  PaymentsApi,
} from '';
import type { ApiPaymentsWebhookPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new PaymentsApi();

  try {
    const data = await api.apiPaymentsWebhookPost();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

