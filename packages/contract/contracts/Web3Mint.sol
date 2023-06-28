// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;
// いくつかの OpenZeppelin のコントラクトをインポートします。
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./libraries/Base64.sol";
import "hardhat/console.sol";
// インポートした OpenZeppelin のコントラクトを継承しています。
// 継承したコントラクトのメソッドにアクセスできるようになります。
contract Web3Mint is ERC721 {

    uint256 public constant MAX_SUPPLY = 50;

    struct NftAttributes{
        string name;
        string imageURL;
    }

    NftAttributes[] Web3Nfts;

    using Counters for Counters.Counter;
    // _tokenIdsを初期化（_tokenIds = 0）
    Counters.Counter private _tokenIds;

    constructor() ERC721 ("NFT","nft") {
    console.log("This is my NFT contract.");
    }

    // ユーザーが NFT を取得するために実行する関数です。
    function mintIpfsNFT(string memory name,string memory imageURI) public{
        uint256 newItemId = _tokenIds.current();
        require (newItemId < MAX_SUPPLY, "Exceeds max supply.");
        _safeMint(msg.sender,newItemId);
        Web3Nfts.push(NftAttributes({
            name: name,
            imageURL: imageURI
        }));
        console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
        _tokenIds.increment();
    }

    function tokenURI(uint256 _tokenId) public override view returns(string memory){
    string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                    '{"name": "',
                    Web3Nfts[_tokenId].name,
                    ' -- NFT #: ',
                    Strings.toString(_tokenId),
                    '", "description": "An epic NFT", "image": "ipfs://',
                    Web3Nfts[_tokenId].imageURL,'"}'
                )
            )
        )
    );
    string memory output = string(
        abi.encodePacked("data:application/json;base64,", json)
    );
    return output;
    }

    function totalSupply() external view returns(uint256) {
        return  _tokenIds.current();
    }
}