import { ReactElement } from 'react';

export function SectionDivider(): ReactElement {
  return (
    <div
      style={{
        borderTop: '2px solid darkgrey',
        gridColumn: '1 / 1'
      }}
    ></div>
  );
}
