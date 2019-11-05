import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import * as crypto from "iris-crypto"

const path = [44, 118, 0, 0, 0];

export class Ledger{
    constructor(){
        this.app = null;
        _createLedgerApp(ledgerApp => {
            this.app = ledgerApp;
        });
    }

    getAddressAndPubKey() {
        return this.app.getAddressAndPubKey(path,"faa").then((result) => {
            return {addr :result.bech32_address,pubKey:result.compressed_pk};
        }).catch (() => {
            this.app = null;
            throw new Error("connect ledger failed,please reconnection ledger")
        });
    }
    signTx(msg) {
        return this.app.sign(path, msg).then((response) => {
            return response.signature;
        }).catch (() => {
            this.app = null;
            throw new Error("connect ledger failed,please reconnection ledger")
        });
    }
    isActive(){
        return this.app !== null
    }
}

function _createLedgerApp(callback) {
    let appCreate = (okFun,failFun) => {
        TransportWebUSB.create().then((transport) => {
            crypto.getLedger().create(transport).then((app) =>{
                okFun(app)
            })
        }).catch ((err) => {
            failFun(err)
        })
    };
    let timer = setInterval(async() =>{
        appCreate((app) =>{
            if(app !== null){
                clearInterval(timer);
                callback(app);
            }
        },(err) =>{
            if(err && err.name === "TransportOpenUserCancelled"){
                clearInterval(timer);
            }
        });
    },1000);
}
