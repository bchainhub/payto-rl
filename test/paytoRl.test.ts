import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import Payto from 'payto-rl';

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
	assert.is(payto.deadline, '1672531199');
	payto.deadline = '1672617599';
	assert.is(payto.deadline, '1672617599');
});

test('get and set donate', () => {
	const payto = new Payto('payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?donate=1');
	assert.is(payto.donate, '1');
	payto.donate = '0';
	assert.is(payto.donate, '0');
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
	const payto = new Payto('payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?amount=ctn:10.01&fiat=eur');
	const jsonObject = payto.toJSONObject();
	assert.equal(jsonObject, {
		address: 'cb7147879011ea207df5b35a24ca6f0859dcfb145999',
		amount: 'ctn:10.01',
		asset: 'ctn',
		fiat: 'eur',
		host: 'xcb',
		hostname: 'xcb',
		href: 'payto://xcb/cb7147879011ea207df5b35a24ca6f0859dcfb145999?amount=ctn:10.01&fiat=eur',
		network: 'xcb',
		pathname: '/cb7147879011ea207df5b35a24ca6f0859dcfb145999',
		protocol: 'payto:',
		search: '?amount=ctn:10.01&fiat=eur',
		value: 10.01
	});
});

test.run();
