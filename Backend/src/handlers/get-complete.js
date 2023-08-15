// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const userTable = process.env.USER_TABLE;

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
exports.getCompleteHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getMethod only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const id = event.pathParameters.id;

  let user = await docClient
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

  if (user.Item.completed === true) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
      body: JSON.stringify({
        ...user.Item,
      }),
    };
  }

  // Update the user in the database
  const updated_item = await docClient
    .update({
      TableName: userTable,
      Key: {
        id: id,
      },
      UpdateExpression:
        "set completed = :completed, completedAt = :completedAt",
      ExpressionAttributeValues: {
        ":completed": true,
        ":completedAt": new Date().getTime(),
      },
      ReturnValues: "UPDATED_NEW",
    })
    .promise();
  const response = {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    statusCode: 200,
    body: JSON.stringify({
      updated_item: updated_item.Attributes,
      user: user.Item,
    }),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
