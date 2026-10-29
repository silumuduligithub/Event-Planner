const aliases = new Map([
  ['marriage', 'wedding'], ['shaadi', 'wedding'], ['wedding', 'wedding'],
  ['engagement', 'engagement'], ['ring ceremony', 'engagement'], ['roka', 'engagement'],
  ['birthday', 'birthday'], ['birthday party', 'birthday'],
  ['anniversary', 'anniversary'], ['wedding anniversary', 'anniversary'],
  ['corporate', 'corporate'], ['corporate event', 'corporate'], ['conference', 'corporate'],
  ['concert', 'concert'], ['cultural', 'cultural'], ['cultural festival', 'cultural'],
  ['baby shower', 'baby-shower'], ['naming ceremony', 'naming-ceremony'],
  ['housewarming', 'housewarming'], ['griha pravesh', 'housewarming'],
]);

function occasionKey(label) {
  const normalized = String(label || '').trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
  return occasionSearchKey(normalized) || normalized.replace(/ /g, '-');
}

function occasionSearchKey(query) {
  let phrase = String(query || '').trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
  if (aliases.has(phrase)) return aliases.get(phrase);
  phrase = phrase.replace(/\s+(event|function|party)$/, '').trim();
  return aliases.get(phrase) || null;
}

module.exports = { occasionKey, occasionSearchKey };
