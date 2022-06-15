import { useAddress, useContract, useDisconnect, useMetamask, useTokenDrop } from '@thirdweb-dev/react';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { useSigner, useToken, useTokenBalance } from '@thirdweb-dev/react';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { BigNumber, ethers } from 'ethers';
import Spinner from '../components/Spinner/Spinner';

const tokenDropContractAddress = '0x196314F89A06bC1E7d7B161a92317bCed56e0d77';
const tokenRewardContractAddress = '0xF1776ad3ddA88aA52c5291E53952A987E917c2D0';
const stakingContractAddress = '0xb40d3A314E99c4260da389B50FF45E3b8De70702';

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
  const rewardTokenContract = useToken(tokenRewardContractAddress);
  const { contract, isLoading } = useContract(stakingContractAddress);

  // Load Owned Tokens
  const { data: ownedTokens } = useTokenBalance(tokenDropContract, address);

  // Load Balance of Reward Token
  const { data: rewardTokenBalance } = useTokenBalance(rewardTokenContract, address);

  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  const [claimedRewards, setClaimedRewards] = useState<BigNumber>();
  const [stakedTokens, setStakedTokens] = useState<BigNumber>();
  const [loading, setLoading] = useState<boolean>(false);

  // const signer = useSigner();
  // const sdk = ThirdwebSDK.fromSigner(signer!);
  // const con = sdk.getTokenDrop(tokenDropContractAddress);

  const price = ethers.BigNumber.from('1000000000000000000');

  useEffect(() => {
    if (!contract || !address) return;
    const loadClaimableRewardsAndStakedTokens = async () => {
      const claimableRewards = await contract.call('earned', address);
      console.log('Claimable rewards', ethers.utils.formatUnits(claimableRewards, 18));
      const claimedRewards = await contract.call('getRewardsTokensBalance', address);
      console.log('Claimed rewards', ethers.utils.formatUnits(claimedRewards, 18));
      const staked = await contract.call('getStaked', address);
      console.log('Staked tokens', ethers.utils.formatUnits(staked, 18));
      setClaimableRewards(claimableRewards);
      setClaimedRewards(claimedRewards);
      setStakedTokens(staked);
    };

    loadClaimableRewardsAndStakedTokens();
  }, [address, contract]);

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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col justify-center items-center h-screen w-screen'>
      {(isLoading || loading) && <Spinner />}
      {address ? (
        <>
          <button className={style.button} onClick={disconnectWallet}>
            Disconnect Wallet
          </button>
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
          {claimableRewards && <div>Claimable rewards (CGTOK): {ethers.utils.formatUnits(claimableRewards, 18)}</div>}
          {claimedRewards && <div>Claimed rewards (CGTOK): {ethers.utils.formatUnits(claimedRewards, 18)}</div>}
        </>
      ) : (
        <div className='flex flex-col justify-center items-center h-screen w-screen'>
          <button className={style.button} onClick={connectWithMetamask}>
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
