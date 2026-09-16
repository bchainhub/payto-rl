import { suite } from "uvu";
import * as assert from "uvu/assert";
import { readFileSync } from "node:fs";
import { inspectEmvMpm } from "../dist/index.js";
const fixture = JSON.parse(
	readFileSync(new URL("./fixtures/qris-emv.json", import.meta.url), "utf8"),
);
const test = suite("Raw EMV inspection (not QRIS validation)");
test("official participant example has independently published CRC and raw fields", () => {
	const result = inspectEmvMpm(fixture.payload);
	assert.equal(JSON.parse(JSON.stringify(result)), {
		fields: fixture.fields,
		templates: fixture.templates,
	});
	assert.not.ok("scheme" in result);
	assert.not.ok("identifier" in result);
	assert.is(result.fields["54"], "789000.00");
	assert.is(result.fields["63"], "A623");
});
for (const [i, value] of fixture.invalid.entries())
	test(`reject malformed envelope ${i}`, () =>
		assert.throws(() => inspectEmvMpm(value)));
test("bounded ASCII subset", () => {
	for (const value of [
		"",
		"x".repeat(4097),
		fixture.payload.replace("Test", "Tést"),
		"payto://qr/id/Demo",
	])
		assert.throws(() => inspectEmvMpm(value));
});
test.run();
