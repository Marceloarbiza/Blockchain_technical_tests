// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/ICampaignSale.sol";

contract CampaignSale is ICampaignSale, Ownable {

    // The IERC20 token
    IERC20 public _ierc20;

    using Counters for Counters.Counter;

    /**
     * @notice Unique indentifier for Launch Campaign
     */
    Counters.Counter private launchCampaignIdentifier;

    /**
    * @notice Mapping for register campaigns by identifier
    */
    mapping(uint => Campaign) private campaigns;

    /**
     * @notice Mapping balance contribution by contributor
     * @dev campaignId => contributor => balance
     */
    mapping(uint => mapping(address => uint)) private balances;
    

    /**
     * @notice Modifier for check if is the creator of the campaign
     */
    modifier onlyCampaignCreator(uint _campaignIdentifier) {
        require(campaigns[_campaignIdentifier].creator == msg.sender, "Only creator can call this function.");
        _;
    }
    
    constructor(IERC20 ierc20) {
        _ierc20 = ierc20;
    }

    /// @notice Launch a new campaign. 
    /// @param _goal The goal in token to raise to unlock the tokens for the project
    /// @param _startAt Starting date of the campaign
    /// @param _endAt Ending date of the campaign
    function launchCampaign(
        uint _goal,
        uint32 _startAt,
        uint32 _endAt
    ) external override {
        require(_goal > 0, "Goal must be grater than 0.");
        require(_startAt > block.timestamp, "Campaign must start in the future.");
        require(_endAt > block.timestamp, "Campaign must end in the future.");
        require(_endAt > _startAt, "Ending date must be brefore Start date.");
        require(_endAt - _startAt <= 90 days, "A campaign should last a maximum of 90 days.");

        launchCampaignIdentifier.increment();
        uint256 _id = launchCampaignIdentifier.current();

        campaigns[_id] =  Campaign({
            creator: msg.sender,
            goal: _goal,
            pledged: 0,
            startAt: _startAt,
            endAt: _endAt,
            claimed: false
        });
        
        emit LaunchCampaign(_id, msg.sender, _goal, _startAt, _endAt);
    }

    /// @notice Cancel a campaign
    /// @param _id Campaign's id
    function cancelCampaign(uint _id) external override onlyCampaignCreator(_id) {
        require(campaigns[_id].startAt > block.timestamp, "The campaign has already started, you can't cancel it.");

        delete campaigns[_id];

        emit CancelCampaign(_id);
    }

    /// @notice Contribute to the campaign for the given amount
    /// @param _id Campaign's id
    /// @param _amount Amount of the contribution    
    function contribute(uint _id, uint _amount) external override {
        require(campaigns[_id].creator != address(0), "The campaign does not exist.");
        require(campaigns[_id].startAt < block.timestamp, "The campaign has not started yet.");
        require(campaigns[_id].endAt > block.timestamp, "The campaign has finished.");
        require(campaigns[_id].claimed == false, "The campaign has been claimed.");

        campaigns[_id].pledged += _amount;

        balances[_id][msg.sender] += _amount;

        _ierc20.transferFrom(msg.sender, address(this), _amount);

        emit Contribute(_id, msg.sender, _amount);
    }

    /// @notice Withdraw an amount from your contribution
    /// @param _id Campaign's id
    /// @param _amount Amount of the contribution to withdraw
    function withdraw(uint _id, uint _amount) external override {
        require(campaigns[_id].creator != address(0), "The campaign does not exist.");
        require(campaigns[_id].startAt < block.timestamp, "The campaign has not started yet.");
        require(campaigns[_id].endAt > block.timestamp, "The campaign has finished.");
        require(campaigns[_id].pledged >= _amount, "The amount to withdraw is greater than the amount contributed.");
        require(balances[_id][msg.sender] >= _amount, "The amount to withdraw is greater than the amount you contributed.");

        campaigns[_id].pledged -= _amount;

        balances[_id][msg.sender] -= _amount;

        _ierc20.transfer(msg.sender, _amount);

        emit Withdraw(_id, msg.sender, _amount);
    }

        /// @notice Claim all the tokens from the campaign
    /// @param _id Campaign's id
    function claimCampaign(uint _id) external override {
        require(campaigns[_id].creator != address(0), "The campaign does not exist.");
        require(campaigns[_id].creator == msg.sender, "Only creator can call this function.");
        require(campaigns[_id].endAt <= block.timestamp, "The campaign has not finished yet.");
        require(campaigns[_id].claimed == false, "Campaign was already claimed.");
        require(campaigns[_id].goal <= campaigns[_id].pledged, "The goal of the campaign has not been reached.");

        _ierc20.transfer(campaigns[_id].creator, campaigns[_id].pledged);

        campaigns[_id].pledged = 0;

        campaigns[_id].claimed = true;        

        emit ClaimCampaign(_id);
    }

    /// @notice Refund all the tokens to the sender
    /// @param _id Campaign's id
    function refundCampaign(uint _id) external override {
        require(campaigns[_id].creator != address(0), "The campaign does not exist.");
        require(campaigns[_id].endAt <= block.timestamp, "The campaign has not finished yet.");
        require(campaigns[_id].goal > campaigns[_id].pledged, "The goal of the campaign has been reached.");
        require(balances[_id][msg.sender] > 0, "You have not contributed to this campaign.");

        uint256 balanceContributor = balances[_id][msg.sender];

        campaigns[_id].pledged -= balances[_id][msg.sender];

        _ierc20.transfer(msg.sender, balances[_id][msg.sender]);

        balances[_id][msg.sender] = 0;

        emit RefundCampaign(_id, msg.sender, balanceContributor);           
    }

    /// @notice Get the campaign info
    /// @param _id Campaign's id
    function getCampaign(uint _id) external override view returns (Campaign memory campaign){
        require(campaigns[_id].creator != address(0), "The campaign does not exist.");
        
        return campaigns[_id];
    }
}