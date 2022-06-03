import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useState
} from 'react';
import GreeterArtifact from '../artifacts/contracts/Greeter.sol/Greeter.json';
import { Provider } from '../utils/provider';
import { SectionDivider } from './SectionDivider';

export function Greeter(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active } = context;

  const [signer, setSigner] = useState<Signer>();
  const [greeterContract, setGreeterContract] = useState<Contract>();
  const [greeterContractAddr, setGreeterContractAddr] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');
  const [greetingInput, setGreetingInput] = useState<string>('');

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  useEffect((): void => {
    if (!greeterContract) {
      return;
    }

    async function getGreeting(greeterContract: Contract): Promise<void> {
      const _greeting = await greeterContract.greet();

      if (_greeting !== greeting) {
        setGreeting(_greeting);
      }
    }

    getGreeting(greeterContract);
  }, [greeterContract, greeting]);

  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the Greeter contract one time, when a signer is defined
    if (greeterContract || !signer) {
      return;
    }

    async function deployGreeterContract(signer: Signer): Promise<void> {
      const Greeter = new ethers.ContractFactory(
        GreeterArtifact.abi,
        GreeterArtifact.bytecode,
        signer
      );

      try {
        const greeterContract = await Greeter.deploy('Hello, Hardhat!');

        await greeterContract.deployed();

        const greeting = await greeterContract.greet();

        setGreeterContract(greeterContract);
        setGreeting(greeting);

        window.alert(`Greeter deployed to: ${greeterContract.address}`);

        setGreeterContractAddr(greeterContract.address);
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    deployGreeterContract(signer);
  }

  function handleGreetingChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setGreetingInput(event.target.value);
  }

  function handleGreetingSubmit(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!greeterContract) {
      window.alert('Undefined greeterContract');
      return;
    }

    if (!greetingInput) {
      window.alert('Greeting cannot be empty');
      return;
    }

    async function submitGreeting(greeterContract: Contract): Promise<void> {
      try {
        const setGreetingTxn = await greeterContract.setGreeting(greetingInput);

        await setGreetingTxn.wait();

        const newGreeting = await greeterContract.greet();
        window.alert(`Success!\n\nGreeting is now: ${newGreeting}`);

        if (newGreeting !== greeting) {
          setGreeting(newGreeting);
        }
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    submitGreeting(greeterContract);
  }

  return (
    <>
      <button
        disabled={!active || greeterContract ? true : false}
        style={{
          width: '180px',
          height: '2rem',
          borderRadius: '1rem',
          placeSelf: 'center',
          cursor: !active || greeterContract ? 'not-allowed' : 'pointer',
          borderColor: !active || greeterContract ? 'unset' : 'blue'
        }}
        onClick={handleDeployContract}
      >
        Deploy Greeter Contract
      </button>
      <SectionDivider />
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '1fr 1fr 1fr',
          gridTemplateColumns: '135px 2.7fr 1fr',
          gridGap: '10px',
          placeSelf: 'center',
          alignItems: 'center'
        }}
      >
        <label className="font-bold">Contract addr</label>
        <div>
          {greeterContractAddr ? (
            greeterContractAddr
          ) : (
            <em>{`<Contract not yet deployed>`}</em>
          )}
        </div>
        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
        <div></div>
        <label className="font-bold">Current greeting</label>
        <div>
          {greeting ? greeting : <em>{`<Contract not yet deployed>`}</em>}
        </div>
        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
        <div></div>
        <label className="font-bold" htmlFor="greetingInput">
          Set new greeting
        </label>
        <input
          id="greetingInput"
          type="text"
          placeholder={greeting ? '' : '<Contract not yet deployed>'}
          onChange={handleGreetingChange}
          style={{
            fontStyle: greeting ? 'normal' : 'italic',
            padding: '0.4rem 0.6rem',
            lineHeight: '2fr'
          }}
        ></input>
        <button
          disabled={!active || !greeterContract ? true : false}
          style={{
            width: '150px',
            height: '2rem',
            borderRadius: '1rem',
            cursor: !active || !greeterContract ? 'not-allowed' : 'pointer',
            borderColor: !active || !greeterContract ? 'unset' : 'blue'
          }}
          onClick={handleGreetingSubmit}
        >
          Submit
        </button>
      </div>
    </>
  );
}
