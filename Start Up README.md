yarn hardhat node

frontend

cd frontend
yarn start

Tailwind integration

Make people pay 💰to change the greeting. 😃 Change the Greeter.sol's setGreeting() function to be payable. Then write a withdraw() function in the contract and add withdraw functionality into the frontend Dapp. Ensure only the owner of the Greeter contract can withdraw money. Check out OpenZeppelin’s Ownable.sol contract for inspiration on how to do this.

Currently the Dapp only allows you to deploy 1 instance of the Greeter contract. Add functionality to the Dapp that allows you to deploy and interact with multiple instances of the Greeter contract.

The Dapp works with the local Hardhat network. Modify the Dapp functionality to deploy and interact with the Greeter contract on a test network like Rinkeby or Ropsten.
