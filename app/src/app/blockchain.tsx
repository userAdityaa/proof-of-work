import { Program, Wallet, AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram, TransactionSignature } from "@solana/web3.js";
import { SolanaChallengeApplication } from '../../../target/types/solana_challenge_application';
import idl from '../idl/solana_challenge_application.json';

let tx: any;
const RPC_URL = "https://api.devnet.solana.com";

export const getProvider = (
    publicKey: PublicKey | null,
    sendTransaction: any, 
    signTransaction: any
): Program<SolanaChallengeApplication> | null => { 
    if (!publicKey || !signTransaction) { 
        return null;
    }

    const connection = new Connection(RPC_URL, 'confirmed');
    const provider = new AnchorProvider(
        connection, 
        { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
        { commitment: 'processed' }
    );

    return new Program<SolanaChallengeApplication>(idl as any, provider);
}

export const getReadOnlyProvider = (): Program<SolanaChallengeApplication> => {
    const connection = new Connection(RPC_URL);

    const wallet = {
        publicKey: PublicKey.default, 
        signTransaction: async() => { 
            throw new Error("Read-only provider");
        }, 
        signAllTransaction: async() => {
            throw new Error("Read-only provider");
        }
    }

    const provider = new AnchorProvider(
        connection, 
        wallet as unknown as Wallet,
        { commitment: 'processed' }
    )

    return new Program<SolanaChallengeApplication>(idl as any, provider);
}

export const createUser = async (
    program: Program<SolanaChallengeApplication>, 
    publicKey: PublicKey,
    username: string, 
    avatar_url: string
): Promise<TransactionSignature> => { 
    const [profilePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), publicKey.toBuffer()],
        program.programId
    );

    tx = await program.methods
        .createUser(username, avatar_url)
        .accountsPartial({
            user: publicKey,
            profile: profilePDA,
            systemProgram: SystemProgram.programId,
        })
        .rpc();

    const connection = new Connection(
        program.provider.connection.rpcEndpoint, 
        'confirmed'
    );

    await connection.confirmTransaction(tx, 'finalized');
    console.log("tx: ", tx);

    return tx;
}

export const getUser = async (
    program: Program<SolanaChallengeApplication>,
    publicKey: PublicKey,
) => {
    const [profilePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), publicKey.toBuffer()],
        program.programId
    );

    try {
        const userProfile = await program.account.user.fetch(profilePDA);
        return {
            userProfile
        }
    } catch (err) {
        // Usually this means the account doesn't exist
        console.warn("User profile does not exist:", err);
        return {
            exists: false,
            data: null
        };
    }
};
