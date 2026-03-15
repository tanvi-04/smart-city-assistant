const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkSpecificModel(modelName) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("Please set the GEMINI_API_KEY environment variable.");
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log(`Testing model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`Success with ${modelName}! Response:`, response.text());
    } catch (error) {
        console.error(`Error with ${modelName}:`, error.message);
    }
}

async function runTests() {
    await checkSpecificModel("gemini-1.5-flash");
    await checkSpecificModel("gemini-flash-latest");
}

runTests();
