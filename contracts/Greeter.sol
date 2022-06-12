//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Greeter is Ownable {
    string private greeting;

    constructor(string memory _greeting) {
        console.log("Deploying a Greeter with greeting:", _greeting);
        greeting = _greeting;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public payable {
        uint price = 1000;
        require(msg.value >= price, "The cost is 1000 wei");

        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
        // send back any leftover change
        uint change = msg.value - price;
        payable(msg.sender).transfer(change);
    }

    function withdraw(uint amount) public onlyOwner {
        uint sendAmount;
        if (amount >= address(this).balance) {
            sendAmount = address(this).balance;
        } else {
            sendAmount = amount;
        }
        payable(msg.sender).transfer(sendAmount);
    }
}
