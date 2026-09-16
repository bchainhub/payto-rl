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
bankPayto.accountId = 'cb1958b39698a44bdae37f881e68dce073823a48a631';
console.log(bankPayto.accountId);     // 'cb1958b39698a44bdae37f881e68dce073823a48a631'
console.log(bankPayto.toString());    // 'payto://bic/DEUTDEFF500/cb1958b39698a44bdae37f881e68dce073823a48a631'

// INTRA transfer example (intra-bank transfers)
const intraPayto = new Payto('payto://intra/pingchb2/cb1958b39698a44bdae37f881e68dce073823a48a631?amount=usd:20');
console.log(intraPayto.bic);           // 'PINGCHB2'
console.log(intraPayto.accountNumber); // 'cb1958b39698a44bdae37f881e68dce073823a48a631'
console.log(intraPayto.amount);        // 'usd:20'
console.log(intraPayto.value);         // 20

// Mode example (preferred interaction mode)
const modePayto = new Payto('payto://xcb/address?mode=nfc');
console.log(modePayto.mode);          // 'nfc'
modePayto.mode = 'qr';
console.log(modePayto.mode);          // 'qr'

// Language/locale example
const langPayto = new Payto('payto://xcb/address?lang=en-US');
console.log(langPayto.lang);          // 'en-US'
langPayto.lang = 'fr-CA';
console.log(langPayto.lang);          // 'fr-CA'
langPayto.lang = 'es';
console.log(langPayto.lang);          // 'es'
// Language codes must be 2-letter lowercase language codes, with optional region (2 letters, all lowercase or all uppercase)
// Valid: 'en', 'es', 'en-US', 'en-us', 'fr-CA', 'fr-ca', 'zh-CN'
// Invalid: 'EN', 'EN-US', 'en-Us', 'fr-Ca', 'invalid', 'eng', 'fra'

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
| `accountId` | `string \| null` | Account identifier for `bic` and `intra` payments |
| `accountNumber` | `number \| string \| null` | Account number (7-14 digits for ACH, alphanumeric for INTRA) |
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
| `lang` | `string \| null` | Language/locale code (2-letter lowercase language code with optional region: all lowercase or all uppercase, e.g., 'en', 'en-US', 'en-us', 'fr-CA') |
| `location` | `string \| null` | Location data (format depends on void type) |
| `message` | `string \| null` | Payment message |
| `mode` | `string \| null` | Preferred mode of Pass (e.g., 'qr', 'nfc') |
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
- Geographic coordinates (up to 9 decimal places)
- Plus codes
- Unix timestamps
- Barcode formats
- IBAN format (case-insensitive)
- Color formats (6-character hex)
- Language/locale codes (2-letter lowercase language codes with optional region codes: region must be all lowercase or all uppercase, mixed case rejected)

## Payment System Support

### BIC Payments

Supports two formats (case-insensitive BIC):

- `payto://bic/bic`
- `payto://bic/bic/account-id`

Example: `payto://bic/deutdeff500/cb1958b39698a44bdae37f881e68dce073823a48a631`

- BIC is validated and converted to uppercase
- Optional account IDs are exposed as both `accountId` and `accountNumber`
- Useful for attaching a beneficiary account or CORE ID directly to the BIC route

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

### INTRA Transfers

Intra-bank transfers with BIC and flexible account numbers:

- `payto://intra/bic/account` (BIC and alphanumeric account number)

Example: `payto://intra/pingchb2/cb1958b39698a44bdae37f881e68dce073823a48a631?amount=usd:20`

- BIC is validated and converted to uppercase
- Account numbers can be alphanumeric strings (no length restriction)
- Supports all standard payment parameters (amount, message, etc.)

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

## PayQR national/interoperable QR payments

Use `payto://qr/{country}/{identifier}` with lowercase ISO country codes. PayQR is global; **Pay QR** is the website's label. Current mappings are BN tarusQR, KH KHQR, ID QRIS, LA LaoQR, MY DuitNow QR, MM MMQR, PH QR Ph, SG PayNow/SGQR, TH PromptPay/Thai QR and VN VietQR.

See [PayQR URI API, field coverage and validation limits](docs/PAYQR.md). A PayTo URI, national payment payload, QR image and payment-network connection are separate things. Generating a syntactically valid QR does not imply participation in or authorization to acquire transactions from a payment network. Unsupported national profiles fail closed.

PayQR support encodes/decodes URI and structured payment data only. National QR payload generation and rendering are owned by the PayTo website.

### Philippine QR Ph payment data

Canonical destination: `payto://qr/ph/{identifier}`; network `qr`, country `ph`, scheme `qrph`.
The identifier is an opaque issuer-provided value, not a verified bank account, mobile number or merchant ID.
The existing generic target stores optional `payment-mode=p2p|p2m` and `qr-type=static|dynamic` in its parameters.
`Payto.paymentMode` and `Payto.qrType` expose validated getters/setters and JSON object properties.
`payment-mode` is a PayTo extension; `mode` remains the existing pass presentation property.

Example (illustrative URI, not an official payment destination or native test vector):

```text
payto://qr/ph/Demo%40Issuer?amount=PHP%3A15.25&payment-mode=p2m&qr-type=dynamic&reference=Bill%201
```

PHP amounts use positive decimal strings with at most two decimal places and the existing 13-character amount limit. No floating-point conversion is used by the QR URI codec. Dynamic requests require an amount in this supported PayTo profile. Static data does not imply a recurring debit mandate. We preserve generic receiver-name/reference fields without claiming a verified native tag mapping. We do not impose participant-specific transaction limits or infer recipient requirements from another country.

**Native QR Ph payload encoding and decoding are not implemented:** researched public sources did not establish the Philippine account templates, routing identifiers and official conformance vectors. A PayTo URI is not a QR Ph payload accepted by banking apps. No generic EMV payload is classified as QR Ph merely from PH/PHP.

Architecture, when a verified native profile becomes available:

```text
PayTo URI → structured payment data → native encoder → payload string
scanned payload string → native decoder → structured data → PayTo URI
```

The native arrows above are currently unavailable for QR Ph. Libraries stop at data, never render QR images, scan cameras, enroll merchants, connect to InstaPay, transfer funds or check payment status. QR URI input is capped at 8192 characters; duplicate query keys, controls, malformed escaping and invalid amounts are rejected.

Sources: [BSP QR Ph](https://www.bsp.gov.ph/SitePages/MediaAndResearch/Multimedia_QRPh.aspx), [BSP P2P FAQ](https://www.bsp.gov.ph/Media_and_Research/Primers%20Faqs/QR_Ph_P2P_FAQs.pdf), [BSP P2M FAQ](https://www.bsp.gov.ph/Media_and_Research/Primers%20Faqs/QR_Ph_P2M_FAQs.pdf), [PayMongo MPM API](https://docs.paymongo.com/reference/generate-mpm-qr), [PayMongo QR Ph acceptance](https://docs.paymongo.com/docs/payment-acceptance-qr-ph). Provider API fields are evidence for supported payment concepts, not the national TLV layout.

### Indonesian QRIS payment data

Canonical URI: `payto://qr/id/{identifier}`. Network `qr`, country `id`, scheme `qris`, domestic currency `IDR`.
The path remains an opaque acquirer-issued identifier (`issuer` type). It is **not** relabeled NMID or Merchant PAN: the reviewed public material does not establish sufficient routing semantics for that mapping. Do not invent these provider-issued values.

```text
payto://qr/id/Demo?qr-type=static
payto://qr/id/Demo?amount=IDR%3A50000&qr-type=dynamic&reference=Bill%201
```

These illustrative links are not native QRIS payloads. Optional `qr-type=static|dynamic` uses the existing `qrType` property. Explicit static requests reject amount; dynamic requests require it. Unspecified type preserves a portable suggested amount without generating a native transaction. Amounts are positive IDR decimal strings, at most two fractional digits, capped at IDR 10,000,000 using integer minor-unit comparison. Decimal precision is the existing portable profile, not a claim that every provider accepts fractional rupiah. Generic `receiver-name` and `reference` remain portable metadata without a verified QRIS tag mapping. No static-to-dynamic payload conversion is implemented.

`inspectEmvMpm(payload)` provides bounded **raw ASCII EMV envelope inspection** in both libraries. It checks TLV boundaries, duplicate fields, nested template boundaries and CRC, then returns `fields` and `templates`. Its JSON shape matches across TypeScript and Dart (Dart uses `.toJson()`). It does not return a national scheme, NMID, Merchant PAN or PayTo target and is not a QRIS compliance validator. It rejects non-ASCII input and payloads over 4096 characters; nested unknown subfields stay raw. The official Midtrans example is a fixture with published CRC `A623`.

**Native QRIS encoding and semantic decoding remain unsupported.** Full authoritative routing/template requirements were not available in the reviewed public material. ASPI documents a specification request process. Neither a correct CRC nor ID/360 proves QRIS validity. No guessed national tags, transaction identifiers or provider credentials are generated. The website uses PayTo for this country and hides the native-format switch.

```text
PayTo URI ↔ structured portable QR data
provider payload → raw EMV inspection (no payment destination inference)
structured QRIS → native encoder → payload → website renderer [not implemented]
```

Libraries render no images, perform no scanning or network calls, register no merchants, issue no identifiers and perform no transfers, status checks or settlement. Static QR does not authorize recurring debits. CPM, QRIS TAP, Tuntas, cross-border routing/FX and provider connectivity are outside this implementation.

Sources: [Bank Indonesia QRIS](https://www.bi.go.id/id/fungsi-utama/sistem-pembayaran/ritel/kanal-layanan/QRIS/default.aspx), [ASPI QRIS modes](https://aspi-indonesia.or.id/standar-dan-layanan/qris/), [ASPI specification-request process, annual report p. 46](https://aspi-indonesia.or.id/files/2024/12/AR%20ASPI%202023-FA_all_rev.pdf), [Midtrans official dynamic example](https://docs.midtrans.com/docs/gopay-qris-pos-integration), [EMVCo QR specifications](https://www.emvco.com/emv-technologies/qr-codes/), [BI cross-border QRIS](https://www.bi.go.id/id/fungsi-utama/sistem-pembayaran/ritel/kanal-layanan/QRIS/QRIS-Antarnegara/default.aspx).


### Presentation formats and URI extensions

`Payto.formats` returns `['payto', 'epc']` for IBAN, or `['payto', '<scheme>']`
for supported Pay QR countries: `khqr`, `laoqr`, `duitnow`, `mmqr`, `paynow`,
`promptpay`, and `vietqr`. PayTo-only methods (including Brunei, QR Ph, and QRIS)
omit `formats` from object JSON; the getter returns `undefined`.
PayTo is always first and is the default. Capability metadata does not validate
whether the supplied fields are sufficient for a native payment format.

`reference`, `purpose`, and `information` are readable/writable PayTo query
extensions, also exposed in object JSON. Assign `null` to remove them. Unknown
query extensions remain preserved by the URI codec. `formats` is derived metadata,
not a query parameter; reading it never changes the PayTo link.

These libraries encode and decode **PayTo links only**. They do not generate or
parse EPC or national payment payloads, or render barcodes. Applications implement
those formats and validate their requirements separately.


**Validation coverage is partial:** all current Pay QR fields round-trip through
the parameter map, but dedicated field accessors/top-level JSON properties and
country-specific validation are not complete. See [field coverage and known
validation gaps](docs/PAYQR.md#field-coverage-and-validation-boundaries).
