const ai = require("./config/gemeni");

async function test() {

    const response =
    await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say Hello"
    });

    console.log(response.text);
}

test();