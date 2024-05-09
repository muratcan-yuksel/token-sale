// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AWToken is ERC20, Ownable {
    constructor() ERC20("AWToken", "AWT") Ownable(msg.sender) {
        _mint(msg.sender, 100 * 10 ** 18);
    }
}
