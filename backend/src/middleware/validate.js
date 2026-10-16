const ApiError = require('../utils/ApiError');

// Zod schema validator middleware
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!parsed.success) {
      // Zod ke errors ko user-friendly format me extract karein
      const errors = parsed.error.issues.map((issue) => {
        const field = issue.path.slice(1).join('.');
        return `${field ? field + ': ' : ''}${issue.message}`;
      });

      return next(new ApiError(400, 'Validation Error', errors));
    }

    // Validated data ko assign karein
    req.validatedBody = parsed.data.body;
    req.validatedQuery = parsed.data.query;
    req.validatedParams = parsed.data.params;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
