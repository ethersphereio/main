pragma solidity^0.4.11;


contract SafeMath {
  function safeMul(uint a, uint b) internal returns (uint) {
    uint c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }

  function safeDiv(uint a, uint b) internal returns (uint) {
    assert(b > 0);
    uint c = a / b;
    assert(a == b * c + a % b);
    return c;
  }

  function safeSub(uint a, uint b) internal returns (uint) {
    assert(b <= a);
    return a - b;
  }

  function safeAdd(uint a, uint b) internal returns (uint) {
    uint c = a + b;
    assert(c>=a && c>=b);
    return c;
  }

  function max64(uint64 a, uint64 b) internal constant returns (uint64) {
    return a >= b ? a : b;
  }

  function min64(uint64 a, uint64 b) internal constant returns (uint64) {
    return a < b ? a : b;
  }

  function max256(uint256 a, uint256 b) internal constant returns (uint256) {
    return a >= b ? a : b;
  }

  function min256(uint256 a, uint256 b) internal constant returns (uint256) {
    return a < b ? a : b;
  }

  function assert(bool assertion) internal {
    if (!assertion) {
      throw;
    }
  }
}

contract Owned {
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    address public owner;

    function Owned() {
        owner = msg.sender;
    }

    address public newOwner;

    function changeOwner(address _newOwner) onlyOwner {
        newOwner = _newOwner;
    }

    function acceptOwnership() {
        if (msg.sender == newOwner) {
            owner = newOwner;
        }
    }
}

/*
 * Haltable
 *
 * Abstract contract that allows children to implement an
 * emergency stop mechanism. Differs from Pausable by causing a throw when in halt mode.
 *
 *
 * Originally envisioned in FirstBlood ICO contract.
 */
contract Haltable is Owned {
  bool public halted;

  modifier stopInEmergency {
    if (halted) throw;
    _;
  }

  modifier onlyInEmergency {
    if (!halted) throw;
    _;
  }

  // called by the owner on emergency, triggers stopped state
  function halt() external onlyOwner {
    halted = true;
  }

  // called by the owner on end of emergency, returns to normal state
  function unhalt() external onlyOwner onlyInEmergency {
    halted = false;
  }

}

contract ERC20{
    uint256 public totalSupply;
    function balanceOf(address _owner) constant returns (uint256 balance);
    function transfer(address _to, uint256 _value) returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) returns (bool success);
    function approve(address _spender, uint256 _value) returns (bool success);
    function allowance(address _owner, address _spender) constant returns (uint256 remaining);
}

contract SphereToken is ERC20{
	function addReserves(uint value);
	function reduceReserves(uint value);
	function depositFees(uint value);
	function claimFees(address _owner) returns (uint);
	function claimFeesForRound(address _owner, uint round) returns (uint);
	function burn(address _owner, uint amount) returns (uint);
}

contract SphereFragment is ERC20{
    function burn(address _owner, uint amount) returns (uint);
}


contract ProposalManager{
    
    
}

contract SphereTokenFactory{
    function mint(address target, uint amount);
}
contract SphereDAO is Haltable, SafeMath{
    SphereToken public token;
    SphereFragment public fragment;
    address public fund;
    address public multiSig;
    uint public reserve;
    address[] public authorizedGameControllers;
    uint public numGames;
    uint public totalFees;
    uint public fragmentsPerToken = 500;
    SphereTokenFactory public tokenFactory;
    mapping(address => uint) public approvedGameFundAmounts;
    mapping(address => uint) public allocatedGameFunds;
    mapping(address => uint) public depositedFees;
    
    modifier onlyAuthorizedFunds{
        if (msg.sender != fund && msg.sender != multiSig) throw;
        _;
    }
    modifier onlyAuthorizedGames{
        if (!doesContainGame(msg.sender)) throw;
        _;
    }
    modifier onlyMultiOwner{
        if (msg.sender != multiSig) throw;
        _;
    }
	modifier onlyPayloadSize(uint size) {
		if(msg.data.length != size + 4) {
		throw;
		}
		_;
	}
	
    function viewBalance(address) onlyPayloadSize(1 * 32) constant returns(uint){
        return 0;
    }
    function viewBurnValue(address) onlyPayloadSize(1 * 32) constant returns(uint){
        return 0;
    }
    function claim() onlyPayloadSize(0) payable stopInEmergency{
        uint claimedAmount = token.claimFees(msg.sender);
        if (claimedAmount > 0){
            msg.sender.send(claimedAmount);
        }
    }
    function claim(address target) onlyPayloadSize(1 * 32) payable stopInEmergency{
        uint claimedAmount = token.claimFees(msg.sender);
        if (claimedAmount > 0){
            target.send(claimedAmount);
        }
    }
    function burn(uint amount) onlyPayloadSize(1 * 32) payable stopInEmergency{
        uint burnValue = token.burn(msg.sender, amount);
        if (burnValue > 0){
            msg.sender.send(burnValue);
        }
    }
    function burn(uint amount,address target) onlyPayloadSize(2 * 32) payable stopInEmergency{
        uint burnValue = token.burn(msg.sender, amount);
        if (burnValue > 0){
            target.send(burnValue);
        }
    }
    function exchangeFragments(uint amount) onlyPayloadSize(1 * 32) payable stopInEmergency{
        amount = amount / fragmentsPerToken * fragmentsPerToken;
        uint burnedAmount = fragment.burn(msg.sender, amount);
        uint numTokens = burnedAmount / fragmentsPerToken;
        tokenFactory.mint(this, numTokens);
        token.transfer(msg.sender, numTokens);
    }
    function viewUpcomingProposals() {
        
    }
    function vote(address proposalAddress,uint amount,uint selectedOption) stopInEmergency{
        
        
    }
    function SphereDAO(address _token){
        token = SphereToken(_token);
    }
    
    function () onlyAuthorizedFunds{
        reserve = safeAdd(reserve, msg.value);
        token.addReserves(msg.value);
    }
    
    function setAuthorizedFunds(address _fund) onlyMultiOwner stopInEmergency{
        fund = _fund;
    }
    function addAuthorizedGame(address gameController, uint amount) onlyMultiOwner stopInEmergency{
        if (doesContainGame(gameController)) throw;
        numGames++;
        authorizedGameControllers.push(gameController);
        approvedGameFundAmounts[gameController] = amount;
    }
    function approveNewGameFunding(address gameController, uint amount) onlyMultiOwner stopInEmergency{
        if (!doesContainGame(gameController)) throw;
        approvedGameFundAmounts[gameController] = amount;
    }
    function depositFee() payable onlyAuthorizedGames{
        totalFees = safeAdd(msg.value, totalFees);
        depositedFees[msg.sender] = safeAdd(msg.value, depositedFees[msg.sender]);
        token.depositFees(msg.value);
    }
    function fundGame(uint amount) payable onlyAuthorizedGames stopInEmergency{
        if (approvedGameFundAmounts[msg.sender] < safeAdd(allocatedGameFunds[msg.sender], amount)) throw;
        if (reserve < amount) throw;
        allocatedGameFunds[msg.sender] = safeAdd(allocatedGameFunds[msg.sender], amount);
        reserve = safeSub(reserve, amount);
        msg.sender.call.gas(150000).value(amount);
    }
    function doesContainGame(address gameController) constant returns (bool){
        for (uint8 i = 0; i < numGames; i++){
            if (authorizedGameControllers[i] == gameController)
                return true;
        }
        return false;
    }
}
