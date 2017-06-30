var standardTxGas = 3940000;

function hasTransactionFailed(txid) {
    var transaction = web3.eth.getTransactionReceipt(txid);
    return transaction == null;
}

function toWei(amount) {
    return web3.toWei(amount, "ether");
}
function fromWei(amount) {
    return Number(web3.fromWei(amount, "ether"));
}