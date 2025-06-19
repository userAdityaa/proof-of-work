import { Program, Wallet, AnchorProvider, BN } from "@coral-xyz/anchor";
import { AccountMeta, Connection, PublicKey, SystemProgram, TransactionSignature } from "@solana/web3.js";
import { SolanaChallengeApplication } from '../../../target/types/solana_challenge_application';
import idl from '../idl/solana_challenge_application.json';
import axios from 'axios';

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

  try {
    const tx = await program.methods
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

    await axios.post("/api/user", {
      name: username,
      avatar_url: avatar_url,
      participant_score: 0,
      creator_score: 0,
    });

    return tx;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

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
            userProfile, 
            exists: true, 
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

export const createChallenge = async (
  program: Program<SolanaChallengeApplication>,
  publicKey: PublicKey,
  title: string,
  description: string,
  imageUrl: string,
  location: string,
  rewardType: number,
  rewardAmount: BN
) => {
  const [programStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );

  const connection = new Connection(program.provider.connection.rpcEndpoint, "confirmed");

  let programStateAccount;
  try {
    programStateAccount = await program.account.programState.fetch(programStatePDA);
    console.log("Program state already exists.");
  } catch (err) {
    console.log("Program state not found. Initializing...");

    try {
      const tx = await program.methods
        .initializeProgramState()
        .accountsPartial({
          programState: programStatePDA,
          initializer: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Program state initialized:", tx);
      programStateAccount = await program.account.programState.fetch(programStatePDA);
    } catch (initErr) {
      console.error("Failed to initialize program state:", initErr);
      throw initErr;
    }
  }

  const challengeCount = programStateAccount.challengeCount.toNumber();
  const cid = new BN(challengeCount + 1);

  const [challengePDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"),
      publicKey.toBuffer(),
      cid.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  if (description.length > 256 || imageUrl.length > 120 || location.length > 20) {
    throw new Error("One of the input strings exceeds length constraints");
  }

  const tx = await program.methods
    .createChallenge(cid, title, description, imageUrl, location, rewardType, rewardAmount)
    .accountsPartial({
      programState: programStatePDA,
      creator: publicKey,
      challenge: challengePDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc({ commitment: "confirmed" });

  console.log("Transaction submitted:", tx);

  await connection.confirmTransaction(tx, "confirmed");
  console.log("Transaction confirmed:", tx);

  return tx;
};

export const getAllChallenge = async (
  program: Program<SolanaChallengeApplication>,
  creatorPublicKey?: PublicKey
) => {
  try {
    const challengeAccounts = await program.account.challenge.all(
      creatorPublicKey
        ? [
            {
              memcmp: {
                offset: 8,
                bytes: creatorPublicKey.toBase58(), 
              },
            },
          ]
        : [] 
    );

    const challenges = challengeAccounts.map((account) => ({
      publicKey: account.publicKey,
      ...account.account,
    }));

    console.log("these are the challengs: ", challenges);
    return challenges;
  } catch (error) {
    console.error("Error fetching challenges:", error);
    throw new Error("Failed to fetch challenges");
  }
};

export const closeProgramState = async (
  program: Program<SolanaChallengeApplication>,
  publicKey: PublicKey 
) => {
  // Derive the program_state PDA
  const [programStatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("program_state")],
    program.programId
  );

  try {
    await program.methods
      .closeProgramState() // matches the Rust method name
      .accounts({
        programState: programStatePDA,
        recipient: publicKey,
      })
      .rpc();

    console.log("Program state closed successfully.");
  } catch (err) {
    console.error("Failed to close program state:", err);
  }
};

export const takePartChallenge = async(
  program: Program<SolanaChallengeApplication>, 
  publicKey: PublicKey, 
  cid: BN, 
  creator: PublicKey,
) => {
  const [challengePDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"), 
      creator.toBuffer(), 
      cid.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const connection = new Connection(program.provider.connection.rpcEndpoint, "confirmed");

  try {
    const txSig = await program.methods
      .startChallenge(cid, creator)
      .accountsPartial({
        challanger: publicKey,
        challange: challengePDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await connection.confirmTransaction(txSig, "confirmed");
    return txSig;
  } catch (err) {
    console.error("Failed to participate in challenge:", err);
    throw err;
  }
}

export const deleteChallenge = async(
  program: Program<SolanaChallengeApplication>, 
  publicKey: PublicKey, 
  cid: BN, 
) => { 
  const [challengePDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"), 
      publicKey.toBuffer(), 
      cid.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const connection = new Connection(program.provider.connection.rpcEndpoint, "confirmed");

  try {
    const txSig = await program.methods
      .deleteChallenge(cid)
      .accountsPartial({
        creator: publicKey,
        challenge: challengePDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await connection.confirmTransaction(txSig, "confirmed");
    return txSig;
  } catch (err) {
    console.error("Failed to delete the challenge:", err);
    throw err;
  }
}

export const updateChallenge = async (
  program: Program<SolanaChallengeApplication>,
  publicKey: PublicKey,
  cid: BN,
  title: string,
  description: string,
  imageUrl: string,
  location: string,
  rewardType: number,
  rewardAmount: BN
) => {
  const [challengePDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"),
      publicKey.toBuffer(),
      cid.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  try {
    const txSig = await program.methods
      .updateChallenge(
        cid,
        title,
        description,
        imageUrl,
        location,
        rewardType,
        rewardAmount,
      )
      .accountsPartial({
        creator: publicKey,
        challenge: challengePDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return txSig;
  } catch (err) {
    console.error("Failed to update challenge:", err);
    throw err;
  }
};

export const submitChallenge = async (
  program: Program<SolanaChallengeApplication>,
  challenger: PublicKey,
  creator: PublicKey,      
  cid: BN,                  
  proofUrl: string
): Promise<TransactionSignature> => {
  const [submissionPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("submission"),
      challenger.toBuffer(),
      creator.toBuffer(),
      cid.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const [challengePDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"),
      creator.toBuffer(),
      cid.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const tx = await program.methods.submitChallenge(cid, creator, proofUrl)
    .accountsPartial({
      challenger,
      participantSubmission: submissionPDA,
      challenge: challengePDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc({ commitment: "confirmed" });

  console.log("Submit challenge transaction:", tx);
  return tx;
};

export const acceptSubmission = async (
  program: Program<SolanaChallengeApplication>,
  owner: PublicKey,   
  cid: BN,               
  participant: PublicKey,   
): Promise<TransactionSignature> => {
  const [challengePDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"),
      owner.toBuffer(),
      cid.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const [submissionPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("submission"),
      participant.toBuffer(),
      owner.toBuffer(),
      cid.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const recipientWallet = participant;

  const tx = await program.methods
  .acceptSubmission()
  .accountsPartial({
    owner,
    challenge: challengePDA,
    participantSubmission: submissionPDA,
    rewardPayer: owner,
    systemProgram: SystemProgram.programId,
    recipientWallet: recipientWallet,
  })
  .remainingAccounts([
    {
      pubkey: recipientWallet,
      isWritable: true,  
      isSigner: false,
    } as AccountMeta,
  ])
  .rpc({ commitment: "confirmed" });

  console.log("Accept submission transaction:", tx);
  return tx;
};

export const getAllSubmissionsForChallenge = async (
  program: Program<SolanaChallengeApplication>,
  creatorPublicKey: PublicKey,
  cid: BN
) => {
  const [challengePDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("challenge"),
      creatorPublicKey.toBuffer(),
      cid.toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  const challenge = await program.account.challenge.fetch(challengePDA);

  const submissions = await Promise.all(
    challenge.submissions.map(async (submissionPubkey) => {
      const submission = await program.account.participantSubmission.fetch(submissionPubkey);
      return {
        publicKey: submissionPubkey,
        ...submission,
      };
    })
  );

  return submissions;
};
