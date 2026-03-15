const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Please set the GEMINI_API_KEY environment variable.");
        process.exit(1);
    }

    // Note: The JS SDK doesn't expose a clean listModels method easily without extra setup,
    // so we will use a direct fetch to the REST API.
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", data.error.message);
            return;
        }

        console.log("Available Models:");
        data.models.forEach(m => {
            console.log(`- ${m.name} (${m.displayName})`);
            console.log(`  Capabilities: ${m.supportedGenerationMethods.join(", ")}`);
        });
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

listModels();
