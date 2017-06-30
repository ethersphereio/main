
describe("Minting", function () {
    var containsMintingFactory = function (address) {
        for (var i = 0; i < Number(sphereTokenContract.numFactories()) ; i++) {
            if (sphereTokenContract.mintingFactories(i).toLowerCase() == address.toLowerCase()) return true;
        }
        return false;
    };

    it("addMintingFactory", function (done) {
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.addMintingFactory.sendTransaction(tokenFactoryAddress, { from: ownerAddress });
        expect(containsMintingFactory(tokenFactoryAddress)).toBe(true);
        done();
    });

    it("mintCoin", function (done) {
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.addMintingFactory.sendTransaction(tokenFactoryAddress, { from: ownerAddress });
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        var previousCoinSupply = Number(sphereTokenContract.totalSupply());
        var previousOwnerCoins = Number(sphereTokenContract.balanceOf(ownerAddress));
        var mintAmount = 500000;
        mintCoin(ownerAddress, mintAmount);
        expect(Number(sphereTokenContract.totalSupply())).toBe(previousCoinSupply + mintAmount);
        expect(Number(sphereTokenContract.balanceOf(ownerAddress))).toBe(previousOwnerCoins + mintAmount);
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.transfer(tokenFactoryAddress, previousOwnerCoins + mintAmount, { from: ownerAddress });
        done();
    });

 /*   it("removeMintingFactory", function (done) {
        web3.personal.unlockAccount(ownerAddress, masterPassword);
        sphereTokenContract.removeMintingFactory.sendTransaction(tokenFactoryAddress, { from: ownerAddress });
        expect(containsMintingFactory(tokenFactoryAddress)).toBe(false);
        done();
    }); */
});
function mintCoin(targetAddress, amount) {
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    tokenFactoryContract.setExchange.sendTransaction(ownerAddress, { from: ownerAddress });
    web3.personal.unlockAccount(ownerAddress, masterPassword);
    tokenFactoryContract.mint.sendTransaction(targetAddress, amount, { from: ownerAddress, gas: standardTxGas });
}