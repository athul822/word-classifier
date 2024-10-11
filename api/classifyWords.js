const axios = require("axios");

async function identifyPhysicalObjects(words) {
  const API_KEY = "AIzaSyCYN5NsiP88GiTepXWgsrBGHkROdkv5QL4";
  const prompt = `Given the following list of words, identify which ones represent physical, tangible objects that can be seen or touched. Return only the words that are physical objects, separated by commas: ${JSON.stringify(
    words
  )}`;
  console.log(words, "prompt");

  // Construct the request payload
  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  console.log(payload, "payload");
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Physical objects identified:");
    console.log(response.data.candidates[0].content.parts[0].text);

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

module.exports = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { words } = req.body;

      // if (!Array.isArray(words) || !words.every(w => w && typeof w === 'object' && 'word' in w && 'score' in w)) {
      //     return res.status(400).json({ error: 'Input must be an array of objects with "word" and "score" properties' });
      // }

      const classifiedWords = await identifyPhysicalObjects(words);
      res.status(200).json(classifiedWords);
    } catch (error) {
      console.error("Error:", error);
      res
        .status(500)
        .json({ error: "An error occurred while processing the request" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
