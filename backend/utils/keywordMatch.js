function keywordMatch(cvText, required = [], optional = []) {
  const text = cvText.toLowerCase();
  const matchedRequired = required.filter(k => new RegExp(`\\b${k.toLowerCase()}\\b`).test(text));
  const matchedOptional = optional.filter(k => new RegExp(`\\b${k.toLowerCase()}\\b`).test(text));
  const score = required.length > 0 ? Math.round((matchedRequired.length / required.length) * 100) : 0;
  return { score, matchedRequired, matchedOptional };
}

module.exports = { keywordMatch }; 