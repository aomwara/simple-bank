// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract Bank is Ownable {
    using SafeERC20 for ERC20;
    using SafeMath for uint256;
    address[] public account;

    mapping(address => uint256) public accountBalance;
    uint256 public bankBalance;

    address internal DAI = 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa;

    constructor() {
        account.push(msg.sender);
    }

    function createAccount(address _address) public {
        require(!isAccount(_address));
        account.push(_address);
    }

    function isAccount(address _account) public view returns (bool) {
        for (uint256 i = 0; i < account.length; i++) {
            if (account[i] == _account) {
                return true;
            }
        }
        return false;
    }

    function deposit(uint256 _amount) public {
        require(_amount > 0);
        if (!isAccount(msg.sender)) {
            account.push(msg.sender);
        }
        ERC20(DAI).safeTransferFrom(msg.sender, address(this), _amount);
        bankBalance += _amount;
        accountBalance[msg.sender] += _amount;
    }

    function withdraw(uint256 _amount) public {
        require(_amount > 0);
        require(isAccount(msg.sender));
        require(accountBalance[msg.sender] >= _amount);
        accountBalance[msg.sender] -= _amount;
        bankBalance -= _amount;
        ERC20(DAI).safeTransfer(msg.sender, _amount);
    }

    function transferTo(address _to, uint256 _amount) public {
        require(_amount > 0);
        require(isAccount(_to) && isAccount(msg.sender));
        require(accountBalance[msg.sender] >= _amount);
        accountBalance[msg.sender] -= _amount;
        accountBalance[_to] += _amount;
    }

    function balanceOf(address _account) public view returns (uint256) {
        return accountBalance[_account];
    }

    function getBankBalance() public view returns (uint256) {
        return bankBalance;
    }
}
