const {MemoryAccount, Node, Universal, Crypto} = require('@aeternity/aepp-sdk');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getHeight() {

    console.log("Get block top height");
    const secretKey = process.argv.slice(2)[0];
    const publicKey = Crypto.getAddressFromPriv(secretKey);
    console.log(publicKey);
    const account = MemoryAccount({
        keypair: {
            secretKey: secretKey,
            publicKey: publicKey
        }
    });
    const nodeInstance = await Node({url: "https://testnet.aeternity.io"});
    const aeInstance = await Universal({
        nodes: [{name: 'main-net', instance: nodeInstance}],
        accounts: [account]
    });
    const height = await aeInstance.height();
    console.log(height.toString());
    return height;
}

function start() {
    getHeight().then(function (height) {
        delay(5000).then(function () {
            start();
        })
    });
}

start();
