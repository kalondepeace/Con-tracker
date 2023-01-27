// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;
interface IERC20Token {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}



contract Visualize{

	 address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
	 address payable internal ownerAddress = payable(0x1a4b2984405a134Ec66D57fC204126411910F0D2);

	//tracking total projects created
	uint256 totalProjects = 0;
	
	//total accounts registered
	uint256 totalAccounts = 0;
	
	

	//map the account address to a bool to check whether it exists
	mapping(address=>bool) internal users;

	//mapping an index to the Project.
	mapping(uint=> Detail) internal contracts;


    //mapping for the quantity
    mapping(address => token) internal amount;


	//struct to store tthe contract details
	struct Detail{
		address owner;
		string name;
		address contractAddr;
		string Type;
	}


     //struct to store quantity details
    struct token{
        uint256 used;
        uint256 total;
    }



	//check whether user is registered
	function Isreg() public view returns(bool) {
		return users[msg.sender];

	}

	//register user
	function registerAccount() public{
		require(!users[msg.sender] ,"You are already registered");
		users[msg.sender] = true;
        token memory _token = token(0,2);
        amount[msg.sender] = _token;
		totalAccounts++;
		
	}


	//function to store contract details
	function storeProject(string memory _name, address _contractAddr, string memory _type) 
	 public{
     require(amount[msg.sender].used < amount[msg.sender].total,"You have used up  your bundle.");
		 require(users[msg.sender] == true, "You are not registered yet");
		 
		Detail memory _detail = Detail(msg.sender,_name,_contractAddr,_type);
		contracts[totalProjects] =_detail;
        amount[msg.sender].used +=1;
		totalProjects++;
		
	}


    //buying more tokenz
    function buyToken(uint256 _amount, uint256 quantity) payable public{

        require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            ownerAddress,
            _amount
          ),
          "Transfer failed."
        );
        amount[msg.sender].total += quantity;
    }


    // transfer your tokens to another user
    function transferTokens(uint _amount, address recipient) public{
        require((amount[msg.sender].total - amount[msg.sender].used) > _amount,"You dont have enough tokens to to transfer");
        require(users[recipient],"The recipient is not registered yet");
        amount[msg.sender].total -=_amount;
        amount[recipient].total += _amount;
    }




	//function to get all the projects
	function getNoProjects() public view returns(uint256){
		return totalProjects;
	}

	//function to fetch contract details.
	function getContract(uint _index) public view returns(Detail memory){
		return (contracts[_index]);
	}

    //get tokens remaining
    function getTokens() public view returns(uint256){
        token memory _amount = amount[msg.sender];
        return (_amount.total-_amount.used);
    }


	//get number of emails accounts registered
	function allAccounts() view public returns(uint){
		return totalAccounts;
	}

	//delete contract details
    //only the onwer will be able to delete it.
	function delContract(uint256 _index) public {
		require(msg.sender == contracts[_index].owner);
		delete contracts[_index];
	}



}