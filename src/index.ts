class Payto {
	private static readonly BIC_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i;
	private static readonly ROUTING_NUMBER_REGEX = /^(\d{9})$/;
	private static readonly UNIX_TIMESTAMP_REGEX = /^\d+$/;
	private static readonly ACCOUNT_NUMBER_REGEX = /^(\d{7,14})$/;
	private static readonly PLUS_CODE_REGEX = /^[23456789CFGHJMPQRVWX]{2,8}\+[23456789CFGHJMPQRVWX]{2,7}$/;
	private static readonly GEO_LOCATION_REGEX = /^(\+|-)?(?:90(?:\.0{1,6})?|(?:[0-9]|[1-8][0-9])(?:\.[0-9]{1,6})?),(\+|-)?(?:180(?:\.0{1,6})?|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:\.[0-9]{1,6})?)$/;

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

	get accountNumber(): number | null {
		if (this.pathname.split('/').length > 1) {
			const accountStr = this.pathname.split('/')[1];
			if (Payto.ACCOUNT_NUMBER_REGEX.test(accountStr)) {
				return parseInt(accountStr, 10);
			}
		}
		return null;
	}

	set accountNumber(value: number | null) {
		if (value !== null) {
			const accountStr = value.toString();
			if (!Payto.ACCOUNT_NUMBER_REGEX.test(accountStr)) {
				throw new Error('Invalid account number format. Must be 7-14 digits.');
			}
			this.pathname = '/' + accountStr;
		} else {
			this.pathname = '/';
		}
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
			this.searchParams.set('amount', value.toString());
		} else {
			this.searchParams.delete('amount');
		}
	}

	get asset(): string | null {
		return this.currency[0];
	}

	set asset(value: string | undefined) {
		this.currency = [value];
	}

	get barcode(): string | null {
		return this.searchParams.get('barcode')?.toLowerCase() || null;
	}

	set barcode(value: string | null) {
		if (value) {
			this.searchParams.set('barcode', value);
		} else {
			this.searchParams.delete('barcode');
		}
	}

	get bic(): string | null {
		const bicStr = this.getHostnameParts(this.pathname.split('/'), 'bic', 2)?.toUpperCase();
		return bicStr as string | null;
	}

	set bic(value: string | null) {
		if (value && !Payto.BIC_REGEX.test(value)) {
			throw new Error('Invalid BIC format');
		}
		this.setHostnameParts(value?.toUpperCase() ?? null, 2);
	}

	get colorBackground(): string | null {
		return this.searchParams.get('color-b')?.toLowerCase() || null;
	}

	set colorBackground(value: string | null) {
		if (value && /[0-9a-fA-F]{6}/.test(value)) {
			this.searchParams.set('color-b', value.toLowerCase());
		} else {
			this.searchParams.delete('color-b');
		}
	}

	get colorForeground(): string | null {
		return this.searchParams.get('color-f')?.toLowerCase() || null;
	}

	set colorForeground(value: string | null) {
		if (value && /[0-9a-fA-F]{6}/.test(value)) {
			this.searchParams.set('color-f', value.toLowerCase());
		} else {
			this.searchParams.delete('color-f');
		}
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

	set currency(value: [string?, string?, number?]) {
		const [token, fiat, amount] = value;
		const amountValue = this.searchParams.get('amount');
		let oldToken, oldValue;
		if (amountValue) {
			const amountArray = amountValue.split(':');
			if (amountArray[1]) {
				oldToken = amountArray[0];
				oldValue = amountArray[1];
			} else {
				oldValue = amountArray[0];
			}
		}
		if (fiat) this.fiat = fiat.toLowerCase();
		if (token) {
			this.amount = `${token}:${amount || (oldValue || '')}`;
		} else if (amount) {
			this.amount = `${oldToken ? oldToken + ':' : ''}${amount}`;
		}
	}

	get deadline(): number | null {
		const dl = this.searchParams.get('dl');
		if (dl !== null && Payto.UNIX_TIMESTAMP_REGEX.test(dl)) {
			const timestamp = parseInt(dl, 10);
			return timestamp >= 0 ? timestamp : null;
		}
		return null;
	}

	set deadline(value: number | null) {
		if (value !== null) {
			if (!Number.isInteger(value) || value < 0 || !Payto.UNIX_TIMESTAMP_REGEX.test(value.toString())) {
				throw new Error('Invalid deadline format. Must be a positive integer (Unix timestamp).');
			}
			this.searchParams.set('dl', value.toString());
		} else {
			this.searchParams.delete('dl');
		}
	}

	get donate(): boolean | null {
		if (this.searchParams.has('donate')) {
			const donateValue = this.searchParams.get('donate');
			return donateValue !== null ? (donateValue === '1' ? true : (donateValue === '0' ? false : null)) : null;
		}
		return null;
	}

	set donate(value: boolean | null) {
		if (value === true || value === false) {
			this.searchParams.set('donate', value ? '1' : '0');
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

	get item(): string | null {
		return this.searchParams.get('item');
	}

	set item(value: string | null) {
		if (value !== null && value.length <= 40) {
			this.searchParams.set('item', value);
		} else {
			this.searchParams.delete('item');
		}
	}

	get location(): string | null {
		return this.searchParams.get('loc') as string | null;
	}

	set location(value: string | null) {
		if (value === null) {
			this.searchParams.delete('loc');
			return;
		}

		const voidType = this.void;
		if (!voidType) {
            throw new Error('Void type must be set before setting location');
        }

		if (voidType === 'geo') {
			if (!Payto.GEO_LOCATION_REGEX.test(value.toString())) {
				throw new Error('Invalid geo location format. Must be "latitude,longitude" with valid coordinates.');
			}
		} else if (voidType === 'plus') {
			if (!Payto.PLUS_CODE_REGEX.test(value.toString())) {
				throw new Error('Invalid plus code format.');
			}
		}

		this.searchParams.set('loc', value.toString());
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

	get organization(): string | null {
		return this.searchParams.get('org');
	}

	set organization(value: string | null) {
		if (value !== null && value.length <= 25) {
			this.searchParams.set('org', value);
		} else {
			this.searchParams.delete('org');
		}
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

	get routingNumber(): number | null {
		const routingNumberStr = this.getHostnameParts(this.pathname.split('/'), 'ach', 2);
		return routingNumberStr !== null ? parseInt(routingNumberStr, 10) : null;
	}

	set routingNumber(value: number | null) {
		if (value !== null && !Payto.ROUTING_NUMBER_REGEX.test(value.toString())) {
			throw new Error('Invalid routing number format. Must be exactly 9 digits.');
		}
		const routingNumberStr = value !== null ? value.toString() : null;
		this.setHostnameParts(routingNumberStr, 2);
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
			if (!receiver || !amountPart) return null;

			const isPercentage = amountPart.startsWith('p:');
			const amount = isPercentage ? amountPart.slice(2) : amountPart;

			return [receiver, amount, isPercentage];
		}
		return null;
	}

	set split(value: [string, string, boolean] | null) {
		if (value === null) {
			this.searchParams.delete('split');
			return;
		}

		const [receiver, amount, percentage] = value;
		if (!receiver || !amount) {
			throw new Error('Split requires both receiver and amount');
		}

		const prefix = percentage ? 'p:' : '';
		this.searchParams.set('split', `${prefix}${amount}@${receiver}`);
	}

	get swap(): string | null {
		return this.searchParams.get('swap')?.toLowerCase() || null;
	}

	set swap(value: string | null) {
		if (value) {
			this.searchParams.set('swap', value.toLowerCase());
		} else {
			this.searchParams.delete('swap');
		}
	}

	get username(): string {
		return this.url.username;
	}

	set username(value: string) {
		this.url.username = value;
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
		if (value === null) {
			return;
		}

		const amount = this.searchParams.get('amount');
		if (amount) {
			const amountArray = amount.split(':');
			if (amountArray[1]) {
				this.searchParams.set('amount', `${amountArray[0]}:${value}`);
			} else {
				this.searchParams.set('amount', value.toString());
			}
		} else {
			this.searchParams.set('amount', value.toString());
		}
	}

	get void(): string | null {
		if (this.hostname === 'void' && this.pathname.length > 1) {
			const parts = this.pathname.split('/');
			return parts[1]?.toLowerCase() || null;
		}
		return null;
	}

	set void(value: string | null) {
		if (value) {
			this.hostname = 'void';
			this.pathname = '/' + value.toLowerCase();
		} else {
			if (this.hostname === 'void') {
				this.pathname = '/';
			}
		}
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
		if (this.currency[0]) obj.asset = this.currency[0];
		if (this.currency[1]) obj.fiat = this.currency[1];
		if (this.accountNumber) obj.accountNumber = this.accountNumber;
		if (this.amount) obj.amount = this.amount;
		if (this.address) obj.address = this.address;
		if (this.barcode) obj.barcode = this.barcode;
		if (this.bic) obj.bic = this.bic;
		if (this.colorBackground) obj.colorBackground = this.colorBackground;
		if (this.colorForeground) obj.colorForeground = this.colorForeground;
		if (this.deadline) obj.deadline = this.deadline;
		if (this.donate) obj.donate = this.donate;
		if (this.hash) obj.hash = this.hash;
		if (this.host) obj.host = this.host;
		if (this.hostname) obj.hostname = this.hostname;
		if (this.href) obj.href = this.href;
		if (this.iban) obj.iban = this.iban;
		if (this.item) obj.item = this.item
		if (this.location) obj.location = this.location;
		if (this.message) obj.message = this.message;
		if (this.network) obj.network = this.network;
		if (this.origin) obj.origin = this.origin;
		if (this.organization) obj.organization = this.organization;
		if (this.password) obj.password = this.password;
		if (this.pathname) obj.pathname = this.pathname;
		if (this.protocol) obj.protocol = this.protocol;
		if (this.receiverName) obj.receiverName = this.receiverName;
		if (this.recurring) obj.recurring = this.recurring;
		if (this.route) obj.route = this.route;
		if (this.routingNumber) obj.routingNumber = this.routingNumber;
		if (this.search) obj.search = this.search;
		if (this.split) obj.split = this.split;
		if (this.swap) obj.swap = this.swap;
		if (this.username) obj.username = this.username;
		if (this.value) obj.value = this.value;
		if (this.void) obj.void = this.void;
		return obj;
	}
}

export default Payto;
