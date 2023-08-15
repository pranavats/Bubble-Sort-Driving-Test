const createError = require("http-errors");

module.exports = () => {
  return {
    before: async (handler) => {
      const { event } = handler;
      if (event.pathParameters.num % 2 === 0) {
        throw createError(400, "num is even");
      }
      return;
    },
  };
};
