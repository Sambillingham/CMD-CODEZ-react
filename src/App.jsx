import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import './styles/App.css';
import mp3 from './assets/bg-audio.mp3';
import cmdCodezNFT from './utils/CmdCodezNFT.json';

const CONTRACT_ADDRESS = "0x065dCEA8d4B7C6337802d293bEFA79020be64fF4";


// Constants
const OPENSEA_LINK = '';


const App = () => {
  // Render Methods
  const [currentAccount, setCurrentAccount] = useState("");
  const [networkId, setNetworkId] = useState('0x4');
  const [networkName, setNetworkName] = useState('*******');
  const [mintedAmount, setMintedAmount] = useState('/'.repeat(20));
  const [loading, setLoading] = useState(0);
  
  const [message, setMessage] = useState('');
  let mintedNum = 0;


  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account)
      setupEventListener()
    } else {
      console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const chainId = await ethereum.request({ method: 'eth_chainId' });

      setNetworkId(chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4"; 
      if (chainId != rinkebyChainId) {
        setNetworkId(chainId);
      } else {
        setNetworkName('**** RINKEBY    ')
      }
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  // Setup our listener.
  const setupEventListener = async () => {
  
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const cmdCodez = new ethers.Contract(CONTRACT_ADDRESS, cmdCodezNFT.abi, signer);

        let chainId = await ethereum.request({ method: 'eth_chainId' });

         setNetworkId(chainId);

        // String, hex code of the chainId of the Rinkebey test network
        const rinkebyChainId = "0x4"; 
        if (chainId != rinkebyChainId) {
          setNetworkId(chainId);
        } else {
          setNetworkName('**** RINKEBY    ')
        }

        cmdCodez.on("CmdCodezNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          setMessage(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);

          setLoading(20);
        });

        console.log("Setup event listener!")

        let nftMinted = await cmdCodez.getTotalNFTsMinted();

        mintedNum = nftMinted.toNumber();
        setMintedAmount(returnMintedString(mintedNum));
        

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, cmdCodezNFT.abi, signer);

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.buildNFT();

        
        startTimer(setLoading);

        await nftTxn.wait();

        setMintedAmount(returnMintedString(mintedNum+1));

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const renderNotConnectedContainer = () => (
    <div className="window window--block">
      <div className="ascii ascii--intro">

░█████╗░███╗░░░███╗██████╗░  ░█████╗░░█████╗░██████╗░███████╗███████╗
██╔══██╗████╗░████║██╔══██╗  ██╔══██╗██╔══██╗██╔══██╗██╔════╝╚════██║
██║░░╚═╝██╔████╔██║██║░░██║  ██║░░╚═╝██║░░██║██║░░██║█████╗░░░░███╔═╝
██║░░██╗██║╚██╔╝██║██║░░██║  ██║░░██╗██║░░██║██║░░██║██╔══╝░░██╔══╝░░
╚█████╔╝██║░╚═╝░██║██████╔╝  ╚█████╔╝╚█████╔╝██████╔╝███████╗███████╗
░╚════╝░╚═╝░░░░░╚═╝╚═════╝░  ░╚════╝░░╚════╝░╚═════╝░╚══════╝╚══════╝
      </div>
      <button onClick={connectWallet} className="cta-button connect-wallet-button">
        ~/terminal[x27] grant_access --rinkeby
      </button>
    </div>
  );

  const renderConnectedContainer = () => (
    <div>
      <div className="interface">
          <div className="window">
            <div className="ascii ascii--access">

    ░█████╗░░█████╗░░█████╗░███████╗░██████╗░██████╗
    ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝
    ███████║██║░░╚═╝██║░░╚═╝█████╗░░╚█████╗░╚█████╗░
    ██╔══██║██║░░██╗██║░░██╗██╔══╝░░░╚═══██╗░╚═══██╗
    ██║░░██║╚█████╔╝╚█████╔╝███████╗██████╔╝██████╔╝
    ╚═╝░░╚═╝░╚════╝░░╚════╝░╚══════╝╚═════╝░╚═════╝░
            </div>
          </div>
          <div className="col">
            <div className="window">
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                ~/terminal[x27] mint
              </button>
            </div>
            <div className="window">
              <div className="mint">{mintedAmount}</div>
            </div>
            <div className="window window-p0">
              <div className="load">
                <span className="loaded">{'='.repeat(loading)}</span>
                <span className="loading">{'='.repeat(20-loading)}</span>
              </div>
            </div>
        </div>
      </div>
      <div className="message">
        <a href={message} target="_blank">{message}</a>
      </div>
    </div>
  );

    const renderDeniedContainer = () => (
    <div className="window window--block">
      <div className="ascii ascii--intro">
██████╗░███████╗███╗░░██╗██╗███████╗██████╗░
██╔══██╗██╔════╝████╗░██║██║██╔════╝██╔══██╗
██║░░██║█████╗░░██╔██╗██║██║█████╗░░██║░░██║
██║░░██║██╔══╝░░██║╚████║██║██╔══╝░░██║░░██║
██████╔╝███████╗██║░╚███║██║███████╗██████╔╝
╚═════╝░╚══════╝╚═╝░░╚══╝╚═╝╚══════╝╚═════╝░
      </div>
    </div>
  );

  function returnMintedString(num) {
    return '#'.repeat(num).concat('/'.repeat(20-num));
  }

  const startTimer = (setLoading) => {
    let counter = 0;
    let timer = setInterval( () => {
      setLoading(counter);
      if (counter >= 20) {
        clearInterval(timer);
        return;
      }
      console.log(counter);
      counter++
    }, 870);
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  

  return (
    <div className="App">
      <audio autoPlay loop src={mp3}></audio>
      <div className="bar bar--top">
        <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"><path fill="#222222" d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.674-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.319.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.721-.103 2.548-.224.238 1.027.389 2.111.446 3.239h-2.994zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.865.034-1.714.102-2.538.222zm2.538 1.776v3.62c-.798-.959-1.458-2.126-1.957-3.456.638-.083 1.291-.136 1.957-.164zm-2.994-7.055c.057-1.128.207-2.212.446-3.239.827.121 1.68.19 2.548.224v3.015h-2.994zm1.024-5.179c.5-1.346 1.165-2.527 1.97-3.496v3.661c-.671-.028-1.329-.081-1.97-.165zm-2.005-.35c-.708-.165-1.377-.373-2.018-.607.937-.918 2.053-1.65 3.29-2.146-.496.844-.927 1.762-1.272 2.753zm-.549 1.918c-.264 1.151-.434 2.36-.492 3.611h-3.933c.165-1.658.739-3.197 1.617-4.518.88.361 1.816.67 2.808.907zm.009 9.262c-.988.236-1.92.542-2.797.9-.89-1.328-1.471-2.879-1.637-4.551h3.934c.058 1.265.231 2.488.5 3.651zm.553 1.917c.342.976.768 1.881 1.257 2.712-1.223-.49-2.326-1.211-3.256-2.115.636-.229 1.299-.435 1.999-.597zm9.924 0c.7.163 1.362.367 1.999.597-.931.903-2.034 1.625-3.257 2.116.489-.832.915-1.737 1.258-2.713zm.553-1.917c.27-1.163.442-2.386.501-3.651h3.934c-.167 1.672-.748 3.223-1.638 4.551-.877-.358-1.81-.664-2.797-.9zm.501-5.651c-.058-1.251-.229-2.46-.492-3.611.992-.237 1.929-.546 2.809-.907.877 1.321 1.451 2.86 1.616 4.518h-3.933z"/></svg>
            <span className="title">HEXAPOD distribution</span>
        </span>
        <span className="blink">{networkName}</span>
      </div>
      <div className="container">
          { currentAccount === "" && renderNotConnectedContainer() }
          { currentAccount !== "" && networkId === '0x4' && renderConnectedContainer()}
          { currentAccount !== "" && networkId !== '0x4' && renderDeniedContainer()}
      </div>
      <div className="bar">
        <span className="">NODE >> 
        <span className="blink"> N{ (Math.floor(Math.random() * 100) + 1)} >> {networkId}</span>
        </span>
        <span className="">System status: 
        <span className="blink">{currentAccount === "" ? " Ready" : " active" }</span>
        </span>
      </div>
    </div>
  );
};

export default App;