import { expect } from 'chai';
import { ethers, waffle } from 'hardhat';

describe('Greeter', function (): void {
  it("Should return the new greeting once it's changed", async function (): Promise<void> {
    const Greeter = await ethers.getContractFactory('Greeter');
    const greeter = await Greeter.deploy('Hello, world!');
    await greeter.deployed();

    expect(await greeter.greet()).to.equal('Hello, world!');

    const setGreetingTx = await greeter.setGreeting('Hola, mundo!', {
      value: 1000
    });
    console.log(setGreetingTx);

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal('Hola, mundo!');
  });

  it('Should contain ', async function (): Promise<void> {
    const Greeter = await ethers.getContractFactory('Greeter');
    const greeter = await Greeter.deploy('Hello, world!');
    await greeter.deployed();

    expect(await greeter.greet()).to.equal('Hello, world!');

    const setGreetingTx = await greeter.setGreeting('Hola, mundo!', {
      value: 1000
    });
    console.log(setGreetingTx);

    // wait until the transaction is mined
    await setGreetingTx.wait();

    const balance = await waffle.provider.getBalance(greeter.address);
  });
});
