import { PublicKey } from '@solana/web3.js';


export function deriveBondingCurvePda(mint: PublicKey): PublicKey {
    const seed = Buffer.from([98, 111, 110, 100, 105, 110, 103, 45, 99, 117, 114, 118, 101]);
    return PublicKey.findProgramAddressSync(
        [seed, mint.toBuffer()],
        new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")
    )[0];
}

export function deriveAssociatedBondingCurvePda(mint: PublicKey, bondingCurve: PublicKey): PublicKey {
    const seed = Buffer.from([6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206, 235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140, 245, 133, 126, 255, 0, 169]);
    const program = Buffer.from([140, 151, 37, 143, 78, 36, 137, 241, 187, 61, 16, 41, 20, 142, 13, 131, 11, 90, 19, 153, 218, 255, 16, 132, 4, 142, 123, 216, 219, 233, 248, 89]);
    return PublicKey.findProgramAddressSync(
        [bondingCurve.toBuffer(), seed, mint.toBuffer()],
        new PublicKey(program)
    )[0];
}

export function deriveMetadataPda(mint: PublicKey): PublicKey {
    const seed1 = Buffer.from([109, 101, 116, 97, 100, 97, 116, 97]);
    const seed2 = Buffer.from([11, 112, 101, 177, 227, 209, 124, 69, 56, 157, 82, 127, 107, 4, 195, 205, 88, 184, 108, 115, 26, 160, 253, 181, 73, 182, 209, 188, 3, 248, 41, 70])
    return PublicKey.findProgramAddressSync(
        [seed1, seed2, mint.toBuffer()],
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
    )[0];
}

