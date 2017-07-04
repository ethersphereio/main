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

