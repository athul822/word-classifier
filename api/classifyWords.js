const natural = require('natural');
const wordnetdb = require('wordnet-db');

natural.WordNet.prototype.path = wordnetdb.path;
const wordnet = new natural.WordNet();

function isPhysicalObject(definition) {
    const physicalKeywords = [
        'object', 'thing', 'item', 'device', 'tool', 'instrument', 'apparatus',
        'machine', 'equipment', 'furniture', 'vessel', 'container', 'vehicle',
        'garment', 'food', 'drink', 'plant', 'animal', 'body part'
    ];
    
    const lowercaseDef = definition.toLowerCase();
    return physicalKeywords.some(keyword => lowercaseDef.includes(keyword));
}

function classifyWord(word) {
    return new Promise((resolve) => {
        wordnet.lookup(word, function(results) {
            if (results.length === 0) {
                resolve({ word, isPhysicalObject: false, score: 0 });
                return;
            }
            
            const nounDefinitions = results.filter(result => result.pos === 'n');
            if (nounDefinitions.length === 0) {
                resolve({ word, isPhysicalObject: false, score: 0 });
                return;
            }
            
            const isObject = nounDefinitions.some(result => 
                isPhysicalObject(result.def) ||
                result?.hypernyms?.some(hypernym => hypernym.lemma === 'physical object')
            );
            
            resolve({
                word,
                isPhysicalObject: isObject,
                score: isObject ? nounDefinitions.length * 100 : 0
            });
        });
    });
}

async function classifyWords(words) {
    const classifiedWords = await Promise.all(words.map(classifyWord));
    return classifiedWords.sort((a, b) => b.score - a.score);
}

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const { words } = req.body;
            
            if (!Array.isArray(words)) {
                return res.status(400).json({ error: 'Words must be provided as an array' });
            }
            
            const classifiedWords = await classifyWords(words);
            res.status(200).json(classifiedWords);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while processing the request' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};