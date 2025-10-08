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
	payto.deadline = 22; // Should be deadline 22 minutes from now
	assert.is(payto.deadline, 22);
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

	// Test coordinates with 9 decimal places
	payto.location = '51.507400000,0.127800000';
	assert.is(payto.location, '51.507400000,0.127800000');

	// Test coordinates with mixed decimal places
	payto.location = '40.712800000,-74.006000000';
	assert.is(payto.location, '40.712800000,-74.006000000');

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

test('get and set mode', () => {
	const payto = new Payto('payto://xcb/address?mode=nfc');
	assert.is(payto.mode, 'nfc');
	payto.mode = 'qr';
	assert.is(payto.mode, 'qr');
	payto.mode = 'NFC';
	assert.is(payto.mode, 'nfc');
	payto.mode = null;
	assert.is(payto.mode, null);
});

test('mode case handling', () => {
	const payto = new Payto('payto://xcb/address');

	// Test case conversion
	payto.mode = 'NFC';
	assert.is(payto.mode, 'nfc');

	payto.mode = 'QR';
	assert.is(payto.mode, 'qr');

	payto.mode = 'Bluetooth';
	assert.is(payto.mode, 'bluetooth');
});

test('mode in toJSONObject', () => {
	const payto = new Payto('payto://xcb/address?mode=nfc');
	const json = payto.toJSONObject();
	assert.is(json.mode, 'nfc');

	payto.mode = null;
	const jsonWithoutMode = payto.toJSONObject();
	assert.is(jsonWithoutMode.mode, undefined);
});

test('mode with other parameters', () => {
	const payto = new Payto('payto://xcb/address?amount=10&mode=nfc&fiat=eur');
	assert.is(payto.mode, 'nfc');
	assert.is(payto.amount, '10');
	assert.is(payto.fiat, 'eur');

	payto.mode = 'qr';
	assert.is(payto.mode, 'qr');
	assert.is(payto.amount, '10');
	assert.is(payto.fiat, 'eur');
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

test('Payto - Error handling and edge cases', () => {
    // Test invalid protocol error
    assert.throws(() => {
        new Payto('http://example.com');
    }, /Invalid protocol, must be payto:/);

    // Test invalid BIC format error
    const payto = new Payto('payto://bic/INVALIDBIC');
    assert.throws(() => {
        payto.bic = 'INVALID';
    }, /Invalid BIC format/);

    // Test invalid IBAN format error
    const ibanPayto = new Payto('payto://iban/DE');
    assert.throws(() => {
        ibanPayto.iban = 'INVALID';
    }, /Invalid IBAN format/);

    // Test invalid routing number format
    const achPayto = new Payto('payto://ach/123456789/123456789');
    assert.throws(() => {
        achPayto.routingNumber = 12345;
    }, /Invalid routing number format/);

    // Test invalid account number format
    assert.throws(() => {
        achPayto.accountNumber = 123;
    }, /Invalid account number format/);

    // Test invalid deadline format
    const deadlinePayto = new Payto('payto://example');
    assert.throws(() => {
        deadlinePayto.deadline = -1;
    }, /Invalid deadline format/);

    // Test invalid location format for geo
    const geoPayto = new Payto('payto://void/geo');
    assert.throws(() => {
        geoPayto.location = 'invalid';
    }, /Invalid geo location format/);

    // Test invalid location format for plus code
    const plusPayto = new Payto('payto://void/plus');
    assert.throws(() => {
        plusPayto.location = 'invalid';
    }, /Invalid plus code format/);

    // Test setting location without void type
    const noVoidPayto = new Payto('payto://example');
    assert.throws(() => {
        noVoidPayto.location = '40.7128,-74.0060';
    }, /Void type must be set before setting location/);

    // Test invalid email format for account alias
    const upiPayto = new Payto('payto://upi');
    assert.throws(() => {
        upiPayto.accountAlias = 'invalid-email';
    }, /Invalid email address format/);

    // Test setting account number with wrong hostname
    const wrongHostPayto = new Payto('payto://example');
    assert.throws(() => {
        wrongHostPayto.accountNumber = 123456789;
    }, /Invalid hostname, must be ach/);
});

test('get and set lang', () => {
	const payto = new Payto('payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?lang=en');
	assert.is(payto.lang, 'en');
	payto.lang = 'fr';
	assert.is(payto.lang, 'fr');
	payto.lang = 'en-US';
	assert.is(payto.lang, 'en-us');
	payto.lang = 'fr-CA';
	assert.is(payto.lang, 'fr-ca');
	payto.lang = null;
	assert.is(payto.lang, null);
});

test('lang validation - valid formats', () => {
	const payto = new Payto('payto://xcb/address');

	// Test valid language codes (2 letters)
	payto.lang = 'en';
	assert.is(payto.lang, 'en');

	payto.lang = 'es';
	assert.is(payto.lang, 'es');

	payto.lang = 'en-US';
	assert.is(payto.lang, 'en-us');

	payto.lang = 'en-us';
	assert.is(payto.lang, 'en-us');

	payto.lang = 'fr-CA';
	assert.is(payto.lang, 'fr-ca');

	payto.lang = 'fr-ca';
	assert.is(payto.lang, 'fr-ca');

	payto.lang = 'zh-CN';
	assert.is(payto.lang, 'zh-cn');

	payto.lang = 'zh-cn';
	assert.is(payto.lang, 'zh-cn');

	payto.lang = 'pt-BR';
	assert.is(payto.lang, 'pt-br');

	payto.lang = 'pt-br';
	assert.is(payto.lang, 'pt-br');

	// Test mixed case region codes
	payto.lang = 'en-Us';
	assert.is(payto.lang, 'en-us');

	payto.lang = 'fr-Ca';
	assert.is(payto.lang, 'fr-ca');
});

test('lang validation - invalid formats', () => {
	const payto = new Payto('payto://xcb/address');

	// Test invalid language codes
	assert.throws(() => {
		payto.lang = 'invalid';
	}, /Invalid language format/);

	assert.throws(() => {
		payto.lang = 'e';
	}, /Invalid language format/);

	assert.throws(() => {
		payto.lang = 'eng';
	}, /Invalid language format/);

	assert.throws(() => {
		payto.lang = 'EN-US';
	}, /Invalid language format/);

	assert.throws(() => {
		payto.lang = 'en-USA';
	}, /Invalid language format/);

	assert.throws(() => {
		payto.lang = 'en-US-EXTRA';
	}, /Invalid language format/);

	assert.throws(() => {
		payto.lang = 'EN';
	}, /Invalid language format/);

	assert.throws(() => {
		payto.lang = 'En';
	}, /Invalid language format/);

	// Test 3-letter language codes (should be invalid)
	assert.throws(() => {
		payto.lang = 'fra';
	}, /Invalid language format/);

	assert.throws(() => {
		payto.lang = 'spa';
	}, /Invalid language format/);
});

test('lang case handling', () => {
	const payto = new Payto('payto://xcb/address?lang=en-US');
	assert.is(payto.lang, 'en-us');

	payto.lang = 'fr-CA';
	assert.is(payto.lang, 'fr-ca');

	payto.lang = 'en-us';
	assert.is(payto.lang, 'en-us');

	// Test that invalid case formats are rejected
	assert.throws(() => {
		payto.lang = 'EN-US';
	}, /Invalid language format/);

	assert.throws(() => {
		payto.lang = 'EN';
	}, /Invalid language format/);
});

test('lang in toJSONObject', () => {
	const payto = new Payto('payto://xcb/address?lang=en-US');
	const json = payto.toJSONObject();
	assert.is(json.lang, 'en-us');

	payto.lang = null;
	const jsonWithoutLang = payto.toJSONObject();
	assert.is(jsonWithoutLang.lang, undefined);
});

test('lang with other parameters', () => {
	const payto = new Payto('payto://xcb/address?amount=10&lang=fr&fiat=eur');
	assert.is(payto.lang, 'fr');
	assert.is(payto.amount, '10');
	assert.is(payto.fiat, 'eur');

	payto.lang = 'es';
	assert.is(payto.lang, 'es');
	assert.is(payto.amount, '10');
	assert.is(payto.fiat, 'eur');
});

test('INTRA transfer - get BIC and account number', () => {
	const payto = new Payto('payto://intra/pingchb2/cb1958b39698a44bdae37f881e68dce073823a48a631?amount=usd:20');
	assert.is(payto.bic, 'PINGCHB2');
	assert.is(payto.accountNumber, 'cb1958b39698a44bdae37f881e68dce073823a48a631');
	assert.is(payto.amount, 'usd:20');
	assert.is(payto.hostname, 'intra');
});

test('INTRA transfer - set BIC and account number', () => {
	const payto = new Payto('payto://intra/deutdeff/account123');
	assert.is(payto.bic, 'DEUTDEFF');
	assert.is(payto.accountNumber, 'account123');

	// Update BIC
	payto.bic = 'sogefrpp';
	assert.is(payto.bic, 'SOGEFRPP');

	// Update account number
	payto.accountNumber = 'newaccount456';
	assert.is(payto.accountNumber, 'newaccount456');
});

test('INTRA transfer - alphanumeric account numbers', () => {
	const payto = new Payto('payto://intra/pingchb2/cb1958b39698a44bdae37f881e68dce073823a48a631');

	// INTRA should accept alphanumeric account numbers
	assert.is(payto.accountNumber, 'cb1958b39698a44bdae37f881e68dce073823a48a631');

	// Test setting various account number formats
	payto.accountNumber = 'abc123xyz';
	assert.is(payto.accountNumber, 'abc123xyz');

	payto.accountNumber = '1234567890';
	assert.is(payto.accountNumber, '1234567890');

	payto.accountNumber = 'ACCOUNT-WITH-DASHES';
	assert.is(payto.accountNumber, 'ACCOUNT-WITH-DASHES');
});

test('INTRA transfer - with amount and currency', () => {
	const payto = new Payto('payto://intra/pingchb2/cb1958b39698a44bdae37f881e68dce073823a48a631?amount=usd:20');
	assert.equal(payto.currency, ['usd', null]);
	assert.is(payto.value, 20);
	assert.is(payto.asset, 'usd');

	// Update amount
	payto.value = 50;
	assert.is(payto.amount, 'usd:50');
	assert.is(payto.value, 50);
});

test('INTRA transfer - toJSONObject', () => {
	const payto = new Payto('payto://intra/pingchb2/cb1958b39698a44bdae37f881e68dce073823a48a631?amount=usd:20');
	const json = payto.toJSONObject();

	assert.is(json.hostname, 'intra');
	assert.is(json.bic, 'PINGCHB2');
	assert.is(json.accountNumber, 'cb1958b39698a44bdae37f881e68dce073823a48a631');
	assert.is(json.amount, 'usd:20');
	assert.is(json.value, 20);
	assert.equal(json.currency, ['usd', null]);
});

test('INTRA transfer - invalid BIC format', () => {
	const payto = new Payto('payto://intra/validbic/account123');

	assert.throws(() => {
		payto.bic = 'INVALID';
	}, /Invalid BIC format/);
});

test('INTRA transfer - account number variations', () => {
	const payto = new Payto('payto://intra/deutdeff/acc1');

	// Test short account number
	payto.accountNumber = 'a1';
	assert.is(payto.accountNumber, 'a1');

	// Test long account number
	payto.accountNumber = 'verylongaccountnumber1234567890abcdefghijklmnop';
	assert.is(payto.accountNumber, 'verylongaccountnumber1234567890abcdefghijklmnop');

	// Test null account number
	payto.accountNumber = null;
	assert.is(payto.accountNumber, null);
});

test('INTRA transfer - setting account number with wrong hostname', () => {
	const payto = new Payto('payto://xcb/address');

	assert.throws(() => {
		payto.accountNumber = 'account123';
	}, /Invalid hostname, must be ach or intra/);
});

test('INTRA transfer - complete example', () => {
	// Create a complete INTRA transfer
	const payto = new Payto('payto://intra/pingchb2/cb1958b39698a44bdae37f881e68dce073823a48a631');

	// Set payment details
	payto.amount = 'usd:20';
	payto.message = 'Transfer to savings';
	payto.receiverName = 'John Doe';

	// Verify all properties
	assert.is(payto.bic, 'PINGCHB2');
	assert.is(payto.accountNumber, 'cb1958b39698a44bdae37f881e68dce073823a48a631');
	assert.is(payto.amount, 'usd:20');
	assert.is(payto.value, 20);
	assert.is(payto.message, 'Transfer to savings');
	assert.is(payto.receiverName, 'John Doe');

	// Verify the URL string
	assert.ok(payto.toString().includes('payto://intra/pingchb2/cb1958b39698a44bdae37f881e68dce073823a48a631'));
});

test.run();
