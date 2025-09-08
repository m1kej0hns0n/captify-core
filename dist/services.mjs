var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/services/aws/dynamodb.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  ScanCommand,
  QueryCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";
async function createDynamoClient(credentials) {
  const client = new DynamoDBClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  });
  return DynamoDBDocumentClient.from(client);
}
__name(createDynamoClient, "createDynamoClient");
async function execute(request, credentials) {
  try {
    const {
      operation,
      table,
      schema = "captify",
      app = "core",
      data = {}
    } = request;
    const fullTableName = `${schema}-${app}-${table}`;
    const client = await createDynamoClient(credentials);
    switch (operation) {
      case "scan": {
        const command = new ScanCommand({ TableName: fullTableName, ...data });
        const result = await client.send(command);
        return {
          success: true,
          data: result,
          metadata: {
            requestId: `dynamo-scan-${Date.now()}`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "dynamo.scan"
          }
        };
      }
      case "query": {
        const command = new QueryCommand({ TableName: fullTableName, ...data });
        const result = await client.send(command);
        return {
          success: true,
          data: result,
          metadata: {
            requestId: `dynamo-query-${Date.now()}`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "dynamo.query"
          }
        };
      }
      case "get": {
        const command = new GetCommand({
          TableName: fullTableName,
          Key: data.key,
          ...data
        });
        const result = await client.send(command);
        return {
          success: true,
          data: result.Item || null,
          metadata: {
            requestId: `dynamo-get-${Date.now()}`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "dynamo.get"
          }
        };
      }
      case "put": {
        const command = new PutCommand({
          TableName: fullTableName,
          Item: data.item,
          ...data
        });
        await client.send(command);
        return {
          success: true,
          data: { message: "Item created successfully" },
          metadata: {
            requestId: `dynamo-put-${Date.now()}`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "dynamo.put"
          }
        };
      }
      case "update": {
        const command = new UpdateCommand({
          TableName: fullTableName,
          Key: data.key,
          UpdateExpression: data.updateExpression,
          ExpressionAttributeValues: data.expressionAttributeValues,
          ...data
        });
        const result = await client.send(command);
        return {
          success: true,
          data: result,
          metadata: {
            requestId: `dynamo-update-${Date.now()}`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "dynamo.update"
          }
        };
      }
      case "delete": {
        const command = new DeleteCommand({
          TableName: fullTableName,
          Key: data.key,
          ...data
        });
        await client.send(command);
        return {
          success: true,
          data: { message: "Item deleted successfully" },
          metadata: {
            requestId: `dynamo-delete-${Date.now()}`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "dynamo.delete"
          }
        };
      }
      default:
        return {
          success: false,
          error: `Unsupported operation: ${operation}`,
          metadata: {
            requestId: `dynamo-error-${Date.now()}`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "dynamo.execute"
          }
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "DynamoDB operation failed",
      metadata: {
        requestId: `dynamo-error-${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        source: "dynamo.execute"
      }
    };
  }
}
__name(execute, "execute");
var manifest = {
  name: "dynamo",
  version: "1.0.0",
  description: "DynamoDB service for data operations",
  operations: ["scan", "query", "get", "put", "update", "delete"],
  requiredParams: {
    scan: ["table"],
    query: ["table"],
    get: ["table", "key"],
    put: ["table", "item"],
    update: ["table", "key", "updateExpression"],
    delete: ["table", "key"]
  }
};
var dynamo = { execute, manifest };

// src/services/aws/cognito.ts
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminEnableUserCommand,
  AdminDisableUserCommand,
  AdminResetUserPasswordCommand,
  AdminSetUserPasswordCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  ListGroupsCommand,
  AdminListGroupsForUserCommand,
  AdminConfirmSignUpCommand,
  AdminDeleteUserCommand,
  DescribeUserPoolCommand
} from "@aws-sdk/client-cognito-identity-provider";
async function execute2(request, credentials, session) {
  if (!credentials?.accessKeyId || !credentials?.secretAccessKey || !credentials?.sessionToken) {
    console.error("\u274C No Identity Pool credentials provided");
    return {
      success: false,
      error: "Authentication required. Please ensure you are logged in and have the necessary permissions.",
      details: "This service requires Identity Pool credentials which are obtained through the API layer."
    };
  }
  if (!session?.user) {
    return {
      success: false,
      error: "No user session found. Please log in to continue."
    };
  }
  const isAdmin2 = session?.isAdmin || session?.user?.isAdmin || session?.groups?.includes("Admins") || session?.user?.groups?.includes("Admins");
  if (!isAdmin2) {
    console.error("\u{1F6AB} Access denied: User is not in Admins group:", session.user.email || session.user.id);
    return {
      success: false,
      error: "Access denied. You must be an administrator to perform Cognito management operations.",
      details: "Please contact your system administrator to request access to the Admins group."
    };
  }
  console.log("\u{1F510} Admin user authenticated:", session.user.email || session.user.id);
  const region = credentials.region || process.env.AWS_REGION || "us-east-1";
  const client = new CognitoIdentityProviderClient({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  });
  const userPoolId = process.env.COGNITO_USER_POOL_ID || "us-east-1_k3Fp77c09";
  if (!userPoolId) {
    return { success: false, error: "Cognito User Pool ID not configured" };
  }
  try {
    const params = request.params || request.data || {};
    switch (request.operation) {
      case "listUsers": {
        const command = new ListUsersCommand({
          UserPoolId: userPoolId,
          Limit: params.limit || 60,
          PaginationToken: params.paginationToken,
          Filter: params.filter
        });
        const response = await client.send(command);
        return { success: true, data: response.Users || [] };
      }
      case "getUser": {
        if (!params.Username) {
          return { success: false, error: "Username is required" };
        }
        const command = new AdminGetUserCommand({
          UserPoolId: userPoolId,
          Username: params.Username
        });
        const response = await client.send(command);
        return { success: true, data: response };
      }
      case "updateUser": {
        if (!params.Username || !params.UserAttributes) {
          return { success: false, error: "Username and UserAttributes are required" };
        }
        const command = new AdminUpdateUserAttributesCommand({
          UserPoolId: userPoolId,
          Username: params.Username,
          UserAttributes: params.UserAttributes
        });
        await client.send(command);
        return { success: true, message: "User attributes updated successfully" };
      }
      case "enableUser": {
        if (!params.Username) {
          return { success: false, error: "Username is required" };
        }
        const command = new AdminEnableUserCommand({
          UserPoolId: userPoolId,
          Username: params.Username
        });
        await client.send(command);
        return { success: true, message: "User enabled successfully" };
      }
      case "disableUser": {
        if (!params.Username) {
          return { success: false, error: "Username is required" };
        }
        const command = new AdminDisableUserCommand({
          UserPoolId: userPoolId,
          Username: params.Username
        });
        await client.send(command);
        return { success: true, message: "User disabled successfully" };
      }
      case "resetPassword": {
        if (!params.Username) {
          return { success: false, error: "Username is required" };
        }
        const command = new AdminResetUserPasswordCommand({
          UserPoolId: userPoolId,
          Username: params.Username
        });
        await client.send(command);
        return { success: true, message: "Password reset email sent" };
      }
      case "setPassword": {
        if (!params.Username || !params.Password) {
          return { success: false, error: "Username and Password are required" };
        }
        const command = new AdminSetUserPasswordCommand({
          UserPoolId: userPoolId,
          Username: params.Username,
          Password: params.Password,
          Permanent: params.Permanent !== false
        });
        await client.send(command);
        return { success: true, message: "Password set successfully" };
      }
      case "addToGroup": {
        if (!params.Username || !params.GroupName) {
          return { success: false, error: "Username and GroupName are required" };
        }
        const command = new AdminAddUserToGroupCommand({
          UserPoolId: userPoolId,
          Username: params.Username,
          GroupName: params.GroupName
        });
        await client.send(command);
        return { success: true, message: "User added to group successfully" };
      }
      case "removeFromGroup": {
        if (!params.Username || !params.GroupName) {
          return { success: false, error: "Username and GroupName are required" };
        }
        const command = new AdminRemoveUserFromGroupCommand({
          UserPoolId: userPoolId,
          Username: params.Username,
          GroupName: params.GroupName
        });
        await client.send(command);
        return { success: true, message: "User removed from group successfully" };
      }
      case "listGroups": {
        const command = new ListGroupsCommand({
          UserPoolId: userPoolId,
          Limit: params.limit || 60,
          NextToken: params.nextToken
        });
        const response = await client.send(command);
        return { success: true, data: response.Groups || [] };
      }
      case "getUserGroups": {
        if (!params.Username) {
          return { success: false, error: "Username is required" };
        }
        const command = new AdminListGroupsForUserCommand({
          UserPoolId: userPoolId,
          Username: params.Username,
          Limit: params.limit || 60,
          NextToken: params.nextToken
        });
        const response = await client.send(command);
        return { success: true, data: response.Groups || [] };
      }
      case "confirmSignUp": {
        if (!params.Username) {
          return { success: false, error: "Username is required" };
        }
        const command = new AdminConfirmSignUpCommand({
          UserPoolId: userPoolId,
          Username: params.Username
        });
        await client.send(command);
        return { success: true, message: "User sign up confirmed" };
      }
      case "deleteUser": {
        if (!params.Username) {
          return { success: false, error: "Username is required" };
        }
        const command = new AdminDeleteUserCommand({
          UserPoolId: userPoolId,
          Username: params.Username
        });
        await client.send(command);
        return { success: true, message: "User deleted successfully" };
      }
      case "describeUserPool": {
        const command = new DescribeUserPoolCommand({
          UserPoolId: userPoolId
        });
        const response = await client.send(command);
        return { success: true, data: response.UserPool };
      }
      default:
        return { success: false, error: `Unknown operation: ${request.operation}` };
    }
  } catch (error) {
    console.error("Cognito operation error:", error);
    if (error.name === "AccessDeniedException" || error.$metadata?.httpStatusCode === 403) {
      return {
        success: false,
        error: "Access denied. Please ensure you are in the Admins group to perform this operation.",
        details: error.$metadata
      };
    }
    if (error.name === "NotAuthorizedException") {
      return {
        success: false,
        error: "Not authorized. Your session may have expired. Please log in again.",
        details: error.$metadata
      };
    }
    if (error.name === "ExpiredTokenException") {
      return {
        success: false,
        error: "Your authentication token has expired. Please refresh the page to get new credentials.",
        details: error.$metadata
      };
    }
    return {
      success: false,
      error: error.message || "Cognito operation failed",
      details: error.$metadata
    };
  }
}
__name(execute2, "execute");
function isAdmin(session) {
  if (!session) return false;
  if (session.isAdmin === true) {
    return true;
  }
  if (session.user?.isAdmin === true) {
    return true;
  }
  if (session.user?.groups?.includes("Admins")) {
    return true;
  }
  if (session.groups?.includes("Admins")) {
    return true;
  }
  if (session?.["cognito:groups"]?.includes("Admins")) {
    return true;
  }
  return false;
}
__name(isAdmin, "isAdmin");
var cognito = {
  execute: execute2,
  isAdmin
};

// src/services/aws/s3.ts
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command
} from "@aws-sdk/client-s3";
function createS3Client(credentials) {
  return new S3Client({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    }
  });
}
__name(createS3Client, "createS3Client");
async function execute3(operation, params, credentials) {
  try {
    const validOperations = ["get", "put", "delete", "list"];
    if (!validOperations.includes(operation)) {
      throw new Error(
        `Invalid S3 operation: ${operation}. Valid operations: ${validOperations.join(
          ", "
        )}`
      );
    }
    const bucket = params?.bucket;
    const key = params?.key;
    if (!bucket) {
      throw new Error("Bucket is required for S3 operations");
    }
    const client = createS3Client(credentials);
    switch (operation) {
      case "get":
        return await executeGet(client, bucket, key, params);
      case "put":
        return await executePut(client, bucket, key, params);
      case "delete":
        return await executeDelete(client, bucket, key, params);
      case "list":
        return await executeList(client, bucket, params);
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  } catch (error) {
    throw error;
  }
}
__name(execute3, "execute");
async function executeGet(client, bucket, key, data) {
  if (!key) {
    throw new Error("Key is required for S3 GET operation");
  }
  const params = {
    Bucket: bucket,
    Key: key,
    ...data
  };
  const command = new GetObjectCommand(params);
  const result = await client.send(command);
  let body = null;
  if (result.Body) {
    const chunks = [];
    for await (const chunk of result.Body) {
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks).toString();
  }
  return {
    body,
    contentType: result.ContentType,
    contentLength: result.ContentLength,
    lastModified: result.LastModified,
    etag: result.ETag,
    metadata: result.Metadata
  };
}
__name(executeGet, "executeGet");
async function executePut(client, bucket, key, data) {
  if (!key) {
    throw new Error("Key is required for S3 PUT operation");
  }
  const params = {
    Bucket: bucket,
    Key: key,
    Body: data.body || data.Body,
    ContentType: data.contentType || data.ContentType,
    Metadata: data.metadata || data.Metadata,
    ...data
  };
  const command = new PutObjectCommand(params);
  const result = await client.send(command);
  return {
    etag: result.ETag,
    location: `https://${bucket}.s3.amazonaws.com/${key}`
  };
}
__name(executePut, "executePut");
async function executeDelete(client, bucket, key, data) {
  if (!key) {
    throw new Error("Key is required for S3 DELETE operation");
  }
  const params = {
    Bucket: bucket,
    Key: key,
    ...data
  };
  const command = new DeleteObjectCommand(params);
  await client.send(command);
  return { message: "Object deleted successfully" };
}
__name(executeDelete, "executeDelete");
async function executeList(client, bucket, data) {
  const params = {
    Bucket: bucket,
    Prefix: data.prefix || data.Prefix,
    MaxKeys: data.maxKeys || data.MaxKeys || 1e3,
    ContinuationToken: data.continuationToken || data.ContinuationToken,
    ...data
  };
  const command = new ListObjectsV2Command(params);
  const result = await client.send(command);
  return {
    objects: result.Contents || [],
    count: result.KeyCount || 0,
    isTruncated: result.IsTruncated || false,
    nextContinuationToken: result.NextContinuationToken,
    prefix: result.Prefix
  };
}
__name(executeList, "executeList");
var manifest2 = {
  name: "s3",
  version: "1.0.0",
  description: "S3 service for file operations",
  operations: ["getObject", "putObject", "deleteObject", "listObjects"],
  requiredParams: {
    getObject: ["bucket", "key"],
    putObject: ["bucket", "key", "body"],
    deleteObject: ["bucket", "key"],
    listObjects: ["bucket"]
  }
};
var s3 = { execute: execute3, manifest: manifest2 };

// src/services/debug.ts
async function execute4(request, credentials) {
  try {
    const { operation, data } = request;
    switch (operation) {
      case "clearCredentialsCache": {
        return {
          success: true,
          data: {
            message: "Cache clear request sent",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          },
          metadata: {
            requestId: `debug-clear-cache-${Date.now()}`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "debug.clearCredentialsCache"
          }
        };
      }
      case "ping": {
        return {
          success: true,
          data: {
            message: "pong",
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            echo: data
          },
          metadata: {
            requestId: `debug-ping-${Date.now()}`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "debug.ping"
          }
        };
      }
      case "testError": {
        throw new Error(data?.message || "Test error triggered");
      }
      case "getSystemInfo": {
        return {
          success: true,
          data: {
            nodeVersion: process.version,
            platform: process.platform,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            env: process.env.NODE_ENV
          },
          metadata: {
            requestId: `debug-system-${Date.now()}`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "debug.getSystemInfo"
          }
        };
      }
      default:
        return {
          success: false,
          error: `Unsupported debug operation: ${operation}`,
          metadata: {
            requestId: `debug-error-${Date.now()}`,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            source: "debug.execute"
          }
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Debug operation failed",
      metadata: {
        requestId: `debug-error-${Date.now()}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        source: "debug.execute",
        error: error instanceof Error ? error.stack : void 0
      }
    };
  }
}
__name(execute4, "execute");
var manifest3 = {
  name: "debug",
  version: "1.0.0",
  description: "Debug and system utility service",
  operations: ["clearCredentialsCache", "ping", "testError", "getSystemInfo"],
  requiredParams: {
    clearCredentialsCache: [],
    ping: [],
    testError: [],
    getSystemInfo: []
  }
};
var debug = { execute: execute4, manifest: manifest3 };

// src/services/index.ts
var services = {
  use: /* @__PURE__ */ __name((serviceName) => {
    switch (serviceName) {
      case "dynamodb":
      case "dynamo":
        return dynamo;
      case "cognito":
        return cognito;
      case "s3":
        return s3;
      case "debug":
        return debug;
      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }
  }, "use"),
  // Direct access to services
  dynamodb: dynamo,
  dynamo,
  cognito,
  s3,
  debug
};
export {
  cognito,
  createDynamoClient,
  debug,
  dynamo,
  dynamo as dynamodb,
  s3,
  services
};
//# sourceMappingURL=services.mjs.map