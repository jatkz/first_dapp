import { useWeb3React } from '@web3-react/core';
import { MouseEvent, ReactElement } from 'react';
import { Provider } from '../utils/provider';

export function SignMessage(): ReactElement {
  const context = useWeb3React<Provider>();
  const { account, active, library } = context;

  function handleSignMessage(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!library || !account) {
      window.alert('Wallet not connected');
      return;
    }

    async function signMessage(
      library: Provider,
      account: string
    ): Promise<void> {
      try {
        const signature = await library.getSigner(account).signMessage('👋');
        window.alert(`Success!\n\n${signature}`);
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    signMessage(library, account);
  }

  return (
    <button
      disabled={!active ? true : false}
      style={{
        width: '150px',
        height: '2rem',
        borderRadius: '1rem',
        placeSelf: 'center',
        cursor: !active ? 'not-allowed' : 'pointer',
        borderColor: !active ? 'unset' : 'blue'
      }}
      onClick={handleSignMessage}
    >
      Sign Message
    </button>
  );
}
