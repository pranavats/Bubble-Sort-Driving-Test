// Create clients and set shared const values outside of the handler.
const middy = require("/opt/middy-wrapper");
const checkEven = require("/opt/check-even");

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.getNumOddHandler = middy(async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getMethod only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: "Yay i am Odd",
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
}).use(checkEven());
