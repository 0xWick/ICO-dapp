import { BigNumber, Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useState, useRef } from "react";
import Web3Modal from "web3modal";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ABI,
} from "../constants";
import styles from "../styles.Home.module.css";

export default function Home() {

  // Create a Bignumber `0`
  const zero = BigNumber.from(0);

  // walletConnected keeps track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);

  // loading is set to true when we aer waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);

  // tokensToBeClaimed keeps track of the number of tokens that can be claimed
  // based on the Crypto Dev NFT's held by the user for which they haven't claimed the tokens
  const [tokensTobeClaimed, setTokensToBeClaimed] = useState(zero);

  // balanceOfCryptoDevTokens keeps track of number of Crypto Dev tokens owned by an address'
  const [balanceOfCryptoDevTokens, setBalanceOfCryptoDevTokens] = useState(zero);

  // amount of the tokens that the user wants to mint
  const [tokenAmount, setTokenAmount] = useState(zero);

  // tokensMinted is the total number of tokens that have been minted till now out of 10000(max total supply)
  const [tokensMinted, setTokensMinted] = useState(zero);

  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  /**
   * getTokensToBeClaimed: checks the balance of tokens that can be claimed by the user
   */

  const getTokensToBeClaimed = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();

      // Create an instance of NFT Contract
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      // We will get the signer now to extract the address of the currently connected MetaMask account
      const signer = await getProviderOrSigner(true);

      // Get the addresss associated to the signer which is connected to MetaMask
      const address = await signer.getAddress();

      // call the balanceOf function from the NFT contract to get the number of NFT's held by the user
      const balance = await nftContract.balanceOf(address);

      // balance is a BigNumber and thus we would compare it with Big Number `zero`
      if (balance == zero) {
        setTokensToBeClaimed(zero);
      } else {
        // amount keeps track of the number of unclaimed tokens
        var amount = 0;

        // For all the NFT's, check if the tokens have already been claimed
        // Only increase the amount if the tokens have not been claimed
        // for an NFT (for a given tokenId)
        for (var i = 0; i < balance; i++) {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const claimed = await nftContract.tokenIdsClaimed(tokenId);
          if (!claimed) {
            amount++;
          }
        }
      }

      // tokensToBeClaimed has been initialized to a Big Number, this we would convert amount
      // to a big number and then set its value
      setTokensToBeClaimed(BigNumber.from(amount));
    } catch (error) {
      console.error(error);
      setTokensToBeClaimed(zero);
    }
  }




}
