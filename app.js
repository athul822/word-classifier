const axios = require("axios");

async function fetchWords(patterns) {
  try {
    const responses = await Promise.all(
      patterns.map(pattern =>
        axios.get(`https://api.datamuse.com/words?sp=${pattern}&md=p`),
      ),
    );
    const response = responses
      .flatMap(res => res.data)
      .sort((a, b) => b.score - a.score);
    // console.log(response, 'nounsresponse');

    return response;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

fetchWords(["?a?a????", "?a?e????", "?a?i????", "?e?a????", "?e?e????", "?e?i????", "?i?a????", "?i?e????", "?i?i????"])
  .then(words => {
    const regex = new RegExp('[fhklmntvwxyz][aei][bcdfghjklmnpqrstvwxyz][aei][a-z][a-z][a-z][a-z][a-z][a-z]');
    const nounWords = words.filter(word => {
      // console.log(word,word.tags);
      return word.tags?.includes('n') || word.tags == undefined
      
    });
    // const filteredWords = words.filter(word => regex.test(word.word));
    console.log(words,words.length, nounWords.length);
  })
  .catch(error => console.error('Error:', error));

