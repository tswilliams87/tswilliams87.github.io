// Lambda handler with validation for required fields
import {
    DynamoDBClient,
    PutItemCommand,
    ScanCommand
  } from "@aws-sdk/client-dynamodb";
  import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
  
  const dynamoDBClient = new DynamoDBClient({ region: process.env.AWS_REGION });
  const s3Client = new S3Client({ region: process.env.AWS_REGION });
  const BUCKET_NAME = "milkshake-user-images";
  
  export const handler = async (event) => {
    console.log("HTTP Method:", event.httpMethod);
    console.log("Resource Path:", event.resource);
    console.log("Event:", JSON.stringify(event));
  
    const errorResponse = (message, statusCode = 500) => ({
      statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message })
    });
  
    try {
      const tableName = process.env.TABLE_NAME;
      const httpMethod = event.httpMethod || "POST";
      const resourcePath = event.resource || "/profiles";
  
      if (httpMethod === "GET" && resourcePath === "/profiles/latest-id") {
        const command = new ScanCommand({ TableName: tableName, Limit: 1, ScanIndexForward: false });
        const response = await dynamoDBClient.send(command);
        return {
          statusCode: 200,
          headers: errorResponse().headers,
          body: JSON.stringify({ message: "Latest profile retrieved successfully!", data: response.Items })
        };
      } else if (httpMethod === "GET" && resourcePath === "/profiles") {
        const response = await dynamoDBClient.send(new ScanCommand({ TableName: tableName }));
        return {
          statusCode: 200,
          headers: errorResponse().headers,
          body: JSON.stringify({ message: "Profiles retrieved successfully!", data: response.Items })
        };
      } else if (httpMethod === "POST" && resourcePath === "/profiles") {
        const body = JSON.parse(event.body);
        const { id, name, favoriteThing, filename } = body;
  
        if (!id || !name || !favoriteThing || !filename || !imageBase64) {
          console.error("❌ Missing required fields", { id, name, favoriteThing, imageBase64, filename });
          return errorResponse("Missing required fields", 400);
        }
  
        const buffer = Buffer.from(imageBase64, 'base64');
        const s3Params = {
          Bucket: BUCKET_NAME,
          Key: `profiles/${filename}`,
          Body: buffer,
          ContentEncoding: 'base64',
          ContentType: 'image/jpeg',
        };
        await s3Client.send(new PutObjectCommand(s3Params));
  
        const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/profiles/${filename}`;
  
        const dbItem = {
          id: { S: id },
          name: { S: name },
          favoriteThing: { S: favoriteThing },
          picture: { S: imageUrl }
        };
  
        Object.entries(dbItem).forEach(([key, val]) => {
          if (!val || !val.S) {
            console.warn(`⚠️ Missing or invalid value for '${key}':`, val);
          }
        });
  
        await dynamoDBClient.send(new PutItemCommand({ TableName: tableName, Item: dbItem }));
  
        return {
          statusCode: 201,
          headers: errorResponse().headers,
          body: JSON.stringify({ message: "Profile created successfully!" })
        };
      } else {
        return errorResponse("Resource not found", 404);
      }
    } catch (error) {
      console.error("❌ Error handling request:", error);
      return errorResponse("Internal Server Error", 500);
    }
  };
  