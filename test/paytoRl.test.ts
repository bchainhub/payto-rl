import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import Payto from 'payto-rl';

const test = suite('Payto');

test('constructor with valid payto string', () => {
	const payto = new Payto('payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.1');
	assert.is(payto.href, 'payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.1');
});

test('constructor with invalid protocol', () => {
	assert.throws(() => {
		new Payto('http://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.1');
	}, /Invalid protocol, must be payto:/);
});

test('get and set address', () => {
	const payto = new Payto('payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
	assert.is(payto.address, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
	payto.address = '1BoatSLRHtKNngkdXEeobR76b53LETtpyT';
	assert.is(payto.address, '1BoatSLRHtKNngkdXEeobR76b53LETtpyT');
});

test('get and set amount', () => {
	const payto = new Payto('payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.1');
	assert.is(payto.amount, '0.1');
	payto.amount = '0.2';
	assert.is(payto.amount, '0.2');
});

test('get and set currency', () => {
	const payto = new Payto('payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=btc:0.1&fiat=usd');
	assert.equal(payto.currency, ['btc', 'usd']);
	payto.currency = [0.2, 'eth', 'eur'];
	assert.equal(payto.currency, ['eth', 'eur']);
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

test('get and set fiat', () => {
	const payto = new Payto('payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?fiat=usd');
	assert.is(payto.fiat, 'usd');
	payto.fiat = 'eur';
	assert.is(payto.fiat, 'eur');
});

test('toJSONObject', () => {
	const payto = new Payto('payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.1&fiat=usd');
	const jsonObject = payto.toJSONObject();
	assert.equal(jsonObject, {
		address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
		amount: '0.1',
		fiat: 'usd',
		host: 'btc',
		hostname: 'btc',
		href: 'payto://btc/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.1&fiat=usd',
		network: 'btc',
		pathname: '/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
		protocol: 'payto:',
		search: '?amount=0.1&fiat=usd',
		value: 0.1
	});
});

test.run();
