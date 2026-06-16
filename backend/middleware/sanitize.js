const sanitizeValue = (val) => {
  if (val instanceof Object) {
    for (const key in val) {
      if (/^\$/.test(key) || key.indexOf('.') !== -1) {
        delete val[key];
      } else {
        sanitizeValue(val[key]);
      }
    }
  }
  return val;
};

const sanitize = (req, res, next) => {
  if (req.body) sanitizeValue(req.body);
  if (req.query) sanitizeValue(req.query);
  if (req.params) sanitizeValue(req.params);
  next();
};

module.exports = { sanitize };
