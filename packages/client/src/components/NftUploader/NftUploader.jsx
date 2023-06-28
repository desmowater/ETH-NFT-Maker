import { ethers } from "ethers";
import Web3Mint from "../../utils/Web3Mint.json";
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, Box } from "@mui/material";
import React from "react";
import { useEffect, useState } from 'react'
import ImageLogo from "./image.svg";
import "./NftUploader.css";
import { Web3Storage } from 'web3.storage';

const NftUploader = () => {
  const CONTRACT_ADDRESS = "0x93623570424da47Ee66518A2E5C5202434378EAA";
  /*
   * ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [maxSupply, setMaxSupply] = useState("");
  const [isMinting, setIsMinting] = useState(false);

  /*この段階でcurrentAccountの中身は空*/
  console.log("currentAccount: ", currentAccount);

  const checkIfWalletIsConnected = async () => {
    /*
     * ユーザーがMetaMaskを持っているか確認します。
     */
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      getSupplyFromContract();
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /*
       * ウォレットアドレスに対してアクセスをリクエストしています。
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      /*
       * ウォレットアドレスを currentAccount に紐付けます。
       */
      setCurrentAccount(accounts[0]);

      getSupplyFromContract();
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async (ipfs) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Web3Mint.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.mintIpfsNFT("sample", ipfs);
        console.log("Mining...please wait.");
        await nftTxn.wait();
        console.log(
          `Mined, see transaction: https://mumbai.polygonscan.com/tx/${nftTxn.hash}`
        );

        getSupplyFromContract();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSupplyFromContract = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Web3Mint.abi,
          signer
        );
        console.log("Fetching data from contract...");
        let totalSupply = Number(await connectedContract.totalSupply());
        let maxSupply = Number(await connectedContract.MAX_SUPPLY());
        console.log("Fetched!");
        setTotalSupply(totalSupply);
        setMaxSupply(maxSupply);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMinting = () => (
    <div className="mintingBox">
      <p>ミント中です...</p>
    </div>
  );

  /*
   * ページがロードされたときに useEffect()内の関数が呼び出されます。
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDI2RUJkMTBhYUE2Qzk0ZDFCMzdBQWQ2MDA4QTQ0NDE5RDZEMDdDMDQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODE0NjQ0NzYwOTgsIm5hbWUiOiJGT1JfVU5DSEFJTiJ9.kdSPw1AfuJk16pltoQ-61ht3_Jt0uLjhPZEA03RNWfg";

  const imageToNFT = async (e) => {

    setIsMinting(true);

    const client = new Web3Storage({ token: API_KEY })
    const image = e.target
    console.log(image)

    const rootCid = await client.put(image.files, {
      name: 'experiment',
      maxRetries: 3
    })
    const res = await client.get(rootCid) // Web3Response
    const files = await res.files() // Web3File[]
    for (const file of files) {
      console.log("file.cid:", file.cid)
      await askContractToMintNft(file.cid)
    }

    setIsMinting(false);
  }

  return (
    <div className="outerBox">
      {currentAccount === "" ? (
        renderNotConnectedContainer()
      ) : (
        <>
          <p>If you choose image, you can mint your NFT</p>
          <Box display="flex" alignItems="center">
            <p>Minted so far : {totalSupply} / {maxSupply} NFT </p>
            &nbsp;&nbsp;
            <Button
              variant="outlined"
              onClick={() => window.open("https://gemcase.vercel.app/view/evm/mumbai/0x93623570424da47ee66518a2e5c5202434378eaa", "_blank")}
            >
              見てみる
            </Button>
          </Box>
        </>


      )}
      <div className="title">
        <h2>NFTアップローダー</h2>
      </div>
      <div className="nftUplodeBox">
        {isMinting ? (
          renderMinting()
        ) : (
          <><div className="imageLogoAndText">
            <img src={ImageLogo} alt="imagelogo" />
            <p>ここにドラッグ＆ドロップしてね</p>
          </div><input className="nftUploadInput" multiple name="imageURL" type="file" accept=".jpg , .jpeg , .png" onChange={imageToNFT} /></>
        )}

      </div>
      {isMinting ? (
        <p>...</p>
      ) : (
        <p>または</p>
      )}
      <LoadingButton
        loading={isMinting}
        variant="contained"
      >
        <span>ファイルを選択</span>
        <input className="nftUploadInput" type="file" accept=".jpg , .jpeg , .png" onChange={imageToNFT} />
      </LoadingButton>

    </div >
  );
};

export default NftUploader;