//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./libs/EIP712MetaTransaction.sol";

contract ERC20MetaTransaction is ERC20, EIP712MetaTransaction {
    constructor() ERC20("Test", "TEST") EIP712MetaTransaction("Test", "1") {
        _mint(msgSender(), 1000 * 10**decimals());
    }

    /**
     * This is used instead of msg.sender as transactions won't be sent by the original token owner, but by OpenSea.
     */
    function _msgSender() internal view override returns (address sender) {
        return msgSender();
    }
}
