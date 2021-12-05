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
  const [mintedAmount, setMintedAmount] = useState('/'.repeat(20));
  const [loading, setLoading] = useState(0);
  const [network, setNetwork] = useState('*******');
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

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      desc = '/access granted'
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
        console.log("Connected to chain " + chainId);

        // String, hex code of the chainId of the Rinkebey test network
        const rinkebyChainId = "0x4"; 
        if (chainId !== rinkebyChainId) {
          alert("You are not connected to the Rinkeby Test Network!");
        } else {
          setNetwork('**** RINKEBY    ')
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
    <div class="window window--block">
      <div class="ascii ascii--intro">

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
      <div class="interface">
          <div class="window">
            <div class="ascii ascii--access">

    ░█████╗░░█████╗░░█████╗░███████╗░██████╗░██████╗
    ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝
    ███████║██║░░╚═╝██║░░╚═╝█████╗░░╚█████╗░╚█████╗░
    ██╔══██║██║░░██╗██║░░██╗██╔══╝░░░╚═══██╗░╚═══██╗
    ██║░░██║╚█████╔╝╚█████╔╝███████╗██████╔╝██████╔╝
    ╚═╝░░╚═╝░╚════╝░░╚════╝░╚══════╝╚═════╝░╚═════╝░
            </div>
          </div>
          <div class="col">
            <div class="window">
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                ~/terminal[x27] mint
              </button>
            </div>
            <div class="window">
              <div class="mint">{mintedAmount}</div>
            </div>
            <div class="window window-p0">
              <div class="load">
                <span class="loaded">{'='.repeat(loading)}</span>
                <span class="loading">{'='.repeat(20-loading)}</span>
              </div>
            </div>
        </div>
      </div>
      <div class="message">
        <a href={message} target="_blank">{message}</a>
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
      <div class="bar bar--top">
        <span> </span>
        <span class="blink">{network}</span>
      </div>
      <div className="container">
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ): (renderConnectedContainer() )}
      </div>
      <div class="bar">
        <span class="">NODE >> 
        <span class="blink"> N{ (Math.floor(Math.random() * 100) + 1)}</span>
        </span>
        <span class="">System status: 
        <span class="blink">{currentAccount === "" ? " Ready" : " active" }</span>
        </span>
      </div>
    </div>
  );
};

export default App;