// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HackersToken is ERC20 {
    address owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "not the owner");
        _;
    }

    constructor() ERC20("TOKEN", "TKN") {
        owner = msg.sender;
    }

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }
}
