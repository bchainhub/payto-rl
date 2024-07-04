class Payto {
	private url: URL;

	constructor(paytoString: string) {
		this.url = new URL(paytoString);
		if (this.url.protocol !== 'payto:') {
			throw new Error('Invalid protocol, must be payto:');
		}
	}

	private getHostnameParts(array: string[], type: string | null, position: number = 2): string | null {
		if (type === null || array[1]?.toLowerCase() === type) {
			return array[position] || null;
		}
		return null;
	}

	private setHostnameParts(value: string | null, position: number = 2): void {
		const addressArray = this.pathname.split('/');
		if (value) {
			addressArray[position] = value;
		} else {
			addressArray.splice(position, 1);
		}
		this.pathname = '/' + addressArray.filter(part => part).join('/');
	}

	get address(): string | null {
		return this.getHostnameParts(this.pathname.split('/'), null, 1);
	}

	set address(value: string | null) {
		this.setHostnameParts(value, 1);
	}

	get amount(): string | null {
		return this.searchParams.get('amount');
	}

	set amount(value: string | null) {
		if (value) {
			this.searchParams.set('amount', value);
		} else {
			this.searchParams.delete('amount');
		}
	}

	get bic(): string | null {
		return this.getHostnameParts(this.pathname.split('/'), 'bic', 2);
	}

	set bic(value: string | null) {
		this.setHostnameParts(value, 2);
	}

	get currency(): [string | null, string | null] {
		const result: [string | null, string | null] = [null, null];
		const amountValue = this.searchParams.get('amount');
		const fiatValue = this.fiat;
		if (amountValue) {
			const amountArray = amountValue.split(':');
			if (amountArray[0] && isNaN(parseFloat(amountArray[0]))) {
				result[0] = amountArray[0];
			}
		}
		if (fiatValue) {
			result[1] = fiatValue;
		}
		return result;
	}

	set currency(value: [number?, string?, string?]) {
		const [amount, token, fiat] = value;
		if (fiat) this.fiat = fiat.toLowerCase();
		if (token) {
			this.amount = `${token}:${amount ?? ''}`;
		} else if (amount) {
			this.amount = `${amount}`;
		}
	}

	get deadline(): string | null {
		return this.searchParams.get('dl');
	}

	set deadline(value: string | null) {
		if (value) {
			this.searchParams.set('dl', value);
		} else {
			this.searchParams.delete('dl');
		}
	}

	get donate(): string | null {
		if (this.searchParams.has('donate')) {
			const donateValue = this.searchParams.get('donate');
			return donateValue !== null ? donateValue : '1';
		}
		return null;
	}

	set donate(value: string | null) {
		if (value === '0' || value === '1') {
			this.searchParams.set('donate', value);
		} else if (value) {
			this.searchParams.set('donate', '1');
		} else {
			this.searchParams.delete('donate');
		}
	}

	get fiat(): string | null {
		return this.searchParams.get('fiat')?.toLowerCase() || null;
	}

	set fiat(value: string | null) {
		if (value) {
			this.searchParams.set('fiat', value);
		} else {
			this.searchParams.delete('fiat');
		}
	}

	get hash(): string {
		return this.url.hash;
	}

	set hash(value: string) {
		this.url.hash = value;
	}

	get host(): string {
		return this.url.host;
	}

	set host(value: string) {
		this.url.host = value;
	}

	get hostname(): string {
		return this.url.hostname.toLowerCase();
	}

	set hostname(value: string) {
		this.url.hostname = value.toLowerCase();
	}

	get href(): string {
		return this.url.href;
	}

	set href(value: string) {
		this.url.href = value;
	}

	get iban(): string | null {
		return this.getHostnameParts(this.pathname.split('/'), 'iban', 2);
	}

	set iban(value: string | null) {
		this.setHostnameParts(value, 2);
	}

	get location(): string | null {
		return this.searchParams.get('loc');
	}

	set location(value: string | null) {
		if (value) {
			this.searchParams.set('loc', value);
		} else {
			this.searchParams.delete('loc');
		}
	}

	get message(): string | null {
		return this.searchParams.get('message');
	}

	set message(value: string | null) {
		if (value) {
			this.searchParams.set('message', value);
		} else {
			this.searchParams.delete('message');
		}
	}

	get network(): string {
		return this.url.hostname.toLowerCase();
	}

	set network(value: string) {
		this.url.hostname = value.toLowerCase();
	}

	get origin(): string | null {
		const origin = this.url.origin;
		return origin === 'null' || origin === '' ? null : origin;
	}

	get password(): string {
		return this.url.password;
	}

	set password(value: string) {
		this.url.password = value;
	}

	get pathname(): string {
		return this.url.pathname;
	}

	set pathname(value: string) {
		this.url.pathname = value;
	}

	get port(): string {
		return this.url.port;
	}

	set port(value: string) {
		this.url.port = value;
	}

	get protocol(): string {
		return this.url.protocol;
	}

	set protocol(value: string) {
		this.url.protocol = value;
	}

	get receiverName(): string | null {
		return this.searchParams.get('receiver-name');
	}

	set receiverName(value: string | null) {
		if (value) {
			this.searchParams.set('receiver-name', value);
		} else {
			this.searchParams.delete('receiver-name');
		}
	}

	get recurring(): string | null {
		return this.searchParams.get('rc')?.toLowerCase() || null;
	}

	set recurring(value: string | null) {
		if (value) {
			this.searchParams.set('rc', value);
		} else {
			this.searchParams.delete('rc');
		}
	}

	get route(): string | null {
		return this.getHostnameParts(this.pathname.split('/'), null, 3);
	}

	set route(value: string | null) {
		this.setHostnameParts(value, 3);
	}

	get routingNumber(): string | null {
		return this.getHostnameParts(this.pathname.split('/'), 'ach', 2);
	}

	set routingNumber(value: string | null) {
		this.setHostnameParts(value, 2);
	}

	get search(): string {
		return this.url.search;
	}

	set search(value: string) {
		this.url.search = value;
	}

	get searchParams(): URLSearchParams {
		return this.url.searchParams;
	}

	get split(): [string, string, boolean] | null {
		const splitValue = this.searchParams.get('split');
		if (splitValue) {
			const [amountPart, receiver] = splitValue.split('@');
			const [prefix, amount] = amountPart.split(':');
			return [receiver, amount, prefix === 'p'];
		}
		return null;
	}

	set split(value: [string, string, boolean] | null) {
		if (value) {
			const [receiver, amount, percentage] = value;
			const prefix = percentage ? 'p:' : '';
			this.searchParams.set('split', `${prefix}${amount}@${receiver}`);
		} else {
			this.searchParams.delete('split');
		}
	}

	get value(): number | null {
		const amount = this.searchParams.get('amount');
		if (amount) {
			const amountArray = amount.split(':');
			let amountParsed;
			if (amountArray[1]) {
				amountParsed = parseFloat(amountArray[1]);
			} else {
				amountParsed = parseFloat(amountArray[0]);
			}
			if (!isNaN(amountParsed)) {
				return amountParsed;
			}
		}
		return null;
	}

	set value(value: number | null) {
		if (value) {
			const amount = this.searchParams.get('amount');
			if (amount) {
				const amountArray = amount.split(':');
				if (amountArray[1]) {
					this.searchParams.set('amount', amountArray[0] + ':' + value);
				} else {
					this.searchParams.set('amount', value.toString());
				}
			}
		} else {
			this.searchParams.delete('amount');
		}
	}

	get username(): string {
		return this.url.username;
	}

	set username(value: string) {
		this.url.username = value;
	}

	toString(): string {
		return this.url.toString();
	}

	toJSON(): string {
		return this.url.toJSON();
	}

	toJSONObject(): object {
		const obj: { [key: string]: any } = {};
		if (this.port) obj.port = this.port;
		if (this.currency[0]) obj.currency = this.currency[0];
		if (this.currency[1]) obj.fiat = this.currency[1];
		if (this.amount) obj.amount = this.amount;
		if (this.address) obj.address = this.address;
		if (this.bic) obj.bic = this.bic;
		if (this.deadline) obj.deadline = this.deadline;
		if (this.donate) obj.donate = this.donate;
		if (this.hash) obj.hash = this.hash;
		if (this.host) obj.host = this.host;
		if (this.hostname) obj.hostname = this.hostname;
		if (this.href) obj.href = this.href;
		if (this.iban) obj.iban = this.iban;
		if (this.location) obj.location = this.location;
		if (this.message) obj.message = this.message;
		if (this.network) obj.network = this.network;
		if (this.origin) obj.origin = this.origin;
		if (this.password) obj.password = this.password;
		if (this.pathname) obj.pathname = this.pathname;
		if (this.protocol) obj.protocol = this.protocol;
		if (this.receiverName) obj.receiverName = this.receiverName;
		if (this.recurring) obj.recurring = this.recurring;
		if (this.route) obj.route = this.route;
		if (this.routingNumber) obj.routingNumber = this.routingNumber;
		if (this.search) obj.search = this.search;
		if (this.split) obj.split = this.split;
		if (this.username) obj.username = this.username;
		if (this.value) obj.value = this.value;
		return obj;
	}
}

export default Payto;
