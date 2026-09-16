# PayQR data support

This library only encodes/decodes PayTo URIs and structured data, with validation and normalization. QR payload generation and rendering belong exclusively to the PayTo website.

## Portable URI contract

```text
payto://qr/{country}/{identifier}
```

The country is a lowercase ISO 3166-1 alpha-2 code and selects the default scheme. Do not add a scheme path segment, `scheme` query parameter, or an alternate national-scheme authority. Country and authority input are case-insensitive; serialization produces lowercase. Identifiers retain their exact case, leading zeros and Unicode; they are never trimmed, numerically converted or Unicode-normalized.

```text
payto://qr/la/ABC123
payto://qr/kh/john_smith%40devb?amount=USD%3A12.50
payto://qr/sg/%2B6581234567
payto://qr/th/0066812345678?amount=THB%3A12.50&receiver-name=Test
```

These are syntax examples, not verified destinations.

The supported URI profile has exactly two nonempty path components, no credentials, port or fragment. Reject extra segments, URLs as identifiers, control/whitespace characters, malformed percent encoding/UTF-8, duplicate query keys and dot segments before URL normalization. Unknown countries (including `br`, `hk` and `in` until registered) are rejected. The global design permits adding those countries without changing this contract.

Identifiers without a verified national format use a deliberately limited **issuer** envelope: 1–128 Unicode letters/digits or `_.@+-`. This is a portable opaque identifier, **not national account validation**. It may exclude legitimate issuer formats not yet researched. The UI discloses this distinction. Do not treat an accepted issuer identifier as a payable account.

Query values are percent-encoded; keys are sorted for deterministic serialization. Default `identifier-type` is omitted; nondefault types use `identifier-type`. Common properties are `amount=ISO4217:decimal`, `receiver-name`, `reference`, `message`, and the existing library's `org`. `currency` is not a separate query property. Amounts use strings, not floating-point conversion: positive, no exponent/sign/grouping, no leading zeros except `0.x`, at most two decimal digits and 13 value characters. KHR and VND use whole units in this profile. These are conservative supported-profile constraints, not a claim that every scheme shares every monetary limit. Empty currency metadata means unverified; amounts are rejected, not unrestricted. Unknown extension queries are preserved, subject to key syntax, a 512 UTF-16-unit value bound and no controls. Adapters reject extensions they cannot encode.

LaoQR uses `application-id` for the institution-supplied 16-character AID and `acquirer-id` for its six-digit IIN. The receiver ID alone cannot produce a routable LaoQR. The constructor applies the encoder’s ASCII receiver-ID restriction; the portable URI envelope continues accepting Unicode identifiers.

National-specific optional query fields currently validated include `acquirer-id`, `merchant-city`, `mcc`, and `qr-type`. KHQR uses `qr-currency=KHR|USD` for a reusable static QR with no amount (default KHR); if an amount is supplied, its currency must agree. MMQR uses the acquirer-supplied `scheme-id` reverse domain (maximum 32 ASCII characters) and `local-name` (1–25 Myanmar characters). VietQR uses `acquirer-id` for the six-digit receiving bank BIN. A dynamic request in the supported profile requires an amount. This rule does not assert that every national dynamic scheme requires an amount.


## API and extension points

TypeScript exports `PayQrCountry`, `PayQrScheme`, `PayQrTarget`, `payQrSchemes`, `parsePayQr`, `serializePayQr`, `validatePayQrIdentifier`, `validatePayQrParameters` from the existing package entry point. Existing `Payto` exposes `payQr`, `country`, `scheme`, `identifier`, `identifierType`, `reference`; setters exist for country, identifier, identifierType and reference. `address` aliases the decoded PayQR identifier. `toJSON()` remains a URI string; `toJSONObject()` adds the new fields. Common PayQR parameter setters are validated atomically. Low-level mutable URL/searchParams APIs are revalidated when reading a PayQR target or serializing.

```ts
import Payto, { parsePayQr, serializePayQr } from 'payto-rl';
const payment = new Payto('payto://qr/th/0066812345678');
payment.amount = 'THB:12.50';
payment.receiverName = 'Test';
const target = parsePayQr(payment.toString());
const canonicalUri = serializePayQr(target);
```

Dart exports `PayQrScheme`, `payQrSchemes` and immutable `PayQrTarget` through `flutter_paytorl.dart`. Use `PayQrTarget.parse(uri)`, the named-argument constructor, `toString()` and `toJson()`. Existing `Payto` has equivalent properties/setters; `toJson()` remains a string and `toJsonObject()` adds country/scheme/identifier/type/reference. No existing required JSON constructor arguments were changed.

```dart
final payment = Payto('payto://qr/kh/john_smith%40devb');
payment.amount = 'USD:12.50';
final target = PayQrTarget.parse(payment.toString());
final canonicalUri = target.toString();
final details = payment.toJsonObject().toJson();
```

To extend globally: add country/scheme metadata and a documented identifier/currency profile in each language; add a website country schema and the desired presentation grouping; implement and register national adapters in the website only; add matching contract fixtures and scheme vectors. No authority or URI redesign is needed. The same checked-in JSON fixtures in both libraries guard parity without imposing a cross-repository dependency on Dart tests.


## Field coverage and validation boundaries

All current Pay QR constructor fields can round-trip through the libraries' URI
parameter maps. This does **not** mean every field has a dedicated `Payto`
getter/setter, a top-level JSON property, or complete country-specific validation.

| Data | URI representation |
| --- | --- |
| Country, identifier | `payto://qr/{country}/{identifier}` path |
| Scheme | Derived from country; not a separate URI parameter |
| Identifier type | `identifier-type` (default type omitted) |
| Amount and currency | `amount=CURRENCY:value`; KH static currency uses `qr-currency` |
| Common details | `receiver-name`, `reference`, `message`, `org` |
| Routing and merchant identity | `acquirer-id`, `application-id`, `scheme-id`, `recipient-type`, `merchant-id`, `acquiring-bank`, `account-information` |
| Merchant details | `merchant-city`, `mcc`, `local-name`, `merchant-mobile`, `postal-code` |
| Additional details | `bill-number`, `store-label`, `terminal-label` |
| Request settings | `payment-mode`, `qr-type`, `amount-editable`, `expiry-date`, `creation-timestamp`, `expiration-timestamp` |

Use `Payto.payQr.parameters` or the parsed target's `parameters` for fields without
dedicated accessors. TypeScript updates can use `serializePayQr` with a copied
parameter map; Dart uses a new `PayQrTarget` with a copied map. Object JSON from
`Payto` does not flatten every parameter; keep the URI or target parameter map
when complete field preservation is needed.

Both libraries validate URI structure/escaping, supported identifiers, monetary
syntax/currencies, selected enums, field lengths and some country-specific rules.
Unknown extensions are preserved under the generic query constraints. Validation
is **not yet fully aligned** with the website: examples of additional website
checks include KH expiry after creation, Lao receiver-ID ASCII/length limits,
printable-ASCII merchant fields, and some field/country and static/amount
combinations. The two library implementations also have remaining differences
(for example, Lao merchant-city length handling). Native-generation prerequisites
remain application responsibilities; a parsed PayTo link does not prove that a
national barcode can be generated or that an account is registered.

## Format metadata and IBAN extensions

`Payto.formats` describes presentation capabilities, not implemented library
encoders and not validation of the current payment data.

| Payment method | `formats` in object JSON |
| --- | --- |
| IBAN | `['payto', 'epc']` |
| Cambodia | `['payto', 'khqr']` |
| Laos | `['payto', 'laoqr']` |
| Malaysia | `['payto', 'duitnow']` |
| Myanmar | `['payto', 'mmqr']` |
| Singapore | `['payto', 'paynow']` |
| Thailand | `['payto', 'promptpay']` |
| Vietnam | `['payto', 'vietqr']` |
| Brunei, Philippines, Indonesia, other PayTo-only methods | Omitted |

PayTo is first and is the application default. A PayTo-only getter returns
`undefined` in TypeScript or `null` in Dart, never `['payto']`. The metadata appears
in `toJSONObject()` (TypeScript) and `toJsonObject().toJson()` (Dart), not in URI
serialization and not automatically on the lower-level Pay QR target.

`reference`, `purpose` and `information` are readable/writable PayTo query
extensions and object JSON properties. Setting them to `null` removes them.
The libraries preserve IBAN extension values without applying the application's
EPC RF checksum, purpose-code or payload-length rules. EPC encoding/decoding and
national payload encoding/decoding are not library capabilities. The existing
`inspectEmvMpm` helper only inspects a raw EMV envelope; it does not decode a
national payment into a PayTo target.

The website's `/pass` endpoint accepts `design.qrFormat` with `payto`, `epc` or the
matching supported country scheme name. It defaults to PayTo when the format or
entire design object is omitted, for both JSON and form requests and both wallets.
This is an application API, not a library encoder. Payment links omit `format`;
shared PayPass presentation links use it only for a nondefault format.
