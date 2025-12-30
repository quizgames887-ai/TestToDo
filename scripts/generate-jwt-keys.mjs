import { exportJWK, exportPKCS8, generateKeyPair } from "jose";
import { writeFileSync } from "fs";
import { join } from "path";

const keys = await generateKeyPair("RS256", {
  extractable: true,
});
const privateKey = await exportPKCS8(keys.privateKey);
const publicKey = await exportJWK(keys.publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicKey }] });

// Format private key as single line (spaces instead of newlines)
const privateKeySingleLine = privateKey.trimEnd().replace(/\n/g, " ");

console.log("\n=== JWT Keys Generated ===\n");
console.log("JWT_PRIVATE_KEY:");
console.log(privateKeySingleLine);
console.log("\nJWKS:");
console.log(jwks);

// Save to a file for easy reference
const outputFile = join(process.cwd(), "convex-jwt-keys.txt");
const output = `JWT_PRIVATE_KEY=${privateKeySingleLine}\nJWKS=${jwks}\n\n=== Instructions ===\n\nOption 1: Use Convex Dashboard (Recommended)\n1. Go to https://dashboard.convex.dev\n2. Select your project\n3. Navigate to Settings > Environment Variables\n4. Add JWT_PRIVATE_KEY with the value above\n5. Add JWKS with the value above\n\nOption 2: Use Convex CLI\nRun these commands (you may need to escape quotes in PowerShell):\n\nnpx convex env set JWT_PRIVATE_KEY "${privateKeySingleLine}"\n\nnpx convex env set JWKS '${jwks}'\n\nNote: If using PowerShell on Windows, you may need to use single quotes for JWT_PRIVATE_KEY:\nnpx convex env set JWT_PRIVATE_KEY '${privateKeySingleLine}'\n`;
writeFileSync(outputFile, output);

console.log("\n=== Instructions ===\n");
console.log("Keys have been saved to: convex-jwt-keys.txt");
console.log("\nOption 1: Use Convex Dashboard (Recommended)");
console.log("1. Go to https://dashboard.convex.dev");
console.log("2. Select your project");
console.log("3. Navigate to Settings > Environment Variables");
console.log("4. Add JWT_PRIVATE_KEY with the value above");
console.log("5. Add JWKS with the value above");
console.log("\nOption 2: Use Convex CLI");
console.log("See convex-jwt-keys.txt for the exact commands to run.");
console.log("\nAfter setting the variables, restart your Convex dev server.\n");

