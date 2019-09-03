import {Ledger} from './Ledger';


const fee = {denom: "iris-atto", amount: 600000000000000000};
const gas = 30000;
const chainId = "irishub-test";
const slippageRate = 0.01;

export class CoinSwap {
    constructor(client) {
        this.client = client;
        this.ledger = new Ledger(client)
    }

    sendSwapTx(input, output,recipient, isBuyOrder) {
        if(isBuyOrder){
            input.amount = input.amount * (1 + slippageRate)
        }else {
            output.amount = output.amount * (1 - slippageRate)
        }
        return this._sendRawTransaction("swap_order",{
            input: input,
            output: output,
            recipient: recipient,
            isBuyOrder: isBuyOrder});
    }

    sendAddLiquidityTx(maxToken,exactIrisAmt,minLiquidity){
        maxToken.amount = maxToken.amount * (1 + slippageRate);
        minLiquidity = minLiquidity * (1 - slippageRate);
        return this._sendRawTransaction("add_liquidity",{
            maxToken: maxToken,
            exactIrisAmt: exactIrisAmt,
            minLiquidity: minLiquidity
        });
    }

    sendRemoveLiquidityTx(withdrawLiquidity,minIrisAmt,minToken){
        minIrisAmt = minIrisAmt * (1 - slippageRate);
        minToken = minToken * (1 - slippageRate);
        return this._sendRawTransaction("remove_liquidity",{
            withdrawLiquidity: withdrawLiquidity,
            minIrisAmt: minIrisAmt,
            minToken: minToken
        });
    }

    _sendRawTransaction(type,req){
        let parent = this;
        return this.ledger.getAddressAndPubKey().then( async account => {
            let result = await parent.client.getAccount(account.addr);
            let acc = result.value;
            let msg = null;
            switch (type) {
                case "swap_order" : {
                    msg = this._createMsgSwap(account.addr,req);
                    break
                }
                case "add_liquidity" : {
                    msg = this._createAddLiquidityMsg(req);
                    break
                }
                case "remove_liquidity" : {
                    msg = this._createRemoveLiquidityMsg(req);
                    break
                }
                default : {
                    throw new Error("unSupport msg")
                }
            }
            let tx = {
                chain_id: chainId,
                from: account.addr,
                account_number: acc.account_number,
                sequence: acc.sequence,
                fees: fee,
                gas: gas,
                type: type,
                msg: msg
            };
            let stdTx = parent.client.getBuilder().buildTx(tx);
            let signMsg = JSON.stringify(stdTx.GetSignBytes());
            return parent.ledger.signTx(signMsg).then( signature => {
                stdTx.SetSignature({pub_key: account.pubKey, signature: signature});
                let postData = stdTx.GetData();
                return parent.client.sendRawTransaction(postData,{mode : "commit"})
            });
        });
    }

    _createMsgSwap(address,req){
        if(!req.recipient){
            req.recipient =  address
        }
        return {
            input: {
                address: address,
                coin: req.input,
            },
            output: {
                address: req.recipient,
                coin: req.output,
            },
            deadline: new Date().getTime(),
            isBuyOrder: req.isBuyOrder
        }
    }

    _createAddLiquidityMsg(req){
        return {
            max_token : req.maxToken,
            exact_iris_amt: req.exactIrisAmt,
            min_liquidity: req.minLiquidity,
            deadline: new Date().getTime()
        }
    }

    _createRemoveLiquidityMsg(req){
        return {
            withdraw_liquidity : req.withdrawLiquidity,
            min_iris_amt: req.minIrisAmt,
            min_token: req.minToken,
            deadline: new Date().getTime()
        }
    }
}

export class Token {

    static getUniDenom(tokenId){
        return `uni:${tokenId}`
    }

    static getMainDenom(denom) {
        if (denom === "uni:iris") {
            return "IRIS"
        }
        let domain = denom.replace("uni:", "");
        return domain.toUpperCase()
    }

    static minTokenToUniDenom(denom) {
        if (denom === "iris-atto") {
            return "uni:iris"
        }
        let domain = denom.replace("-min", "");
        return `uni:${domain}`
    }

    static uniDenomToMinDenom(denom) {
        if (denom === "uni:iris") {
            return "iris-atto"
        }
        let domain = denom.replace("uni:", "");
        return `${domain}-min`
    }

    static toFix(amount){
        return Number(amount).toFixed(10)
    }
}
