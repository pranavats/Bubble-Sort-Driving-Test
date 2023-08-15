// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = process.env.AWS_SAM_LOCAL
  ? new dynamodb.DocumentClient({
      endpoint: "http://host.docker.internal:8000",
    })
  : new dynamodb.DocumentClient();

// Get the DynamoDB table name from environment variables
const algorithmTable = process.env.ALGORITHM_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.postUpdateAlgorithmHandler = async (event) => {
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

  const { algorithmId } = body;
  if (algorithmId === undefined) {
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

  // Update algorithm with given rollno
  // rollno is not primary key in algorithm table
  const algorithm = await docClient
    .update({
      TableName: algorithmTable,
      Key: {
        id: id,
      },
      UpdateExpression: "set algorithmId = :algorithmId",
      ExpressionAttributeValues: {
        ":algorithmId": algorithmId,
      },
      ReturnValues: "UPDATED_NEW",
    })
    .promise();

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(algorithm),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
