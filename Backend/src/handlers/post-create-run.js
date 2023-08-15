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
const tableName = process.env.RUN_TABLE;
const userTable = process.env.USER_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.postCreateRunHandler = async (event) => {
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
  const machineId = body.machineId;

  // Check if id is there in user table
  const user = await docClient
    .get({
      TableName: userTable,
      Key: {
        id: id,
      },
    })
    .promise();
  if (!user.Item) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 404,
      body: JSON.stringify({
        error: `User ${id} not found`,
      }),
    };
  }

  // Create a nanoid to be used as the run id
  const runId = nanoid(15);

  // Add to Run table
  await docClient
    .put({
      TableName: tableName,
      Item: {
        id: runId,
        userId: id,
        machineId: machineId,
      },
    })
    .promise();

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      id: runId,
      userId: id,
      machineId: machineId,
    }),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
