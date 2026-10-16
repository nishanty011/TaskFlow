// Async functions ko wrap karta hai taaki try-catch baar baar na likhna pade
// Controller mein simply asyncHandler se wrap kar do, errors automatically catch ho jayenge
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
