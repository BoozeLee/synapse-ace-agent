const { SapConnection } = require("@oobe-protocol-labs/synapse-sap-sdk");
const { Keypair } = require("@solana/web3.js");
const fs = require('fs');

async function register(name, keypairPath, description, capabilities) {
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairData));
    
    console.log(`Registering ${name} (${keypair.publicKey.toString()})...`);
    
    const conn = SapConnection.devnet();
    const client = conn.fromKeypair(keypair);
    
    console.log("Global Registry Address:", client.discovery.deriveGlobalRegistry().toString());
    console.log("Agent PDA Address:", client.discovery.deriveAgentPDA(keypair.publicKey).toString());
    
    try {
        const tx = await client.agent.register({
            name,
            description,
            capabilities,
            pricing: [],
            protocols: ["acedata"],
            agentId: name.toLowerCase() + "-v1",
            agentUri: "https://github.com/BoozeLee/baker-street-laboratory",
            x402Endpoint: "https://trendforge-agent.onrender.com"
        });
        console.log(`✅ ${name} registered! Tx: ${tx}`);
    } catch (err) {
        if (err.message.includes("already registered") || err.message.includes("0x0")) {
             console.log(`ℹ️  ${name} is already registered.`);
        } else {
            console.error(`❌ Failed to register ${name}: ${err.message}`);
        }
    }
}

async function main() {
    await register(
        "TrendForge", 
        "/home/kilisan/trendforge-agent/keys/agent.json",
        "Autonomous research agent: SAP discovery → SERP search → LLM analysis → image generation.",
        [{ id: "trend:research", description: "Web search + LLM + image gen", protocolId: "acedata", version: "1.0.0" }]
    );
    
    await register(
        "NeuroForge",
        "/home/kilisan/neuroforge-agent/keys/agent.json",
        "Neuromorphic autonomous agent using LIF spiking neural network.",
        [{ id: "neuro:snn-escrow", description: "LIF spiking neural network → SAP escrow settlement", protocolId: "sap-escrow", version: "1.0.0" }]
    );
}

main().catch(console.error);
