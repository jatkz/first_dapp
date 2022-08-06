import { expect } from 'chai';
import { ethers, waffle } from 'hardhat';
import { Greeter } from '../typechain';

describe('Greeter', function (): void {
  let greeter: Greeter;
  beforeEach(async () => {
    const Greeter = await ethers.getContractFactory('Greeter');
    greeter = await Greeter.deploy('Hello, world!');
    await greeter.deployed();
  });

  it("Should return the new greeting once it's changed", async function (): Promise<void> {
    expect(await greeter.greet()).to.equal('Hello, world!');

    const setGreetingTx = await greeter.setGreeting('Hola, mundo!', {
      value: 1000
    });

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal('Hola, mundo!');
  });

  it('Should contain the payment in the balance after setting the greeting', async function (): Promise<void> {
    const setGreetingTx = await greeter.setGreeting('Hola, mundo!', {
      value: 1000
    });

    // wait until the transaction is mined
    await setGreetingTx.wait();

    const balance = await waffle.provider
      .getBalance(greeter.address)
      .then((d) => d.toNumber());

    expect(balance).to.equal(1000);
  });

  it('Should return change back to sender if too much was sent', async function (): Promise<void> {
    const [owner] = await ethers.getSigners();

    const startBal = await owner.getBalance();

    const setGreetingTx = await greeter.setGreeting('Hola, mundo!', {
      value: 1005
    });

    // wait until the transaction is mined
    const receipt = await setGreetingTx.wait();

    const balance = await waffle.provider
      .getBalance(greeter.address)
      .then((d) => d.toNumber());
    expect(balance).to.equal(1000);

    const endBal = await owner.getBalance();
    const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    const balanceDelta = startBal.sub(endBal);
    const paymentCost = balanceDelta.sub(gasCost);
    expect(paymentCost.toNumber()).to.equal(1000);
  });

  it('Should reject insufficient payment to set greeting', async function (): Promise<void> {
    const setGreetingTx = await greeter.setGreeting('Hola, mundo!', {
      value: 500
    });

    // wait until the transaction is mined
    await expect(setGreetingTx.wait()).to.be.reverted;
  });

  it('should allow owner to withdraw partial balance', async function (): Promise<void> {
    const [owner] = await ethers.getSigners();

    const startBal = await owner.getBalance();

    const setGreetingTx = await greeter.setGreeting('Hola, mundo!', {
      value: 1000
    });

    // wait until the transaction is mined
    const setGreetingReceipt = await setGreetingTx.wait();
    const setGreetingGasCost = setGreetingReceipt.gasUsed.mul(
      setGreetingReceipt.effectiveGasPrice
    );

    const withdrawAmount = 500;
    const withdrawTx = await greeter.withdraw(withdrawAmount);
    const withdrawReciept = await withdrawTx.wait();
    const withdrawGasCost = withdrawReciept.gasUsed.mul(
      withdrawReciept.effectiveGasPrice
    );

    await waffle.provider.getBalance(greeter.address).then((d) => d.toNumber());

    const endBal = await owner.getBalance();
    const balanceDelta = startBal.sub(endBal);
    const deltaWithoutCost = balanceDelta
      .sub(setGreetingGasCost)
      .sub(withdrawGasCost);
    expect(deltaWithoutCost).to.equal(1000 - withdrawAmount);
  });

  it('should allow owner to withdraw all balance if amount is higher', async function (): Promise<void> {
    const [owner] = await ethers.getSigners();

    const startBal = await owner.getBalance();

    const setGreetingTx = await greeter.setGreeting('Hola, mundo!', {
      value: 1000
    });

    // wait until the transaction is mined
    const setGreetingReceipt = await setGreetingTx.wait();
    const setGreetingGasCost = setGreetingReceipt.gasUsed.mul(
      setGreetingReceipt.effectiveGasPrice
    );

    const withdrawAmount = 2000;
    const withdrawTx = await greeter.withdraw(withdrawAmount);
    const withdrawReciept = await withdrawTx.wait();
    const withdrawGasCost = withdrawReciept.gasUsed.mul(
      withdrawReciept.effectiveGasPrice
    );

    await waffle.provider.getBalance(greeter.address).then((d) => d.toNumber());

    const endBal = await owner.getBalance();
    const balanceDelta = startBal.sub(endBal);
    const deltaWithoutCost = balanceDelta
      .sub(setGreetingGasCost)
      .sub(withdrawGasCost);
    expect(deltaWithoutCost).to.equal(0);
  });

  it('should reject non owner from withdrawing balance ', async function (): Promise<void> {
    const [, addr1] = await ethers.getSigners();

    const setGreetingTx = await greeter.setGreeting('Hola, mundo!', {
      value: 1000
    });

    // wait until the transaction is mined
    await setGreetingTx.wait();

    const withdrawTx = await greeter.connect(addr1).withdraw(1000);
    await expect(withdrawTx.wait()).to.be.reverted;
  });
});
