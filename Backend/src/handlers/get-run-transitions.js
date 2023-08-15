// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
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
exports.getRunTransitionsHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getMethod only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  // All log statements are written to CloudWatch
  console.info("received:", event);

  // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const runId = event.pathParameters.runId;

  // Get all the items from the table with runId
  // Scan all items till LastEvaluatedKey is empty
  let runTransitionsResult = await docClient
    .scan({
      TableName: runTransitionTable,
      FilterExpression: "runId = :runId",
      ExpressionAttributeValues: {
        ":runId": runId,
      },
    })
    .promise();
  let lastEvaluatedKey = runTransitionsResult.LastEvaluatedKey;
  let runTransitions = runTransitionsResult.Items;

  do {
    runTransitionsResult = await docClient
      .scan({
        TableName: runTransitionTable,
        FilterExpression: "runId = :runId",
        ExpressionAttributeValues: {
          ":runId": runId,
        },
        ExclusiveStartKey: lastEvaluatedKey,
      })
      .promise();
    lastEvaluatedKey = runTransitionsResult.LastEvaluatedKey;
    runTransitions = [...runTransitions, ...runTransitionsResult.Items];
  } while (lastEvaluatedKey);

  // Return the items in the body
  const response = {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    statusCode: 200,
    body: JSON.stringify(runTransitions),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
