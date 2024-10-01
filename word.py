import requests
import nltk
from nltk.corpus import wordnet

# Download necessary NLTK data
nltk.download('wordnet', quiet=True)

def get_words_with_regex(pattern):
    url = f"https://api.datamuse.com/words?sp={pattern}"
    response = requests.get(url)
    words = [word['word'] for word in response.json()]
    return words

def is_object(word):
    synsets = wordnet.synsets(word)
    for syn in synsets:
        if syn.pos() == 'n':  # 'n' denotes a noun
            # Check if it's a physical object
            if any('physical object' in h for h in syn.hypernym_paths()):
                return True
    return False

def guess_word(hints):
    pattern = ''
    for i in range(hints['length']):
        if i < len(hints['word_pattern']) and hints['word_pattern'][i] != '_':
            pattern += hints['word_pattern'][i]
        else:
            pattern += '?'
    
    possible_words = get_words_with_regex(pattern)
    
    if 'is_object' in hints and hints['is_object']:
        possible_words = [word for word in possible_words if is_object(word)]
    
    return possible_words

# Example usage
hints = {
    'length': 10,
    'word_pattern': 't__th_____',
    'is_object': True
}

possible_words = guess_word(hints)
print(f"Possible words: {possible_words}")