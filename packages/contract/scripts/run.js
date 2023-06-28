const main = async () => {
    const nftContractFactory = await hre.ethers.getContractFactory("Web3Mint");
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();
    console.log("Contract deployed to:", nftContract.address);
    // makeAnEpicNFT 関数を呼び出す。NFT が Mint される。
    let txn = await nftContract.mintIpfsNFT(
        "poker",
        "bafybeibewfzz7w7lhm33k2rmdrk3vdvi5hfrp6ol5vhklzzepfoac37lry"
    );
    await txn.wait();
    let returnedTokenUri = await nftContract.tokenURI(0);
    console.log("tokenURI:", returnedTokenUri);
};
// エラー処理を行っています。
const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};
runMain();