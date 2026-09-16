import * as publicApi from "../dist/index.js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { readFileSync } from "node:fs";
import Payto, {
	payQrSchemes,
	parsePayQr,
	serializePayQr,
} from "../dist/index.js";
const fixture = JSON.parse(
	readFileSync(new URL("./fixtures/payqr.json", import.meta.url), "utf8"),
);
const test = suite("PayQR");
for (const sample of fixture.valid) {
	test(`${sample.country}: parse, serialization, JSON, getters, query and setters`, () => {
		const p = new Payto(sample.uri);
		assert.is(p.network, "qr");
		assert.is(p.country, sample.country);
		assert.is(p.scheme, sample.scheme);
		assert.is(p.identifier, sample.identifier);
		assert.is(p.address, sample.identifier);
		assert.is(
			p.identifierType,
			payQrSchemes[sample.country as keyof typeof payQrSchemes]
				.identifierTypes[0],
		);
		assert.is(p.toString(), sample.uri);
		assert.is(p.toJSON(), sample.uri);
		assert.is(p.toJSONObject().country, sample.country);
		assert.is(p.toJSONObject().scheme, sample.scheme);
		assert.is(p.toJSONObject().identifier, sample.identifier);
		p.country = sample.country.toUpperCase();
		p.identifier = sample.identifier;
		p.identifierType = p.identifierType!;
		p.reference = "invoice/1 & 2";
		p.message = "ຂອບໃຈ + thanks";
		p.receiverName = "José";
		p.searchParams.set("custom-note", "保留");
		const roundtrip = new Payto(p.toString());
		assert.is(roundtrip.reference, p.reference);
		assert.is(roundtrip.message, p.message);
		assert.is(roundtrip.receiverName, "José");
		assert.is(roundtrip.searchParams.get("custom-note"), "保留");
		assert.equal(
			parsePayQr(serializePayQr(parsePayQr(p.toString()))),
			parsePayQr(p.toString()),
		);
		assert.is(
			new Payto(
				sample.uri.replace(
					"/" + sample.country + "/",
					"/" + sample.country.toUpperCase() + "/",
				),
			).toString(),
			sample.uri,
		);
		assert.throws(() => {
			p.identifier = "https://bad.example";
		});
		assert.is(p.identifier, sample.identifier);
	});
}
for (const [index, uri] of fixture.invalid.entries()) {
	test(`reject malformed URI ${index}`, () => {
		assert.throws(() => parsePayQr(uri));
		assert.throws(() => new Payto(uri));
	});
}
test("exact Unicode identifier and escaping, canonical query ordering", () => {
	const uri = serializePayQr({
		country: "la",
		identifier: "ລາວ_É",
		parameters: { message: "A&B /?", reference: "#1" },
	});
	assert.is(parsePayQr(uri).identifier, "ລາວ_É");
	assert.ok(uri.includes("message=A%26B%20%2F%3F&reference=%231"));
	assert.throws(() => new Payto(" payto://qr/la/ABC"));
});
test("amount and currency profiles", () => {
	for (const [country, identifier, currency] of [
		["kh", "name@bank", "USD"],
		["id", "ABC", "IDR"],
		["my", "ABC", "MYR"],
		["mm", "123456789012345", "MMK"],
		["sg", "%2B6581234567", "SGD"],
		["th", "0066812345678", "THB"],
	]) {
		const p = new Payto(
			`payto://qr/${country}/${identifier}?amount=${currency}:12.34`,
		);
		assert.is(p.amount, `${currency}:12.34`);
		assert.is(p.currency[0], currency);
		assert.is(p.value, 12.34);
	}
});
test("identifier variants and setter transactionality", () => {
	const p = new Payto(
		"payto://qr/th/1234567890123?identifier-type=national-id",
	);
	assert.is(p.identifierType, "national-id");
	assert.throws(() => {
		p.identifierType = "mobile";
	});
	assert.is(p.identifierType, "national-id");
	assert.is(
		parsePayQr("payto://qr/th/123456789012345?identifier-type=ewallet")
			.identifierType,
		"ewallet",
	);
	p.searchParams.set("amount", "THB:-1");
	assert.throws(() => p.toString());
});
test("validated parameter setters are atomic", () => {
	const p = new Payto("payto://qr/my/MERCHANT01?amount=MYR:1");
	assert.throws(() => {
		p.amount = "MYR:-1";
	});
	assert.is(p.amount, "MYR:1");
	p.amount = "MYR:2.50";
	assert.is(new Payto(p.toString()).amount, "MYR:2.50");
	assert.throws(() => {
		p.message = "bad\nmessage";
	});
	assert.is(p.message, null);
	p.address = "MERCHANT02";
	assert.is(p.identifier, "MERCHANT02");
});

// Golden vectors generated independently by NBC's bakong-khqr 1.0.20 SDK.
test("Thai user input normalizes without losing leading zeros", () => {
	for (const identifier of ["0812345678", "+66812345678", "0066812345678"]) {
		const uri = serializePayQr({
			country: "th",
			identifier,
			parameters: { "receiver-name": "Test" },
		});
		assert.is(parsePayQr(uri).identifier, "0066812345678");
	}
});
test("public API only exposes data support, not national QR generation", () => {
	for (const name of [
		"generateNationalQr",
		"tryGenerateNationalQr",
		"payQrAdapters",
		"parseNationalQr",
		"encodeTLV",
		"calculateCRC16",
	])
		assert.not.ok(name in publicApi);
	for (const scheme of Object.values(payQrSchemes))
		assert.not.ok("supportsQrGeneration" in scheme);
});
test("QR Ph properties, atomic setters and input limit", () => {
	const p = new Payto(
		"payto://qr/ph/Demo?amount=PHP:15.25&payment-mode=p2p&qr-type=dynamic",
	);
	assert.is(p.paymentMode, "p2p");
	assert.is(p.qrType, "dynamic");
	assert.is(p.toJSONObject().paymentMode, "p2p");
	p.paymentMode = "p2m";
	assert.is(p.toJSONObject().paymentMode, "p2m");
	const before = p.href;
	assert.throws(() => {
		p.paymentMode = "unknown";
	});
	assert.is(p.href, before);
	p.qrType = null;
	assert.is(p.qrType, null);
	assert.throws(() => parsePayQr("payto://qr/ph/a?" + "x".repeat(8192)));
});
test.run();
