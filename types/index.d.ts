declare class Payto {
	private url: URL;

	constructor(paytoString: string);

	private getHostnameParts(array: string[], type: string | null, position?: number): string | null;
	private setHostnameParts(value: string | null, position?: number): void;

	get address(): string | null;
	set address(value: string | null);

	get amount(): string | null;
	set amount(value: string | null);

	get asset(): string | null;
	set asset(value: string | null);

	get bic(): string | null;
	set bic(value: string | null);

	get currency(): [string, string?, string?];
	set currency(value: [string?, string?, number?]);

	get deadline(): string | null;
	set deadline(value: string | null);

	get donate(): boolean;
	set donate(value: boolean);

	get fiat(): string | null;
	set fiat(value: string | null);

	get hash(): string;
	set hash(value: string);

	get host(): string;
	set host(value: string);

	get hostname(): string;
	set hostname(value: string);

	get href(): string;
	set href(value: string);

	get iban(): string | null;
	set iban(value: string | null);

	get location(): string | null;
	set location(value: string | null);

	get message(): string | null;
	set message(value: string | null);

	get network(): string;
	set network(value: string);

	get origin(): string | null;

	get password(): string;
	set password(value: string);

	get pathname(): string;
	set pathname(value: string);

	get port(): string;
	set port(value: string);

	get protocol(): string;
	set protocol(value: string);

	get receiverName(): string | null;
	set receiverName(value: string | null);

	get recurring(): string | null;
	set recurring(value: string | null);

	get route(): string | null;
	set route(value: string | null);

	get routingNumber(): string | null;
	set routingNumber(value: string | null);

	get search(): string;
	set search(value: string);

	get searchParams(): URLSearchParams;

	get split(): [string, string, boolean] | null;
	set split(value: [string, string, boolean] | null);

	get username(): string;
	set username(value: string);

	get value(): number | null;
	set value(value: number | null);

	toString(): string;
	toJSON(): string;
	toJSONObject(): object;
}

export default Payto;
