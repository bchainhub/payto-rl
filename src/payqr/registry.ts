/** Global registry. UI regional groupings deliberately do not belong here. */
export const payQrSchemes = {
	bn: {
		scheme: "tarusqr",
		name: "tarusQR",
		currencies: [],
		identifierTypes: ["issuer"],
	},
	kh: {
		scheme: "khqr",
		name: "KHQR",
		currencies: ["KHR", "USD"],
		identifierTypes: ["bakong"],
	},
	id: {
		scheme: "qris",
		name: "QRIS",
		currencies: ["IDR"],
		identifierTypes: ["issuer"],
	},
	la: {
		scheme: "laoqr",
		name: "LaoQR",
		currencies: ["LAK"],
		identifierTypes: ["issuer"],
	},
	my: {
		scheme: "duitnow",
		name: "DuitNow QR",
		currencies: ["MYR"],
		identifierTypes: ["merchant"],
	},
	mm: {
		scheme: "mmqr",
		name: "MMQR / MyanmarPay",
		currencies: ["MMK"],
		identifierTypes: ["merchant"],
	},
	ph: {
		scheme: "qrph",
		name: "QR Ph",
		currencies: ["PHP"],
		identifierTypes: ["issuer"],
	},
	sg: {
		scheme: "paynow",
		name: "SGQR / PayNow",
		currencies: ["SGD"],
		identifierTypes: ["mobile", "uen"],
	},
	th: {
		scheme: "promptpay",
		name: "Thai QR / PromptPay QR",
		currencies: ["THB"],
		identifierTypes: ["mobile", "national-id", "ewallet"],
	},
	vn: {
		scheme: "vietqr",
		name: "VietQR",
		currencies: ["VND"],
		identifierTypes: ["account"],
	},
} as const;
export type PayQrCountry = keyof typeof payQrSchemes;
export type PayQrScheme = (typeof payQrSchemes)[PayQrCountry]["scheme"];
export interface PayQrTarget {
	country: PayQrCountry;
	scheme: PayQrScheme;
	identifier: string;
	identifierType: string;
	parameters: Record<string, string>;
}
export function payQrCountry(value: string): PayQrCountry {
	const country = value.toLowerCase();
	if (!Object.hasOwn(payQrSchemes, country))
		throw new Error("Unsupported PayQR country");
	return country as PayQrCountry;
}

/** URI envelope constraints, not a claim that an issuer has registered this destination. */
/** UI-friendly Thai mobile input; canonical URIs retain the BOT 0066 representation. */
export function normalizePayQrIdentifier(
	country: PayQrCountry,
	identifier: string,
	type: string,
): string {
	if (country === "th" && type === "mobile") {
		if (/^0[0-9]{9}$/.test(identifier)) return "0066" + identifier.slice(1);
		if (/^\+66[0-9]{9}$/.test(identifier)) return "0066" + identifier.slice(3);
	}
	return identifier;
}
export function validatePayQrIdentifier(
	country: PayQrCountry,
	identifier: string,
	type: string,
): void {
	identifier = normalizePayQrIdentifier(country, identifier, type);
	if (
		!(payQrSchemes[country].identifierTypes as readonly string[]).includes(type)
	)
		throw new Error("Unsupported PayQR identifier type");
	if (
		/[\u0000-\u0020\u007f]/.test(identifier) ||
		!/^[\p{L}\p{N}_.@+\-]{1,128}$/u.test(identifier) ||
		identifier === "." ||
		identifier === ".."
	)
		throw new Error(
			"Invalid PayQR identifier: use an issuer identifier, not a URL or QR payload",
		);
	const rules: Partial<Record<PayQrCountry, Record<string, RegExp>>> = {
		kh: { bakong: /^[A-Za-z0-9_.\-]+@[A-Za-z0-9_\-]+$/ },
		vn: { account: /^[A-Za-z0-9]{1,19}$/ },
		my: { merchant: /^[A-Za-z0-9]{1,28}$/ },
		mm: { merchant: /^[0-9]{15}$/ },
		sg: { mobile: /^\+65[89][0-9]{7}$/, uen: /^[A-Z0-9]{10}$/ },
		th: {
			mobile: /^0066[0-9]{9}$/,
			"national-id": /^[0-9]{13}$/,
			ewallet: /^[0-9]{15}$/,
		},
	};
	if (
		(country === "kh" && identifier.length > 32) ||
		(rules[country]?.[type] && !rules[country]![type].test(identifier))
	)
		throw new Error(
			"Invalid " + payQrSchemes[country].name + " " + type + " identifier",
		);
}

export function validatePayQrParameters(
	country: PayQrCountry,
	parameters: Record<string, string>,
): void {
	for (const [key, value] of Object.entries(parameters)) {
		if (
			!/^[a-z][a-z0-9-]*$/.test(key) ||
			value.length > 512 ||
			/[\u0000-\u001f\u007f]/.test(value)
		)
			throw new Error("Invalid PayQR query parameter");
	}
	if (
		parameters["qr-type"] !== undefined &&
		!["static", "dynamic"].includes(parameters["qr-type"])
	)
		throw new Error("Invalid QR type");
	if (parameters["qr-type"] === "dynamic" && !parameters.amount)
		throw new Error("Dynamic PayQR requests require an amount in this profile");
	if (
		parameters["payment-mode"] !== undefined &&
		(country !== "ph" || !["p2p", "p2m"].includes(parameters["payment-mode"]))
	)
		throw new Error("Invalid payment-mode; use p2p or p2m for QR Ph");
	// BI QRIS domestic transaction cap; see bi.go.id/.../QRIS/default.aspx.
	if (
		country === "id" &&
		parameters["qr-type"] === "static" &&
		parameters.amount !== undefined
	)
		throw new Error("Static QRIS requests must not include an amount");
	const limits: Partial<Record<PayQrCountry, Record<string, number>>> = {
		la: { "receiver-name": 25 },
		kh: { "receiver-name": 25, "merchant-city": 15 },
		my: { "receiver-name": 25, "merchant-city": 15 },
		mm: { "receiver-name": 25, "merchant-city": 15 },
		sg: { "receiver-name": 25, "merchant-city": 15 },
		th: { "receiver-name": 25, "merchant-city": 15 },
	};
	for (const [key, limit] of Object.entries(limits[country] ?? {})) {
		if (
			parameters[key] !== undefined &&
			(!parameters[key] || [...parameters[key]].length > limit)
		)
			throw new Error("Invalid " + key + " length");
	}
	if (parameters.mcc !== undefined && !/^[0-9]{4}$/.test(parameters.mcc))
		throw new Error("Invalid merchant category code");
	if (
		["my", "vn", "la"].includes(country) &&
		parameters["acquirer-id"] !== undefined &&
		!/^[0-9]{6}$/.test(parameters["acquirer-id"])
	)
		throw new Error("Invalid acquirer ID");
	if (
		parameters["application-id"] !== undefined &&
		(country !== "la" ||
			!/^[A-Za-z0-9]{16}$/.test(parameters["application-id"]))
	)
		throw new Error(
			"Invalid application-id; use the 16-character LaoQR AID supplied by your institution",
		);
	if (
		parameters["qr-currency"] !== undefined &&
		(country !== "kh" ||
			!["KHR", "USD"].includes(parameters["qr-currency"]) ||
			(parameters.amount &&
				!parameters.amount.startsWith(parameters["qr-currency"] + ":")))
	)
		throw new Error(
			"Invalid qr-currency; only KHQR static currency selection is supported",
		);
	if (
		parameters["scheme-id"] !== undefined &&
		(country !== "mm" ||
			!/^[A-Za-z0-9]+(?:\.[A-Za-z0-9-]+)+$/.test(parameters["scheme-id"]) ||
			parameters["scheme-id"].length > 32)
	)
		throw new Error(
			"Invalid scheme-id; use the reverse domain supplied by your MMQR acquirer",
		);
	if (
		parameters["local-name"] !== undefined &&
		(country !== "mm" ||
			!/^[\u1000-\u109f\uAA60-\uAA7F\uA9E0-\uA9FF 0-9]{1,25}$/u.test(
				parameters["local-name"],
			) ||
			!/\p{Script=Myanmar}/u.test(parameters["local-name"]))
	)
		throw new Error("Invalid local-name; use 1–25 Myanmar characters");
	const asciiLimits: Record<string, number> = {
		"bill-number": 25,
		"store-label": 25,
		"terminal-label": 25,
		"mobile-number": 25,
		"merchant-mobile": 15,
		"merchant-id": 32,
		"acquiring-bank": 32,
		"account-information": 32,
	};
	for (const [key, limit] of Object.entries(asciiLimits)) {
		if (
			parameters[key] !== undefined &&
			!new RegExp("^[\\x20-\\x7e]{1," + limit + "}$").test(parameters[key])
		)
			throw new Error("Invalid " + key);
	}
	if (
		parameters["postal-code"] !== undefined &&
		(country !== "my" || !/^[0-9]{5}$/.test(parameters["postal-code"]))
	)
		throw new Error("Invalid postal-code");
	if (
		parameters["recipient-type"] !== undefined &&
		(country !== "kh" ||
			!["individual", "merchant"].includes(parameters["recipient-type"]))
	)
		throw new Error("Invalid recipient-type");
	if (
		parameters["amount-editable"] !== undefined &&
		(country !== "sg" || !["0", "1"].includes(parameters["amount-editable"]))
	)
		throw new Error("Invalid amount-editable");
	if (parameters["expiry-date"] !== undefined) {
		const date = parameters["expiry-date"];
		const iso =
			date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8);
		const parsed = new Date(iso + "T00:00:00Z");
		if (
			country !== "sg" ||
			!/^[0-9]{8}$/.test(date) ||
			!Number.isFinite(parsed.getTime()) ||
			parsed.toISOString().slice(0, 10) !== iso
		)
			throw new Error("Invalid expiry-date");
	}
	for (const key of ["creation-timestamp", "expiration-timestamp"])
		if (
			parameters[key] !== undefined &&
			(country !== "kh" || !/^[0-9]{13}$/.test(parameters[key]))
		)
			throw new Error("Invalid " + key);
	if ("scheme" in parameters || "currency" in parameters)
		throw new Error("Use country for scheme and amount=CURRENCY:value");
	if (parameters.amount !== undefined) {
		const match = /^([A-Z]{3}):((?:0|[1-9][0-9]*)(?:\.[0-9]{1,2})?)$/.exec(
			parameters.amount,
		);
		if (
			!match ||
			!(payQrSchemes[country].currencies as readonly string[]).includes(
				match[1],
			) ||
			match[2].length > 13 ||
			!/[1-9]/.test(match[2]) ||
			((country === "vn" || (country === "kh" && match[1] === "KHR")) &&
				match[2].includes("."))
		)
			throw new Error(
				"Invalid PayQR amount or unsupported currency; use CURRENCY:positive-decimal",
			);
		if (country === "id") {
			const [whole, fraction = ""] = match[2].split(".");
			if (BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0")) > 1000000000n)
				throw new Error("QRIS amount exceeds IDR 10000000");
		}
	}
}

export function parsePayQr(input: string): PayQrTarget {
	if (input.length > 8192) throw new Error("PayQR URI exceeds 8192 characters");
	// Check raw input before URL parsing can remove whitespace or dot segments.
	if (/[\u0000-\u0020\u007f]/.test(input) || /%(?![0-9a-f]{2})/i.test(input))
		throw new Error("Malformed PayQR URI");
	const raw = /^payto:\/\/qr\/([A-Za-z]{2})\/([^/?#]+)(?:\?([^#]*))?$/i.exec(
		input,
	);
	if (!raw) throw new Error("Expected payto://qr/{country}/{identifier}");
	const country = payQrCountry(raw[1]);
	let identifier = decodeURIComponent(raw[2]);
	const parameters: Record<string, string> = Object.create(null);
	if (raw[3]) {
		for (const pair of raw[3].split("&")) {
			if (!pair.includes("="))
				throw new Error("PayQR query parameters require values");
			const index = pair.indexOf("=");
			const key = decodeURIComponent(pair.slice(0, index).replace(/\+/g, " "));
			const value = decodeURIComponent(
				pair.slice(index + 1).replace(/\+/g, " "),
			);
			if (Object.hasOwn(parameters, key))
				throw new Error("Duplicate PayQR query parameter");
			parameters[key] = value;
		}
	}
	const identifierType =
		parameters["identifier-type"] ?? payQrSchemes[country].identifierTypes[0];
	identifier = normalizePayQrIdentifier(country, identifier, identifierType);
	validatePayQrIdentifier(country, identifier, identifierType);
	validatePayQrParameters(country, parameters);
	return {
		country,
		scheme: payQrSchemes[country].scheme,
		identifier,
		identifierType,
		parameters,
	};
}

/** Stable escaping and lexicographic query ordering; account identifiers are never case-folded. */
export function serializePayQr(
	target: Omit<PayQrTarget, "scheme" | "identifierType"> & {
		identifierType?: string;
	},
): string {
	const country = payQrCountry(target.country);
	const parameters = { ...target.parameters };
	if (target.identifierType)
		parameters["identifier-type"] = target.identifierType;
	if (
		parameters["identifier-type"] === payQrSchemes[country].identifierTypes[0]
	)
		delete parameters["identifier-type"];
	const query = Object.keys(parameters)
		.sort()
		.map(
			(key) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`,
		)
		.join("&");
	const uri = `payto://qr/${country}/${encodeURIComponent(normalizePayQrIdentifier(country, target.identifier, parameters["identifier-type"] ?? payQrSchemes[country].identifierTypes[0]))}${query ? "?" + query : ""}`;
	parsePayQr(uri);
	return uri;
}
