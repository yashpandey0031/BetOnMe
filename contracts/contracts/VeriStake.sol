/**
 * @title VeriStake
 * @dev A decentralized reputation market where users can stake FOR or AGAINST a profile.
 */
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VeriStake {
    struct Profile {
        uint256 id;
        address owner;
        string name;
        string description;
        uint256 totalStakeFor;
        uint256 totalStakeAgainst;
        uint256 timestamp;
    }

    struct Stake {
        address staker;
        uint256 amount;
        bool isFor;
        string reason;
        uint256 timestamp;
    }

    uint256 public profileCount;
    mapping(uint256 => Profile) public profiles;
    // profileId => mapping of Stakes
    mapping(uint256 => Stake[]) public profileStakes;

    event ProfileCreated(uint256 indexed profileId, address indexed owner, string name, string description, uint256 timestamp);
    event Staked(uint256 indexed profileId, address indexed staker, uint256 amount, bool isFor, string reason, uint256 timestamp);

    function createProfile(string memory _name, string memory _description) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        profileCount++;
        profiles[profileCount] = Profile({
            id: profileCount,
            owner: msg.sender,
            name: _name,
            description: _description,
            totalStakeFor: 0,
            totalStakeAgainst: 0,
            timestamp: block.timestamp
        });

        emit ProfileCreated(profileCount, msg.sender, _name, _description, block.timestamp);
    }

    function stake(uint256 _profileId, bool _isFor, string memory _reason) external payable {
        require(_profileId > 0 && _profileId <= profileCount, "Invalid profile ID");
        require(msg.value > 0, "Must stake some MONAD");
        require(bytes(_reason).length > 0, "Must provide a reason/evidence");

        Profile storage profile = profiles[_profileId];

        if (_isFor) {
            profile.totalStakeFor += msg.value;
        } else {
            profile.totalStakeAgainst += msg.value;
        }

        profileStakes[_profileId].push(Stake({
            staker: msg.sender,
            amount: msg.value,
            isFor: _isFor,
            reason: _reason,
            timestamp: block.timestamp
        }));

        emit Staked(_profileId, msg.sender, msg.value, _isFor, _reason, block.timestamp);
    }

    function getReputationScore(uint256 _profileId) external view returns (int256) {
        require(_profileId > 0 && _profileId <= profileCount, "Invalid profile ID");
        Profile memory p = profiles[_profileId];
        // simple score: For - Against (in wei or eth, up to the frontend to format)
        return int256(p.totalStakeFor) - int256(p.totalStakeAgainst);
    }

    function getAllProfiles() external view returns (Profile[] memory) {
        Profile[] memory allProfiles = new Profile[](profileCount);
        for (uint256 i = 1; i <= profileCount; i++) {
            allProfiles[i - 1] = profiles[i];
        }
        return allProfiles;
    }
    
    function getStakes(uint256 _profileId) external view returns (Stake[] memory) {
        return profileStakes[_profileId];
    }
}
