import React, { useState, useEffect, useContext } from "react";
import { MdVerified } from "react-icons/md";
import { RiSendPlaneFill, RiCloseFill } from "react-icons/ri";
import { AiFillLock, AiFillUnlock } from "react-icons/ai";
import Image from "next/image";
import Loading from "../loding.gif";
import Data from "../components/Data";
import Style from "../styles/index.module.css";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { todoContractAddress, todoContractAbi } from "../context/constants";

const Home = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [error, setError] = useState("");
  const [allToDoList, setAllToDoList] = useState([]);
  const [myList, setMyList] = useState([]);
  const [message, setMessage] = useState("");
  const [allAddress, setAllAddress] = useState([]);
  const [walletConnected, setWalletConnected] = useState(false);

  const fetchContract = (signerOrProvider) =>
    new ethers.Contract(todoContractAddress, todoContractAbi, signerOrProvider);

  //-----CONNECT WALLET
  const connectWallet = async () => {
    if (!window.ethereum) return setError("Please Install MetaMask");

    const account = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setCurrentAccount(account[0]);
    setWalletConnected(true);
  };

  const toDoList = async (message) => {
    try {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
      const createList = await contract.createList(message);
      console.log(message, "message");
      createList.wait();
    } catch (error) {
      console.error(error);
      setError("something wrong creating list");
    }
  };

  const getToDoList = async () => {
    try {
      //CONNECTING SMART CONTRACT
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      //GET DATA
      const getAllAddress = await contract.getAddress();
      setAllAddress(getAllAddress);
      console.log(getAllAddress);

      getAllAddress.map(async (el) => {
        const getSingleData = await contract.getCreatorData(el);
        allToDoList.push(getSingleData);
        console.log(getSingleData, "getSingleData");
      });

      const allMessage = await contract.getMessage();
      console.log(allMessage, "all Message");
      setMyList(allMessage);
    } catch (error) {
      setError("Something wrong while getting the data");
    }
  };

  const change = async (address) => {
    try {
      //CONNECTING SMART CONTRACT
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const state = await contract.toggle(address);
      state.wait();
      console.log(state);
    } catch (error) {
      console.log("Wrong");
    }
  };

  useEffect(() => {
    connectWallet();
    getToDoList();
    if (typeof window !== "undefined") {
      if (window.ethereum) {
        console.log("MetaMask Here!");
        window.ethereum.on("accountsChanged", (newAcc) => {
          setCurrentAccount(newAcc);
        });
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      } else {
        console.log("Need to install MetaMask");
        setError("Please install MetaMask browser extension to interact");
      }
    }
  }, []);

  return (
    <div className={Style.home}>
      <div className={Style.navBar}>
        <Image src={Loading} alt="Logo" width={50} height={50} />
        <div className={Style.connect}>
          {!currentAccount ? (
            <button
              onClick={() => {
                connectWallet();
              }}
            >
              Connect Wallet
            </button>
          ) : (
            <button>{currentAccount.slice(0, 20)}..</button>
          )}
        </div>
      </div>
      <div className={Style.home_box}>
        <div className={Style.home_completed}>
          <h2>Todo History List</h2>
          <div>
            {myList.map((el, i) => {
              return (
                <div className={Style.home_completed_list}>
                  <MdVerified className={Style.iconColor} />
                  <p>{el.slice(0, 30)}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className={Style.home_create}>
          <div className={Style.home_create_box}>
            <h2>Create BlockChain ToDoList</h2>
            <div className={Style.home_create_input}>
              <input
                type="text"
                placeholder="Enter your todo"
                onChange={(e) => setMessage(e.target.value)}
              />

              {currentAccount ? (
                <RiSendPlaneFill
                  className={Style.iconBlack}
                  onClick={() => {
                    toDoList(message);
                  }}
                />
              ) : (
                <RiSendPlaneFill
                  className={Style.iconBlack}
                  onClick={() => connectWallet()}
                />
              )}
            </div>

            <Data
              allToDoList={allToDoList}
              allAddress={allAddress}
              myList={myList}
              change={change}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Home;
