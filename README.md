# Documentation

Information regarding EtherSphere games and tokens can be found in the [whitepaper](https://ico.ethersphere.io/whitepaper).
Development progress and documents can be found in the following folders:

```diff
libs: contains all external dependencies
solidity: Ethereum smart contracts
tests: Jasmine unit tests in javascript
```

All information uploaded are provided for transparency and accountability.

# SphereTokens

ERC20 standard token that encapsulates additional features to record and allocate received game fees. Revenue distribution architecture is stipulated under the interface:

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