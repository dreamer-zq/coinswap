import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import * as crypto from "iris-crypto"

const path = [44, 118, 0, 0, 0];
let app = null;

document.body.addEventListener("click", async () => {
    const transport = await TransportWebUSB.create();
    app = await crypto.getLedger().create(transport)
});

export class Ledger{
    constructor(){
        this.app = app;
    }

    getAddressAndPubKey() {
        return this.app.getAddressAndPubKey(path,"faa").then((result) => {
            if (result.return_code !== 0x9000 ){
                throw new Error("can't connect to ledger")
            }
            return {addr :result.bech32_address,pubKey:result.compressed_pk};
        });
    }
    signTx(msg) {
        return this.app.sign(path, msg).then((response) => {
            if (response.return_code !== 0x9000 ){
                throw new Error("can't connect to ledger")
            }
            return response.signature;
        });
    }

    isActive(){
        return this.app !== null
    }
}
