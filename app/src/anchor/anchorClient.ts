import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@project-serum/anchor"; 
import idlJson from '../idl/solana_challenge_application-keypair.json';
import { Wallet } from "@project-serum/anchor";

const programId = new PublicKey('3ktaaLhu7U97irLAWRjWWDnSf4rzLgVwQWtijUQ15tFF');
const network = 'http://127.0.0.1:8899';

const getAnchorProgram = (wallet: Wallet) => { 
    const connection = new Connection(network);
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' }); 
    const idl = idlJson as unknown as Idl;
    return new Program(idl, programId, provider);
}