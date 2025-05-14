import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
  GetItemCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || 'us-east-1';
const TABLE_NAME = process.env.TABLE_NAME;
const BUCKET_NAME = "milkshakeproddevs3071b7-dev";

const dynamoDBClient = new DynamoDBClient({ region: REGION });
const s3Client = new S3Client({ region: REGION });

export const handler = async (event) => {
  console.log("=== Incoming Request ===");
  console.log("HTTP Method:", event.httpMethod);
  console.log("Resource Path:", event.resource);
  console.log("Raw Event:", JSON.stringify(event));

  if (!TABLE_NAME) {
    return errorResponse("Environment variable TABLE_NAME is missing", 500);
  }

  try {
    const method = event.httpMethod || "POST";
    const path = event.resource || "/profiles";

    // GET all profiles
    if (method === "GET" && path === "/profiles") {
      const command = new ScanCommand({ TableName: TABLE_NAME });
      const data = await dynamoDBClient.send(command);
      return successResponse("Profiles retrieved successfully!", data.Items);
    }

    // GET profile by email
    if (method === "GET" && path === "/profiles/{email}" && event.pathParameters?.email) {
      const email = decodeURIComponent(event.pathParameters.email);

      const result = await dynamoDBClient.send(new GetItemCommand({
        TableName: TABLE_NAME,
        Key: { email: { S: email } }
      }));

      if (!result.Item) return errorResponse("Profile not found", 404);

      const profile = {
        email: result.Item.email.S,
        name: result.Item.name?.S || '',
        favoriteThing: result.Item.favoriteThing?.S || '',
        filename: result.Item.filename?.S || ''
      };

      return successResponse("Profile retrieved", profile);
    }

    // GET latest ID
    if (method === "GET" && path === "/profiles/latest-id") {
      const command = new ScanCommand({ TableName: TABLE_NAME });
      const data = await dynamoDBClient.send(command);
      return successResponse("Latest profile retrieved successfully!", data.Items);
    }

    // POST: Create new profile
    if (method === "POST" && path === "/profiles") {
      if (!event.body) return errorResponse("Missing request body", 400);

      const body = JSON.parse(event.body);
      const { id, name, favoriteThing, filename, email } = body;

      if (!id || !name || !favoriteThing || !filename || !email) {
        return errorResponse("Missing required fields", 400);
      }

      const imageUrl = `profiles/${filename}`;
      const dbParams = {
        TableName: TABLE_NAME,
        Item: {
          id: { S: id },
          email: { S: email },
          name: { S: name },
          favoriteThing: { S: favoriteThing },
          filename: { S: filename }
        }
      };

      await dynamoDBClient.send(new PutItemCommand(dbParams));
      return successResponse("Profile created successfully!", null, 201);
    }

    // PUT: Update profile by email
    if (method === "PUT" && path === "/profiles") {
      if (!event.body) return errorResponse("Missing request body", 400);
      const { email, name, favoriteThing, filename } = JSON.parse(event.body);

      if (!email) return errorResponse("Email is required", 400);

      const updateExpr = [];
      const names = {};
      const values = {};

      if (name) {
        updateExpr.push("#n = :n");
        names["#n"] = "name";
        values[":n"] = { S: name };
      }
      if (favoriteThing) {
        updateExpr.push("#f = :f");
        names["#f"] = "favoriteThing";
        values[":f"] = { S: favoriteThing };
      }
      if (filename) {
        updateExpr.push("#p = :p");
        names["#p"] = "filename";
        values[":p"] = { S: filename };
      }

      if (updateExpr.length === 0) return errorResponse("No updatable fields provided", 400);

      await dynamoDBClient.send(new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: { email: { S: email } },
        UpdateExpression: "SET " + updateExpr.join(", "),
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values
      }));

      return successResponse("Profile updated");
    }

    return errorResponse("Resource not found", 404);
  } catch (error) {
    console.error("Error caught in handler:", error);
    return {
      statusCode: 500,
      headers: defaultHeaders(),
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message || "Unknown error",
        stack: error.stack
      })
    };
  }
};

function successResponse(message, data = null, code = 200) {
  return {
    statusCode: code,
    headers: defaultHeaders(),
    body: JSON.stringify(data ? data : { message })
  };
}

function errorResponse(message, code = 500) {
  return {
    statusCode: code,
    headers: defaultHeaders(),
    body: JSON.stringify({ message })
  };
}

function defaultHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
