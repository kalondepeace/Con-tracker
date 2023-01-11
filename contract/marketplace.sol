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

	//tracking total projects created
	uint256 NoOfProjects = 0;
	
	//total accounts registered
	uint256 totalAccounts = 0;
	
	//declare a string array to hopefully hold the abi for us
	string[] public emailAddresses;

	//map the email address to a bool to check whether it exists
	mapping(string=>bool) public EmailExists;

	//map the email address to the array with contract addressses with their abis
	mapping(uint=> Detail) public contracts;
    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;


	//struct to store tthe contract details
	struct Detail{
		address owner;
		string emailAddress;
		string name;
		address contractAddr;
		string Type;
	}


	//check whether email is registered
	function Isreg(string calldata _email) public view returns(bool) {
		return EmailExists[_email];
	}

	//register email
	function registerAccount(string calldata _emailAddress) public{
		require(!EmailExists[_emailAddress] ,"You are already registered");
		EmailExists[_emailAddress] = true;
		emailAddresses.push(_emailAddress);
		totalAccounts++;
		
	}

	//function to store contract details
	function storeProject( 
		string calldata _emailAddress, 
		string calldata _name, 
		address _contractAddr, 
		string calldata _type) 
	 public{
		require(bytes(_emailAddress).length > 0, "Email address cannot be empty");
		require(bytes(_name).length > 0, "Name field cannot be empty");
		require(bytes(_type).length > 0, "Type cannot be empty");
		require(EmailExists[_emailAddress] == true, "You are not registered yet");


		Detail memory _detail = Detail(msg.sender,_emailAddress,_name,_contractAddr,_type);
		contracts[NoOfProjects] =_detail;
		NoOfProjects++;
		
	}

	function editContractAddress(
		address contractAddress,
		uint _index
	) public {
		require(
          IERC20Token(cUsdTokenAddress).transferFrom(
            msg.sender,
            contracts[_index].owner,
            10**24
          ),
          "Edit failed!"
        );
		contracts[_index].contractAddr = contractAddress;
	}


	//function to get all the projects
	function getNoProjects() public view returns(uint256){
		return NoOfProjects;
	}

	//function to fetch contract details.
	function getContract(uint _index) public view returns(Detail memory){
		return (contracts[_index]);
	}

	function getEmailAddresses() public view returns(string[] memory){
		return emailAddresses;
	}

	//get number of emails accounts registered
	function allAccounts() view public returns(uint){
		return totalAccounts;
	}

	//delete contract details
	function delContract(uint256 _index) public {
		delete contracts[_index];
	}


}