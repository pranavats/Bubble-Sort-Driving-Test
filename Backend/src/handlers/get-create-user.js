// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const tableName = process.env.USER_TABLE;

// Create a DocumentClient that represents the query to add an item
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = process.env.AWS_SAM_LOCAL
  ? new dynamodb.DocumentClient({
      endpoint: "http://host.docker.internal:8000",
    })
  : new dynamodb.DocumentClient();

const { nanoid } = require("nanoid");

/**
 * A simple example includes a HTTP get method to create a new user with a random id and stores the user in a DynamoDB table with timestamp.
 */
exports.getCreateUserHandler = async (event) => {
  const rollno = event.pathParameters.rollno;

  if (event.httpMethod !== "GET") {
    throw new Error(
      `getCreateUser only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  // All log statements are written to CloudWatch
  console.info("received:", event);

  // check if rollno exists in the table
  const item = await docClient
    .scan({
      TableName: tableName,
      FilterExpression: "rollno = :rollno",
      ExpressionAttributeValues: {
        ":rollno": rollno,
      },
    })
    .promise();
  if (item.Items.length > 0) {
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
      body: JSON.stringify({
        msg: `User with rollno ${rollno} already exists`,
        ...item.Items[0],
      }),
    };
  }

  // Create a nanoid to be used as the user id
  const userId = nanoid(10);

  // Create a timestamp for the user
  const timestamp = new Date().getTime();

  // Create a new user object
  const user = {
    id: userId,
    rollno: rollno,
    timestamp,
    completed: false,
  };

  // Add the user to the DynamoDB table
  const result = await docClient
    .put({
      TableName: tableName,
      Item: user,
    })
    .promise();

  // Return the user id
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(user),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
