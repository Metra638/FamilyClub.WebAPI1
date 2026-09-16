
# Order


## Properties

Name | Type
------------ | -------------
`id` | number
`userId` | string
`clubMember` | [ClubMember](ClubMember.md)
`orderDate` | Date
`status` | string
`paymentMethod` | string
`totalPrice` | number
`firstName` | string
`lastName` | string
`email` | string
`phone` | string
`deliveryProvider` | string
`deliveryType` | string
`city` | string
`cityRef` | string
`branch` | string
`branchRef` | string
`deliveryCost` | number
`comment` | string
`orderItems` | [Array&lt;OrderItem&gt;](OrderItem.md)

## Example

```typescript
import type { Order } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "userId": null,
  "clubMember": null,
  "orderDate": null,
  "status": null,
  "paymentMethod": null,
  "totalPrice": null,
  "firstName": null,
  "lastName": null,
  "email": null,
  "phone": null,
  "deliveryProvider": null,
  "deliveryType": null,
  "city": null,
  "cityRef": null,
  "branch": null,
  "branchRef": null,
  "deliveryCost": null,
  "comment": null,
  "orderItems": null,
} satisfies Order

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Order
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


