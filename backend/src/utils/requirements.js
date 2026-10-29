// Customer preferences describe requested scope; they never determine pricing.
const requirementKeys = ['menu', 'meal', 'requests', 'theme', 'area', 'setup', 'start', 'coverage', 'format', 'look', 'layout'];

function normalizeRequirements(requirements = {}) {
  return Object.fromEntries(requirementKeys
    .filter((key) => typeof requirements[key] === 'string' && requirements[key].trim())
    .sort()
    .map((key) => [key, requirements[key].trim()]));
}

module.exports = { requirementKeys, normalizeRequirements };
