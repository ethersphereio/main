
describe("Permissions", function () {
    it("changeOwner", function (done) {
        web3.personal.unlockAccount(test1Address, masterPassword);
      /*  sphereTokenContract.changeOwner.sendTransaction(test1Address, { from: test1Address, gas: standardTxGas }, function (e, txid) {
            expect(hasTransactionFailed(txid)).toBe(true);
            done();
        }); */
        done();
    });
});

describe("TokenFees", function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 200000;
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    sphereTokenContract.addMintingFactory.sendTransaction(tokenFactoryAddress, { from: ownerAddress });
    it("addReserves", function () {
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        var previousReserves = fromWei(sphereTokenContract.reserves());
        var addedReserves = 10;
        sphereTokenContract.addReserves.sendTransaction(toWei(addedReserves), { from: ownerAddress, gas: standardTxGas });
        var newReserves = fromWei(sphereTokenContract.reserves());
        expect(Number(previousReserves + addedReserves).toFixed(8)).toBe(newReserves.toFixed(8));
        var reservesPerCoin = fromWei(sphereTokenContract.reservesPerUnitToken());
        expect(newReserves.toFixed(8) == (reservesPerCoin * Number(sphereTokenContract.totalSupply())).toFixed(8)).toBe(true);

        mintCoin(ownerAddress, 1000);
        reservesPerCoin = fromWei(sphereTokenContract.reservesPerUnitToken());
        expect(newReserves.toFixed(8) == (reservesPerCoin * sphereTokenContract.totalSupply()).toFixed(8)).toBe(true);
    });
    it("reduceReserves", function () {
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        var previousReserves = fromWei(sphereTokenContract.reserves());
        var reducedReserves = 10;
        sphereTokenContract.reduceReserves.sendTransaction(toWei(reducedReserves), { from: ownerAddress, gas: standardTxGas });
        var newReserves = fromWei(sphereTokenContract.reserves());
        expect((previousReserves - reducedReserves).toFixed(8)).toBe(newReserves.toFixed(8));
        var reservesPerCoin = fromWei(sphereTokenContract.reservesPerUnitToken());
        expect(newReserves.toFixed(8) == (reservesPerCoin * Number(sphereTokenContract.totalSupply())).toFixed(8)).toBe(true);

        mintCoin(ownerAddress, 1000);
        reservesPerCoin = fromWei(sphereTokenContract.reservesPerUnitToken());
        expect(newReserves.toFixed(8) == (reservesPerCoin * Number(sphereTokenContract.totalSupply())).toFixed(8)).toBe(true);

    });
    it("transfers", function () {
        var initialMint = 5000;
        var transferAmount = 2531;
        mintCoin(test1Address, initialMint);
        var balance1 = Number(sphereTokenContract.balanceOf(test1Address));
        var balance2 = Number(sphereTokenContract.balanceOf(test2Address));
        expect(balance1).toBeGreaterThanOrEqual(initialMint);
        web3.personal.unlockAccount(test1Address, masterPassword);
        sphereTokenContract.transfer.sendTransaction(test2Address, transferAmount, { from: test1Address, gas: standardTxGas });
        expect(Number(sphereTokenContract.balanceOf(test1Address))).toBe(balance1 - transferAmount);
        expect(Number(sphereTokenContract.balanceOf(test2Address))).toBe(balance2 + transferAmount);
    });
    it("transferFrom", function () {
        var initialMint = 5000;
        var approveTransferValue = 2531;
        mintCoin(test1Address, initialMint);
        var balance1 = Number(sphereTokenContract.balanceOf(test1Address));
        var balance2 = Number(sphereTokenContract.balanceOf(test2Address));
        var balance3 = Number(sphereTokenContract.balanceOf(ownerAddress));
        expect(balance1).toBeGreaterThanOrEqual(initialMint);
        //Reset approve amount
        web3.personal.unlockAccount(test1Address, masterPassword);
        sphereTokenContract.approve.sendTransaction(test2Address, 0, { from: test1Address });
        //Test1 approve Test2 to spend on behalf
        web3.personal.unlockAccount(test1Address, masterPassword);
        sphereTokenContract.approve.sendTransaction(test2Address, approveTransferValue, { from: test1Address });
        expect(Number(sphereTokenContract.allowance(test1Address, test2Address))).toBe(approveTransferValue);
        //Test2 overspends, transfers to owner
        web3.personal.unlockAccount(test2Address, masterPassword);
        sphereTokenContract.transferFrom.sendTransaction(test1Address, ownerAddress, Math.floor(approveTransferValue * 1.1), { from: test2Address });
        expect(Number(sphereTokenContract.balanceOf(test1Address))).toBe(balance1);
        expect(Number(sphereTokenContract.balanceOf(test2Address))).toBe(balance2);
        expect(Number(sphereTokenContract.balanceOf(ownerAddress))).toBe(balance3);
        expect(Number(sphereTokenContract.allowance(test1Address, test2Address))).toBe(approveTransferValue);
        //Test2 spends correctly, transfers to owner
        web3.personal.unlockAccount(test2Address, masterPassword);
        sphereTokenContract.transferFrom.sendTransaction(test1Address, ownerAddress, approveTransferValue, { from: test2Address });
        expect(Number(sphereTokenContract.balanceOf(test1Address))).toBe(balance1 - approveTransferValue);
        expect(Number(sphereTokenContract.balanceOf(test2Address))).toBe(balance2);
        expect(Number(sphereTokenContract.balanceOf(ownerAddress))).toBe(balance3 + approveTransferValue);
        expect(Number(sphereTokenContract.allowance(test1Address, test2Address))).toBe(0);
        //Reset approve balances
        web3.personal.unlockAccount(test1Address, masterPassword);
        sphereTokenContract.approve.sendTransaction(test2Address, 0, { from: test1Address }); 
    });
    it("unauthorizedTransferFroms", function () {
        var initialMint = 5000;
        var approveTransferValue = 2531;
        mintCoin(test1Address, initialMint);
        var balance1 = Number(sphereTokenContract.balanceOf(test1Address));
        var balance2 = Number(sphereTokenContract.balanceOf(test2Address));
        var balance3 = Number(sphereTokenContract.balanceOf(ownerAddress));
        web3.personal.unlockAccount(test1Address, masterPassword);
        sphereTokenContract.approve.sendTransaction(test2Address, approveTransferValue, { from: test1Address });
        expect(Number(sphereTokenContract.allowance(test1Address, test2Address))).toBe(approveTransferValue);
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.transferFrom.sendTransaction(test1Address, ownerAddress, approveTransferValue, { from: ownerAddress });
        expect(Number(sphereTokenContract.balanceOf(test1Address))).toBe(balance1);
        expect(Number(sphereTokenContract.balanceOf(test2Address))).toBe(balance2);
        expect(Number(sphereTokenContract.balanceOf(ownerAddress))).toBe(balance3);
        //Reset approve balances
        web3.personal.unlockAccount(test1Address, masterPassword);
        sphereTokenContract.approve.sendTransaction(test2Address, 0, { from: test1Address });
    });
    it("roundUpdateOnDeposit", function () {
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        var previousRound =Number(sphereTokenContract.latestRound());
        sphereTokenContract.depositFees.sendTransaction(0, { from: ownerAddress, gas: standardTxGas });
        expect(Number(sphereTokenContract.latestRound())).toBe(previousRound + 1);
    });
    it("depositedFeesRecorded", function () {
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        var feesDeposited = toWei(10.5);
        sphereTokenContract.depositFees.sendTransaction(feesDeposited, { from: ownerAddress, gas: standardTxGas });
        var roundFees = Number(sphereTokenContract.roundFees(Number(sphereTokenContract.latestRound())));
        expect(roundFees).toBe(Number(feesDeposited));
    });
    it("totalCoinSupplyUpdatesInRounds", function () {
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        var numTokensBeforeMint = Number(sphereTokenContract.totalSupply());
        sphereTokenContract.depositFees.sendTransaction(0, { from: ownerAddress, gas: standardTxGas });
        expect(Number(sphereTokenContract.recordedCoinSupplyForRound(Number(sphereTokenContract.latestRound())))).toBe(numTokensBeforeMint);
        var mintedCoins = 1015;
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        mintCoin(ownerAddress, mintedCoins);
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.depositFees.sendTransaction(0, { from: ownerAddress, gas: standardTxGas });
        expect(Number(sphereTokenContract.recordedCoinSupplyForRound(Number(sphereTokenContract.latestRound())))).toBe(numTokensBeforeMint + mintedCoins); 
    });
    it("depositedFeesPerCoinAccuracy", function () {
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        var feesDeposited = toWei(10.5);
        var numTokens = sphereTokenContract.totalSupply();
        sphereTokenContract.depositFees.sendTransaction(feesDeposited, { from: ownerAddress, gas: standardTxGas });
        var latestRound = Number(sphereTokenContract.latestRound());
        var roundFees = Number(sphereTokenContract.roundFees(latestRound));
        expect(roundFees).toBe(Number(feesDeposited));
        expect(Number(sphereTokenContract.feePerUnitOfCoin(latestRound))).toBe(Math.floor(Number((roundFees / numTokens))));
    });
        it("claimedFeesAccuracy", function (done) {
        var numTokens = sphereTokenContract.totalSupply();
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.setDAO.sendTransaction(ownerAddress, { from: ownerAddress });
        clearAllFees();
        expect(Number(sphereTokenContract.balanceOf(ownerAddress))).toBe(0);
        expect(Number(sphereTokenContract.balanceOf(test1Address))).toBe(0);
        expect(Number(sphereTokenContract.balanceOf(test2Address))).toBe(0);
        expect(Number(sphereTokenContract.balanceOf(tokenFactoryAddress))).toBe(0);
        expect(Number(sphereTokenContract.balanceOf(sphereTokenAddress))).toBe(0);
        expect(Number(sphereTokenContract.totalSupply())).toBe(0);
        var mint1 = 40231823;
        var mint2 = 82893024;
        var mint3 = 193204;
        mintCoin(ownerAddress, mint1);
        mintCoin(test1Address, mint2);
        mintCoin(test2Address, mint3);
        var feesDeposited = toWei(10.51423);
        var feesDeposited2 = toWei(5.9517357);
        var totalClaimedFees = 0;
        var numTxs = 0;
        sphereTokenContract.Claimed().watch(function (err, tx) {
            totalClaimedFees += Number(tx.args._amount);
            numTxs++;
            if (numTxs == 3) {
                expect(totalClaimedFees).toBeLessThanOrEqual(Number(feesDeposited));
                expect(totalClaimedFees).toBeGreaterThanOrEqual(Number(feesDeposited) - Number(toWei(0.0000001)));
            }
            if (numTxs == 6) {
                expect(totalClaimedFees).toBeLessThanOrEqual(Number(feesDeposited) + Number(feesDeposited2));
                expect(totalClaimedFees).toBeGreaterThanOrEqual(Number(feesDeposited) + Number(feesDeposited2) - Number(toWei(0.0000001)));
                done();
            }
        });
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.depositFees.sendTransaction(feesDeposited, { from: ownerAddress, gas: standardTxGas });
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.claimFees.sendTransaction(ownerAddress, { from: ownerAddress });
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.claimFees.sendTransaction(test1Address, { from: ownerAddress });
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.claimFees.sendTransaction(test2Address, { from: ownerAddress });
        mintCoin(ownerAddress, mint1 * 5);
        mintCoin(test1Address, mint2 * 3);
        mintCoin(test2Address, mint3 * 1);
        setTimeout(function () {
            web3.personal.unlockAccount(ownerAddress, masterPassword);
            sphereTokenContract.depositFees.sendTransaction(feesDeposited2, { from: ownerAddress, gas: standardTxGas });
            web3.personal.unlockAccount(ownerAddress, masterPassword);
            sphereTokenContract.claimFees.sendTransaction(ownerAddress, { from: ownerAddress });
            web3.personal.unlockAccount(ownerAddress, masterPassword);
            sphereTokenContract.claimFees.sendTransaction(test1Address, { from: ownerAddress });
            web3.personal.unlockAccount(ownerAddress, masterPassword);
            sphereTokenContract.claimFees.sendTransaction(test2Address, { from: ownerAddress });
        }, 100);
    });
   it("burnReserveAccuracy", function () {
        var totalBurnedCoins = 0;
        var numTx = 0;
        var addedReserves = Number(toWei(10));
        clearAllFees();
        sphereTokenContract.Burned().watch(function (err, tx) {
            totalBurnedCoins += Number(tx.args._value);
        });
        var mint1 = 1523213;
        var mint2 = 2315161;
        mintCoin(ownerAddress, mint1);
        mintCoin(test1Address, mint2);
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        var originalReserves = Number(sphereTokenContract.reserves());
        sphereTokenContract.addReserves.sendTransaction(addedReserves, { from: ownerAddress });
        expect(Number(sphereTokenContract.reserves())).toBe(originalReserves + addedReserves);
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.burn.sendTransaction(ownerAddress, Number(sphereTokenContract.balanceOf(ownerAddress)), { from: ownerAddress });
        expect(Number(sphereTokenContract.reserves())).toBeGreaterThanOrEqual(Number(toWei(10)) * mint1 / (mint1 + mint2));
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.burn.sendTransaction(test1Address, Number(sphereTokenContract.balanceOf(test1Address)), { from: ownerAddress });
        expect(Number(sphereTokenContract.reserves())).toBeLessThanOrEqual(Number(toWei(0.000000000001)));
        
   });
   it("feeRedistributionOnTransfer", function (done) {
       clearAllFees();
       var mint1 = 40231823;
       var mint2 = 82893024;
       mintCoin(ownerAddress, mint1);
       mintCoin(test1Address, mint2);
       var addedReserves = Number(toWei(10));
       var feesDeposited = toWei(10.51423);
       web3.personal.unlockAccount(ownerAddress, masterPassword);
       sphereTokenContract.addReserves.sendTransaction(addedReserves, { from: ownerAddress });
       web3.personal.unlockAccount(ownerAddress, masterPassword);
       sphereTokenContract.depositFees.sendTransaction(feesDeposited, { from: ownerAddress, gas: standardTxGas });
       web3.personal.unlockAccount(ownerAddress, masterPassword);
       sphereTokenContract.transfer.sendTransaction(test2Address, Math.round(Number(sphereTokenContract.balanceOf(ownerAddress)) * 0.5) , { from: ownerAddress, gas: standardTxGas });
       var totalClaimedFees = 0;
       var originalReserves = Number(sphereTokenContract.reserves());
       mintCoin(test1Address, mint2);
       var numTxs = 0;
       sphereTokenContract.Claimed().watch(function (err, tx) {
           totalClaimedFees += Number(tx.args._amount);
           numTxs++;
           if (numTxs == 3) {
               expect(totalClaimedFees).toBeGreaterThanOrEqual(Number(feesDeposited) * 0.5);
               expect(totalClaimedFees).toBeLessThanOrEqual(Number(feesDeposited));
               web3.personal.unlockAccount(ownerAddress, masterPassword);
               sphereTokenContract.burn.sendTransaction(ownerAddress, Number(sphereTokenContract.balanceOf(ownerAddress)), { from: ownerAddress });
               web3.personal.unlockAccount(ownerAddress, masterPassword);
               sphereTokenContract.burn.sendTransaction(test1Address, Number(sphereTokenContract.balanceOf(test1Address)), { from: ownerAddress });
               web3.personal.unlockAccount(ownerAddress, masterPassword);
               sphereTokenContract.burn.sendTransaction(test2Address, Number(sphereTokenContract.balanceOf(test2Address)), { from: ownerAddress });
               web3.personal.unlockAccount(ownerAddress, masterPassword);
           }
       });

       sphereTokenContract.Burned().watch(function (err, tx) {
           numTxs++;
           if (numTxs == 6) {
               var reservesDispatched = originalReserves - Number(sphereTokenContract.reserves());
               expect(reservesDispatched).toBeGreaterThanOrEqual(addedReserves);
               expect(reservesDispatched + totalClaimedFees).toBeLessThanOrEqual(addedReserves + Number(feesDeposited));
               done();
           }
       });
       setTimeout(function () {
           web3.personal.unlockAccount(ownerAddress, masterPassword);
           sphereTokenContract.claimFees.sendTransaction(ownerAddress, { from: ownerAddress });
           web3.personal.unlockAccount(ownerAddress, masterPassword);
           sphereTokenContract.claimFees.sendTransaction(test1Address, { from: ownerAddress });
           web3.personal.unlockAccount(ownerAddress, masterPassword);
           sphereTokenContract.claimFees.sendTransaction(test2Address, { from: ownerAddress });
       }, 100);
   });
    
   it("preventOverspend", function () {
       clearAllFees();
       var mint1 = 82893024;
       var mint2 = 32893024;
       var mint3 = 52893024;
       mintCoin(ownerAddress, mint1);
       expect(Number(sphereTokenContract.balanceOf(ownerAddress))).toBe(mint1);
       web3.personal.unlockAccount(ownerAddress, masterPassword);
       sphereTokenContract.transfer.sendTransaction(test1Address, Math.floor(mint1 * 1.05), { from: ownerAddress });
       expect(Number(sphereTokenContract.balanceOf(ownerAddress))).toBe(mint1);
       expect(Number(sphereTokenContract.balanceOf(test1Address))).toBe(0);
       expect(Number(sphereTokenContract.totalSupply())).toBe(Number(sphereTokenContract.balanceOf(ownerAddress)));
       mintCoin(test1Address, mint2);
       mintCoin(ownerAddress, mint3);
       web3.personal.unlockAccount(test1Address, masterPassword);
       sphereTokenContract.transfer.sendTransaction(ownerAddress, Math.floor(mint2 * 1.05), { from: test1Address });
       expect(Number(sphereTokenContract.balanceOf(ownerAddress))).toBe(mint1 + mint3);
       expect(Number(sphereTokenContract.balanceOf(test1Address))).toBe(mint2);
       expect(Number(sphereTokenContract.totalSupply())).toBe(mint1 + mint2 + mint3);
       var approveTransferValue = 5000;
       web3.personal.unlockAccount(test1Address, masterPassword);
       sphereTokenContract.approve.sendTransaction(test2Address, approveTransferValue, { from: test1Address });
       expect(Number(sphereTokenContract.allowance(test1Address, test2Address))).toBe(approveTransferValue);
       web3.personal.unlockAccount(test1Address, masterPassword);
       sphereTokenContract.transferFrom.sendTransaction(test2Address, ownerAddress, approveTransferValue * 7000, { from: test1Address });
       expect(Number(sphereTokenContract.balanceOf(ownerAddress))).toBe(mint1 + mint3);
       expect(Number(sphereTokenContract.balanceOf(test1Address))).toBe(mint2);
       expect(Number(sphereTokenContract.totalSupply())).toBe(mint1 + mint2 + mint3);
   });
});
function clearAllFees() {
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    sphereTokenContract.claimFees.sendTransaction(ownerAddress, { from: ownerAddress });
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    sphereTokenContract.claimFees.sendTransaction(test1Address, { from: ownerAddress });
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    sphereTokenContract.claimFees.sendTransaction(test2Address, { from: ownerAddress });
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    sphereTokenContract.claimFees.sendTransaction(tokenFactoryAddress, { from: ownerAddress });
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    sphereTokenContract.claimFees.sendTransaction(sphereTokenAddress, { from: ownerAddress });
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    sphereTokenContract.burn.sendTransaction(ownerAddress, Number(sphereTokenContract.balanceOf(ownerAddress)), { from: ownerAddress });
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    sphereTokenContract.burn.sendTransaction(test1Address, Number(sphereTokenContract.balanceOf(test1Address)), { from: ownerAddress });
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    sphereTokenContract.burn.sendTransaction(test2Address, Number(sphereTokenContract.balanceOf(test2Address)), { from: ownerAddress });
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    sphereTokenContract.burn.sendTransaction(tokenFactoryAddress, Number(sphereTokenContract.balanceOf(tokenFactoryAddress)), { from: ownerAddress });
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    sphereTokenContract.burn.sendTransaction(sphereTokenAddress, Number(sphereTokenContract.balanceOf(sphereTokenAddress)), { from: ownerAddress });

}
function waitForBlockConfirmation(confirmations, callback, timeInterval) {
    var currentBlock = web3.eth.blockNumber;
    var loop = function () {
        setTimeout(function () {
            if (currentBlock + confirmations <= web3.eth.blockNumber) {
                callback();
            }
            else loop();
        }, timeInterval);
    };
    loop();
}
