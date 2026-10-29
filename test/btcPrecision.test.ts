import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import Payto from '../dist/index.js';

const test = suite('BTC amount precision');
// Fresh random BIP173 witness program, generated for this regression only.
const address = 'bc1q2arlmu9m58k22htatp099kznd32pygqm9luxw0';
for (const amount of ['0.000123', '0.00000001', '0.00012345', '0.00009999', '1.23456789', '21000000.00000000', '0.00012300', '0.12345678', '0.10000000', '1.00000000', '0.00000000']) {
	for (const currency of ['btc', 'BTC']) {
		test(`${currency}:${amount} survives parsing, JSON, serialization and setters`, () => {
			const payto = new Payto(`payto://btc/${address}?amount=${currency}%3A${amount}&org=Precision%20Test&item=Test%20BTC&color-b=8539ef`);
			assert.is(new Payto(`payto://btc/${address}?amount=${currency}:${amount}`).amount, `${currency}:${amount}`);
			assert.is(payto.address, address);
			assert.is(payto.amount, `${currency}:${amount}`);
			assert.is(payto.value, Number(amount));
			assert.is(payto.currency[0], currency);
			assert.is(payto.toJSONObject().amount, `${currency}:${amount}`);
			assert.is(new Payto(payto.href).amount, `${currency}:${amount}`);
			payto.value = Number(amount);
			assert.is(new Payto(payto.href).value, Number(amount));
		});
	}
}
test.run();
