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

