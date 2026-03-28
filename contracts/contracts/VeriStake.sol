// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VeriStake
 * @notice Community-priced credibility market. Users can stake for or against a profile.
 *         Reputation score updates in real time after every stake.
 */
contract VeriStake {
    uint256 public constant MIN_EVIDENCE_STAKE = 0.02 ether;

    struct Profile {
        string name;
        string description;
        string imageUrl;
        uint256 forStake;
        uint256 againstStake;
        uint256 reputationScore;
        address creator;
        uint256 createdAt;
        bool exists;
    }

    struct StakeAction {
        address user;
        uint256 profileId;
        bool isFor;
        uint256 amount;
        string evidence;
        uint256 timestamp;
    }

    uint256 public profileCount;

    mapping(uint256 => Profile) public profiles;
    mapping(uint256 => StakeAction[]) private stakeHistory;

    event ProfileCreated(
        uint256 indexed profileId,
        address indexed creator,
        string name,
        string description,
        uint256 timestamp
    );

    event Staked(
        uint256 indexed profileId,
        address indexed user,
        bool isFor,
        uint256 amount,
        string evidence,
        uint256 newReputationScore,
        uint256 totalForStake,
        uint256 totalAgainstStake,
        uint256 timestamp
    );

    error InvalidProfile();
    error InvalidAmount();
    error MissingEvidence();
    error InvalidInput();
, string calldata imageUrl) external returns (uint256 profileId) {
        if (bytes(name).length == 0 || bytes(description).length == 0 || bytes(imageUrl).length == 0) revert InvalidInput();

        profileId = profileCount;
        profileCount += 1;

        profiles[profileId] = Profile({
            name: name,
            description: description,
            imageUrl: imageUrl
            description: description,
            forStake: 0,
            againstStake: 0,
            reputationScore: 5000,
            creator: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });

        emit ProfileCreated(profileId, msg.sender, name, description, block.timestamp);
    }

    function stake(uint256 profileId, bool isFor, string calldata evidence) external payable {
        if (!profiles[profileId].exists) revert InvalidProfile();
        if (msg.value == 0) revert InvalidAmount();

        _enforceEvidence(msg.value, evidence);
        _applyStake(profileId, isFor, msg.value, evidence);
    }

    /**
     * @notice Burst stake demo for Monad throughput narrative.
     *         Splits msg.value across many rapid virtual stake actions in one tx.
     */
    function burstStake(
        uint256 profileId,
        uint8 forCount,
        uint8 againstCount,
        string calldata evidence
    ) external payable {
        if (!profiles[profileId].exists) revert InvalidProfile();
        if (msg.value == 0) revert InvalidAmount();

        uint256 totalActions = uint256(forCount) + uint256(againstCount);
        if (totalActions == 0) revert InvalidInput();

        _enforceEvidence(msg.value, evidence);

        uint256 amountPerAction = msg.value / totalActions;
        if (amountPerAction == 0) revert InvalidAmount();

        for (uint256 i = 0; i < forCount; i++) {
            _applyStake(profileId, true, amountPerAction, evidence);
        }

        for (uint256 i = 0; i < againstCount; i++) {
            _applyStake(profileId, false, amountPerAction, evidence);
        }
    }

    function getProfile(uint256 profileId)
        external
        view
        returns (
            string memory name,
            string memory imageUrl,
            uint256 forStake,
            uint256 againstStake,
            uint256 totalStake,
            uint256 reputationScore,
            address creator,
            uint256 createdAt
        )
    {
        if (!profiles[profileId].exists) revert InvalidProfile();

        Profile storage p = profiles[profileId];
        totalStake = p.forStake + p.againstStake;

        return (p.name, p.description, p.imageUrl
        return (p.name, p.description, p.forStake, p.againstStake, totalStake, p.reputationScore, p.creator, p.createdAt);
    }

    function getStakeHistoryCount(uint256 profileId) external view returns (uint256) {
        if (!profiles[profileId].exists) revert InvalidProfile();
        return stakeHistory[profileId].length;
    }

    function getStakeAction(uint256 profileId, uint256 index) external view returns (StakeAction memory) {
        if (!profiles[profileId].exists) revert InvalidProfile();
        return stakeHistory[profileId][index];
    }

    function _applyStake(uint256 profileId, bool isFor, uint256 amount, string calldata evidence) internal {
        Profile storage p = profiles[profileId];

        if (isFor) {
            p.forStake += amount;
        } else {
            p.againstStake += amount;
        }

        p.reputationScore = _calculateReputationScore(p.forStake, p.againstStake);

        stakeHistory[profileId].push(
            StakeAction({
                user: msg.sender,
                profileId: profileId,
                isFor: isFor,
                amount: amount,
                evidence: evidence,
                timestamp: block.timestamp
            })
        );

        emit Staked(
            profileId,
            msg.sender,
            isFor,
            amount,
            evidence,
            p.reputationScore,
            p.forStake,
            p.againstStake,
            block.timestamp
        );
    }

    function _enforceEvidence(uint256 amount, string calldata evidence) internal pure {
        if (amount >= MIN_EVIDENCE_STAKE && bytes(evidence).length < 8) {
            revert MissingEvidence();
        }
    }

    /**
     * @dev Simple market formula with score scaled from 0 to 10000.
     *      5000 = neutral baseline.
     */
    function _calculateReputationScore(uint256 forStake, uint256 againstStake) internal pure returns (uint256) {
        uint256 total = forStake + againstStake;
        if (total == 0) return 5000;

        return (forStake * 10000) / total;
    }
}
