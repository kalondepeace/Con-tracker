// SPDX-License-Identifier: MIT

pragma solidity ^0.8.3;


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


	//struct to store tthe contract details
	struct Detail{
		string owner;
		string name;
		address contractAddr;
		string Type;
	}


	//check whether email is registered
	function Isreg(string memory _email) public view returns(bool) {
		return EmailExists[_email];

	}

	//register email
	function registerAccount(string memory _emailAddress) public{
		require(!EmailExists[_emailAddress] ,"You are already registered");
		EmailExists[_emailAddress] = true;
		emailAddresses.push(_emailAddress);
		totalAccounts++;
		
	}


	//function to store contract details
	function storeProject( string memory _emailAddress, string memory _name, address _contractAddr, string memory _type) 
	 public{
		 require(EmailExists[_emailAddress] == true, "You are not registered yet");
		Detail memory _detail = Detail(_emailAddress,_name,_contractAddr,_type);
		contracts[NoOfProjects] =_detail;
		NoOfProjects++;
		
	}


	//function to get all the projects
	function getNoProjects() public view returns(uint256){
		return NoOfProjects;
	}

	//function to fetch contract details.
	function getContract(uint _index) public view returns(Detail memory){
		return (contracts[_index]);
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