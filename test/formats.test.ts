import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { readFileSync } from 'node:fs';
import Payto from '../dist/index.js';
const test = suite('Presentation metadata and PayTo extensions');
const fixture = JSON.parse(readFileSync(new URL('./fixtures/payqr.json', import.meta.url), 'utf8'));
for (const sample of fixture.valid) {
	test(`formats for ${sample.uri}`, () => {
		const p = new Payto(sample.uri);
		const formats = ['bn', 'ph', 'id'].includes(sample.country) ? undefined : ['payto', sample.scheme];
		assert.equal(p.formats, formats);
		assert.equal(p.toJSONObject().formats, formats);
		assert.is(Object.hasOwn(p.toJSONObject(), 'formats'), !!formats);
		assert.is(p.toString(), sample.uri);
		assert.is(p.toJSON(), sample.uri);
	});
}
test('IBAN capabilities and extension roundtrip do not generate native data', () => {
	const p = new Payto('payto://iban/FR1420041010050500013M02606');
	assert.equal(p.formats, ['payto', 'epc']);
	p.formats!.push('khqr');
	assert.equal(p.formats, ['payto', 'epc']);
	p.reference = 'RF18539007547034';
	p.purpose = 'GDDS';
	p.information = 'Invoice / café & 1';
	const parsed = new Payto(p.toString());
	assert.is(parsed.reference, p.reference);
	assert.is(parsed.purpose, 'GDDS');
	assert.is(parsed.information, p.information);
	assert.equal(parsed.toJSONObject().formats, ['payto', 'epc']);
	assert.is(parsed.toJSONObject().purpose, 'GDDS');
	assert.is(parsed.toJSONObject().information, p.information);
	assert.ok(p.toString().startsWith('payto://iban/'));
	assert.not.ok(p.searchParams.has('formats'));
	parsed.purpose = null;
	parsed.information = null;
	assert.not.ok(parsed.searchParams.has('purpose'));
	assert.not.ok(parsed.searchParams.has('information'));
	assert.not.ok(Object.hasOwn(parsed.toJSONObject(), 'purpose'));
});
test('metadata updates with the URI and is absent for PayTo-only networks', () => {
	const p = new Payto('payto://iban/FR1420041010050500013M02606');
	p.hostname = 'xcb';
	assert.is(p.formats, undefined);
	assert.not.ok(Object.hasOwn(p.toJSONObject(), 'formats'));
});
test.run();
