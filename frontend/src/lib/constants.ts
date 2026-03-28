export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // TODO: Replace after deploying

export const VERISTAKE_ABI = [
  "event ProfileCreated(uint256 indexed profileId, address indexed owner, string name, string description, uint256 timestamp)",
  "event Staked(uint256 indexed profileId, address indexed staker, uint256 amount, bool isFor, string reason, uint256 timestamp)",
  "function createProfile(string memory _name, string memory _description) external",
  "function stake(uint256 _profileId, bool _isFor, string memory _reason) external payable",
  "function getReputationScore(uint256 _profileId) external view returns (int256)",
  "function getAllProfiles() external view returns (tuple(uint256 id, address owner, string name, string description, uint256 totalStakeFor, uint256 totalStakeAgainst, uint256 timestamp)[])",
  "function getStakes(uint256 _profileId) external view returns (tuple(address staker, uint256 amount, bool isFor, string reason, uint256 timestamp)[])",
  "function profileCount() external view returns (uint256)"
] as const;
