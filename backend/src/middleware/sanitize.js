// NoSQL injection protection middleware
// Request body, query, aur params se '$' aur '.' wale keys sanitize karta hai
const cleanInput = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanInput(item));
  }

  const cleaned = {};
  for (const [key, val] of Object.entries(obj)) {
    // '$' se start hone wale operators ($gt, $ne, $where etc.) ko filter out karein
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = typeof val === 'object' && val !== null ? cleanInput(val) : val;
  }
  return cleaned;
};

const sanitize = (req, res, next) => {
  if (req.body) req.body = cleanInput(req.body);
  if (req.params) req.params = cleanInput(req.params);
  // req.query may have getter, so we sanitize property-by-property
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete req.query[key];
      } else if (typeof req.query[key] === 'object' && req.query[key] !== null) {
        req.query[key] = cleanInput(req.query[key]);
      }
    }
  }
  next();
};

module.exports = sanitize;
