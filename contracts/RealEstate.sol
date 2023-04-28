//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// import the Counters, ERC721, and ERC721URIStorage contracts from the OpenZeppelin library
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// declare a contract named RealEstate that inherits from ERC721URIStorage
contract RealEstate is ERC721URIStorage {
    // use the Counters library to create a counter for tokenIds
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // declare a constructor for the RealEstate contract that calls the constructor for the ERC721URIStorage contract
    constructor() ERC721("RealEstate", "Real") {}

    // declare a function named mint that takes a string parameter named tokenURI and returns a uint256
    //used open Zepplin library to piece this together quicker
    function mint(string memory tokenURI) public returns (uint256) {
        // increment the tokenIds counter
        _tokenIds.increment();

        // get the current value of the tokenIds counter and assign it to a new variable named newItemId
        uint256 newItemId = _tokenIds.current();
        // mint a new token to the address that called the mint function
        _mint(msg.sender, newItemId);
        // return the ID of the newly minted token
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
