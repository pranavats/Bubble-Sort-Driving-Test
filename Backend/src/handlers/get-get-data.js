// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const algorithmTable = process.env.ALGORITHM_TABLE;
const userTable = process.env.USER_TABLE;
const runTable = process.env.RUN_TABLE;
const runTransitionTable = process.env.RUN_TRANSITION_TABLE;

// Create a DocumentClient that represents the query to add an item
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = process.env.AWS_SAM_LOCAL
  ? new dynamodb.DocumentClient({
      endpoint: "http://host.docker.internal:8000",
    })
  : new dynamodb.DocumentClient();

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.getDataHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getMethod only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  // All log statements are written to CloudWatch
  console.info("received:", event);

  // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const id = event.pathParameters.table;
  let tableNames = {
    algorithm: algorithmTable,
    user: userTable,
    run: runTable,
    "run-transition": runTransitionTable,
  };
  if (!(id in tableNames)) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 400,
      body: JSON.stringify({
        error: `Table for ${id} not found`,
      }),
    };
  }

  // Get all the items from the table
  const itemsResult = await docClient
    .scan({
      TableName: tableNames[id],
    })
    .promise();
  let lastEvaluatedKey = itemsResult.LastEvaluatedKey;
  let items = itemsResult.Items;

  do {
    const itemsResult = await docClient
      .scan({
        TableName: tableNames[id],
        ExclusiveStartKey: lastEvaluatedKey,
      })
      .promise();
    lastEvaluatedKey = itemsResult.LastEvaluatedKey;
    items = [...items, ...itemsResult.Items];
  } while (lastEvaluatedKey);

  // Return the items in the body
  const response = {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    statusCode: 200,
    body: JSON.stringify(items),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
