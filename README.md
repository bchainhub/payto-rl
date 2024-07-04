
# Payto-RL

`payto-rl` is a TypeScript library for handling Payto resource locators (PRLs). This library is based on the [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) API and provides additional functionality for managing PRLs.

## Installation

You can install the `payto-rl` package using npm or yarn:

### Using npm

```sh
npm install payto-rl
```

### Using yarn

```sh
yarn add payto-rl
```

## Usage

Here is an example of how to use the `Payto-RL` package:

### Example

```typescript
import Payto from 'payto-rl';

const paytoString = 'payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.1&fiat=usd';
const payto = new Payto(paytoString);

console.log(payto.address); // Outputs: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
console.log(payto.amount); // Outputs: 0.1
console.log(payto.currency); // Outputs: ['btc', 'usd']

payto.amount = '0.2';
console.log(payto.amount); // Outputs: 0.2

console.log(payto.toJSONObject());

/*
Outputs:
{
  address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  amount: '0.2',
  currency: 'btc',
  fiat: 'usd',
  host: 'btc',
  hostname: 'btc',
  href: 'payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.2&fiat=usd',
  network: 'btc',
  pathname: '/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  protocol: 'payto:',
  search: '?amount=0.2&fiat=usd'
}
*/
```

## API

### `Payto`

#### Constructor

```typescript
constructor(paytoString: string)
```

Creates a new `Payto` instance.

#### Properties

##### `address: string | null`

Gets or sets the address component of the PRL.

##### `amount: string | null`

Gets or sets the amount component of the PRL. Amount consists of the number of units and the currency delimited by `:`.

##### `bic: string | null`

Gets or sets the BIC component of the PRL.

##### `currency: [string | null, string | null]`

Gets or sets the currency component of the PRL.

##### `deadline: string | null`

Gets or sets the deadline component of the PRL.

##### `donate: string | null`

Gets or sets the donate component of the PRL.

##### `fiat: string | null`

Gets or sets the fiat component of the PRL.

##### `hash: string`

Gets or sets the hash component of the PRL.

##### `host: string`

Gets or sets the host component of the PRL.

##### `hostname: string`

Gets or sets the hostname component of the PRL.

##### `href: string`

Gets or sets the href component of the PRL.

##### `iban: string | null`

Gets or sets the IBAN component of the PRL.

##### `location: string | null`

Gets or sets the location component of the PRL.

##### `message: string | null`

Gets or sets the message component of the PRL.

##### `network: string`

Gets or sets the network component of the PRL.

##### `origin: string | null`

Gets the origin component of the PRL.

##### `password: string`

Gets or sets the password component of the PRL.

##### `pathname: string`

Gets or sets the pathname component of the PRL.

##### `port: string`

Gets or sets the port component of the PRL.

##### `protocol: string`

Gets or sets the protocol component of the PRL.

##### `receiverName: string | null`

Gets or sets the receiver name component of the PRL.

##### `recurring: string | null`

Gets or sets the recurring component of the PRL.

##### `route: string | null`

Gets or sets the route component of the PRL.

##### `routingNumber: string | null`

Gets or sets the routing number component of the PRL.

##### `search: string`

Gets or sets the search component of the PRL.

##### `searchParams: URLSearchParams`

Gets the URLSearchParams object.

##### `split: [string, string, boolean] | null`

Gets or sets the split component of the PRL.

##### `username: string`

Gets or sets the username component of the PRL.

##### `value: number | null`

Gets or sets the amount component of the PRL. This contrasts with the `amount` working only with the currency string and not the currency number itself.

#### Methods

##### `toString(): string`

Returns the string representation of the PRL.

##### `toJSON(): string`

Returns the JSON representation of the PRL.

##### `toJSONObject(): object`

Returns the PRL as a JSON object with all non-empty values.

## License

This project is licensed under the CORE License - see the [LICENSE](LICENSE) file for details.

## Contributing

Feel free to contribute to this project. You can open issues for feature requests or bug fixes. Pull requests are also welcome.

## Acknowledgments

This library is based on the [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) API from MDN.
