<template>
    <div id="app">
        <el-container>
            <el-header><img alt="Vue logo"
                            src="https://www.irisnet.org/dist/irisnet_logo.png?4386a8f8710c9076ff3bb63fc78ef4e7">
            </el-header>
            <el-main style="margin: 80px auto 0 auto;width: 700px;">
                <el-tabs type="border-card" @tab-click="tabClick">
                    <el-tab-pane label="Swap">
                        <div class="tab_div">
                            <el-input v-model="swapInput" style="width: 50%" @input="setOutputAmount"/>
                            <Dropdown v-model="swapInputDropdown" style="width: 150px" :itemData="data"
                                      :change="changeInput"/>
                        </div>
                        <div class="tab_div">
                            <el-input v-model="swapOutput" style="width: 50%" @input="setInputAmount"/>
                            <Dropdown style="width: 150px" :itemData="data" :change="changeOutput"
                                      v-model="swapOutputDropdown"/>
                        </div>
                        <div class="tab_div" v-if="exchangeRate !== ''">
                            <el-tag class="el-tag">
                                <p><span>Exchange Rate:</span><span>{{exchangeRate}}</span></p>
                            </el-tag>
                        </div>
                        <div class="tab_div">
                            <el-button type="primary" round style="width: 35%" @click="doSwap">Swap</el-button>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="Send">
                        <div class="tab_div">
                            <el-input v-model="swapInput" style="width: 50%" @input="setOutputAmount"/>
                            <Dropdown v-model="swapInputDropdown" style="width: 150px" :itemData="data"
                                      :change="changeInput"/>
                        </div>
                        <div class="tab_div">
                            <el-input v-model="swapOutput" style="width: 50%" @input="setInputAmount"/>
                            <Dropdown style="width: 150px" :itemData="data" :change="changeOutput"
                                      v-model="swapOutputDropdown"/>
                        </div>
                        <div class="tab_div">
                            <el-input v-model="recipient" style="width: 77%" placeholder="Recipient Address"/>
                        </div>
                        <div class="tab_div" v-if="exchangeRate !== ''">
                            <el-tag class="el-tag">
                                <p><span>Exchange Rate:</span><span>{{exchangeRate}}</span></p>
                            </el-tag>
                        </div>
                        <div class="tab_div">
                            <el-button type="primary" round style="width: 35%" @click="doSwap">Swap</el-button>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="Pool">
                        <div>
                            <el-tabs @tab-click="poolTabClick">
                                <el-tab-pane label="Add Liquidity">
                                    <div class="tab_div">
                                        <el-input v-model="poolIrisAmt" style="width: 50%" @input="addLiquidityInput"/>
                                        <Dropdown style="width: 150px" :itemData="i_data" :change="emptyFun" disabled/>
                                    </div>
                                    <div class="tab_div">
                                        <el-input v-model="poolTokenAmt" style="width: 50%"/>
                                        <Dropdown style="width: 150px" :itemData="filterData"
                                                  :change="computeAddLiquidity" v-model="poolTokenDropdown"/>
                                    </div>
                                </el-tab-pane>
                                <el-tab-pane label="Remove Liquidity">
                                    <div class="tab_div">
                                        <el-input v-model="poolLiquidityAmt" @input="removeLiquidityInput"
                                                  style="width: 50%"/>
                                        <Dropdown style="width: 150px" :itemData="poolLiquidity"
                                                  :change="computeRemoveLiquidity" v-model="poolLiquidityDropdown"/>
                                    </div>
                                    <div class="tab_div">
                                        <el-input readonly v-model="poolLiquidityOutput" style="width: 77%"
                                                  placeholder="Output"/>
                                    </div>
                                </el-tab-pane>
                            </el-tabs>
                        </div>
                        <div class="tab_div" style="margin-top: 0px" v-if="poolState !== ''">
                            <el-tag class="el-tag">
                                <p><span>Exchange Rate:</span><span>{{poolState.rate}}</span></p>
                                <p><span>Current Pool Size:</span><span>{{poolState.size}}</span></p>
                                <p v-if="mintLiquidity !== 0"><span>Get Pool Share:</span><span>{{mintLiquidity}}</span></p>
                            </el-tag>
                        </div>
                        <div class="tab_div">
                            <el-button type="primary" style="width: 35%" round @click="doLiquidity">{{methodDesc}}</el-button>
                        </div>
                    </el-tab-pane>
                    <div class="tab_div" v-if="msg !== ''">
                        <el-tag :type="tipType">{{msg}}</el-tag>
                    </div>
                </el-tabs>
            </el-main>
        </el-container>
    </div>

</template>

<script>
    import Dropdown from './components/Dropdown.vue'
    import {IrisClient} from 'sdk-js'
    import {CoinSwap,Token} from './script/Coinswap';

    const AddLiquidity = 'Add Liquidity';
    const RemoveLiquidity = 'Remove Liquidity';

    let client = new IrisClient("https://localhost/api", {
        network: "testnet",
        chain: "iris",
        timeout: 10000
    });

    let swap = new CoinSwap(client);

    export default {
        name: 'app',
        components: {
            Dropdown,
        },
        data() {
            return {
                data: [],
                filterData: [],
                decimals: {},
                s_data: [{
                    value: AddLiquidity,
                    label: AddLiquidity,
                }, {
                    value: RemoveLiquidity,
                    label: RemoveLiquidity,
                }],
                i_data: [{
                    value: 'iris-atto',
                    label: 'IRIS',
                }],
                msg: "",
                tipType: "danger",
                swapInput: 0,
                swapInputDropdown: "",
                swapOutput: 0,
                swapOutputDropdown: "",
                recipient: "",
                isBuyOrder: false,
                exchangeRate: "",
                methodDesc: "Add Liquidity",
                poolTokenDropdown: "",
                poolState: "",
                poolIrisAmt: 0,
                poolTokenAmt: 0,
                poolLiquidity: [],
                poolLiquidityAmt: 0,
                deltaIrisAmt: 0,
                deltaTokenAmt: 0,
                mintLiquidity: 0,
                poolLiquidityOutput: "",
                poolLiquidityDropdown: "",
            }
        },
        watch: {
            data() {
                this.swapInputDropdown = this.data[0].value;
                this.swapOutputDropdown = this.data[0].value;
                this.poolTokenDropdown = this.poolLiquidity[0].value;
                this.poolLiquidityDropdown = this.poolLiquidity[0].value;
            }
        },
        methods: {
            init() {
                client.getTokens().then(res => {
                    res.forEach((item) => {
                        let token = item.base_token;
                        let uDenom = Token.getUniDenom(token.id);
                        let option = {
                            value: uDenom,
                            label: token.symbol.toUpperCase(),
                        };
                        this.data.push(option);
                        this.decimals[uDenom] = token.decimal;

                        if (token.id !== "iris") {
                            this.poolLiquidity.push({
                                value: uDenom,
                                label: Token.getUniDenom(token.id).toUpperCase(),
                            });
                            this.filterData.push(option);
                        }
                    });
                }).catch(() => {
                    this.showError("init page error!")
                });
            },
            tabClick() {
                this.swapInput = 0;
                this.swapOutput = 0;
                this.exchangeRate = "";
                this.poolTabClick()
            },
            showError(message) {
                this.tipType = "danger";
                this.msg = message;
            },
            clearError() {
                this.msg = '';
            },
            poolTabClick(tab) {
                this.poolState = "";
                this.poolIrisAmt = 0;
                this.poolTokenAmt = 0;
                this.poolLiquidityAmt = 0;
                this.poolLiquidityOutput = 0;
                this.deltaIrisAmt = 0;
                this.deltaTokenAmt = 0;
                this.mintLiquidity = 0;
                let method = AddLiquidity;
                if (tab) {
                    method = tab.label
                }
                this.methodDesc = method;
                this.clearError();
            },
            changeInput(denom) {
                this.swapInputDropdown = denom;
                if (this.swapInputDropdown === "" || this.swapOutputDropdown === "") {
                    return
                }
                if (this.swapInputDropdown === "uni:iris" && this.swapOutputDropdown === "uni:iris") {
                    return
                }
                this.setInputAmount()
            },
            changeOutput(denom) {
                this.swapOutputDropdown = denom;
                if (this.swapInputDropdown === "" || this.swapOutputDropdown === "") {
                    return
                }
                if (this.swapInputDropdown === "uni:iris" && this.swapOutputDropdown === "uni:iris") {
                    return
                }
                this.setOutputAmount()
            },
            setInputAmount() {
                this.isBuyOrder = true;
                let inputDenom = this.swapInputDropdown;
                let outputDenom = this.swapOutputDropdown;
                let outputAmt = this.swapOutput * Math.pow(10, this.decimals[outputDenom]);
                if (inputDenom === "" || outputDenom === "" || inputDenom === outputDenom) {
                    return;
                }
                if (inputDenom === "uni:iris" && outputDenom === "uni:iris") {
                    return;
                }
                if (!Number.isInteger(outputAmt) || outputAmt === 0) {
                    this.showError("invalid number!");
                    return;
                }

                if (inputDenom === "uni:iris") {
                    client.tradeIrisForExactTokens(outputDenom, outputAmt).then(data => {
                        this.swapInput = Token.toFix(data.toNumber() / Math.pow(10, this.decimals[inputDenom]));
                        this.showRate(data.toNumber(), inputDenom, outputAmt, outputDenom)
                    }).catch((e) => {
                        this.showError(`${e}`)
                    });
                } else if (outputDenom === "uni:iris") {
                    client.tradeTokensForExactIris(inputDenom, outputAmt).then(data => {
                        this.swapInput = Token.toFix(data.toNumber() / Math.pow(10, this.decimals[inputDenom]));
                        this.showRate(data.toNumber(), inputDenom, outputAmt, outputDenom)
                    }).catch((e) => {
                        this.showError(`${e}`)
                    });
                } else {
                    client.tradeTokensForExactTokens(inputDenom, outputDenom, outputAmt).then(data => {
                        this.swapInput = Token.toFix(data.toNumber() / Math.pow(10, this.decimals[inputDenom]));
                        this.showRate(data.toNumber(), inputDenom, outputAmt, outputDenom)
                    }).catch((e) => {
                        this.showError(`${e}`)
                    });

                }
                this.clearError();
            },
            setOutputAmount() {
                this.isBuyOrder = false;
                let inputDenom = this.swapInputDropdown;
                let outputDenom = this.swapOutputDropdown;
                let inputAmt = this.swapInput * Math.pow(10, this.decimals[inputDenom]);
                if (inputDenom === "" || outputDenom === "" || inputDenom === outputDenom) {
                    return;
                }
                if (inputDenom === "uni:iris" && outputDenom === "uni:iris") {
                    return;
                }
                if (!Number.isInteger(inputAmt) || inputAmt === 0) {
                    this.showError("invalid number!");
                    return;
                }
                if (inputDenom === "uni:iris") {
                    client.tradeExactIrisForTokens(outputDenom, inputAmt).then(data => {
                        this.swapOutput = Token.toFix(data.toNumber() / Math.pow(10, this.decimals[outputDenom]));
                        this.showRate(inputAmt, inputDenom, data.toNumber(), outputDenom)
                    }).catch((e) => {
                        this.showError(`${e}`)
                    });
                } else if (outputDenom === "uni:iris") {
                    client.tradeExactTokensForIris(inputDenom, inputAmt).then(data => {
                        this.swapOutput = Token.toFix(data.toNumber() / Math.pow(10, this.decimals[outputDenom]));
                        this.showRate(inputAmt, inputDenom, data.toNumber(), outputDenom)
                    }).catch((e) => {
                        this.showError(`${e}`)
                    });
                } else {
                    client.tradeExactTokensForTokens(inputDenom, outputDenom, inputAmt).then(data => {
                        this.swapOutput = Token.toFix(data.toNumber() / Math.pow(10, this.decimals[outputDenom]));
                        this.showRate(inputAmt, inputDenom, data.toNumber(), outputDenom)
                    }).catch((e) => {
                        this.showError(`${e}`)
                    });
                }
                this.clearError();
            },
            showRate(inputAmt, inputDenom, outputAmt, outputDenom) {
                if (!Number.isInteger(inputAmt) || !Number.isInteger(outputAmt)
                    || inputAmt === 0 || outputAmt === 0) {
                    this.showError("invalid number!");
                    return
                }
                inputAmt = inputAmt / Math.pow(10, this.decimals[inputDenom]);
                outputAmt = outputAmt / Math.pow(10, this.decimals[outputDenom]);
                if (inputDenom === "uni:iris") {
                    let rate = Token.toFix(inputAmt / outputAmt);
                    this.exchangeRate = `1 ${Token.getMainDenom(outputDenom)} = ${rate} ${Token.getMainDenom(inputDenom)}`;
                } else if (outputDenom === "uni:iris") {
                    let rate = Token.toFix(outputAmt / inputAmt);
                    this.exchangeRate = `1 ${Token.getMainDenom(inputDenom)} = ${rate} ${Token.getMainDenom(outputDenom)}`;
                } else {
                    let rate = Token.toFix(inputAmt / outputAmt);
                    this.exchangeRate = `1 ${Token.getMainDenom(outputDenom)} = ${rate} ${Token.getMainDenom(inputDenom)}`;
                }
            },
            addLiquidityInput() {
                this.computeAddLiquidity(this.poolTokenDropdown);
            },
            computeAddLiquidity(denom) {
                this.poolTokenDropdown = denom;
                if (denom === 'uni:iris') {
                    return
                }
                client.getReservePool(denom).then(data => {
                    if (!data) {
                        return;
                    }
                    let token = data.token;
                    let iris = data.iris;
                    let tokenUdenom = Token.minTokenToUniDenom(token.denom);
                    let irisUdenom = Token.minTokenToUniDenom(iris.denom);

                    let tokenMainDenom = Token.getMainDenom(tokenUdenom);
                    let irisMainDenom = Token.getMainDenom(irisUdenom);

                    let tokenAmt = Token.toFix(token.amount / Math.pow(10, this.decimals[tokenUdenom]));
                    let irisAmt = Token.toFix(iris.amount / Math.pow(10, this.decimals[irisUdenom]));

                    if (data.token.amount === "0") {
                        this.poolState = {
                            size: `${irisAmt} ${irisMainDenom} + ${tokenAmt} ${tokenMainDenom}`,
                        };
                        return;
                    }else {
                        this.poolState = {
                            rate: `1 ${tokenMainDenom} = ${Token.toFix(irisAmt / tokenAmt)} ${irisMainDenom}`,
                            size: `${irisAmt} ${irisMainDenom} + ${tokenAmt} ${tokenMainDenom}`,
                        };
                    }
                    if (this.poolIrisAmt === 0) {
                        return;
                    }
                    // compute deposted token
                    let deltaIris = this.poolIrisAmt * Math.pow(10, this.decimals[irisUdenom]);
                    let deltaToken = (deltaIris / iris.amount) * token.amount;
                    this.poolTokenAmt = Token.toFix(deltaToken / Math.pow(10, this.decimals[tokenUdenom]));
                    this.mintLiquidity = Token.toFix(((data.liquidity.amount * deltaIris)/iris.amount + 1)/Math.pow(10, this.decimals[irisUdenom]))
                }).catch(() => {
                    this.showError(`liquidity pool ${denom} not exist !`);
                });
                this.clearError();
            },
            removeLiquidityInput() {
                this.computeRemoveLiquidity(this.poolLiquidityDropdown);
            },
            computeRemoveLiquidity(denom) {
                this.poolLiquidityDropdown = denom;
                let parent = this;
                client.getReservePool(denom).then(data => {
                    if (!data || data.liquidity.amount === "0") {
                        this.showError(`liquidity ${denom} equal zero `);
                        return;
                    }
                    let token = data.token;
                    let iris = data.iris;

                    let tokenUdenom = Token.minTokenToUniDenom(token.denom);
                    let irisUdenom = Token.minTokenToUniDenom(iris.denom);
                    let tokenMainDenom = Token.getMainDenom(tokenUdenom);
                    let irisMainDenom = Token.getMainDenom(irisUdenom);

                    let reserveTokenAmt = Token.toFix(token.amount / Math.pow(10, this.decimals[tokenUdenom]));
                    let reserveIrisAmt = Token.toFix(iris.amount / Math.pow(10, this.decimals[irisUdenom]));

                    let liquidityAmt = data.liquidity.amount;
                    let deltaliquidity = parent.poolLiquidityAmt * Math.pow(10, parent.decimals[irisUdenom]);
                    let delta = deltaliquidity / liquidityAmt;

                    // compute deposted token
                    let deltaIris = delta * iris.amount;
                    let deltaToken = delta * token.amount;
                    this.deltaIrisAmt = deltaIris;
                    this.deltaTokenAmt = deltaToken;

                    let tokenAmt = Token.toFix(deltaToken / Math.pow(10, parent.decimals[tokenUdenom]));
                    let irisAmt = Token.toFix(deltaIris / Math.pow(10, parent.decimals[irisUdenom]));
                    parent.poolLiquidityOutput = `${irisAmt} ${irisMainDenom} + ${tokenAmt} ${tokenMainDenom}`;
                    parent.poolState = {
                        rate: `1 ${tokenMainDenom} = ${Token.toFix(reserveIrisAmt / reserveTokenAmt)} ${irisMainDenom}`,
                        size: `${reserveIrisAmt} ${irisMainDenom} + ${reserveTokenAmt} ${tokenMainDenom}`,
                    };
                }).catch(() => {
                    this.showError(`liquidity pool ${denom} not exist !`);
                });
                this.clearError();
            },
            emptyFun() {
            },
            doSwap() {
                let input = {
                    denom: Token.uniDenomToMinDenom(this.swapInputDropdown),
                    amount: String(this.swapInput * Math.pow(10, this.decimals[this.swapInputDropdown])),
                };

                let output = {
                    denom: Token.uniDenomToMinDenom(this.swapOutputDropdown),
                    amount: String(this.swapOutput * Math.pow(10, this.decimals[this.swapOutputDropdown])),
                };

                swap.sendSwapTx(input,output,this.recipient,this.isBuyOrder).then((result) => {
                    this.tipType = "success";
                    this.msg = `${result.hash}`;
                }).catch(e => {
                    this.showError(`${e}`)
                });
            },

            doLiquidity(){
              if(this.methodDesc === AddLiquidity){
                  let maxToken = {
                      denom: Token.uniDenomToMinDenom(this.poolTokenDropdown),
                      amount: String(this.poolTokenAmt * Math.pow(10, this.decimals[this.poolTokenDropdown])),
                  };

                  let exactIrisAmt = this.poolIrisAmt * Math.pow(10, this.decimals["uni:iris"]);
                  let mintLiquidity = this.mintLiquidity * Math.pow(10, this.decimals["uni:iris"]);
                  swap.sendAddLiquidityTx(maxToken,exactIrisAmt,mintLiquidity).then(result => {
                      this.tipType = "success";
                      this.msg = `${result.hash}`;
                  }).catch(e => {
                      this.showError(`${e}`)
                  });
              } else if (this.methodDesc === RemoveLiquidity){
                  let withdrawLiquidity = {
                      denom: `${this.poolLiquidityDropdown}-min`,
                      amount: String(this.poolLiquidityAmt * Math.pow(10, this.decimals[this.poolLiquidityDropdown])),
                  };
                  swap.sendRemoveLiquidityTx(withdrawLiquidity,this.deltaIrisAmt,this.deltaTokenAmt).then(result => {
                      this.tipType = "success";
                      this.msg = `${result.hash}`;
                  }).catch(e => {
                      this.showError(`${e}`)
                  });
              }
            }
        },
        mounted() {
            this.init()
        }
    }
</script>
<style>
    #app {
        text-align: center;
    }

    .tab_div {
        display: flex;
        justify-content: center;
        margin: 30px;
    }

    .el-tabs__nav-scroll {
        overflow: hidden;
        margin-left: 200px;
    }

    .el-tag {
        width: 77% !important;
        display: inline-block !important;
        height: auto !important;
        line-height: 18px !important;
        box-sizing: border-box !important;
        padding: 10px !important;
    }

    .el-tag p {
        display: flex;
        justify-content: space-between;
        margin: 0;
    }
</style>
