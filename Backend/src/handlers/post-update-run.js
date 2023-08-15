// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = process.env.AWS_SAM_LOCAL
  ? new dynamodb.DocumentClient({
      endpoint: "http://host.docker.internal:8000",
    })
  : new dynamodb.DocumentClient();

const { nanoid } = require("nanoid");

// Get the DynamoDB table name from environment variables
const runTable = process.env.RUN_TABLE;
const runTransitionTabke = process.env.RUN_TRANSITION_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.postUpdateRunHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  // Get the body from the event
  const body = JSON.parse(event.body);

  // Get id and name from the body of the request
  const id = body.id;

  // Check if id is there in run table
  const run = await docClient
    .get({
      TableName: runTable,
      Key: {
        id: id,
      },
    })
    .promise();
  if (!run.Item) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 404,
      body: JSON.stringify({
        error: `Run ${id} not found`,
      }),
    };
  }

  // Get type, payload, preState, postState and timestamp from the body of the request
  // Check if each of these are there in request body
  const { type, payload, preState, postState, timestamp } = body;
  if (!type || !preState || !postState || !timestamp) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 400,
      body: JSON.stringify({
        error: `Missing required fields in request body`,
      }),
    };
  }

  const item = {
    runId: id,
    id: nanoid(15),
    type,
    payload: payload || {},
    preState,
    postState,
    timestamp,
  };
  // Add to RunTransition table
  await docClient
    .put({
      TableName: runTransitionTabke,
      Item: item,
    })
    .promise();

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(item),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
