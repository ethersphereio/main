# Documentation

Information regarding EtherSphere games and tokens can be found in the [whitepaper](https://ico.ethersphere.io/whitepaper).

```diff
libs: contains all external dependencies
solidity: Ethereum smart contracts
tests: Jasmine unit test
```

# SphereTokens

Sphere token is a ERC20 standard token that encapsulates additional features to record and allocate received game fees. Revenue distribution architecture is stipulated under the interface:

```diff
contract CollectibleFeeToken {

    event Claimed(address indexed _owner, uint256 _amount);

    mapping(uint => uint) public roundFees;

    mapping(uint => uint) public recordedCoinSupplyForRound;

    mapping(uint => mapping (address => uint)) public claimedFees;

    mapping(address => uint) public lastClaimedRound;

    uint public latestRound = 0;

    uint public initialRound = 1;

    function claimFees(address _owner);

    function claimFeesForRound(address _owner, uint round);

    function feePerUnitOfCoin(uint round);
    
}
```

Due to memory and gas constraints, it is not possible to record all token holder information necessary for accurate distribution of revenue. A workaround is to record total fees and supply for each round, track all claim events and coin transfers to eventually determine the remaining funds claimable for each token holder.

Upon each transfer, the receipient's claimable fees are reset.

```diff
for (uint i = lastClaimedRound[_owner] + 1; i <= latestRound; i++){
    uint feeForRound = balances[_owner] * feePerUnitOfCoin(i);
    if (feeForRound > claimedFees[i][_owner]) {
        //Add unclaimed fees to reserves
        uint unclaimedFees = min256(numCoins * feePerUnitOfCoin(i), safeSub(feeForRound, claimedFees[i][_owner]));
        reserves = safeAdd(reserves, unclaimedFees);
        claimedFees[i][_owner] = safeAdd(claimedFees[i][_owner], unclaimedFees);
    }
}
for (uint x = lastClaimedRound[_receipient] + 1; x <= latestRound; x++){
    //Empty fees for new receipient
    claimedFees[x][_receipient] = safeAdd(claimedFees[x][_receipient], numCoins * feePerUnitOfCoin(x));
}
```

Burn functionality is added to allow reserve funds to be claimed by token holders.

```diff
contract BurnableToken {

    event Burned(address indexed _owner, uint256 _value);

    function burn(address _owner, uint amount);
    
}
```

# SphereFragments

Reward fragments that are core to EtherSphere 2.0 gameplay. It is ERC20 standard, but has no additional functionality other than to serve as a burnable token to exchange for reward ethers.

```diff
contract BurnableToken {

    event Burned(address indexed _owner, uint256 _value);

    function burn(address _owner, uint amount);
    
}
```

# SphereDAO

Controls access to protected functions in SphereToken and SphereFragment. SphereDAO is responsible for storing actual ethers of reserves and fees from game. 

## Game authorization

Only authorized games are allowed access to funds and can deposit fees/alter round records through the DAO. 

```diff
address[] public authorizedGameControllers;
```

## Fragment exchange

The DAO also allows the exchange of fragments for tokens. In order to achieve this, the DAO is also inherently granted minting permissions from SphereToken. 

```diff
function exchangeFragments(uint amount);
```

## Claiming fees

Fee information is stored in each token in order to allow transfer information to be incorporated into entitlement determination for each token holder. Actual revenue is first deposited by authorized games during reset.

```diff
function depositFee();
```

Addresses that invoke the claim fee functionality will cause the DAO to calculate fee entitlement amount and subsequently disburse a portion of its balance to the owner. Claiming of fee has to be manually invoked and gas paid for by the invoker.

```diff
function claim();
function claim(address target);
```

# Testing

Testing is essential in ensuring contracts run with 100% reliability and accuracy as required on a production application that is immutable on the blockchain. Issues related to smart contract creates not just hindrnace in user experience but security concerns that can lead to fund compromise. Therefore, it is important that testing is done properly and thoroughly.

## Parity Dev

Parity is used for running test node. Standard nodes require block confirmations created through mining in order for transactions to be processed. This delay in transaction processing from time of broadcast or transaction invocation creates a lot of asynchronous processing issues.

In order to simplify testing, parity is run on dev mode with instant seal on to allow for instant transaction incorporation into the block. 

```diff
parity --chain dev
```
As such, all tests defined assume synchronous operation of blockchain calls.

## Jasmine Testing Framework

On top of managing the simulated Ethereum environment responsible for creating test transactions and hosting contracts, a test framework is also necessary. 

```diff
<script src="https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.6.1/jasmine.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.6.1/jasmine-html.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jasmine/2.6.1/boot.min.js"></script>
```