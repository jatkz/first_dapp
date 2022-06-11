import { Contract } from 'ethers';
import {
  ChangeEvent,
  ReactElement,
  useEffect,
  useState,
  MouseEvent
} from 'react';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

export function OwnerFeatures({
  account,
  owner,
  greeterContractAddr,
  greetingBalance,
  active,
  greeting,
  greeterContract,
  getBalance
}: {
  account: string | null | undefined;
  owner: string;
  greeterContractAddr: string;
  greetingBalance: string;
  active: boolean;
  greeting: string;
  greeterContract: Contract | undefined;
  getBalance: (contract: Contract) => Promise<any>;
}): ReactElement {
  const [ownerFeatures, setOwnerFeatures] = useState<JSX.Element>(<></>);
  const [greetingWithdrawInput, setGreetingWithdrawInput] = useState<number>(0);

  function handleWithdrawChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setGreetingWithdrawInput(event.target.valueAsNumber);
  }

  function handleWithdrawSubmit(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!greeterContract) {
      window.alert('Undefined greeterContract');
      return;
    }

    if (!greetingWithdrawInput) {
      window.alert('Withdraw cannot be empty');
      return;
    }

    async function submitWithdraw(greeterContract: Contract): Promise<void> {
      try {
        const setGreetingTxn = await greeterContract.withdraw(
          greetingWithdrawInput
        );

        await setGreetingTxn.wait();

        const newBalance = await getBalance(greeterContract);
        window.alert(`Success!\n\nBalance is now: ${newBalance}`);
        setGreetingWithdrawInput(0);
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    submitWithdraw(greeterContract);
  }

  useEffect((): void => {
    let _ownerFeatures: JSX.Element;
    if (account == owner) {
      _ownerFeatures = (
        <>
          <label className="font-bold">Contract Balance</label>
          <div>
            {greeterContractAddr ? (
              greetingBalance
            ) : (
              <em>{`<Contract not yet deployed>`}</em>
            )}
          </div>
          {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
          <div></div>
          <label className="font-bold" htmlFor="greetingInput">
            Withdraw
          </label>
          <input
            id="withDrawInput"
            type="number"
            placeholder={greeting ? '' : '<Contract not yet deployed>'}
            value={greetingWithdrawInput < 0 ? 0 : greetingWithdrawInput}
            onChange={handleWithdrawChange}
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
            onClick={handleWithdrawSubmit}
          >
            Submit
          </button>
        </>
      );
    } else {
      _ownerFeatures = (
        <>
          <label className="font-bold">Contract Owner</label>
          <div>
            {greeterContractAddr ? (
              owner
            ) : (
              <em>{`<Contract not yet deployed>`}</em>
            )}{' '}
          </div>
          {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
          <div></div>
          <label className="font-bold">Current Account</label>
          <div>
            {account ? account : <em>{`<Account not yet connected>`}</em>}{' '}
          </div>
          {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
          <div></div>
        </>
      );
    }
    setOwnerFeatures(_ownerFeatures);
  }, [
    account,
    owner,
    greeterContractAddr,
    greetingBalance,
    active,
    greetingWithdrawInput
  ]);

  return ownerFeatures;
}
