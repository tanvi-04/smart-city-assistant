const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Please set the GEMINI_API_KEY environment variable.");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Fetching available models...");
        // The listModels method is part of the genAI client but we'll use the REST API as it's more direct for debugging if needed
        // or just try to generate a simple response.
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const result = await model.generateContent("Test");
        const response = await result.response;
        console.log("Success! Response:", response.text());
    } catch (error) {
        console.error("Error encountered:");
        if (error.message.includes("429")) {
            console.error("429 Too Many Requests: Your API key's quota has been exceeded.");
        } else if (error.message.includes("404")) {
            console.error("404 Not Found: The model was not found.");
        } else if (error.message.includes("400")) {
            console.error("400 Bad Request: Check your API key or request parameters.");
        } else {
            console.error(error.message);
        }
    }
}

checkModels();
