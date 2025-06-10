import { ethers } from 'ethers';

interface MishtiWasm {
  request_from_signer: (value: string, algorithm: string, signerUrl: string) => Promise<string>;
}

let mishtiWasm: MishtiWasm | null = null;
let humanNetworkInitialized = false;

// Initialize the WASM module
const initializeHumanNetwork = async () => {
  if (humanNetworkInitialized) return;

  try {
    // Dynamic import for browser compatibility
    const mishtiModule = await import("@holonym-foundation/mishtiwasm");
    
    // Check if the module was loaded successfully
    if (!mishtiModule) {
      throw new Error("WASM module failed to load");
    }

    // Initialize WASM - call the default export which is the init function
    if (typeof mishtiModule.default === 'function') {
      await mishtiModule.default();
    }

    // Check if request_from_signer exists
    if (typeof mishtiModule.request_from_signer !== 'function') {
      throw new Error("request_from_signer function not found in WASM module");
    }

    mishtiWasm = { request_from_signer: mishtiModule.request_from_signer };
    humanNetworkInitialized = true;
    console.log("Human Network WASM module initialized successfully");
  } catch (error) {
    console.error("Failed to load Human Network WASM module:", error);
    humanNetworkInitialized = true; // Mark as attempted
    throw new Error(`WASM module initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// reference: https://docs.network.human.tech/for-developers/making-requests-to-human-network/signer-on-behalf-of-users
export const requestFromSigner = async ({
  value,
  method,
  signerUrl,
}: {
  value: string;
  method: string;
  signerUrl: string;
}): Promise<string> => {
  await initializeHumanNetwork();

  if (!mishtiWasm?.request_from_signer) {
    throw new Error("WASM module not properly initialized - request_from_signer function not available");
  }

  try {
    const result = await mishtiWasm.request_from_signer(value, method, signerUrl);
    return result;
  } catch (error) {
    throw new Error(`OPRF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Browser-compatible base64 encoding using Web API
export const base64Encode = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // Use browser crypto API for hashing
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Convert to base64
    const binaryString = String.fromCharCode.apply(null, hashArray);
    return btoa(binaryString);
  }
  
  // Fallback for non-browser environments
  return btoa(data);
};

export const checkAndDeriveHumanKey = async (result: string) => {
  // Convert the OPRF result to a private key
  const privateKeyDecimal = result.toString();
  const privateKeyBigInt = BigInt(privateKeyDecimal);
  
  // Convert to hex format (32 bytes for secp256k1)
  const privateKeyHex = '0x' + privateKeyBigInt.toString(16).padStart(64, '0');
  console.log("\n=== Key Derivation ===");
  console.log("OPRF Result (decimal):", privateKeyDecimal);
  console.log("Private Key (hex):", privateKeyHex);
  console.log("Private Key (bytes):", (privateKeyHex.length - 2) / 2, "bytes");
  
  // Validate that it's within secp256k1 curve order
  const secp256k1Order = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
  const isValidPrivateKey = privateKeyBigInt > 0 && privateKeyBigInt < secp256k1Order;
  console.log("Valid secp256k1 private key:", isValidPrivateKey);
  
  if (isValidPrivateKey) {
    try {
      // Use ethers to create wallet and derive address
      const wallet = new ethers.Wallet(privateKeyHex);
      
      console.log("\n=== Derived Keys using Ethers ===");
      console.log("Private Key:", wallet.privateKey);
      console.log("Public Key:", wallet.signingKey.publicKey);
      console.log("Ethereum Address:", wallet.address);

      return { privateKey: wallet.privateKey, publicKey: wallet.signingKey.publicKey, address: wallet.address };
      
    } catch (keyError) {
      console.error("Error deriving public key:", keyError);
      return { error: keyError };
    }
  } else {
    console.log("⚠️  Invalid private key - outside secp256k1 curve order");
    return { error: "Invalid private key - outside secp256k1 curve order" };
  }
}