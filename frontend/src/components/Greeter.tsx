import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, providers, Signer } from 'ethers';
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState
} from 'react';
import GreeterArtifact from '../artifacts/contracts/Greeter.sol/Greeter.json';
import { Provider } from '../utils/provider';
import { SectionDivider } from './SectionDivider';
import '../headless-components/list-box';
import ListBox from '../headless-components/list-box';
import { useLocalStorage } from '../utils/useLocalStorage';
import { OwnerFeatures } from './greeter-components/OwnerFeatures';

const defaultContractAddrArray: ContractAddressStore = {
  addresses: ['<No Contract selected>'],
  current: '<No Contract selected>'
};

const CONTRACT_ADDRESSES = 'CONTRACT_ADDRESSES';
interface ContractAddressStore {
  addresses: string[];
  current: string;
}

export function Greeter(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active, account } = context;

  const [signer, setSigner] = useState<Signer>();
  const [greeterContract, setGreeterContract] = useState<Contract>();
  const [contractStore, setContractStore] =
    useLocalStorage<ContractAddressStore>(
      CONTRACT_ADDRESSES,
      defaultContractAddrArray
    );
  const ContractStoreUtils = {
    pushAddress: (addr: string) => {
      setContractStore({
        addresses: [...contractStore.addresses, addr],
        current: contractStore.current
      });
    },
    activateNewAddress: (addr: string) => {
      setContractStore({
        addresses: [...contractStore.addresses, addr],
        current: addr
      });
    },
    setCurrent: (addr: string) => {
      setContractStore({
        addresses: contractStore.addresses,
        current: addr
      });
    }
  };

  const [greeting, setGreeting] = useState<string>('');
  const [greetingInput, setGreetingInput] = useState<string>('');

  const [greetingBalance, setGreetingBalance] = useState<string>('');
  const [owner, setOwner] = useState<string>('');

  async function getGreeting(greeterContract: Contract): Promise<void> {
    const _greeting = await greeterContract.greet();

    if (_greeting !== greeting) {
      setGreeting(_greeting);
    }
  }
  async function getBalance(greeterContract: Contract) {
    const newBalance = await greeterContract.provider
      .getBalance(greeterContract.address)
      .then((d) => d.toString());
    if (newBalance !== greetingBalance) {
      setGreetingBalance(ethers.utils.formatEther(newBalance));
    }
    return newBalance;
  }

  // library change setting the signer
  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }
    setSigner(library.getSigner());
  }, [library]);

  // greeter contract is the top most data, thus changing it updates everything else
  useEffect((): void => {
    if (!greeterContract) {
      if (contractStore?.current && signer) {
        const _greeterContract = new ethers.Contract(
          contractStore.current,
          GreeterArtifact.abi,
          signer
        );
        setGreeterContract(_greeterContract);
      }
      return;
    }

    getGreeting(greeterContract);
    getBalance(greeterContract);
    ContractStoreUtils.setCurrent(greeterContract.address);

    async function getOwner(ownable: Contract): Promise<void> {
      const _owner = await ownable.owner();

      if (_owner !== owner) {
        setOwner(_owner);
      }
    }

    getOwner(greeterContract);
  }, [greeterContract]);

  // if the selected address changes update the greeter contract
  useEffect((): void => {
    if (!greeterContract) return;
    const _contract = greeterContract.attach(contractStore.current);
    setGreeterContract(_contract);
  }, [contractStore?.current]);

  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the Greeter contract when a signer is defined
    if (!signer) {
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

        ContractStoreUtils.activateNewAddress(greeterContract.address);
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
        const setGreetingTxn = await greeterContract.setGreeting(
          greetingInput,
          {
            value: 1000
          }
        );

        await setGreetingTxn.wait();

        const newGreeting = await greeterContract.greet();
        window.alert(`Success!\n\nGreeting is now: ${newGreeting}`);
        setGreetingInput('');

        if (newGreeting !== greeting) {
          setGreeting(newGreeting);
        }
        await getBalance(greeterContract);
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
        disabled={!active ? true : false}
        style={{
          width: '180px',
          height: '2rem',
          borderRadius: '1rem',
          placeSelf: 'center',
          cursor: !active ? 'not-allowed' : 'pointer',
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
        <ListBox
          selections={contractStore?.addresses}
          selected={contractStore?.current}
          setSelected={ContractStoreUtils.setCurrent}
          label={'Contract addr'}
        ></ListBox>
        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
        <div></div>
        <label className="font-bold block text-gray-700">
          Current greeting
        </label>
        <div>
          {greeting ? greeting : <em>{`<Contract not yet deployed>`}</em>}
        </div>
        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
        <div></div>
        <label
          className="font-bold block text-gray-700"
          htmlFor="greetingInput"
        >
          Set new greeting (1000 wei)
        </label>
        <input
          id="greetingInput"
          type="text"
          placeholder={greeting ? '' : '<Contract not yet deployed>'}
          onChange={handleGreetingChange}
          value={greetingInput}
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
      <SectionDivider />
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '1fr 1fr',
          gridTemplateColumns: '135px 2.7fr 1fr',
          gridGap: '10px',
          placeSelf: 'center',
          alignItems: 'center'
        }}
      >
        <OwnerFeatures
          account={account}
          owner={owner}
          greeterContractAddr={contractStore?.current}
          greetingBalance={greetingBalance}
          active={active}
          greeting={greeting}
          greeterContract={greeterContract}
          getBalance={getBalance}
        ></OwnerFeatures>
      </div>
    </>
  );
}
