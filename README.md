# Payto-RL

`payto-rl` is a TypeScript library for handling Payto Resource Locators (PRLs). This library is based on the [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) API and provides additional functionality for managing PRLs.

[![npm](https://img.shields.io/npm/v/payto-rl?label=npm&color=cb3837&logo=npm)](https://www.npmjs.com/package/payto-rl)
[![License: CORE](https://img.shields.io/badge/License-CORE-yellow?logo=googledocs)](LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/payto-rl?label=Size&logo=tsnode)](https://bundlephobia.com/package/payto-rl@latest)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/bchainhub?label=Sponsors&logo=githubsponsors&color=EA4AAA)](https://github.com/sponsors/bchainhub)

## Features

- 🐥 **Small**: **[![Bundle Size](https://img.shields.io/bundlephobia/minzip/payto-rl?label=&color=6ead0a)](https://bundlephobia.com/package/payto-rl@latest)** gzipped, distributed as minified ES modules.
- 📜 **Standardized**: Based on the [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) Web API.
- 🏗️ **Simple**: Easy to implement.
- 🗂 **Typed**: Ships with types included.
- 🧪 **Tested**: Robust test coverage.
- 🌲 **Tree Shaking**: Zero dependencies, no side effects.

## Installation

Install the `payto-rl` package using your package manager:

```sh
npm i payto-rl
```

```sh
pnpm add payto-rl
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

// Color customization
payto.colorBackground = 'ff0000';  // Red background (6-character hex)
payto.colorForeground = '000000';  // Black foreground
console.log(payto.colorBackground); // 'ff0000'

// ACH payment examples
const achPayto1 = new Payto('payto://ach/123456789/1234567'); // With routing number
console.log(achPayto1.routingNumber); // 123456789
console.log(achPayto1.accountNumber); // 1234567

const achPayto2 = new Payto('payto://ach/1234567'); // Account number only
console.log(achPayto2.accountNumber); // 1234567

// UPI/PIX payment examples (case-insensitive email)
const upiPayto = new Payto('payto://upi/USER@example.com');
console.log(upiPayto.accountAlias); // 'user@example.com'

const pixPayto = new Payto('payto://pix/user@EXAMPLE.com');
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

// Bank details example (case-insensitive BIC)
const bankPayto = new Payto('payto://bic/deutdeff500');
console.log(bankPayto.bic);           // 'DEUTDEFF500'
bankPayto.routingNumber = 123456789;  // Valid 9-digit routing number
console.log(bankPayto.routingNumber); // 123456789

// Language/locale example
const langPayto = new Payto('payto://xcb/address?lang=en-US');
console.log(langPayto.lang);          // 'en-us'
langPayto.lang = 'fr-CA';
console.log(langPayto.lang);          // 'fr-ca'
langPayto.lang = 'es';
console.log(langPayto.lang);          // 'es'
// Language codes must be 2-letter language codes, with optional region (2 letters, case-insensitive)
// Valid: 'en', 'es', 'en-US', 'en-us', 'fr-CA', 'fr-ca', 'zh-CN'
// Invalid: 'EN', 'EN-US', 'invalid', 'eng', 'fra'

// Value handling examples
const numericPayto = new Payto('payto://example/address?amount=10.5');
console.log(numericPayto.value);  // 10.5
console.log(numericPayto.amount); // '10.5'

const tokenPayto = new Payto('payto://example/address?amount=token:10.5');
console.log(tokenPayto.value);    // 10.5
console.log(tokenPayto.amount);   // 'token:10.5'
console.log(tokenPayto.asset);    // 'token'

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
| `accountAlias` | `string \| null` | Email address for UPI/PIX payments (case-insensitive) |
| `accountNumber` | `number \| null` | Account number (7-14 digits) for ACH payments |
| `address` | `string \| null` | Payment address |
| `amount` | `string \| null` | Payment amount with optional currency prefix |
| `asset` | `string \| null` | Asset type or contract address |
| `barcode` | `'qr' \| 'pdf417' \| 'aztec' \| 'code128' \| null` | Barcode format |
| `bic` | `string \| null` | Bank Identifier Code (8 or 11 characters, case-insensitive) |
| `colorBackground` | `string \| null` | Background color in 6-character hex format |
| `colorForeground` | `string \| null` | Foreground color in 6-character hex format |
| `currency` | `[string \| null, string \| null]` | Currency codes array [asset, fiat] |
| `deadline` | `number \| null` | Payment deadline (Unix timestamp or positive integer) |
| `donate` | `boolean \| null` | Donation flag |
| `fiat` | `string \| null` | Fiat currency code (case-insensitive) |
| `hash` | `string` | URL hash component |
| `host` | `string` | Complete host (hostname:port) |
| `hostname` | `string` | Host without port (case-insensitive) |
| `href` | `string` | Complete URL string |
| `iban` | `string \| null` | International Bank Account Number (case-insensitive) |
| `item` | `string \| null` | Item description (maximum 40 characters) |
| `lang` | `string \| null` | Language/locale code (2-letter language code, e.g., 'en', 'en-US', 'en-us', 'fr-CA') |
| `location` | `string \| null` | Location data (format depends on void type) |
| `message` | `string \| null` | Payment message |
| `network` | `string` | Network identifier (case-insensitive) |
| `organization` | `string \| null` | Organization name (maximum 25 characters) |
| `origin` | `string \| null` | URL origin |
| `password` | `string` | URL password component |
| `pathname` | `string` | URL path component |
| `port` | `string` | URL port component |
| `protocol` | `string` | URL protocol (always 'payto:') |
| `receiverName` | `string \| null` | Receiver's name |
| `recurring` | `string \| null` | Recurring payment details |
| `routingNumber` | `number \| null` | Bank routing number (9 digits) |
| `rtl` | `boolean \| null` | Right-to-left layout |
| `search` | `string` | URL search component |
| `searchParams` | `URLSearchParams` | URL search parameters |
| `split` | `[string, string, boolean] \| null` | Payment split information |
| `swap` | `string \| null` | Swap transaction details |
| `username` | `string` | URL username component |
| `value` | `number \| null` | Numeric amount value (extracted from both simple and token:amount formats) |
| `void` | `string \| null` | Void path type (e.g., 'geo', 'plus') |

### Methods

| Method | Return Type | Description |
|--------|-------------|-------------|
| `toString()` | `string` | Returns the complete payto URL string |
| `toJSON()` | `string` | Returns a JSON string representation |
| `toJSONObject()` | `PaytoJSON` | Returns a typed object with all properties and custom fields |

## Type Safety

The library includes TypeScript type definitions and runtime validation for:

- Bank Identifier Codes (BIC) - 8 or 11 characters, case-insensitive
- Routing numbers (9 digits)
- Account numbers (7-14 digits)
- Email addresses (for UPI/PIX, case-insensitive)
- Geographic coordinates
- Plus codes
- Unix timestamps
- Barcode formats
- IBAN format (case-insensitive)
- Color formats (6-character hex)
- Language/locale codes (2-letter language codes with optional region codes, case-insensitive)

## Payment System Support

### IBAN

Supports two formats (case-insensitive):

- `payto://iban/iban` (without BIC)
- `payto://iban/bic/iban` (with BIC)

### ACH Payments

Supports two formats:

- `payto://ach/routing/account` (with routing number)
- `payto://ach/account` (account number only)

### UPI/PIX Payments

Email-based payment identifiers (case-insensitive):

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

List of sponsors: [![GitHub Sponsors](https://img.shields.io/github/sponsors/bchainhub?label=Sponsors&logo=githubsponsors&color=EA4AAA)](https://github.com/sponsors/bchainhub)
