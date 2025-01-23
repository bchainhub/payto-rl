import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import Payto from '../dist/index.js';

const test = suite('Payto');

test('constructor with valid payto string', () => {
	const payto = new Payto('payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?amount=ctn:10.01&fiat=eur');
	assert.is(payto.href, 'payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?amount=ctn:10.01&fiat=eur');
});

test('constructor with invalid protocol', () => {
	assert.throws(() => {
		new Payto('http://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?amount=ctn:10.01&fiat=eur');
	}, /Invalid protocol, must be payto:/);
});

test('get and set address', () => {
	const payto = new Payto('payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999');
	assert.is(payto.address, 'cb7147879011ea207df5b35a24ca6f0859dcfb145999');
	payto.address = 'cb7147879011ea207df5b35a24ca6f0859dcfb145000';
	assert.is(payto.address, 'cb7147879011ea207df5b35a24ca6f0859dcfb145000');
});

test('get and set amount', () => {
	const payto = new Payto('payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?amount=ctn:10.01');
	assert.is(payto.amount, 'ctn:10.01');
	payto.amount = 'ctn:20.02';
	assert.is(payto.amount, 'ctn:20.02');
});

test('get and set currency', () => {
	const payto = new Payto('payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?amount=ctn:10.01&fiat=eur');
	assert.equal(payto.currency, ['ctn', 'eur']);
	payto.currency = ['xxx', 'usd', 20.02];
	assert.equal(payto.currency, ['xxx', 'usd']);
	payto.currency = ['yyy', 'czk'];
	assert.equal(payto.currency, ['yyy', 'czk']);
	// check if value is consistent
	assert.is(payto.value, 20.02);
});

test('get and set value', () => {
	const payto = new Payto('payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?amount=ctn:10.01&fiat=eur');
	assert.is(payto.value, 10.01);
	payto.value = 20.02;
	assert.is(payto.value, 20.02);
	// check if currency is consistent
	assert.equal(payto.currency, ['ctn', 'eur']);
});

test('get and set deadline', () => {
	const payto = new Payto('payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?dl=1672531199');
	assert.is(payto.deadline, 1672531199);
	payto.deadline = 1672617599;
	assert.is(payto.deadline, 1672617599);
});

test('get and set donate', () => {
	const payto = new Payto('payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?donate=1');
	assert.is(payto.donate, true);
	payto.donate = false;
	assert.is(payto.donate, null); // Should be null because donate is not set
	payto.donate = null;
	assert.is(payto.donate, null);
});

test('get and set asset', () => {
	const payto = new Payto('payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?amount=ctn:10.01&fiat=eur');
	assert.is(payto.asset, 'ctn');
	payto.asset = 'xxx';
	assert.is(payto.asset, 'xxx');
	// check if amount is consistent
	assert.is(payto.amount, 'xxx:10.01');
	// check if currency is consistent
	assert.equal(payto.currency, ['xxx', 'eur']);
});

test('get and set fiat', () => {
	const payto = new Payto('payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?fiat=usd');
	assert.is(payto.fiat, 'usd');
	payto.fiat = 'eur';
	assert.is(payto.fiat, 'eur');
});

test('toJSONObject', () => {
	const payto = new Payto('payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?amount=ctn:10.01&fiat=eur&color-f=001BEE');
	const jsonObject = payto.toJSONObject();
	assert.equal(jsonObject, {
		address: 'cb7147879011ea207df5b35a24ca6f0859dcfb145999',
		amount: 'ctn:10.01',
		asset: 'ctn',
		colorForeground: '001bee',
		currency: [
			"ctn",
			"eur"
		],
		fiat: 'eur',
		host: 'xcb',
		hostname: 'xcb',
		href: 'payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?amount=ctn:10.01&fiat=eur&color-f=001BEE',
		network: 'xcb',
		pathname: '/cb7147879011ea207df5b35a24ca6f0859dcfb145999',
		protocol: 'payto:',
		search: '?amount=ctn:10.01&fiat=eur&color-f=001BEE',
		value: 10.01,
        origin: "payto://xcb"
	});
});

test('get and set location with geo coordinates', () => {
	const payto = new Payto('payto://void/geo');
	payto.location = '51.5074,0.1278';
	assert.is(payto.location, '51.5074,0.1278');
	assert.throws(() => {
		payto.location = '91.0000,0.1278'; // Invalid latitude
	}, /Invalid geo location format/);
	assert.throws(() => {
		payto.location = '51.5074,181.0000'; // Invalid longitude
	}, /Invalid geo location format/);
});

test('get and set location with plus code', () => {
	const payto = new Payto('payto://void/plus');
	payto.location = '8FVC9G8V+R9';
	assert.is(payto.location, '8FVC9G8V+R9');
	assert.throws(() => {
		payto.location = 'INVALID+CODE';
	}, /Invalid plus code format/);
});

test('get and set location with custom void type', () => {
	const payto = new Payto('payto://void/custom');
	payto.location = 'any value';
	assert.is(payto.location, 'any value');
});

test('get and set void type', () => {
	const payto = new Payto('payto://void/geo');
	assert.is(payto.void, 'geo');
	payto.void = 'plus';
	assert.is(payto.void, 'plus');
	payto.void = null;
	assert.is(payto.void, null);
});

test('get and set colors', () => {
	const payto = new Payto('payto://xcb/address');
	payto.colorBackground = '00ff00';
	assert.is(payto.colorBackground, '00ff00');
	payto.colorForeground = 'ff0000';
	assert.is(payto.colorForeground, 'ff0000');
	// Invalid hex colors should be ignored
	payto.colorBackground = 'invalid';
	assert.is(payto.colorBackground, null);
});

test('get and set organization with length limit', () => {
	const payto = new Payto('payto://xcb/address');
	payto.organization = 'Valid Org Name';
	assert.is(payto.organization, 'Valid Org Name');
	payto.organization = 'This organization name is too long and should be ignored';
	assert.is(payto.organization, null);
});

test('get and set item with length limit', () => {
	const payto = new Payto('payto://xcb/address');
	payto.item = 'Valid Item Description';
	assert.is(payto.item, 'Valid Item Description');
	payto.item = 'This item description is way too long and should be ignored because it exceeds forty characters';
	assert.is(payto.item, null);
});

test('get and set split payment', () => {
	const payto = new Payto('payto://xcb/address');
	payto.split = ['receiver123', '50', true];  // 50% split
	assert.equal(payto.split, ['receiver123', '50', true]);
	payto.split = ['receiver456', '100', false];  // 100 unit split
	assert.equal(payto.split, ['receiver456', '100', false]);
	payto.split = null;
	assert.is(payto.split, null);
});

test('get and set swap', () => {
	const payto = new Payto('payto://xcb/address');
	payto.swap = 'btc';
	assert.is(payto.swap, 'btc');
	payto.swap = null;
	assert.is(payto.swap, null);
});

test('toJSONObject includes all properties', () => {
	const payto = new Payto('payto://xcb/address?amount=10&color-b=00ff00&color-f=ff0000&org=TestOrg&item=TestItem');
	const json = payto.toJSONObject();
	assert.ok(json.hasOwnProperty('amount'));
	assert.ok(json.hasOwnProperty('colorBackground'));
	assert.ok(json.hasOwnProperty('colorForeground'));
	assert.ok(json.hasOwnProperty('organization'));
	assert.ok(json.hasOwnProperty('item'));
});

test('get and set account alias for UPI', () => {
	const payto = new Payto('payto://upi/user@example.com');
	assert.is(payto.accountAlias, 'user@example.com');
	payto.accountAlias = 'newuser@example.com';
	assert.is(payto.accountAlias, 'newuser@example.com');
	assert.throws(() => {
		payto.accountAlias = 'invalid-email';
	}, /Invalid email address format/);
});

test('get and set account alias for PIX', () => {
	const payto = new Payto('payto://pix/user@example.com');
	assert.is(payto.accountAlias, 'user@example.com');
	payto.accountAlias = 'newuser@example.com';
	assert.is(payto.accountAlias, 'newuser@example.com');
	payto.accountAlias = null;
	assert.is(payto.accountAlias, null);
});

test('get and set account number for ACH', () => {
	const payto = new Payto('payto://ach/123456789/1234567');
	assert.is(payto.accountNumber, 1234567);
	payto.accountNumber = 12345678;
	assert.is(payto.accountNumber, 12345678);
	assert.throws(() => {
		payto.accountNumber = 123456; // Too short
	}, /Invalid account number format/);
	assert.throws(() => {
		payto.accountNumber = 123456789012345; // Too long
	}, /Invalid account number format/);
	payto.accountNumber = null;
	assert.is(payto.accountNumber, null);
});

test('get and set IBAN', () => {
	const payto = new Payto('payto://iban/ABC');
	payto.iban = 'DE89370400440532013000';
	assert.is(payto.iban, 'DE89370400440532013000');
	payto.iban = null;
	assert.is(payto.iban, null);
	assert.throws(() => {
		payto.iban = 'XXX';
	}, /Invalid IBAN format/);
});

test('get and set rtl', () => {
	const payto = new Payto('payto://xcb/address');
	payto.rtl = true;
	assert.is(payto.rtl, true);
	payto.rtl = null;
	assert.is(payto.rtl, null);
});

test('handle empty search params', () => {
	const payto = new Payto('payto://xcb/address');
	assert.is(payto.searchParams.toString(), '');
});

test('handle null values in currency', () => {
	const payto = new Payto('payto://xcb/address');
	payto.currency = [null, null];
	assert.equal(payto.currency, [null, null]);
});

test('validate complex URL components', () => {
	const payto = new Payto('payto://user:pass@test.com:8080/path?query=1#hash');
	assert.is(payto.username, 'user');
	assert.is(payto.password, 'pass');
	assert.is(payto.port, '8080');
	assert.is(payto.hash, '#hash');
});

test('handle setting URL components', () => {
	const payto = new Payto('payto://xcb/address');
	payto.username = 'user';
	payto.password = 'pass';
	payto.host = 'test.com:8080';
	assert.is(payto.href, 'payto://user:pass@test.com:8080/address');
});

test('handle invalid amount formats', () => {
	const payto = new Payto('payto://xcb/address');
	payto.amount = 'invalid:amount';
	assert.is(payto.value, null);
});

test('handle complex currency scenarios', () => {
	const payto = new Payto('payto://xcb/address');
	payto.currency = ['token', 'usd', 15.5];
	assert.equal(payto.currency, ['token', 'usd']);
	assert.is(payto.value, 15.5);
	assert.is(payto.amount, 'token:15.5');
});

test('validate routing number format', () => {
	const payto = new Payto('payto://ach/123456789/1234567');
	assert.throws(() => {
		payto.routingNumber = 12345678; // Invalid 8-digit number
	}, /Invalid routing number format/);
});

test('handle complex JSON object conversion', () => {
	const payto = new Payto('payto://xcb/address');
	payto.colorBackground = 'ff0000';
	payto.deadline = 1234567890;
	payto.donate = true;
	const json = payto.toJSONObject();
	assert.ok(json.colorBackground === 'ff0000');
	assert.ok(json.deadline === 1234567890);
	assert.ok(json.donate === true);
});

test('handle edge cases in void type', () => {
	const payto = new Payto('payto://void/custom');
	payto.void = 'geo';
	assert.is(payto.void, 'geo');
	payto.void = null;
	assert.is(payto.void, null);
});

test('validate organization name length', () => {
	const payto = new Payto('payto://xcb/address');
	const longName = 'This organization name is way too long and should be rejected';
	payto.organization = longName;
	assert.is(payto.organization, null);
});

test('handle complex split payment scenarios', () => {
	const payto = new Payto('payto://xcb/address');
	payto.split = ['receiver123', '50', true];
	assert.equal(payto.split, ['receiver123', '50', true]);
	payto.split = null;
	assert.is(payto.split, null);
});

test('validate search params manipulation', () => {
	const payto = new Payto('payto://xcb/address?custom=value');
	assert.is(payto.searchParams.get('custom'), 'value');
	payto.searchParams.set('new', 'param');
	assert.is(payto.searchParams.get('new'), 'param');
});

test('handle origin for payto protocol', () => {
	// Test with port
	const paytoWithPort = new Payto('payto://user:pass@test.com:8080/path');
	assert.is(paytoWithPort.origin, 'payto://test.com:8080');

	// Test without port
	const paytoNoPort = new Payto('payto://test.com/path');
	assert.is(paytoNoPort.origin, 'payto://test.com');

	// Test with subdomain
	const paytoSubdomain = new Payto('payto://sub.test.com:8080/path');
	assert.is(paytoSubdomain.origin, 'payto://sub.test.com:8080');
});

test('handle IBAN operations', () => {
	// Test IBAN with BIC
	const paytoWithBic = new Payto('payto://iban/DEUTDEFF/DE89370400440532013000');
	assert.is(paytoWithBic.iban, 'DE89370400440532013000');
	assert.is(paytoWithBic.bic, 'DEUTDEFF');

	// Test setting IBAN
	paytoWithBic.iban = 'GB29NWBK60161331926819';
	assert.is(paytoWithBic.iban, 'GB29NWBK60161331926819');

	// Test null IBAN
	paytoWithBic.iban = null;
	assert.is(paytoWithBic.iban, null);

	// Test invalid IBAN format
	assert.throws(() => {
		paytoWithBic.iban = 'invalid';
	}, /Invalid IBAN format/);
});

test('handle BIC operations', () => {
	// Test BIC direct
	const paytoBic = new Payto('payto://bic/DEUTDEFF500');
	assert.is(paytoBic.bic, 'DEUTDEFF500');

	// Test setting BIC
	paytoBic.bic = 'SOGEFRPP';
	assert.is(paytoBic.bic, 'SOGEFRPP');

	// Test null BIC
	paytoBic.bic = null;
	assert.is(paytoBic.bic, null);

	// Test invalid BIC format
	assert.throws(() => {
		paytoBic.bic = 'invalid';
	}, /Invalid BIC format/);
});

test('handle ACH operations', () => {
	// Test setting routing number
	const paytoAch = new Payto('payto://ach/123456789/1234567');
	paytoAch.routingNumber = 987654321;
	assert.is(paytoAch.routingNumber, 987654321);

	// Test invalid routing number
	assert.throws(() => {
		paytoAch.routingNumber = 12345;
	}, /Invalid routing number format/);

	// Test setting account number
	paytoAch.accountNumber = 7654321;
	assert.is(paytoAch.accountNumber, 7654321);

	// Test invalid hostname for account number
	const paytoInvalid = new Payto('payto://invalid/123456789');
	assert.throws(() => {
		paytoInvalid.accountNumber = 1234567;
	}, /Invalid hostname, must be ach/);
});

test('handle currency operations', () => {
	const payto = new Payto('payto://example.com');

	// Test setting currency with amount
	payto.currency = ['token', 'usd', 100];
	assert.equal(payto.currency, ['token', 'usd']);
	assert.is(payto.amount, 'token:100');

	// Test setting currency without amount
	payto.currency = ['newtoken', 'eur'];
	assert.equal(payto.currency, ['newtoken', 'eur']);

	// Test clearing currency
	payto.currency = [null, null];
	assert.equal(payto.currency, [null, null]);
});

test('handle location operations', () => {
	// Test geo location
	const paytoGeo = new Payto('payto://void/geo');
	paytoGeo.location = '51.5074,-0.1278';
	assert.is(paytoGeo.location, '51.5074,-0.1278');

	// Test plus code
	const paytoPlus = new Payto('payto://void/plus');
	paytoPlus.location = '8FVC9G8V+R9';
	assert.is(paytoPlus.location, '8FVC9G8V+R9');

	// Test invalid location without void type
	const paytoInvalid = new Payto('payto://example.com');
	assert.throws(() => {
		paytoInvalid.location = '51.5074,-0.1278';
	}, /Void type must be set/);
});

test('handle RTL and donate flags', () => {
	const payto = new Payto('payto://example.com');

	// Test RTL
	payto.rtl = true;
	assert.is(payto.rtl, true);
	payto.rtl = null;
	assert.is(payto.rtl, null);

	// Test donate
	payto.donate = true;
	assert.is(payto.donate, true);
	payto.donate = null;
	assert.is(payto.donate, null);
});

test('handle path parts operations', () => {
	const payto = new Payto('payto://example.com/part1/part2');

	// Test pathname parts
	assert.is(payto.pathname, '/part1/part2');

	// Test setting pathname
	payto.pathname = '/newpart/part2';
	assert.is(payto.pathname, '/newpart/part2');

	// Test clearing pathname
	payto.pathname = '/part2';
	assert.is(payto.pathname, '/part2');
});

test('handle complex JSON conversion', () => {
	const payto = new Payto('payto://example.com/address?custom=value&amount=10.5');
	const json = payto.toJSONObject();

	// Test standard properties
	assert.is(json.address, 'address');
	assert.is(json.amount, '10.5');

	// Test conversion with all possible fields
	payto.colorBackground = 'ff0000';
	payto.deadline = 1234567890;
	payto.donate = true;
	payto.rtl = true;
	payto.organization = 'Test Org';

	const fullJson = payto.toJSONObject();
	assert.ok(fullJson.colorBackground === 'ff0000');
	assert.ok(fullJson.deadline === 1234567890);
	assert.ok(fullJson.donate === true);
	assert.ok(fullJson.rtl === true);
	assert.ok(fullJson.organization === 'Test Org');
});

test.run();
