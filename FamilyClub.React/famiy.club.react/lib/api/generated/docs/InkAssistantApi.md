# InkAssistantApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiInkAssistantChatPost**](InkAssistantApi.md#apiinkassistantchatpost) | **POST** /api/InkAssistant/chat |  |
| [**apiInkAssistantReindexEmbeddingsPost**](InkAssistantApi.md#apiinkassistantreindexembeddingspost) | **POST** /api/InkAssistant/reindex-embeddings |  |



## apiInkAssistantChatPost

> ChatResponse apiInkAssistantChatPost(chatRequest)



### Example

```ts
import {
  Configuration,
  InkAssistantApi,
} from '';
import type { ApiInkAssistantChatPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new InkAssistantApi();

  const body = {
    // ChatRequest (optional)
    chatRequest: ...,
  } satisfies ApiInkAssistantChatPostRequest;

  try {
    const data = await api.apiInkAssistantChatPost(body);
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
| **chatRequest** | [ChatRequest](ChatRequest.md) |  | [Optional] |

### Return type

[**ChatResponse**](ChatResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`, `text/json`, `application/*+json`
- **Accept**: `text/plain`, `application/json`, `text/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiInkAssistantReindexEmbeddingsPost

> ReindexResponse apiInkAssistantReindexEmbeddingsPost()



### Example

```ts
import {
  Configuration,
  InkAssistantApi,
} from '';
import type { ApiInkAssistantReindexEmbeddingsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new InkAssistantApi();

  try {
    const data = await api.apiInkAssistantReindexEmbeddingsPost();
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

[**ReindexResponse**](ReindexResponse.md)

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

