import TransportWebUSB from '@ledgerhq/hw-transport-webusb';

const path = [44, 118, 0, 0, 0];

export class Ledger{
    constructor(client){
        this.app = null;
        _createLedgerApp(client,ledgerApp => {
            this.app = ledgerApp;
        });
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
}

function _createLedgerApp(client,callback) {
    TransportWebUSB.create().then(transport =>{
        client.getLedger().create(transport).then(app => {
            callback(app)
        });
    });
}
