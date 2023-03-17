// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721 {
    uint256 public immutable MINT_PRICE = 0.1 ether;
    uint16 public immutable MAX_SUPPLY = 10000;
    uint16 public currentSupply = 0;

    constructor() ERC721("TOKEN", "TKN") {}

    function mint() external payable returns (uint16) {
        require(currentSupply < MAX_SUPPLY);
        require(msg.value >= MINT_PRICE, "insufficient amount sent");

        currentSupply += 1;
        _mint(msg.sender, currentSupply);

        return currentSupply;
    }
}
