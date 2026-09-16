
# ChatResponse


## Properties

Name | Type
------------ | -------------
`reply` | string
`needsSupport` | boolean
`books` | [Array&lt;BookHitDto&gt;](BookHitDto.md)

## Example

```typescript
import type { ChatResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "reply": null,
  "needsSupport": null,
  "books": null,
} satisfies ChatResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ChatResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


