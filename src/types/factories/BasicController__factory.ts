/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { BasicController } from "../BasicController";

export class BasicController__factory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BasicController {
    return new Contract(address, _abi, signerOrProvider) as BasicController;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "parent",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "minter",
        type: "address",
      },
    ],
    name: "RegisteredDomain",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "contract IRegistrar",
        name: "_registrar",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "domain",
        type: "string",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "registerDomain",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "parentId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "label",
        type: "string",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "registerSubdomain",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "parentId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "label",
        type: "string",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "string",
        name: "metadata",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "royaltyAmount",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "lockOnCreation",
        type: "bool",
      },
    ],
    name: "registerSubdomainExtended",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
