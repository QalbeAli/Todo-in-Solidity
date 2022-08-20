import React, { useState, createContext } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

//INTERNAL IMPORT
import { todoContractAddress, todoContractAbi } from "./constants";

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(todoContractAddress, todoContractAbi, signerOrProvider);

export const ToDoListContext = createContext();

export const TodoListProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [error, setError] = useState("");
  const [allToDoList, setAllToDoList] = useState([]);
  const [myList, setMyList] = useState([]);

  const [allAddress, setAllAddress] = useState([]);
  //----CONNECTING METAMASK

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return setError("Please Install MetaMask");

    const account = await window.ethereum.request({ method: "eth_accounts" });

    if (account.length) {
      setCurrentAccount(account[0]);
    } else {
      setError("Please Install MetaMask & Connect, Reload");
    }
  };

  //-----CONNECT WALLET
  const connectWallet = async () => {
    if (!window.ethereum) return setError("Please Install MetaMask");

    const account = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setCurrentAccount(account[0]);
  };

  //----UPLOAD TO IPFS VOTER IMAGE

  const toDoList = async (message) => {
    try {
      //CONNECTING SMART CONTRACT
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);

      const createList = await contract.createList(message);
      createList.wait();
    } catch (error) {
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
      const contract = await fetchContract(signer);

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
      const contract = await fetchContract(signer);

      const state = await contract.toggle(address);
      state.wait();
      console.log(state);
    } catch (error) {
      console.log("Wrong");
    }
  };

  return (
    <ToDoListContext.Provider
      value={{
        checkIfWalletIsConnected,
        connectWallet,
        toDoList,
        allToDoList,
        currentAccount,
        getToDoList,
        error,
        allAddress,
        myList,
        change,
      }}
    >
      {children}
    </ToDoListContext.Provider>
  );
};
