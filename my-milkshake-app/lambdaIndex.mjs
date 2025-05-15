// lambdaIndex.mjs — Updated to match /profiles/user/{id} via event.path
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
    const path = event.path || "/profiles";

    if (method === "GET" && path === "/profiles") {
      const command = new ScanCommand({ TableName: TABLE_NAME });
      const data = await dynamoDBClient.send(command);
      return successResponse("Profiles retrieved successfully!", data.Items);
    }

    if (method === "GET" && path === "/profiles/latest-id") {
      const command = new ScanCommand({ TableName: TABLE_NAME });
      const data = await dynamoDBClient.send(command);
      return successResponse("Latest profile retrieved successfully!", data.Items);
    }

    if (method === "GET" && path.startsWith("/profiles/user/")) {
      const id = decodeURIComponent(path.split("/").pop());
      const result = await dynamoDBClient.send(new GetItemCommand({
        TableName: TABLE_NAME,
        Key: { id: { S: id } }
      }));
      if (!result.Item) return errorResponse("Profile not found", 404);
      const profile = {
        id: result.Item.id.S,
        name: result.Item.name?.S || '',
        favoriteThing: result.Item.favoriteThing?.S || '',
        filename: result.Item.filename?.S || '',
        email: result.Item.email?.S || '',
        picture: result.Item.picture?.S || ''
      };
      return successResponse("Profile retrieved", profile);
    }

    if (method === "POST" && path === "/profiles") {
      if (!event.body) return errorResponse("Missing request body", 400);
      const body = JSON.parse(event.body);
      const { id, name, favoriteThing, filename, email, picture } = body;
      if (!id || !name || !favoriteThing || !filename || !email || !picture) {
        return errorResponse("Missing required fields", 400);
      }
      const dbParams = {
        TableName: TABLE_NAME,
        Item: {
          id: { S: id },
          name: { S: name },
          favoriteThing: { S: favoriteThing },
          filename: { S: filename },
          email: { S: email },
          picture: {S: picture}
        }
      };
      await dynamoDBClient.send(new PutItemCommand(dbParams));
      return successResponse("Profile created successfully!", null, 201);
    }

    if (method === "PUT" && path.startsWith("/profiles/user/")) {
      if (!event.body) return errorResponse("Missing request body", 400);
      const id = decodeURIComponent(path.split("/").pop());
      const { name, favoriteThing, filename, email, picture } = JSON.parse(event.body);

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
      if (picture) {
        updateExpr.push("#p = :p");
        names["#p"] = "picture";
        values[":p"] = { S: picture };
      }
      if (email) {
        updateExpr.push("#e = :e");
        names["#e"] = "email";
        values[":e"] = { S: email };
      }
      if (filename) {
        updateExpr.push("#fn = :fn");
        names["#fn"] = "filename";
        values[":fn"] = { S: filename };
      }

      if (updateExpr.length === 0) return errorResponse("No updatable fields provided", 400);

      await dynamoDBClient.send(new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: { id: { S: id } },
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