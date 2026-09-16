# AuthClubMemberApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiAuthClubMemberExternalLoginCallbackGet**](AuthClubMemberApi.md#apiauthclubmemberexternallogincallbackget) | **GET** /api/AuthClubMember/external-login-callback |  |
| [**apiAuthClubMemberExternalLoginGet**](AuthClubMemberApi.md#apiauthclubmemberexternalloginget) | **GET** /api/AuthClubMember/external-login |  |
| [**apiAuthClubMemberExternalLoginTokenPost**](AuthClubMemberApi.md#apiauthclubmemberexternallogintokenpost) | **POST** /api/AuthClubMember/external-login-token |  |
| [**apiAuthClubMemberForgotPasswordPost**](AuthClubMemberApi.md#apiauthclubmemberforgotpasswordpost) | **POST** /api/AuthClubMember/forgot-password |  |
| [**apiAuthClubMemberLoginPost**](AuthClubMemberApi.md#apiauthclubmemberloginpost) | **POST** /api/AuthClubMember/login |  |
| [**apiAuthClubMemberLogoutPost**](AuthClubMemberApi.md#apiauthclubmemberlogoutpost) | **POST** /api/AuthClubMember/logout |  |
| [**apiAuthClubMemberMeGet**](AuthClubMemberApi.md#apiauthclubmembermeget) | **GET** /api/AuthClubMember/me |  |
| [**apiAuthClubMemberRegisterPost**](AuthClubMemberApi.md#apiauthclubmemberregisterpost) | **POST** /api/AuthClubMember/register |  |
| [**apiAuthClubMemberResetPasswordPost**](AuthClubMemberApi.md#apiauthclubmemberresetpasswordpost) | **POST** /api/AuthClubMember/reset-password |  |



## apiAuthClubMemberExternalLoginCallbackGet

> apiAuthClubMemberExternalLoginCallbackGet(returnUrl)



### Example

```ts
import {
  Configuration,
  AuthClubMemberApi,
} from '';
import type { ApiAuthClubMemberExternalLoginCallbackGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthClubMemberApi();

  const body = {
    // string (optional)
    returnUrl: returnUrl_example,
  } satisfies ApiAuthClubMemberExternalLoginCallbackGetRequest;

  try {
    const data = await api.apiAuthClubMemberExternalLoginCallbackGet(body);
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
| **returnUrl** | `string` |  | [Optional] [Defaults to `undefined`] |

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


## apiAuthClubMemberExternalLoginGet

> apiAuthClubMemberExternalLoginGet(provider, returnUrl)



### Example

```ts
import {
  Configuration,
  AuthClubMemberApi,
} from '';
import type { ApiAuthClubMemberExternalLoginGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthClubMemberApi();

  const body = {
    // string (optional)
    provider: provider_example,
    // string (optional)
    returnUrl: returnUrl_example,
  } satisfies ApiAuthClubMemberExternalLoginGetRequest;

  try {
    const data = await api.apiAuthClubMemberExternalLoginGet(body);
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
| **provider** | `string` |  | [Optional] [Defaults to `undefined`] |
| **returnUrl** | `string` |  | [Optional] [Defaults to `undefined`] |

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


## apiAuthClubMemberExternalLoginTokenPost

> AuthResponseClubMemberDTO apiAuthClubMemberExternalLoginTokenPost(externalLoginRequestDto)



### Example

```ts
import {
  Configuration,
  AuthClubMemberApi,
} from '';
import type { ApiAuthClubMemberExternalLoginTokenPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthClubMemberApi();

  const body = {
    // ExternalLoginRequestDto (optional)
    externalLoginRequestDto: ...,
  } satisfies ApiAuthClubMemberExternalLoginTokenPostRequest;

  try {
    const data = await api.apiAuthClubMemberExternalLoginTokenPost(body);
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
| **externalLoginRequestDto** | [ExternalLoginRequestDto](ExternalLoginRequestDto.md) |  | [Optional] |

### Return type

[**AuthResponseClubMemberDTO**](AuthResponseClubMemberDTO.md)

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


## apiAuthClubMemberForgotPasswordPost

> apiAuthClubMemberForgotPasswordPost(forgotPasswordDto)



### Example

```ts
import {
  Configuration,
  AuthClubMemberApi,
} from '';
import type { ApiAuthClubMemberForgotPasswordPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthClubMemberApi();

  const body = {
    // ForgotPasswordDto (optional)
    forgotPasswordDto: ...,
  } satisfies ApiAuthClubMemberForgotPasswordPostRequest;

  try {
    const data = await api.apiAuthClubMemberForgotPasswordPost(body);
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
| **forgotPasswordDto** | [ForgotPasswordDto](ForgotPasswordDto.md) |  | [Optional] |

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


## apiAuthClubMemberLoginPost

> AuthResponseClubMemberDTO apiAuthClubMemberLoginPost(loginClubMemberDto)



### Example

```ts
import {
  Configuration,
  AuthClubMemberApi,
} from '';
import type { ApiAuthClubMemberLoginPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthClubMemberApi();

  const body = {
    // LoginClubMemberDto (optional)
    loginClubMemberDto: ...,
  } satisfies ApiAuthClubMemberLoginPostRequest;

  try {
    const data = await api.apiAuthClubMemberLoginPost(body);
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
| **loginClubMemberDto** | [LoginClubMemberDto](LoginClubMemberDto.md) |  | [Optional] |

### Return type

[**AuthResponseClubMemberDTO**](AuthResponseClubMemberDTO.md)

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


## apiAuthClubMemberLogoutPost

> apiAuthClubMemberLogoutPost()



### Example

```ts
import {
  Configuration,
  AuthClubMemberApi,
} from '';
import type { ApiAuthClubMemberLogoutPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthClubMemberApi();

  try {
    const data = await api.apiAuthClubMemberLogoutPost();
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


## apiAuthClubMemberMeGet

> ClubMemberReadDto apiAuthClubMemberMeGet()



### Example

```ts
import {
  Configuration,
  AuthClubMemberApi,
} from '';
import type { ApiAuthClubMemberMeGetRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthClubMemberApi();

  try {
    const data = await api.apiAuthClubMemberMeGet();
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

[**ClubMemberReadDto**](ClubMemberReadDto.md)

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


## apiAuthClubMemberRegisterPost

> ClubMemberReadDto apiAuthClubMemberRegisterPost(registerClubMemberDto)



### Example

```ts
import {
  Configuration,
  AuthClubMemberApi,
} from '';
import type { ApiAuthClubMemberRegisterPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthClubMemberApi();

  const body = {
    // RegisterClubMemberDto (optional)
    registerClubMemberDto: ...,
  } satisfies ApiAuthClubMemberRegisterPostRequest;

  try {
    const data = await api.apiAuthClubMemberRegisterPost(body);
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
| **registerClubMemberDto** | [RegisterClubMemberDto](RegisterClubMemberDto.md) |  | [Optional] |

### Return type

[**ClubMemberReadDto**](ClubMemberReadDto.md)

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


## apiAuthClubMemberResetPasswordPost

> apiAuthClubMemberResetPasswordPost(resetPasswordDto)



### Example

```ts
import {
  Configuration,
  AuthClubMemberApi,
} from '';
import type { ApiAuthClubMemberResetPasswordPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new AuthClubMemberApi();

  const body = {
    // ResetPasswordDto (optional)
    resetPasswordDto: ...,
  } satisfies ApiAuthClubMemberResetPasswordPostRequest;

  try {
    const data = await api.apiAuthClubMemberResetPasswordPost(body);
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
| **resetPasswordDto** | [ResetPasswordDto](ResetPasswordDto.md) |  | [Optional] |

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

