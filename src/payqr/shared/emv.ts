/** ASCII EMV MPM envelope inspection only, not national-scheme validation.
 * EMVCo MPM v1.1; QRIS example: docs.midtrans.com/docs/gopay-qris-pos-integration.
 * Unknown template subfields are retained without assigning national semantics.
 */
export interface EmvMpmInspection {
	fields: Record<string, string>;
	templates: Record<string, Record<string, string>>;
}
function readTlv(input: string): Record<string, string> {
	const fields: Record<string, string> = Object.create(null);
	let offset = 0;
	while (offset < input.length) {
		const header = input.slice(offset, offset + 4);
		if (!/^[0-9]{4}$/.test(header)) throw new Error("Malformed EMV TLV header");
		const tag = header.slice(0, 2);
		const length = Number(header.slice(2));
		if (
			!length ||
			offset + 4 + length > input.length ||
			Object.hasOwn(fields, tag)
		)
			throw new Error("Truncated, empty or duplicate EMV TLV field");
		fields[tag] = input.slice(offset + 4, offset + 4 + length);
		offset += 4 + length;
	}
	return fields;
}
function checksum(input: string): string {
	let crc = 0xffff;
	for (let i = 0; i < input.length; i++) {
		crc ^= input.charCodeAt(i) << 8;
		for (let bit = 0; bit < 8; bit++)
			crc = (crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1) & 0xffff;
	}
	return crc.toString(16).toUpperCase().padStart(4, "0");
}
/** Does not identify QRIS, validate enrollment or turn a payload into a PayTo destination. */
export function inspectEmvMpm(input: string): EmvMpmInspection {
	if (input.length > 4096 || !/^[\x20-\x7e]+$/.test(input))
		throw new Error(
			"Unsupported EMV input: expected at most 4096 printable ASCII characters",
		);
	const fields = readTlv(input);
	if (!input.startsWith("000201") || !/6304[0-9A-F]{4}$/.test(input))
		throw new Error("Unsupported EMV format or CRC placement");
	if (fields["63"] !== checksum(input.slice(0, -4)))
		throw new Error("Invalid EMV CRC");
	const templates: EmvMpmInspection["templates"] = Object.create(null);
	for (const [tag, value] of Object.entries(fields)) {
		const id = Number(tag);
		if ((id >= 26 && id <= 51) || id === 62 || id === 64 || id >= 80)
			templates[tag] = readTlv(value);
	}
	return { fields, templates };
}
