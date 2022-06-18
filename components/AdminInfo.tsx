import { ethers } from 'ethers';
import React, { useContext } from 'react';
import { ApiContext } from '../context/ApiContext';

const AdminInfo = () => {
  const { stakerAddresses, stakerRewards } = useContext(ApiContext);

  return (
    <div>
      {stakerAddresses[0] && stakerAddresses[0].length ? (
        <ul className='mt-4'>
          {stakerAddresses[0].map((addr, index) => (
            <li key={index}>
              Addresss {addr} has stakes {ethers.utils.formatUnits(stakerAddresses[1][index], 18)}
            </li>
          ))}
        </ul>
      ) : (
        <div>There are no stakes yet</div>
      )}
      {stakerRewards[0] && stakerRewards[0].length ? (
        <ul className='mt-4'>
          {stakerRewards[0].map((addr, index) => (
            <li key={index}>
              Addresss {addr} has rewards {ethers.utils.formatUnits(stakerRewards[1][index], 18)}
            </li>
          ))}
        </ul>
      ) : (
        <div>There are no rewards yet</div>
      )}
    </div>
  );
};

export default AdminInfo;
