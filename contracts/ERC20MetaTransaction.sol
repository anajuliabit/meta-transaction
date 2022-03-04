//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";

contract ERC20MetaTransaction is ERC20, BaseRelayRecipient {
    constructor(address _trustedForwarder) public ERC20("Test", "TEST") {
        _mint(msg.sender, 1000 * 10**18);
        trustedForwarder = _trustedForwarder;
    }

    function setTrustedForwarder(address _trustedForwarder) public {
        trustedForwarder = _trustedForwarder;
    }

    function versionRecipient() external view override returns (string memory) {
        return "1";
    }

    function _msgSender()
        internal
        view
        override(Context, BaseRelayRecipient)
        returns (address payable)
    {
        return BaseRelayRecipient._msgSender();
    }

    function _msgData()
        internal
        view
        override(Context, BaseRelayRecipient)
        returns (bytes memory)
    {
        return BaseRelayRecipient._msgData();
    }
}
