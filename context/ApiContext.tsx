import { createContext, ReactNode, useState } from 'react';
import { BigNumber } from 'ethers';

export const ApiContext = createContext<any>(null);

type Props = {
  children: ReactNode;
};

const ApiProvider = ({ children }: Props) => {
  const [stakerAddresses, setStakerAddresses] = useState<[string[], BigNumber[]]>([[], []]);
  const [stakerRewards, setStakerRewards] = useState<[string[], BigNumber[]]>([[], []]);

  const value = {
    stakerAddresses,
    stakerRewards,
    setStakerAddresses,
    setStakerRewards,
  };

  return (
    <>
      <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
    </>
  );
};

export default ApiProvider;
