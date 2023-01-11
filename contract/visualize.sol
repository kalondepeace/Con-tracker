// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;


contract Visualize{

	//tracking total projects created
	uint256 public NoOfProjects = 0;
	
	//total accounts registered
	uint256 public totalAccounts = 0;
	
	//declare a string array to hopefully hold the abi for us
	// string[] public emailAddresses;

	//map the email address to a bool to check whether it exists
	mapping(address => bool) public accountExists;

	//map the email address to the array with contract addressses with their abis
	mapping(uint => Detail) public contracts;


	//struct to store tthe contract details
	struct Detail{
		address owner;
		string name;
		address addr;
		string addressType;
	}


	//check whether email is registered
	function Isreg(address _address) public view returns(bool) {
		return accountExists[_address];
	}

	//register email
	function registerAccount(address _address) public{
		require(!accountExists[_address] ,"You are already registered");
		accountExists[_address] = true;
		// emailAddresses.push(_address);
		totalAccounts++;
	}


	//function to store contract details
	function storeProject(
		string memory _name,
		string memory _type,
		address _addr
	) public {
		require(accountExists[msg.sender], "You are not registered yet");
		Detail memory _detail = Detail(msg.sender, _name, _addr, _type);
		contracts[NoOfProjects] =_detail;
		NoOfProjects++;
	}

	//function to fetch contract details.
	function getContract(uint _index) public view returns(Detail memory){
		return (contracts[_index]);
	}

	//delete contract details
	function delContract(uint256 _index) public {
		delete contracts[_index];
	}


}