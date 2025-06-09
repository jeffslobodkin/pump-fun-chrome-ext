import {
    Connection,
    PublicKey,
    TransactionInstruction,
    VersionedTransaction,
    TransactionMessage,
    ComputeBudgetProgram,
    SystemProgram,
    AddressLookupTableAccount,
    Keypair,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountIdempotentInstruction, createSyncNativeInstruction } from '@solana/spl-token';
import { config } from '../config/config';
import { deriveBondingCurvePda, deriveAssociatedBondingCurvePda, deriveMetadataPda } from '../utils/pdaUtils';
import { DeployData } from '../types/pumpfun';
export default async function deployTx(keypair: Keypair, name: string, symbol: string, uri: string, devBuyAmount: number): Promise<PublicKey> {
    const connection = new Connection(config.rpcEndpoint);
    let instructions: TransactionInstruction[] = [];


    //Pumpfun Create Instruction
    const mint = new Keypair();
    const bondingCurve = deriveBondingCurvePda(mint.publicKey);
    const associatedBondingCurve = deriveAssociatedBondingCurvePda(mint.publicKey, bondingCurve);
    const metadata = deriveMetadataPda(mint.publicKey);
    const createIxDiscriminator = Buffer.from([24, 30, 200, 40, 5, 28, 7, 119])

    const data: DeployData = {
        name: name,
        symbol: symbol,
        uri: uri,
        creator: keypair.publicKey,
    }

    const computeUnitLimit = ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 });
    const computeUnitPrice = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10_000_000 });

    instructions.push(computeUnitLimit);
    instructions.push(computeUnitPrice);

    const createIx = new TransactionInstruction({
        programId: new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"),
        keys: [
            { pubkey: mint.publicKey, isSigner: true, isWritable: true },
            { pubkey: new PublicKey("TSLvdd1pWpHVjahSpsvCXUbgwsL3JAcvokwaKt1eokM"), isSigner: false, isWritable: false },
            { pubkey: bondingCurve, isSigner: false, isWritable: true },
            { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
            { pubkey: new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"), isSigner: false, isWritable: false },
            { pubkey: metadata, isSigner: false, isWritable: true },
            { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"), isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([createIxDiscriminator, Buffer.from(JSON.stringify(data))]),
    });

    instructions.push(createIx);


    //Extend_account instruction
    const extendAccountDiscriminator = Buffer.from([234, 102, 194, 203, 150, 72, 62, 229])

    const extendAccountIx = new TransactionInstruction({
        programId: new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"),
        keys: [
            { pubkey: bondingCurve, isSigner: false, isWritable: true },
            { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"), isSigner: false, isWritable: false },
        ],
        data: extendAccountDiscriminator,
    });

    instructions.push(extendAccountIx);


    //Create token account for the mint
    const userDestinationToken = getAssociatedTokenAddressSync(mint.publicKey, keypair.publicKey, true);
    const createDestinationTokenAccountIx = createAssociatedTokenAccountIdempotentInstruction(keypair.publicKey, userDestinationToken, keypair.publicKey, mint.publicKey);

    instructions.push(createDestinationTokenAccountIx);

    //Dev Buy
    const devBuyDiscriminator = Buffer.from([102, 6, 61, 18, 1, 218, 235, 234])
    
    const devBuyData = {
        amount: {
            type: "u64",
            data: "50613207519520"
        },
        max_sol_cost: {
            type: "u64",
            data: "1000000000000000"
        }
    };

    const devBuyIx = new TransactionInstruction({
        programId: new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"),
        keys: [
            { pubkey: new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("9rPYyANsfQZw3DnDmKE3YCQF5E8oD89UXoHn9JFEhJUz"), isSigner: false, isWritable: true },
            { pubkey: mint.publicKey, isSigner: true, isWritable: true },
            { pubkey: bondingCurve, isSigner: false, isWritable: true },
            { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
            { pubkey: userDestinationToken, isSigner: false, isWritable: true },
            { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
            { pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("SysvarRent111111111111111111111111111111111"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"), isSigner: false, isWritable: false },
            { pubkey: new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"), isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([devBuyDiscriminator, Buffer.from(JSON.stringify(devBuyData))]),
    });

    instructions.push(devBuyIx);

    const latestBlockhash = await connection.getLatestBlockhash();
    const deployTx = new TransactionMessage({
        payerKey: keypair.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: instructions,
    }).compileToV0Message();
    
    const versionedTx = new VersionedTransaction(deployTx);
    const txId = await connection.sendRawTransaction(versionedTx.serialize());
    console.log(`https://solscan.io/tx/${txId}?cluster=mainnet`)


    return mint.publicKey;
}