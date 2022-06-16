import { useAddress, useContract, useDisconnect, useMetamask, useTokenDrop } from '@thirdweb-dev/react';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { useSigner, useToken, useTokenBalance } from '@thirdweb-dev/react';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import Spinner from '../components/Spinner/Spinner';

const tokenDropContractAddress = '0x196314F89A06bC1E7d7B161a92317bCed56e0d77';
const stakingContractAddress = '0xa585386576370376942CA0C82e491e0D38740C0c';

const style = {
  button:
    'border border-[#282b2f] bg-[#8a9ad1] p-[0.5rem] my-2 text-xl font-semibold rounded-lg cursor-pointer text-black w-[200px]',
};

const Home: NextPage = () => {
  // Wallet Connection Hooks
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();

  // Contract Hooks
  const tokenDropContract = useTokenDrop(tokenDropContractAddress);
  const { contract, isLoading } = useContract(stakingContractAddress);

  // Load Owned Tokens
  const { data: ownedTokens } = useTokenBalance(tokenDropContract, address);

  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  const [claimedRewards, setClaimedRewards] = useState<BigNumber>();
  const [stakedTokens, setStakedTokens] = useState<BigNumber>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isOwner, setIsQwner] = useState<boolean | undefined>(undefined);
  const [stakerAddresses, setStakerAddresses] = useState<any[][]>([]);
  const [stakerRewards, setStakerRewards] = useState<any[][]>([]);

  // const signer = useSigner();
  // const sdk = ThirdwebSDK.fromSigner(signer!);
  // const con = sdk.getTokenDrop(tokenDropContractAddress);

  const price = ethers.BigNumber.from('1000000000000000000');

  useEffect(() => {
    if (!contract || !address) return;

    const checkIfOwner = async () => {
      const isOwner = await contract.call('isOwner', address);
      setIsQwner(isOwner);
    };
    checkIfOwner();
  }, [address, contract]);

  useEffect(() => {
    if (!contract || !address || isOwner === undefined) return;

    const loadOwnerView = async () => {
      try {
        setLoading(true);
        const usersStaked = await contract.call('getUsersStaked', address);
        console.log(usersStaked);
        const usersRewards = await contract.call('getUsersRewards', address);
        console.log(usersRewards);
        setStakerAddresses(usersStaked);
        setStakerRewards(usersRewards);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    isOwner ? loadOwnerView() : updateUserView();
  }, [address, contract, isOwner]);

  const updateUserView = async () => {
    try {
      const claimableRewards = await contract?.call('earned', address);
      console.log('Claimable rewards', ethers.utils.formatUnits(claimableRewards, 18));
      const claimedRewards = await contract?.call('getRewardsTokensBalance', address);
      console.log('Claimed rewards', ethers.utils.formatUnits(claimedRewards, 18));
      const staked = await contract?.call('getStaked', address);
      console.log('Staked tokens', ethers.utils.formatUnits(staked, 18));
      setClaimableRewards(claimableRewards);
      setClaimedRewards(claimedRewards);
      setStakedTokens(staked);
    } catch (error) {
      console.log(error);
    }
  };

  const claimTokens = async (num: string | null) => {
    if (num === null) return;
    try {
      setLoading(true);
      const tx = await tokenDropContract?.claimTo(address!, +num);
      alert('Minted tokens successfully');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const stakeTokens = async (num: string | null) => {
    if (num === null) return;
    try {
      setLoading(true);
      // const al = await tokenDropContract?.allowanceOf(address!, stakingContractAddress);
      const sal = await tokenDropContract?.setAllowance(stakingContractAddress, +num);
      const result = await contract?.call('stake', ethers.BigNumber.from(+num).mul(price));
      alert('Staked tokens successfully');
      updateUserView();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const withdrawTokens = async (num: string | null) => {
    if (num === null) return;
    try {
      setLoading(true);
      const result = await contract?.call('withdraw', ethers.BigNumber.from(+num).mul(price));
      alert('Tokens are withdrawn successfully');
      updateUserView();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    try {
      setLoading(true);
      const result = await contract?.call('claimReward');
      alert('Rewards claimed successfully');
      updateUserView();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center w-screen h-screen'>
      {(isLoading || loading) && <Spinner />}
      {address ? (
        <>
          <button className={style.button} onClick={disconnectWallet}>
            Disconnect Wallet
          </button>
          {isOwner && (
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
          )}
          {isOwner === false && (
            <>
              <button
                className={style.button}
                onClick={() => claimTokens(prompt('How many tokens do you want to claim?', ''))}
              >
                Claim tokens
              </button>
              <button
                className={style.button}
                onClick={() => stakeTokens(prompt('How many tokens do you want to stake?', ''))}
              >
                Stake tokens
              </button>
              <button
                className={style.button}
                onClick={() => withdrawTokens(prompt('How many tokens do you want to withdraw?', ''))}
              >
                Withdraw tokens
              </button>
              <button className={style.button} onClick={() => claimRewards()}>
                Get rewards
              </button>
              <p>Your address: {address}</p>
              {ownedTokens && <div>Ownned tokens (NTOK): {ownedTokens.displayValue}</div>}
              {stakedTokens && <div>Staked tokens (NTOK): {ethers.utils.formatUnits(stakedTokens, 18)}</div>}
              {claimableRewards && (
                <div>Claimable rewards (CGTOK): {ethers.utils.formatUnits(claimableRewards, 18)}</div>
              )}
              {claimedRewards && <div>Claimed rewards (CGTOK): {ethers.utils.formatUnits(claimedRewards, 18)}</div>}
            </>
          )}
        </>
      ) : (
        <div className='flex flex-col items-center justify-center w-screen h-screen'>
          <button className={style.button} onClick={connectWithMetamask}>
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
