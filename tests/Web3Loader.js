﻿function loadWeb3(){
    var endpoint = 'http://localhost:8545';
    if (typeof web3 !== 'undefined') {
        web3 = new Web3(web3.currentProvider);
    } else {
        web3 = new Web3(new Web3.providers.HttpProvider(endpoint));
    }
}