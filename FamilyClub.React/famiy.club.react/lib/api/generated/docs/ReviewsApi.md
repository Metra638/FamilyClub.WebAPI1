# ReviewsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiReviewsByProductProductIdGet**](ReviewsApi.md#apireviewsbyproductproductidget) | **GET** /api/Reviews/by-product/{productId} |  |
| [**apiReviewsByUserUserIdGet**](ReviewsApi.md#apireviewsbyuseruseridget) | **GET** /api/Reviews/by-user/{userId} |  |
| [**apiReviewsGet**](ReviewsApi.md#apireviewsget) | **GET** /api/Reviews |  |
| [**apiReviewsIdDelete**](ReviewsApi.md#apireviewsiddelete) | **DELETE** /api/Reviews/{id} |  |
| [**apiReviewsIdGet**](ReviewsApi.md#apireviewsidget) | **GET** /api/Reviews/{id} |  |
| [**apiReviewsIdPut**](ReviewsApi.md#apireviewsidput) | **PUT** /api/Reviews/{id} |  |
| [**apiReviewsPost**](ReviewsApi.md#apireviewspost) | **POST** /api/Reviews |  |



## apiReviewsByProductProductIdGet

> Array&lt;ReviewDto&gt; apiReviewsByProductProductIdGet(productId)



### Example

```ts
import {
  Configuration,
  ReviewsApi,
} from '';
import type { ApiReviewsByProductProductIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ReviewsApi();

  const body = {
    // number
    productId: 56,
  } satisfies ApiReviewsByProductProductIdGetRequest;

  try {
    const data = await api.apiReviewsByProductProductIdGet(body);
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
| **productId** | `number` |  | [Defaults to `undefined`] |

### Return type

[**Array&lt;ReviewDto&gt;**](ReviewDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`, `application/json`, `text/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiReviewsByUserUserIdGet

> Array&lt;ReviewDto&gt; apiReviewsByUserUserIdGet(userId)



### Example

```ts
import {
  Configuration,
  ReviewsApi,
} from '';
import type { ApiReviewsByUserUserIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ReviewsApi();

  const body = {
    // string
    userId: userId_example,
  } satisfies ApiReviewsByUserUserIdGetRequest;

  try {
    const data = await api.apiReviewsByUserUserIdGet(body);
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
| **userId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**Array&lt;ReviewDto&gt;**](ReviewDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`, `application/json`, `text/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiReviewsGet

> Array&lt;ReviewDto&gt; apiReviewsGet()



### Example

```ts
import {
  Configuration,
  ReviewsApi,
} from '';
import type { ApiReviewsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ReviewsApi();

  try {
    const data = await api.apiReviewsGet();
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

[**Array&lt;ReviewDto&gt;**](ReviewDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`, `application/json`, `text/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiReviewsIdDelete

> apiReviewsIdDelete(id)



### Example

```ts
import {
  Configuration,
  ReviewsApi,
} from '';
import type { ApiReviewsIdDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ReviewsApi();

  const body = {
    // number
    id: 56,
  } satisfies ApiReviewsIdDeleteRequest;

  try {
    const data = await api.apiReviewsIdDelete(body);
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
| **id** | `number` |  | [Defaults to `undefined`] |

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


## apiReviewsIdGet

> ReviewDto apiReviewsIdGet(id)



### Example

```ts
import {
  Configuration,
  ReviewsApi,
} from '';
import type { ApiReviewsIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ReviewsApi();

  const body = {
    // number
    id: 56,
  } satisfies ApiReviewsIdGetRequest;

  try {
    const data = await api.apiReviewsIdGet(body);
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
| **id** | `number` |  | [Defaults to `undefined`] |

### Return type

[**ReviewDto**](ReviewDto.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`, `application/json`, `text/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiReviewsIdPut

> apiReviewsIdPut(id, reviewDto)



### Example

```ts
import {
  Configuration,
  ReviewsApi,
} from '';
import type { ApiReviewsIdPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ReviewsApi();

  const body = {
    // number
    id: 56,
    // ReviewDto (optional)
    reviewDto: ...,
  } satisfies ApiReviewsIdPutRequest;

  try {
    const data = await api.apiReviewsIdPut(body);
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
| **id** | `number` |  | [Defaults to `undefined`] |
| **reviewDto** | [ReviewDto](ReviewDto.md) |  | [Optional] |

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


## apiReviewsPost

> apiReviewsPost(reviewDto)



### Example

```ts
import {
  Configuration,
  ReviewsApi,
} from '';
import type { ApiReviewsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ReviewsApi();

  const body = {
    // ReviewDto (optional)
    reviewDto: ...,
  } satisfies ApiReviewsPostRequest;

  try {
    const data = await api.apiReviewsPost(body);
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
| **reviewDto** | [ReviewDto](ReviewDto.md) |  | [Optional] |

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

