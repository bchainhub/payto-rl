class Payto {
    constructor(paytoString) {
        this.url = new URL(paytoString);
        if (this.url.protocol !== 'payto:') {
            throw new Error('Invalid protocol, must be payto:');
        }
    }
    getHostnameParts(array, type, position = 2) {
        if (type === null || array[1]?.toLowerCase() === type) {
            return array[position] || null;
        }
        return null;
    }
    setHostnameParts(value, position = 2) {
        const addressArray = this.pathname.split('/');
        if (value) {
            addressArray[position] = value;
        }
        else {
            addressArray.splice(position, 1);
        }
        this.pathname = '/' + addressArray.filter(part => part).join('/');
    }
    get address() {
        return this.getHostnameParts(this.pathname.split('/'), null, 1);
    }
    set address(value) {
        this.setHostnameParts(value, 1);
    }
    get amount() {
        return this.searchParams.get('amount');
    }
    set amount(value) {
        if (value) {
            this.searchParams.set('amount', value);
        }
        else {
            this.searchParams.delete('amount');
        }
    }
    get asset() {
        return this.currency[0];
    }
    set asset(value) {
        this.currency = [value];
    }
    get bic() {
        return this.getHostnameParts(this.pathname.split('/'), 'bic', 2);
    }
    set bic(value) {
        this.setHostnameParts(value, 2);
    }
    get currency() {
        const result = [null, null];
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
    set currency(value) {
        const [token, fiat, amount] = value;
        const amountValue = this.searchParams.get('amount');
        let oldToken, oldValue;
        if (amountValue) {
            const amountArray = amountValue.split(':');
            if (amountArray[1]) {
                oldToken = amountArray[0];
                oldValue = amountArray[1];
            }
            else {
                oldValue = amountArray[0];
            }
        }
        if (fiat)
            this.fiat = fiat.toLowerCase();
        if (token) {
            this.amount = `${token}:${amount || (oldValue || '')}`;
        }
        else if (amount) {
            this.amount = `${oldToken ? oldToken + ':' : ''}${amount}`;
        }
    }
    get deadline() {
        return this.searchParams.get('dl');
    }
    set deadline(value) {
        if (value) {
            this.searchParams.set('dl', value);
        }
        else {
            this.searchParams.delete('dl');
        }
    }
    get donate() {
        if (this.searchParams.has('donate')) {
            const donateValue = this.searchParams.get('donate');
            return donateValue !== null ? donateValue : '1';
        }
        return null;
    }
    set donate(value) {
        if (value === '0' || value === '1') {
            this.searchParams.set('donate', value);
        }
        else if (value) {
            this.searchParams.set('donate', '1');
        }
        else {
            this.searchParams.delete('donate');
        }
    }
    get fiat() {
        return this.searchParams.get('fiat')?.toLowerCase() || null;
    }
    set fiat(value) {
        if (value) {
            this.searchParams.set('fiat', value);
        }
        else {
            this.searchParams.delete('fiat');
        }
    }
    get hash() {
        return this.url.hash;
    }
    set hash(value) {
        this.url.hash = value;
    }
    get host() {
        return this.url.host;
    }
    set host(value) {
        this.url.host = value;
    }
    get hostname() {
        return this.url.hostname.toLowerCase();
    }
    set hostname(value) {
        this.url.hostname = value.toLowerCase();
    }
    get href() {
        return this.url.href;
    }
    set href(value) {
        this.url.href = value;
    }
    get iban() {
        return this.getHostnameParts(this.pathname.split('/'), 'iban', 2);
    }
    set iban(value) {
        this.setHostnameParts(value, 2);
    }
    get location() {
        return this.searchParams.get('loc');
    }
    set location(value) {
        if (value) {
            this.searchParams.set('loc', value);
        }
        else {
            this.searchParams.delete('loc');
        }
    }
    get message() {
        return this.searchParams.get('message');
    }
    set message(value) {
        if (value) {
            this.searchParams.set('message', value);
        }
        else {
            this.searchParams.delete('message');
        }
    }
    get network() {
        return this.url.hostname.toLowerCase();
    }
    set network(value) {
        this.url.hostname = value.toLowerCase();
    }
    get origin() {
        const origin = this.url.origin;
        return origin === 'null' || origin === '' ? null : origin;
    }
    get password() {
        return this.url.password;
    }
    set password(value) {
        this.url.password = value;
    }
    get pathname() {
        return this.url.pathname;
    }
    set pathname(value) {
        this.url.pathname = value;
    }
    get port() {
        return this.url.port;
    }
    set port(value) {
        this.url.port = value;
    }
    get protocol() {
        return this.url.protocol;
    }
    set protocol(value) {
        this.url.protocol = value;
    }
    get receiverName() {
        return this.searchParams.get('receiver-name');
    }
    set receiverName(value) {
        if (value) {
            this.searchParams.set('receiver-name', value);
        }
        else {
            this.searchParams.delete('receiver-name');
        }
    }
    get recurring() {
        return this.searchParams.get('rc')?.toLowerCase() || null;
    }
    set recurring(value) {
        if (value) {
            this.searchParams.set('rc', value);
        }
        else {
            this.searchParams.delete('rc');
        }
    }
    get route() {
        return this.getHostnameParts(this.pathname.split('/'), null, 3);
    }
    set route(value) {
        this.setHostnameParts(value, 3);
    }
    get routingNumber() {
        return this.getHostnameParts(this.pathname.split('/'), 'ach', 2);
    }
    set routingNumber(value) {
        this.setHostnameParts(value, 2);
    }
    get search() {
        return this.url.search;
    }
    set search(value) {
        this.url.search = value;
    }
    get searchParams() {
        return this.url.searchParams;
    }
    get split() {
        const splitValue = this.searchParams.get('split');
        if (splitValue) {
            const [amountPart, receiver] = splitValue.split('@');
            const [prefix, amount] = amountPart.split(':');
            return [receiver, amount, prefix === 'p'];
        }
        return null;
    }
    set split(value) {
        if (value) {
            const [receiver, amount, percentage] = value;
            const prefix = percentage ? 'p:' : '';
            this.searchParams.set('split', `${prefix}${amount}@${receiver}`);
        }
        else {
            this.searchParams.delete('split');
        }
    }
    get username() {
        return this.url.username;
    }
    set username(value) {
        this.url.username = value;
    }
    get value() {
        const amount = this.searchParams.get('amount');
        if (amount) {
            const amountArray = amount.split(':');
            let amountParsed;
            if (amountArray[1]) {
                amountParsed = parseFloat(amountArray[1]);
            }
            else {
                amountParsed = parseFloat(amountArray[0]);
            }
            if (!isNaN(amountParsed)) {
                return amountParsed;
            }
        }
        return null;
    }
    set value(value) {
        if (value) {
            const amount = this.searchParams.get('amount');
            if (amount) {
                const amountArray = amount.split(':');
                if (amountArray[1]) {
                    this.searchParams.set('amount', amountArray[0] + ':' + value);
                }
                else {
                    this.searchParams.set('amount', value.toString());
                }
            }
        }
    }
    toString() {
        return this.url.toString();
    }
    toJSON() {
        return this.url.toJSON();
    }
    toJSONObject() {
        const obj = {};
        if (this.port)
            obj.port = this.port;
        if (this.currency[0])
            obj.asset = this.currency[0];
        if (this.currency[1])
            obj.fiat = this.currency[1];
        if (this.amount)
            obj.amount = this.amount;
        if (this.address)
            obj.address = this.address;
        if (this.bic)
            obj.bic = this.bic;
        if (this.deadline)
            obj.deadline = this.deadline;
        if (this.donate)
            obj.donate = this.donate;
        if (this.hash)
            obj.hash = this.hash;
        if (this.host)
            obj.host = this.host;
        if (this.hostname)
            obj.hostname = this.hostname;
        if (this.href)
            obj.href = this.href;
        if (this.iban)
            obj.iban = this.iban;
        if (this.location)
            obj.location = this.location;
        if (this.message)
            obj.message = this.message;
        if (this.network)
            obj.network = this.network;
        if (this.origin)
            obj.origin = this.origin;
        if (this.password)
            obj.password = this.password;
        if (this.pathname)
            obj.pathname = this.pathname;
        if (this.protocol)
            obj.protocol = this.protocol;
        if (this.receiverName)
            obj.receiverName = this.receiverName;
        if (this.recurring)
            obj.recurring = this.recurring;
        if (this.route)
            obj.route = this.route;
        if (this.routingNumber)
            obj.routingNumber = this.routingNumber;
        if (this.search)
            obj.search = this.search;
        if (this.split)
            obj.split = this.split;
        if (this.username)
            obj.username = this.username;
        if (this.value)
            obj.value = this.value;
        return obj;
    }
}
export default Payto;
