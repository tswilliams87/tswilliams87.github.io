import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand
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

    // GET latest ID
    if (method === "GET" && path === "/profiles/latest-id") {
      const command = new ScanCommand({ TableName: TABLE_NAME });
      const data = await dynamoDBClient.send(command);
      return successResponse("Latest profile retrieved successfully!", data.Items);
    }

    // POST: Create new profile (image already uploaded from frontend)
    if (method === "POST" && path === "/profiles") {
      if (!event.body) return errorResponse("Missing request body", 400);

      const body = JSON.parse(event.body);
      console.log("Parsed body:", body);

      const { id, name, favoriteThing, filename } = body;

      if (!id || !name || !favoriteThing || !filename) {
        return errorResponse("Missing required fields", 400);
      }

      const imageUrl = `profiles/${filename}`; // store key only
      console.log("Image URL:", imageUrl);

      const dbParams = {
        TableName: TABLE_NAME,
        Item: {
          id: { S: id },
          name: { S: name },
          favoriteThing: { S: favoriteThing },
          picture: { S: imageUrl }

        }
      };

      await dynamoDBClient.send(new PutItemCommand(dbParams));
      return successResponse("Profile created successfully!", null, 201);
    }

    // PUT: Update profile
    if (method === "PUT" && path === "/profiles/latest-id") {
      if (!event.body) return errorResponse("Missing request body", 400);

      const { id, name, favoriteThing, picture } = JSON.parse(event.body);

      if (!id || !name || !favoriteThing || !picture) {
        return errorResponse("Missing fields for update", 400);
      }

      const updateParams = {
        TableName: TABLE_NAME,
        Item: {
          id: { S: id },
          name: { S: name },
          favoriteThing: { S: favoriteThing },
          picture: { S: imageUrl }
        }
      };

      await dynamoDBClient.send(new PutItemCommand(updateParams));
      return successResponse("Profile updated successfully!");
    }

    // Default 404
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
    body: JSON.stringify({ message, data })
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
