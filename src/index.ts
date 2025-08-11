export type PaytoJSON = {
	accountAlias?: string | null;
	accountNumber?: number | null;
	address?: string | null;
	amount?: string | null;
	asset?: string | null;
	barcode?: string | null;
	bic?: string | null;
	colorBackground?: string | null;
	colorForeground?: string | null;
	currency?: [string | null, string | null];
	deadline?: number | null;
	donate?: boolean | null;
	fiat?: string | null;
	hash?: string;
	host?: string;
	hostname?: string;
	href?: string;
	iban?: string | null;
	item?: string | null;
	lang?: string | null;
	location?: string | null;
	message?: string | null;
	mode?: string | null;
	network?: string;
	organization?: string | null;
	origin?: string | null;
	password?: string;
	pathname?: string;
	port?: string;
	protocol?: string;
	receiverName?: string | null;
	recurring?: string | null;
	routingNumber?: number | null;
	rtl?: boolean | null;
	search?: string;
	split?: [string, string, boolean] | null;
	username?: string;
	value?: number | null;
	void?: string | null;
};

class Payto {
	/** Validates account numbers (7-14 digits) */
	private static readonly ACCOUNT_NUMBER_REGEX = /^(\d{7,14})$/;

	/** Validates BIC/SWIFT/ORIC codes */
	private static readonly BIC_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i;

	/** Validates email addresses */
	private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

	/** Validates geographic coordinates */
	private static readonly GEO_LOCATION_REGEX = /^(\+|-)?(?:90(?:\.0{1,9})?|(?:[0-9]|[1-8][0-9])(?:\.[0-9]{1,9})?),(\+|-)?(?:180(?:\.0{1,9})?|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:\.[0-9]{1,9})?)$/;

	/** Validates IBAN */
	private static readonly IBAN_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{12,30}$/i;

	/** Validates language/locale codes (e.g., 'en', 'en-US', 'en-us', 'fr-CA') */
	private static readonly LANG_REGEX = /^[a-z]{2}(-[a-zA-Z]{2})?$/;

	/** Validates Plus codes - only long format is supported */
	private static readonly PLUS_CODE_REGEX = /^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2,7}$/;

	/** Validates routing numbers (9 digits) */
	private static readonly ROUTING_NUMBER_REGEX = /^(\d{9})$/;

	/** Internal URL object */
	private url: URL;

	/** Creates a new Payto instance from a payto URL string */
	constructor(paytoString: string) {
		this.url = new URL(paytoString);
		if (this.url.protocol !== 'payto:') {
			throw new Error('Invalid protocol, must be payto:');
		}
	}

	/** Extracts parts from combined hostname and pathname */
	private getHostpathParts(type?: string, position = 1): string | null {
		const hostnamePlusPath = this.hostname + this.url.pathname;
		const array = hostnamePlusPath.split('/');
		if (!type || array[0]?.toLowerCase() === type) {
			return array[position] || null;
		}
		return null;
	}

	/** Extracts parts from pathname */
	private getPathParts(position = 1): string | null {
		const path = this.url.pathname;
		const array = path.split('/');
		return array[position] || null;
	}

	/** Updates parts in pathname */
	private setPathParts(value: string | null, position = 1): void {
		const addressArray = this.pathname.split('/');
		if (value) {
			addressArray[position] = value;
		} else {
			addressArray.splice(position, 1);
		}
		this.pathname = '/' + addressArray.filter(part => part).join('/');
	}

	/** Gets email alias for UPI/PIX payments */
	get accountAlias(): string | null {
		if (this.hostname === 'upi' || this.hostname === 'pix') {
			const alias = this.getPathParts();
			if (alias && Payto.EMAIL_REGEX.test(alias)) {
				return alias;
			}
		}
		return null;
	}

	/**
	 * Sets email alias for UPI/PIX payments
	 * @throws Error if email format is invalid
	 */
	set accountAlias(value: string | null) {
		if (value) {
			if (!Payto.EMAIL_REGEX.test(value)) {
				throw new Error('Invalid email address format');
			}
			this.setPathParts(value);
		} else {
			this.setPathParts(null);
		}
	}

	/** Gets account number for ACH payments */
	get accountNumber(): number | null {
		if (this.hostname === 'ach') {
			const parts = this.pathname.split('/');
			const accountStr = parts.length > 2 ? parts[2] : parts[1];
			if (accountStr && Payto.ACCOUNT_NUMBER_REGEX.test(accountStr)) {
				return parseInt(accountStr, 10);
			}
		}
		return null;
	}

	/**
	 * Sets account number for ACH payments
	 * @throws Error if format invalid or wrong hostname
	 */
	set accountNumber(value: number | null) {
		if (!this.hostname || this.hostname !== 'ach') {
			throw new Error('Invalid hostname, must be ach');
		}

		if (value !== null) {
			const accountStr = value.toString();
			if (!Payto.ACCOUNT_NUMBER_REGEX.test(accountStr)) {
				throw new Error('Invalid account number format');
			}
		}

		const parts = this.pathname.split('/');
		if (parts.length > 2) {
			if (!value) {
				this.setPathParts(null, 2);
				this.setPathParts(null, 1);
			} else {
				this.setPathParts(value?.toString() ?? null, 2);
			}
		} else if (parts.length > 1) {
			this.setPathParts(value?.toString() ?? null, 1);
		}
	}

	/** Gets payment address */
	get address(): string | null {
		return this.getPathParts();
	}

	/** Sets payment address */
	set address(value: string | null) {
		this.setPathParts(value);
	}

	/** Gets payment amount */
	get amount(): string | null {
		return this.searchParams.get('amount');
	}

	/** Sets payment amount */
	set amount(value: string | null) {
		if (value) {
			this.searchParams.set('amount', value);
		} else {
			this.searchParams.delete('amount');
		}
	}

	/** Gets asset type from currency */
	get asset(): string | null {
		return this.currency[0];
	}

	/** Sets asset type in currency */
	set asset(value: string | null) {
		if (value === null) {
			// Reset currency to null
			this.currency = [null];
		} else {
			this.currency = [value];
		}
	}

	/** Gets barcode format */
	get barcode(): string | null {
		return this.searchParams.get('barcode')?.toLowerCase() || null;
	}

	/** Sets barcode format */
	set barcode(value: string | null) {
		if (value) {
			this.searchParams.set('barcode', value);
		} else {
			this.searchParams.delete('barcode');
		}
	}

	/** Gets BIC/SWIFT code from BIC or IBAN path */
	get bic(): string | null {
		if (this.hostname === 'bic') {
			return this.getHostpathParts('bic', 1)?.toUpperCase() ?? null;
		} else if (this.hostname === 'iban') {
			if (this.pathname.length > 2) {
				return this.getHostpathParts('iban', 1)?.toUpperCase() ?? null;
			}
		}
		return null;
	}

	/**
	 * Sets BIC/SWIFT code
	 * @throws Error if BIC format invalid
	 */
	set bic(value: string | null) {
		if (value && !Payto.BIC_REGEX.test(value)) {
			throw new Error('Invalid BIC format');
		}
		if (this.hostname === 'bic') {
			this.setPathParts(value?.toUpperCase() ?? null, 1);
		} else if (this.hostname === 'iban') {
			if (this.pathname.length > 2) {
				this.setPathParts(value?.toUpperCase() ?? null, 1);
			} else if (this.pathname.length > 1) {
				const ibanStr = this.getHostpathParts('iban', 1);
				if (ibanStr) {
					this.setPathParts(ibanStr, 2);
					this.setPathParts(value?.toUpperCase() ?? null, 1);
				} else {
					this.setPathParts(value?.toUpperCase() ?? null, 1);
				}
			}
		}
	}

	/** Gets background color in hex format */
	get colorBackground(): string | null {
		return this.searchParams.get('color-b')?.toLowerCase() || null;
	}

	/**
	 * Sets background color in hex format
	 * @throws Error if color format invalid
	 */
	set colorBackground(value: string | null) {
		if (value && /[0-9a-fA-F]{6}/.test(value)) {
			this.searchParams.set('color-b', value.toLowerCase());
		} else {
			this.searchParams.delete('color-b');
		}
	}

	/** Gets foreground color in hex format */
	get colorForeground(): string | null {
		return this.searchParams.get('color-f')?.toLowerCase() || null;
	}

	/**
	 * Sets foreground color in hex format
	 * @throws Error if color format invalid
	 */
	set colorForeground(value: string | null) {
		if (value && /[0-9a-fA-F]{6}/.test(value)) {
			this.searchParams.set('color-f', value.toLowerCase());
		} else {
			this.searchParams.delete('color-f');
		}
	}

	/** Gets currency as [asset, fiat] tuple */
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

	/** Sets currency from [token, fiat, value] array */
	set currency(valueArray: Array<string | number | null | undefined>) {
		if (valueArray.length > 3) {
			throw new Error('Invalid currency array length');
		}
		const [token, fiat, value] = valueArray;
		const amountValue = this.searchParams.get('amount');
		let prevToken, prevValue;
		if (amountValue) {
			const amountArray = amountValue.split(':');
			if (amountArray[1]) {
				prevToken = amountArray[0];
				prevValue = amountArray[1];
			} else {
				prevValue = amountArray[0];
			}
		} else if (value === null) {
			prevValue = null;
		}
		if (fiat && typeof fiat === 'string') {
			this.fiat = fiat.toLowerCase();
		} else if (fiat === null) {
			this.fiat = null;
		}
		if (token) {
			this.amount = `${token}:${value || (prevValue || '')}`;
		} else if (token === null) {
			this.amount = `${value || prevValue ? ':' : ''}${value || (prevValue || '')}`;
		} else if (value) {
			this.amount = `${prevToken ? prevToken + ':' : ''}${value}`;
		}
	}

	/** Gets payment deadline as Unix timestamp or positive integer */
	get deadline(): number | null {
		const dl = this.searchParams.get('dl');
		if (dl !== null) {
			const timestamp = parseInt(dl, 10);
			if (!isNaN(timestamp) && timestamp >= 0) {
				return timestamp;
			}
		}
		return null;
	}

	/**
	 * Sets payment deadline as Unix timestamp
	 * @throws Error if deadline format invalid
	 */
	set deadline(value: number | null) {
		if (value !== null) {
			if (!Number.isInteger(value) || value < 0) {
				throw new Error('Invalid deadline format. Must be a positive integer.');
			}
			this.searchParams.set('dl', value.toString());
		} else {
			this.searchParams.delete('dl');
		}
	}

	/** Gets donation flag */
	get donate(): boolean | null {
		if (this.searchParams.has('donate')) {
			const donateValue = this.searchParams.get('donate');
			return donateValue !== null ? (donateValue === '1' ? true : (donateValue === '0' ? false : null)) : null;
		}
		return null;
	}

	/** Sets donation flag */
	set donate(value: boolean | null) {
		if (value === true) {
			this.searchParams.set('donate', '1');
		} else {
			this.searchParams.delete('donate');
		}
	}

	/** Gets fiat currency code */
	get fiat(): string | null {
		return this.searchParams.get('fiat')?.toLowerCase() || null;
	}

	/** Sets fiat currency code */
	set fiat(value: string | null) {
		if (value) {
			this.searchParams.set('fiat', value);
		} else {
			this.searchParams.delete('fiat');
		}
	}

	/**
	 * Gets URL hash
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/hash
	 */
	get hash(): string {
		return this.url.hash;
	}

	/**
	 * Sets URL hash
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/hash
	 */
	set hash(value: string) {
		this.url.hash = value;
	}

	/**
	 * Gets URL host
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/host
	 */
	get host(): string {
		return this.url.host;
	}

	/**
	 * Sets URL host
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/host
	 */
	set host(value: string) {
		this.url.host = value;
	}

	/**
	 * Gets URL hostname
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/hostname
	 */
	get hostname(): string {
		return this.url.hostname.toLowerCase();
	}

	/**
	 * Sets URL hostname
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/hostname
	 */
	set hostname(value: string) {
		this.url.hostname = value.toLowerCase();
	}

	/**
	 * Gets URL href
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/href
	 */
	get href(): string {
		return this.url.href;
	}

	/**
	 * Sets URL href
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/href
	 */
	set href(value: string) {
		this.url.href = value;
	}

	/** Gets IBAN from path */
	get iban(): string | null {
		if (this.hostname === 'iban') {
			const parts = this.pathname.split('/');
			const ibanStr = parts.length > 2 ? parts[2] : parts[1];
			return ibanStr && Payto.IBAN_REGEX.test(ibanStr) ? ibanStr.toUpperCase() : null;
		}
		return null;
	}

	/**
	 * Sets IBAN in path
	 * @throws Error if IBAN format invalid
	 */
	set iban(value: string | null) {
		if (value && !Payto.IBAN_REGEX.test(value)) {
			throw new Error('Invalid IBAN format');
		}
		if (this.hostname === 'iban') {
			const parts = this.pathname.split('/');
			if (parts.length > 2) {
				if (!value) {
					this.setPathParts(null, 2);
					this.setPathParts(null, 1);
				} else {
					this.setPathParts(value?.toUpperCase() ?? null, 2);
				}
			} else if (parts.length > 1) {
				this.setPathParts(value?.toUpperCase() ?? null, 1);
			}
		}
	}

	/** Gets item description (max 40 chars) */
	get item(): string | null {
		const item = this.searchParams.get('item');
		return item && item.length <= 40 ? item : null;
	}

	/** Sets item description (max 40 chars) */
	set item(value: string | null) {
		if (value !== null && value.length <= 40) {
			this.searchParams.set('item', value);
		} else {
			this.searchParams.delete('item');
		}
	}

	/** Gets location based on void type (geo or plus code) */
	get location(): string | null {
		const voidType = this.void;
		if (!voidType) {
			return null;
		}

		const value = this.searchParams.get('loc');
		if (!value) return null;

		if (voidType === 'geo') {
			return Payto.GEO_LOCATION_REGEX.test(value) ? value : null;
		}
		if (voidType === 'plus') {
			return Payto.PLUS_CODE_REGEX.test(value) ? value : null;
		}

		return value;
	}

	/**
	 * Sets location value
	 * @throws Error if void type not set or location format invalid
	 */
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

	/** Gets payment message */
	get message(): string | null {
		return this.searchParams.get('message');
	}

	/** Sets payment message */
	set message(value: string | null) {
		if (value) {
			this.searchParams.set('message', value);
		} else {
			this.searchParams.delete('message');
		}
	}

	/** Gets payment network */
	get network(): string {
		return this.url.hostname.toLowerCase();
	}

	/** Sets payment network */
	set network(value: string) {
		this.url.hostname = value.toLowerCase();
	}

	/** Gets organization name (max 25 chars) */
	get organization(): string | null {
		return this.searchParams.get('org');
	}

	/** Sets organization name (max 25 chars) */
	set organization(value: string | null) {
		if (value !== null && value.length <= 25) {
			this.searchParams.set('org', value);
		} else {
			this.searchParams.delete('org');
		}
	}

	/**
	 * Gets URL origin
	 * Simulates standard URL origin behavior for payto protocol
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/origin
	 */
	get origin(): string {
		// Reconstruct origin format: protocol//hostname[:port]
		const port = this.port ? `:${this.port}` : '';
		return `payto://${this.hostname}${port}`;
	}

	/**
	 * Gets URL password
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/password
	 */
	get password(): string {
		return this.url.password;
	}

	/**
	 * Sets URL password
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/password
	 */
	set password(value: string) {
		this.url.password = value;
	}

	/**
	 * Gets URL pathname
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname
	 */
	get pathname(): string {
		return this.url.pathname;
	}

	/**
	 * Sets URL pathname
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname
	 */
	set pathname(value: string) {
		this.url.pathname = value;
	}

	/**
	 * Gets URL port
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/port
	 */
	get port(): string {
		return this.url.port;
	}

	/**
	 * Sets URL port
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/port
	 */
	set port(value: string) {
		this.url.port = value;
	}

	/**
	 * Gets URL protocol
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/protocol
	 */
	get protocol(): string {
		return this.url.protocol;
	}

	/**
	 * Sets URL protocol
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/protocol
	 */
	set protocol(value: string) {
		this.url.protocol = value;
	}

	/** Gets receiver name */
	get receiverName(): string | null {
		return this.searchParams.get('receiver-name');
	}

	/** Sets receiver name */
	set receiverName(value: string | null) {
		if (value) {
			this.searchParams.set('receiver-name', value);
		} else {
			this.searchParams.delete('receiver-name');
		}
	}

	/** Gets recurring payment info */
	get recurring(): string | null {
		return this.searchParams.get('rc')?.toLowerCase() || null;
	}

	/** Sets recurring payment info */
	set recurring(value: string | null) {
		if (value) {
			this.searchParams.set('rc', value);
		} else {
			this.searchParams.delete('rc');
		}
	}

	/** Gets routing number for ACH payments */
	get routingNumber(): number | null {
		if (this.hostname === 'ach') {
			if (this.pathname.length > 2) {
				// Routing number is the first part or not present
				const routingNumberStr = this.getHostpathParts('ach', 1) ?? '';
				return Payto.ROUTING_NUMBER_REGEX.test(routingNumberStr) ? parseInt(routingNumberStr, 10) : null;
			}
			return null;
		}
		return null;
	}

	/**
	 * Sets routing number for ACH payments
	 * @throws Error if routing number format invalid
	 */
	set routingNumber(value: number | null) {
		if (value && !Payto.ROUTING_NUMBER_REGEX.test(value.toString())) {
			throw new Error('Invalid routing number format. Must be exactly 9 digits.');
		}
		if (this.pathname.length > 2) {
			this.setPathParts(value?.toString() ?? null, 1);
		} else if (this.pathname.length > 1) {
			const accountNumberStr = this.getHostpathParts('ach', 1);
			if (accountNumberStr) {
				this.setPathParts(accountNumberStr, 2);
				this.setPathParts(value?.toString() ?? null, 1);
			} else {
				this.setPathParts(value?.toString() ?? null, 1);
			}
		}
	}

	/** Gets RTL (right-to-left) flag */
	get rtl(): boolean | null {
		if (this.searchParams.has('rtl')) {
			const rtlValue = this.searchParams.get('rtl');
			return rtlValue !== null ? (rtlValue === '1' ? true : (rtlValue === '0' ? false : null)) : null;
		}
		return null;
	}

	/** Sets RTL (right-to-left) flag */
	set rtl(value: boolean | null) {
		if (value === true) {
			this.searchParams.set('rtl', '1');
		} else {
			this.searchParams.delete('rtl');
		}
	}

	/**
	 * Gets URL search string
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/search
	 */
	get search(): string {
		return this.url.search;
	}

	/**
	 * Sets URL search string
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/search
	 */
	set search(value: string) {
		this.url.search = value;
	}

	/** Gets URL search parameters */
	get searchParams(): URLSearchParams {
		return this.url.searchParams;
	}

	/** Gets payment split information as [receiver, amount, isPercentage] */
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

	/**
	 * Sets payment split information
	 * @throws Error if receiver or amount missing
	 */
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

	/** Gets swap type */
	get swap(): string | null {
		return this.searchParams.get('swap')?.toLowerCase() || null;
	}

	/** Sets swap type */
	set swap(value: string | null) {
		if (value) {
			this.searchParams.set('swap', value.toLowerCase());
		} else {
			this.searchParams.delete('swap');
		}
	}

	/**
	 * Gets URL username
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/username
	 */
	get username(): string {
		return this.url.username;
	}

	/**
	 * Sets URL username
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/username
	 */
	set username(value: string) {
		this.url.username = value;
	}

	/** Gets payment value from amount */
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

	/** Sets payment value in amount */
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

	/** Gets void type */
	get void(): string | null {
		if (this.hostname === 'void' && this.pathname.length > 1) {
			const parts = this.pathname.split('/');
			return parts[1]?.toLowerCase() || null;
		}
		return null;
	}

	/** Sets void type */
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

	/** Gets language/locale code */
	get lang(): string | null {
		return this.searchParams.get('lang')?.toLowerCase() || null;
	}

	/**
	 * Sets language/locale code
	 * @throws Error if language format invalid
	 */
	set lang(value: string | null) {
		if (value) {
			if (!Payto.LANG_REGEX.test(value)) {
				throw new Error('Invalid language format. Must be a valid 2-letter language code (e.g., "en", "en-US", "en-us", "fr-CA").');
			}
			this.searchParams.set('lang', value.toLowerCase());
		} else {
			this.searchParams.delete('lang');
		}
	}

	/** Gets preferred mode of Pass */
	get mode(): string | null {
		return this.searchParams.get('mode')?.toLowerCase() || null;
	}

	/** Sets preferred mode of Pass */
	set mode(value: string | null) {
		if (value) {
			this.searchParams.set('mode', value.toLowerCase());
		} else {
			this.searchParams.delete('mode');
		}
	}

	/** Converts to URL string */
	toString(): string {
		return this.url.toString();
	}

	/** Converts to JSON string */
	toJSON(): string {
		return this.url.toJSON();
	}

	/** Converts to PaytoJSON object with all properties */
	toJSONObject(): PaytoJSON {
		const obj: PaytoJSON = {};

		// URL properties
		if (this.port) obj.port = this.port;
		if (this.host) obj.host = this.host;
		if (this.hostname) obj.hostname = this.hostname;
		if (this.href) obj.href = this.href;
		if (this.origin) obj.origin = this.origin;
		if (this.password) obj.password = this.password;
		if (this.pathname) obj.pathname = this.pathname;
		if (this.protocol) obj.protocol = this.protocol;
		if (this.search) obj.search = this.search;
		if (this.username) obj.username = this.username;

		// PayTo-specific properties
		if (this.accountAlias) obj.accountAlias = this.accountAlias;
		if (this.accountNumber) obj.accountNumber = this.accountNumber;
		if (this.address) obj.address = this.address;
		if (this.amount) obj.amount = this.amount;
		if (this.asset) obj.asset = this.asset;
		if (this.barcode) obj.barcode = this.barcode;
		if (this.bic) obj.bic = this.bic;
		if (this.colorBackground) obj.colorBackground = this.colorBackground;
		if (this.colorForeground) obj.colorForeground = this.colorForeground;
		if (this.currency[0] || this.currency[1]) obj.currency = this.currency;
		if (this.deadline) obj.deadline = this.deadline;
		if (this.donate) obj.donate = this.donate;
		if (this.fiat) obj.fiat = this.fiat;
		if (this.hash) obj.hash = this.hash;
		if (this.iban) obj.iban = this.iban;
		if (this.item) obj.item = this.item;
		if (this.lang) obj.lang = this.lang;
		if (this.location) obj.location = this.location;
		if (this.message) obj.message = this.message;
		if (this.mode) obj.mode = this.mode;
		if (this.network) obj.network = this.network;
		if (this.organization) obj.organization = this.organization;
		if (this.receiverName) obj.receiverName = this.receiverName;
		if (this.recurring) obj.recurring = this.recurring;
		if (this.routingNumber) obj.routingNumber = this.routingNumber;
		if (this.rtl) obj.rtl = this.rtl;
		if (this.split) obj.split = this.split;
		if (this.value !== null) obj.value = this.value;
		if (this.void) obj.void = this.void;

		return obj;
	}
}

export default Payto;
