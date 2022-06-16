// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error TransferFailed();
error NeedsMoreThanZero();

contract StakingFinal is ReentrancyGuard, Ownable {
    IERC20 public s_rewardsToken;
    IERC20 public s_stakingToken;

    // This is the reward token per second
    // Which will be multiplied by the tokens the user staked divided by the total
    // This is a steady reward rate of the platform
    // That means that the more users stake, the less the reward is for everyone who is staking.
    uint256 public constant REWARD_RATE = 100;
    uint256 public s_lastUpdateTime;
    uint256 public s_rewardPerTokenStored;
    address[] public addresses;
    // Minimal staking period in seconds
    uint256 public minStakePeriod = 120; //2 mins

    uint256 private s_totalSupply;

    mapping(address => uint256) public s_userRewardPerTokenPaid;
    mapping(address => uint256) public s_rewards;
    mapping(address => uint256) public s_stakes;
    mapping(address => uint256) public s_lastTimeOfRewardsClaimed;

    event Staked(address indexed user, uint256 indexed amount);
    event WithdrewStake(address indexed user, uint256 indexed amount);
    event RewardsClaimed(address indexed user, uint256 indexed amount);

    constructor(address stakingToken, address rewardsToken) {
        s_stakingToken = IERC20(stakingToken);
        s_rewardsToken = IERC20(rewardsToken);
    }

    /**
     * @notice How much reward a token gets based on how long it's been in and during which "snapshots"
     */
    function rewardPerToken() public view returns (uint256) {
        if (s_totalSupply == 0) {
            return s_rewardPerTokenStored;
        }
        return
            s_rewardPerTokenStored +
            (((block.timestamp - s_lastUpdateTime) * REWARD_RATE * 1e18) / s_totalSupply);
    }

    /**
     * @notice How much reward a user has earned
     */
    function earned(address account) public view returns (uint256) {
        return
            ((s_stakes[account] * (rewardPerToken() - s_userRewardPerTokenPaid[account])) / 1e18) + s_rewards[account];
    }

    /**
     * @notice Deposit tokens into this contract
     * @param amount | How much to stake
     */
    function stake(uint256 amount)
        external
        updateReward(msg.sender)
        nonReentrant
        moreThanZero(amount)
    {
        if(!(s_stakes[msg.sender] > 0)){
            addresses.push(msg.sender);
        }
        s_totalSupply += amount;
        s_stakes[msg.sender] += amount;
        emit Staked(msg.sender, amount);
        bool success = s_stakingToken.transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert TransferFailed();
        }
    }

    /**
     * @notice Withdraw tokens from this contract
     * @param amount | How much to withdraw
     */
    function withdraw(uint256 amount) external updateReward(msg.sender) nonReentrant {
        s_totalSupply -= amount;
        s_stakes[msg.sender] -= amount;
        emit WithdrewStake(msg.sender, amount);
        bool success = s_stakingToken.transfer(msg.sender, amount);
        if (!success) {
            revert TransferFailed();
        }
    }

    /**
     * @notice User claims their tokens
     */
    function claimReward() external updateReward(msg.sender) nonReentrant {
      require(
            claimRewardsTimer(msg.sender) == 0,
            "Tried to claim rewards too soon"
        );
        s_lastTimeOfRewardsClaimed[msg.sender] = block.timestamp;
        uint256 reward = s_rewards[msg.sender];
        s_rewards[msg.sender] = 0;
        emit RewardsClaimed(msg.sender, reward);
        bool success = s_rewardsToken.transfer(msg.sender, reward);
        if (!success) {
            revert TransferFailed();
        }
    }

    // Utility function that returns the timer for claiming rewards
    function claimRewardsTimer(address _user)
        public
        view
        returns (uint256 _timer)
    {
        if (s_lastTimeOfRewardsClaimed[_user] + minStakePeriod <= block.timestamp) {
            return 0;
        } else {
            return
                (s_lastTimeOfRewardsClaimed[_user] + minStakePeriod) -
                block.timestamp;
        }
    }

    /********************/
    /* Modifiers Functions */
    /********************/
    modifier updateReward(address account) {
        s_rewardPerTokenStored = rewardPerToken();
        s_lastUpdateTime = block.timestamp;
        s_rewards[account] = earned(account);
        s_userRewardPerTokenPaid[account] = s_rewardPerTokenStored;
        _;
    }

    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert NeedsMoreThanZero();
        }
        _;
    }

    /********************/
    /* Getter Functions */
    /********************/
    function getStaked(address _stakeholder) public view returns (uint256) {
        return s_stakes[_stakeholder];
    }

    function getStakableTokensBalance(address account) public view returns (uint256) {
      return s_stakingToken.balanceOf(account);
    }

    function getRewardsTokensBalance(address account) public view returns (uint256) {
      return s_rewardsToken.balanceOf(account);
    }

    function getTotalRewardTokensSupply() public view returns (uint256) {
      return s_rewardsToken.totalSupply();
    }

    function getTotalStakingTokensSupply() public view returns (uint256) {
      return s_stakingToken.totalSupply();
    }

    function getTotalStakes() public view returns (uint256) {
      return s_totalSupply;
    }

    function getRewardPerTokenStored() public view returns (uint256) {
      return s_rewardPerTokenStored;
    }

    function getSender() public view returns (address) {
      return msg.sender;
    }

    function getOwner() public view returns (address) {
      return owner();
    }

    function isOwner(address account) public view returns (bool) {
      return owner() == account;
    }

    function getUsersStaked(address account) public view returns (address[] memory, uint[] memory) {
      require(owner() == account, "You are not the owner");
      address[] memory mAddresses = new address[](addresses.length);
      uint[] memory mStakes = new uint[](addresses.length);

      for(uint i=0; i<addresses.length; i++) {
        mAddresses[i] = addresses[i];
        mStakes[i] = s_stakes[addresses[i]];
      }

      return (mAddresses, mStakes);
    }

    function getUsersRewards(address account) public view returns (address[] memory, uint[] memory) {
      require(owner() == account, "You are not the owner");
      address[] memory mAddresses = new address[](addresses.length);
      uint[] memory mRewards = new uint[](addresses.length);

      for(uint i=0; i<addresses.length; i++) {
        mAddresses[i] = addresses[i];
        mRewards[i] = s_rewardsToken.balanceOf(addresses[i]);
      }

      return (mAddresses, mRewards);
    }
    
}