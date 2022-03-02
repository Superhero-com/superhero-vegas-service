const {MemoryAccount, Node, Universal, Crypto} = require('@aeternity/aepp-sdk');
const VegasMarketContract = require('./contracts/VegasMarketContract');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getHeight() {

    // console.log("——————————————START——————————————");
    const secretKey = process.argv.slice(2)[0];
    const publicKey = Crypto.getAddressFromPriv(secretKey);
    // console.log(publicKey);
    const account = MemoryAccount({
        keypair: {
            secretKey: secretKey,
            publicKey: publicKey
        }
    });
    const nodeInstance = await Node({url: "https://node.aeasy.io"});
    const sdkInstance = await Universal({
        compilerUrl: "https://compiler.aeasy.io",
        nodes: [{name: 'main-net', instance: nodeInstance}],
        accounts: [account]
    });

    // console.log(VegasMarketContract);
    const veagsContract = await sdkInstance.getContractInstance(VegasMarketContract, {contractAddress: "ct_iJXHVLfBLeFPhQ4PFSxwL5SWhpuferJbuExAyfKVsguMeQcxR"});
    const marketsStartResult = await veagsContract.methods.get_markets_start(publicKey);
    const state = await veagsContract.methods.get_state();
    // console.log(JSON.stringify(state.decodedResult));
    const marketsStart = await marketsStartResult.decodedResult;

    const currentHeight = await sdkInstance.height();

    let startCount = marketsStart.length;
    let waitCount = 0;

    for (let i = 0; i < marketsStart.length; i++) {

        let overHeight = marketsStart[i][1].over_height;
        if (currentHeight > overHeight) {
            startCount--;
            waitCount++;
        }
    }
    // console.log("START COUNT -> " + startCount + " - WAIT COUNT ->" + waitCount + " - TOP HEIGHT -> " + currentHeight);
    for (let i = 0; i < marketsStart.length; i++) {

        let owner = marketsStart[i][1].owner;
        let marketId = marketsStart[i][1].market_id;
        let overHeight = marketsStart[i][1].over_height;
        if (currentHeight > overHeight) {
            const waitResult = await veagsContract.methods.update_market_progress_to_wait(owner, marketId);
            const wait = await waitResult.decodedResult;
            if (wait) {
                console.log(owner + " - " + marketId + " -> WAIT SUCCESS!");
            }
        }
    }


    const marketsWaitResult = await veagsContract.methods.get_markets_wait(publicKey);
    const marketsWait = marketsWaitResult.decodedResult;

    const configResult = await veagsContract.methods.get_config();
    const config = await configResult.decodedResult;


    console.log("START COUNT -> " + startCount + " - WAIT START COUNT -> " + waitCount + " - WAIT COUNT -> " + marketsWait.length + " - TOP HEIGHT -> " + currentHeight);
    for (let i = 0; i < marketsWait.length; i++) {

        let owner = marketsWait[i][1].owner;
        let marketId = marketsWait[i][1].market_id;

        const provideCountResult = await veagsContract.methods.get_oracle_market_provide_count(marketId);
        const provideCount = await provideCountResult.decodedResult;


        if (config.oracle_trigger_count >= config.oracle_trigger_count) {
            const overResult = await veagsContract.methods.update_market_progress_to_over(owner, marketId);
            const over = await overResult.decodedResult;
            if (over) {
                console.log(owner + " - " + marketId + " OVER SUCCESS!");
            }
        }
    }
    // console.log("\n");


}

function start() {
    getHeight().then(function (height) {
        delay(1000 * 60 * 3).then(function () {
            start();
        })
    }).catch(function () {
        delay(1000 * 60 * 3).then(function () {
            start();
        })
    });
}

start();
