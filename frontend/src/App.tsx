import { ReactElement } from 'react';
import { ActivateDeactivate } from './components/ActivateDeactivate';
import { Greeter } from './components/Greeter';
import { SectionDivider } from './components/SectionDivider';
import { SignMessage } from './components/SignMessage';
import { WalletStatus } from './components/WalletStatus';

export function App(): ReactElement {
  return (
    <div style={{ display: 'grid', gridGap: '20px' }}>
      <ActivateDeactivate />
      <SectionDivider />
      <WalletStatus />
      <SectionDivider />
      <SignMessage />
      <SectionDivider />
      <Greeter />
      <SectionDivider />
    </div>
  );
}
