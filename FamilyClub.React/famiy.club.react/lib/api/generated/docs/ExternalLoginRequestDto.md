
# ExternalLoginRequestDto


## Properties

Name | Type
------------ | -------------
`provider` | string
`idToken` | string
`accessToken` | string
`returnUrl` | string

## Example

```typescript
import type { ExternalLoginRequestDto } from ''

// TODO: Update the object below with actual values
const example = {
  "provider": null,
  "idToken": null,
  "accessToken": null,
  "returnUrl": null,
} satisfies ExternalLoginRequestDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ExternalLoginRequestDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


