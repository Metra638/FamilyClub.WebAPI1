# ProductsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiProductsGet**](ProductsApi.md#apiproductsget) | **GET** /api/Products |  |
| [**apiProductsIdDelete**](ProductsApi.md#apiproductsiddelete) | **DELETE** /api/Products/{id} |  |
| [**apiProductsIdGet**](ProductsApi.md#apiproductsidget) | **GET** /api/Products/{id} |  |
| [**apiProductsIdPut**](ProductsApi.md#apiproductsidput) | **PUT** /api/Products/{id} |  |
| [**apiProductsPost**](ProductsApi.md#apiproductspost) | **POST** /api/Products |  |
| [**apiProductsProductIdImagesImageIdGet**](ProductsApi.md#apiproductsproductidimagesimageidget) | **GET** /api/Products/{productId}/images/{imageId} |  |



## apiProductsGet

> Array&lt;ProductDto&gt; apiProductsGet()



### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '';
import type { ApiProductsGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ProductsApi();

  try {
    const data = await api.apiProductsGet();
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

[**Array&lt;ProductDto&gt;**](ProductDto.md)

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


## apiProductsIdDelete

> apiProductsIdDelete(id)



### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '';
import type { ApiProductsIdDeleteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ProductsApi();

  const body = {
    // number
    id: 56,
  } satisfies ApiProductsIdDeleteRequest;

  try {
    const data = await api.apiProductsIdDelete(body);
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


## apiProductsIdGet

> ProductDto apiProductsIdGet(id)



### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '';
import type { ApiProductsIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ProductsApi();

  const body = {
    // number
    id: 56,
  } satisfies ApiProductsIdGetRequest;

  try {
    const data = await api.apiProductsIdGet(body);
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

[**ProductDto**](ProductDto.md)

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


## apiProductsIdPut

> apiProductsIdPut(id, id2, productName, price, discountPrice, description, publisherId, productImages, originalTitle, pageCount, publishingDate, coverType, availability, quantityInStock, originalLanguageId, iSBN, promotionId, productCode, weightGrams, itemsInSet, authorIds, languageIds, categoryIds, seriesIds, translatorIds, formatIds, bookSizeIds, ageRestrictionIds, leaveOldImages, productImageFiles)



### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '';
import type { ApiProductsIdPutRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ProductsApi();

  const body = {
    // number
    id: 56,
    // number (optional)
    id2: 56,
    // string (optional)
    productName: productName_example,
    // number (optional)
    price: 1.2,
    // number (optional)
    discountPrice: 1.2,
    // string (optional)
    description: description_example,
    // number (optional)
    publisherId: 56,
    // Array<ProductImage> (optional)
    productImages: ...,
    // string (optional)
    originalTitle: originalTitle_example,
    // number (optional)
    pageCount: 56,
    // Date (optional)
    publishingDate: 2013-10-20,
    // CoverType (optional)
    coverType: ...,
    // Availability (optional)
    availability: ...,
    // number (optional)
    quantityInStock: 56,
    // number (optional)
    originalLanguageId: 56,
    // string (optional)
    iSBN: iSBN_example,
    // number (optional)
    promotionId: 56,
    // string (optional)
    productCode: productCode_example,
    // number (optional)
    weightGrams: 56,
    // number (optional)
    itemsInSet: 56,
    // Array<number> (optional)
    authorIds: ...,
    // Array<number> (optional)
    languageIds: ...,
    // Array<number> (optional)
    categoryIds: ...,
    // Array<number> (optional)
    seriesIds: ...,
    // Array<number> (optional)
    translatorIds: ...,
    // Array<number> (optional)
    formatIds: ...,
    // Array<number> (optional)
    bookSizeIds: ...,
    // Array<number> (optional)
    ageRestrictionIds: ...,
    // boolean (optional)
    leaveOldImages: true,
    // Array<Blob> (optional)
    productImageFiles: /path/to/file.txt,
  } satisfies ApiProductsIdPutRequest;

  try {
    const data = await api.apiProductsIdPut(body);
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
| **id2** | `number` |  | [Optional] [Defaults to `undefined`] |
| **productName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **price** | `number` |  | [Optional] [Defaults to `undefined`] |
| **discountPrice** | `number` |  | [Optional] [Defaults to `undefined`] |
| **description** | `string` |  | [Optional] [Defaults to `undefined`] |
| **publisherId** | `number` |  | [Optional] [Defaults to `undefined`] |
| **productImages** | `Array<ProductImage>` |  | [Optional] |
| **originalTitle** | `string` |  | [Optional] [Defaults to `undefined`] |
| **pageCount** | `number` |  | [Optional] [Defaults to `undefined`] |
| **publishingDate** | `Date` |  | [Optional] [Defaults to `undefined`] |
| **coverType** | `CoverType` |  | [Optional] [Defaults to `undefined`] [Enum: 0, 1] |
| **availability** | `Availability` |  | [Optional] [Defaults to `undefined`] [Enum: 0, 1, 2] |
| **quantityInStock** | `number` |  | [Optional] [Defaults to `undefined`] |
| **originalLanguageId** | `number` |  | [Optional] [Defaults to `undefined`] |
| **iSBN** | `string` |  | [Optional] [Defaults to `undefined`] |
| **promotionId** | `number` |  | [Optional] [Defaults to `undefined`] |
| **productCode** | `string` |  | [Optional] [Defaults to `undefined`] |
| **weightGrams** | `number` |  | [Optional] [Defaults to `undefined`] |
| **itemsInSet** | `number` |  | [Optional] [Defaults to `undefined`] |
| **authorIds** | `Array<number>` |  | [Optional] |
| **languageIds** | `Array<number>` |  | [Optional] |
| **categoryIds** | `Array<number>` |  | [Optional] |
| **seriesIds** | `Array<number>` |  | [Optional] |
| **translatorIds** | `Array<number>` |  | [Optional] |
| **formatIds** | `Array<number>` |  | [Optional] |
| **bookSizeIds** | `Array<number>` |  | [Optional] |
| **ageRestrictionIds** | `Array<number>` |  | [Optional] |
| **leaveOldImages** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **productImageFiles** | `Array<Blob>` |  | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiProductsPost

> apiProductsPost(id, productName, price, discountPrice, description, publisherId, productImages, originalTitle, pageCount, publishingDate, coverType, availability, quantityInStock, originalLanguageId, iSBN, promotionId, productCode, weightGrams, itemsInSet, authorIds, languageIds, categoryIds, seriesIds, translatorIds, formatIds, bookSizeIds, ageRestrictionIds, leaveOldImages, productImageFiles)



### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '';
import type { ApiProductsPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ProductsApi();

  const body = {
    // number (optional)
    id: 56,
    // string (optional)
    productName: productName_example,
    // number (optional)
    price: 1.2,
    // number (optional)
    discountPrice: 1.2,
    // string (optional)
    description: description_example,
    // number (optional)
    publisherId: 56,
    // Array<ProductImage> (optional)
    productImages: ...,
    // string (optional)
    originalTitle: originalTitle_example,
    // number (optional)
    pageCount: 56,
    // Date (optional)
    publishingDate: 2013-10-20,
    // CoverType (optional)
    coverType: ...,
    // Availability (optional)
    availability: ...,
    // number (optional)
    quantityInStock: 56,
    // number (optional)
    originalLanguageId: 56,
    // string (optional)
    iSBN: iSBN_example,
    // number (optional)
    promotionId: 56,
    // string (optional)
    productCode: productCode_example,
    // number (optional)
    weightGrams: 56,
    // number (optional)
    itemsInSet: 56,
    // Array<number> (optional)
    authorIds: ...,
    // Array<number> (optional)
    languageIds: ...,
    // Array<number> (optional)
    categoryIds: ...,
    // Array<number> (optional)
    seriesIds: ...,
    // Array<number> (optional)
    translatorIds: ...,
    // Array<number> (optional)
    formatIds: ...,
    // Array<number> (optional)
    bookSizeIds: ...,
    // Array<number> (optional)
    ageRestrictionIds: ...,
    // boolean (optional)
    leaveOldImages: true,
    // Array<Blob> (optional)
    productImageFiles: /path/to/file.txt,
  } satisfies ApiProductsPostRequest;

  try {
    const data = await api.apiProductsPost(body);
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
| **id** | `number` |  | [Optional] [Defaults to `undefined`] |
| **productName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **price** | `number` |  | [Optional] [Defaults to `undefined`] |
| **discountPrice** | `number` |  | [Optional] [Defaults to `undefined`] |
| **description** | `string` |  | [Optional] [Defaults to `undefined`] |
| **publisherId** | `number` |  | [Optional] [Defaults to `undefined`] |
| **productImages** | `Array<ProductImage>` |  | [Optional] |
| **originalTitle** | `string` |  | [Optional] [Defaults to `undefined`] |
| **pageCount** | `number` |  | [Optional] [Defaults to `undefined`] |
| **publishingDate** | `Date` |  | [Optional] [Defaults to `undefined`] |
| **coverType** | `CoverType` |  | [Optional] [Defaults to `undefined`] [Enum: 0, 1] |
| **availability** | `Availability` |  | [Optional] [Defaults to `undefined`] [Enum: 0, 1, 2] |
| **quantityInStock** | `number` |  | [Optional] [Defaults to `undefined`] |
| **originalLanguageId** | `number` |  | [Optional] [Defaults to `undefined`] |
| **iSBN** | `string` |  | [Optional] [Defaults to `undefined`] |
| **promotionId** | `number` |  | [Optional] [Defaults to `undefined`] |
| **productCode** | `string` |  | [Optional] [Defaults to `undefined`] |
| **weightGrams** | `number` |  | [Optional] [Defaults to `undefined`] |
| **itemsInSet** | `number` |  | [Optional] [Defaults to `undefined`] |
| **authorIds** | `Array<number>` |  | [Optional] |
| **languageIds** | `Array<number>` |  | [Optional] |
| **categoryIds** | `Array<number>` |  | [Optional] |
| **seriesIds** | `Array<number>` |  | [Optional] |
| **translatorIds** | `Array<number>` |  | [Optional] |
| **formatIds** | `Array<number>` |  | [Optional] |
| **bookSizeIds** | `Array<number>` |  | [Optional] |
| **ageRestrictionIds** | `Array<number>` |  | [Optional] |
| **leaveOldImages** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **productImageFiles** | `Array<Blob>` |  | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiProductsProductIdImagesImageIdGet

> apiProductsProductIdImagesImageIdGet(productId, imageId)



### Example

```ts
import {
  Configuration,
  ProductsApi,
} from '';
import type { ApiProductsProductIdImagesImageIdGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new ProductsApi();

  const body = {
    // number
    productId: 56,
    // number
    imageId: 56,
  } satisfies ApiProductsProductIdImagesImageIdGetRequest;

  try {
    const data = await api.apiProductsProductIdImagesImageIdGet(body);
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
| **imageId** | `number` |  | [Defaults to `undefined`] |

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

