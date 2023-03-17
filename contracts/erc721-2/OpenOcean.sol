// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title OpenOcean
 * @author JohnnyTime (https://smartcontractshacking.com)
 */
contract OpenOcean {
    // TODO: Complete this contract functionality

    // TODO: Constants
    uint256 constant maxPrice = 100 ether;

    // TODO: Item Struct
    struct Item {
        uint256 itemId;
        address contractAddress;
        uint256 tokenId;
        uint256 price;
        address seller;
        bool isSold;
    }

    // TODO: State Variables and Mappings
    uint256 itemsCounter;
    mapping(uint256 => Item) public items;

    constructor() {}

    // TODO: List item function
    // 1. Make sure params are correct
    // 2. Increment itemsCounter
    // 3. Transfer token from sender to the contract
    // 4. Add item to items mapping
    function listItem(
        address _collection,
        uint256 _tokenId,
        uint256 _price
    ) external {
        itemsCounter++;
        IERC721(_collection).transferFrom(msg.sender, address(this), _tokenId);
        Item memory item = Item(
            itemsCounter,
            _collection,
            _tokenId,
            _price,
            msg.sender,
            false
        );

        items[itemsCounter] = item;
    }

    // TODO: Purchase item function
    // 1. Check that item exists and not sold
    // 2. Check that enough ETH was paid
    // 3. Change item status to "sold"
    // 4. Transfer NFT to buyer
    // 5. Transfer ETH to seller
    function purchase(uint _itemId) external payable {
        require(_itemId != 0 && _itemId <= itemsCounter, "incorrect _itemId");

        Item storage item = items[_itemId];

        require(item.isSold == false, "item is not listed");
        require(msg.value == item.price, "insufficient payment");
        item.isSold = true;

        IERC721(item.contractAddress).transferFrom(
            address(this),
            msg.sender,
            item.tokenId
        );

        (bool sucess, ) = item.seller.call{value: msg.value}("");
        require(sucess, "eth transfer failed");
    }
}
