import { DefaultSession } from 'next-auth';
import * as _aws_sdk_lib_dynamodb from '@aws-sdk/lib-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

/**
 * Debug service for system utilities and testing
 */
declare function execute$3(request: {
    service: string;
    operation: string;
    data?: any;
}, credentials?: any): Promise<{
    success: boolean;
    data: {
        message: string;
        timestamp: string;
        echo?: undefined;
        nodeVersion?: undefined;
        platform?: undefined;
        uptime?: undefined;
        memory?: undefined;
        env?: undefined;
    };
    metadata: {
        requestId: string;
        timestamp: string;
        source: string;
        error?: undefined;
    };
    error?: undefined;
} | {
    success: boolean;
    data: {
        message: string;
        timestamp: string;
        echo: any;
        nodeVersion?: undefined;
        platform?: undefined;
        uptime?: undefined;
        memory?: undefined;
        env?: undefined;
    };
    metadata: {
        requestId: string;
        timestamp: string;
        source: string;
        error?: undefined;
    };
    error?: undefined;
} | {
    success: boolean;
    data: {
        nodeVersion: string;
        platform: NodeJS.Platform;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        env: "development" | "production" | "test";
        message?: undefined;
        timestamp?: undefined;
        echo?: undefined;
    };
    metadata: {
        requestId: string;
        timestamp: string;
        source: string;
        error?: undefined;
    };
    error?: undefined;
} | {
    success: boolean;
    error: string;
    metadata: {
        requestId: string;
        timestamp: string;
        source: string;
        error?: undefined;
    };
    data?: undefined;
} | {
    success: boolean;
    error: string;
    metadata: {
        requestId: string;
        timestamp: string;
        source: string;
        error: string | undefined;
    };
    data?: undefined;
}>;
declare const debug: {
    execute: typeof execute$3;
    manifest: {
        name: string;
        version: string;
        description: string;
        operations: string[];
        requiredParams: {
            clearCredentialsCache: never[];
            ping: never[];
            testError: never[];
            getSystemInfo: never[];
        };
    };
};

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            email?: string | null;
            name?: string | null;
            image?: string | null;
            groups?: string[];
            isAdmin?: boolean;
        } & DefaultSession["user"];
        accessToken?: string;
        idToken?: string;
        refreshToken?: string;
        awsTokenExpiresAt?: number;
        groups?: string[];
        isAdmin?: boolean;
        captifyStatus?: string | null;
        error?: string;
    }
    interface JWT {
        sub?: string;
        email?: string;
        name?: string;
        accessToken?: string;
        idToken?: string;
        refreshToken?: string;
        awsTokenExpiresAt?: number;
        accessTokenExpires?: number;
        groups?: string[];
        isAdmin?: boolean;
        captifyStatus?: string | null;
        error?: string;
    }
}

interface AwsCredentials$1 {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    expiration?: string;
    region: string;
}
interface ApiUserSession {
    user: {
        id: string;
        userId: string;
        email: string;
        name?: string;
        orgId: string;
        roles: string[];
    };
    accessToken: string;
    idToken: string;
    refreshToken?: string;
    expiresAt: number;
}

/**
 * S3 Service
 * Handles all S3 operations for the Captify platform
 */

/**
 * Execute S3 operations
 */
declare function execute$2(operation: string, params: any, credentials: AwsCredentials$1 & {
    region: string;
}): Promise<any>;
declare const s3: {
    execute: typeof execute$2;
    manifest: {
        name: string;
        version: string;
        description: string;
        operations: string[];
        requiredParams: {
            getObject: string[];
            putObject: string[];
            deleteObject: string[];
            listObjects: string[];
        };
    };
};

/**
 * Cognito Service
 *
 * AWS Cognito user management service using Identity Pool credentials.
 *
 * Authentication:
 * - Uses temporary credentials from Cognito Identity Pool
 * - Credentials are obtained at the API layer using the user's ID token
 * - User must be authenticated and in 'Admins' group for admin operations
 * - Provides user-specific, temporary, scoped access with audit trail
 *
 * Security Benefits:
 * - No hardcoded AWS credentials
 * - Temporary credentials that auto-rotate
 * - User-specific access control
 * - Full audit trail of who performed each action
 * - Instantly revocable by removing user from Admins group
 *
 * Required Configuration:
 * - COGNITO_USER_POOL_ID: The Cognito User Pool ID
 * - COGNITO_IDENTITY_POOL_ID: Identity Pool ID (configured at API layer)
 * - AWS_REGION: AWS region (defaults to us-east-1)
 */
interface CognitoRequest {
    service: string;
    operation: string;
    params?: any;
    data?: any;
    schema?: string;
    app?: string;
}
/**
 * Execute Cognito user management operations
 * Uses Identity Pool credentials obtained at the API layer
 * Requires user to be in Admins group
 */
declare function execute$1(request: CognitoRequest, credentials?: any, // Identity Pool credentials from API (required)
session?: any): Promise<any>;
/**
 * Check if user has admin privileges
 * @param session - User session containing groups or role information
 */
declare function isAdmin(session?: any): boolean;
declare const cognito: {
    execute: typeof execute$1;
    isAdmin: typeof isAdmin;
};

interface AwsCredentials {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    region: string;
}
declare function createDynamoClient(credentials: AwsCredentials): Promise<DynamoDBDocumentClient>;
declare function execute(request: {
    service: string;
    operation: string;
    table: string;
    schema?: string;
    app?: string;
    data?: any;
}, credentials: AwsCredentials): Promise<{
    success: boolean;
    data: _aws_sdk_lib_dynamodb.ScanCommandOutput;
    metadata: {
        requestId: string;
        timestamp: string;
        source: string;
    };
    error?: undefined;
} | {
    success: boolean;
    data: Record<string, any> | null;
    metadata: {
        requestId: string;
        timestamp: string;
        source: string;
    };
    error?: undefined;
} | {
    success: boolean;
    data: _aws_sdk_lib_dynamodb.UpdateCommandOutput;
    metadata: {
        requestId: string;
        timestamp: string;
        source: string;
    };
    error?: undefined;
} | {
    success: boolean;
    error: string;
    metadata: {
        requestId: string;
        timestamp: string;
        source: string;
    };
    data?: undefined;
}>;
declare const dynamo: {
    execute: typeof execute;
    manifest: {
        name: string;
        version: string;
        description: string;
        operations: string[];
        requiredParams: {
            scan: string[];
            query: string[];
            get: string[];
            put: string[];
            update: string[];
            delete: string[];
        };
    };
};

declare const services: {
    use: (serviceName: string) => {
        execute: typeof execute;
        manifest: {
            name: string;
            version: string;
            description: string;
            operations: string[];
            requiredParams: {
                scan: string[];
                query: string[];
                get: string[];
                put: string[];
                update: string[];
                delete: string[];
            };
        };
    } | {
        execute: typeof execute$1;
        isAdmin: typeof isAdmin;
    } | {
        execute: typeof execute$2;
        manifest: {
            name: string;
            version: string;
            description: string;
            operations: string[];
            requiredParams: {
                getObject: string[];
                putObject: string[];
                deleteObject: string[];
                listObjects: string[];
            };
        };
    } | {
        execute: typeof execute$3;
        manifest: {
            name: string;
            version: string;
            description: string;
            operations: string[];
            requiredParams: {
                clearCredentialsCache: never[];
                ping: never[];
                testError: never[];
                getSystemInfo: never[];
            };
        };
    };
    dynamodb: {
        execute: typeof execute;
        manifest: {
            name: string;
            version: string;
            description: string;
            operations: string[];
            requiredParams: {
                scan: string[];
                query: string[];
                get: string[];
                put: string[];
                update: string[];
                delete: string[];
            };
        };
    };
    dynamo: {
        execute: typeof execute;
        manifest: {
            name: string;
            version: string;
            description: string;
            operations: string[];
            requiredParams: {
                scan: string[];
                query: string[];
                get: string[];
                put: string[];
                update: string[];
                delete: string[];
            };
        };
    };
    cognito: {
        execute: typeof execute$1;
        isAdmin: typeof isAdmin;
    };
    s3: {
        execute: typeof execute$2;
        manifest: {
            name: string;
            version: string;
            description: string;
            operations: string[];
            requiredParams: {
                getObject: string[];
                putObject: string[];
                deleteObject: string[];
                listObjects: string[];
            };
        };
    };
    debug: {
        execute: typeof execute$3;
        manifest: {
            name: string;
            version: string;
            description: string;
            operations: string[];
            requiredParams: {
                clearCredentialsCache: never[];
                ping: never[];
                testError: never[];
                getSystemInfo: never[];
            };
        };
    };
};

export { type ApiUserSession, type AwsCredentials$1 as AwsCredentials, cognito, createDynamoClient, debug, dynamo, dynamo as dynamodb, s3, services };
