# Payto-RL

`payto-rl` is a TypeScript library for handling Payto Resource Locators (PRLs). This library is based on the [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) API and provides additional functionality for managing PRLs.

## Installation

Install the `payto-rl` package using npm or yarn:

```sh
npm i payto-rl
```

```sh
yarn add payto-rl
```

## Usage

Here's an example of how to use the `payto-rl` package:

```typescript
import Payto from 'payto-rl';

// Basic payment URL
const paytoString = 'payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?amount=ctn:10.01&fiat=eur';
const payto = new Payto(paytoString);

// Standard payment properties
console.log(payto.address);  // 'cb7147879011ea207df5b35a24ca6f0859dcfb145999'
console.log(payto.amount);   // 'ctn:10.01'
console.log(payto.value);    // 10.01
console.log(payto.network);  // 'xcb'
console.log(payto.currency); // ['ctn', 'eur']

// Update payment amount
payto.value = 20.02;
console.log(payto.amount);   // 'ctn:20.02'
console.log(payto.fiat);     // 'eur'

// ACH payment examples
const achPayto1 = new Payto('payto://ach/123456789/1234567'); // With routing number
console.log(achPayto1.routingNumber); // 123456789
console.log(achPayto1.accountNumber); // 1234567

const achPayto2 = new Payto('payto://ach/1234567'); // Account number only
console.log(achPayto2.accountNumber); // 1234567

// UPI/PIX payment examples
const upiPayto = new Payto('payto://upi/user@example.com');
console.log(upiPayto.accountAlias); // 'user@example.com'

const pixPayto = new Payto('payto://pix/user@example.com');
console.log(pixPayto.accountAlias); // 'user@example.com'

// Geo location example
const geoPayto = new Payto('payto://void/geo');
geoPayto.location = '51.5074,0.1278';  // Valid coordinates
console.log(geoPayto.void);     // 'geo'
console.log(geoPayto.location); // '51.5074,0.1278'

// Plus code example
const plusPayto = new Payto('payto://void/plus');
plusPayto.location = '8FVC9G8V+R9';  // Valid plus code
console.log(plusPayto.void);     // 'plus'
console.log(plusPayto.location); // '8FVC9G8V+R9'

// Bank details example
const bankPayto = new Payto('payto://bic/DEUTDEFF500');
console.log(bankPayto.bic);           // 'DEUTDEFF500'
bankPayto.routingNumber = 123456789;  // Valid 9-digit routing number
console.log(bankPayto.routingNumber); // 123456789

// Convert to JSON object
const jsonObj = payto.toJSONObject();
console.log(jsonObj.colorForeground); // Access typed properties
console.log(jsonObj['custom-field']); // Access custom properties
```

## API Reference

### Constructor

```typescript
new Payto(paytoString: string)
```

Creates a new Payto instance from a payto URL string.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `accountAlias` | `string \| null` | Email address for UPI/PIX payments |
| `accountNumber` | `number \| null` | Account number (7-14 digits) for ACH payments |
| `address` | `string \| null` | Payment address |
| `amount` | `string \| null` | Payment amount with currency |
| `asset` | `string \| null` | Asset type or contract address |
| `barcode` | `'qr' \| 'pdf417' \| 'aztec' \| 'code128' \| null` | Barcode format |
| `bic` | `string \| null` | Bank Identifier Code (8 or 11 characters) |
| `colorBackground` | `string \| null` | Background color in hex format |
| `colorForeground` | `string \| null` | Foreground color in hex format |
| `currency` | `[string \| null, string \| null]` | Currency codes array |
| `deadline` | `number \| null` | Payment deadline (Unix timestamp) |
| `donate` | `boolean \| null` | Donation flag |
| `fiat` | `string \| null` | Fiat currency code |
| `hash` | `string` | URL hash component |
| `host` | `string` | Complete host (hostname:port) |
| `hostname` | `string` | Host without port |
| `href` | `string` | Complete URL string |
| `iban` | `string \| null` | International Bank Account Number |
| `item` | `string \| null` | Item description (max 40 chars) |
| `location` | `string \| null` | Location data (format depends on void type) |
| `message` | `string \| null` | Payment message |
| `network` | `string` | Network identifier |
| `organization` | `string \| null` | Organization name (max 25 chars) |
| `origin` | `string \| null` | URL origin |
| `password` | `string` | URL password component |
| `pathname` | `string` | URL path component |
| `port` | `string` | URL port component |
| `protocol` | `string` | URL protocol (always 'payto:') |
| `receiverName` | `string \| null` | Receiver's name |
| `recurring` | `string \| null` | Recurring payment details |
| `routingNumber` | `number \| null` | Bank routing number (9 digits) |
| `rtl` | `boolean \| null` | right-to-left layout |
| `search` | `string` | URL search component |
| `searchParams` | `URLSearchParams` | URL search parameters |
| `split` | `[string, string, boolean] \| null` | Payment split information |
| `swap` | `string \| null` | Swap transaction details |
| `username` | `string` | URL username component |
| `value` | `number \| null` | Numeric amount value |
| `void` | `string \| null` | Void path type (e.g., 'geo', 'plus') |

### Methods

| Method | Return Type | Description |
|--------|-------------|-------------|
| `toString()` | `string` | Returns the complete payto URL string |
| `toJSON()` | `string` | Returns a JSON string representation |
| `toJSONObject()` | `PaytoJSON` | Returns a typed object with all properties and custom fields |

## Type Safety

The library includes TypeScript type definitions and runtime validation for:

- Bank Identifier Codes (BIC)
- Routing numbers (9 digits)
- Account numbers (7-14 digits)
- Email addresses (for UPI/PIX)
- Geographic coordinates
- Plus codes
- Unix timestamps
- Barcode formats
- IBAN format

## Payment System Support

### IBAN

Supports two formats:

- `payto://iban/iban` (without BIC)
- `payto://iban/bic/iban` (with BIC)

### ACH Payments

Supports two formats:

- `payto://ach/routing/account` (with routing number)
- `payto://ach/account` (account number only)

### UPI/PIX Payments

Email-based payment identifiers:

- `payto://upi/email@example.com`
- `payto://pix/email@example.com`

## License

This project is licensed under the CORE License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Acknowledgments

- Based on the [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) Web API
- Implements [RFC 8905](https://datatracker.ietf.org/doc/html/rfc8905) - The 'payto' URI Scheme

## Funding

If you find this project useful, please consider supporting it:

- [GitHub Sponsors](https://github.com/sponsors/bchainhub)
- [Core](https://blockindex.net/address/cb7147879011ea207df5b35a24ca6f0859dcfb145999)
- [Bitcoin](https://www.blockchain.com/explorer/addresses/btc/bc1pd8guxjkr2p6n2kl388fdj2trete9w2fr89xlktdezmcctxvtzm8qsymg0d)
- [Litecoin](https://www.blockchain.com/explorer/addresses/ltc/ltc1ql8dvx0wv0nh2vncpt9j3zqefaehsd25cwp7pfx)

List of sponsors: [![GitHub Sponsors](https://img.shields.io/github/sponsors/bchainhub)](https://github.com/sponsors/bchainhub)
