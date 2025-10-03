/**
 * Common Schemas
 * 
 * Predefined schemas for common configuration patterns
 */

import { JsonSchema, SchemaValidationRule } from '../../shared/types';

export class CommonSchemas {
  /**
   * Database configuration schema
   */
  static getDatabaseSchema(): JsonSchema {
    return {
      type: 'object',
      properties: {
        host: {
          type: 'string',
          format: 'hostname',
          minLength: 1
        },
        port: {
          type: 'number',
          minimum: 1,
          maximum: 65535
        },
        database: {
          type: 'string',
          minLength: 1
        },
        username: {
          type: 'string',
          minLength: 1
        },
        password: {
          type: 'string',
          minLength: 8
        },
        ssl: {
          type: 'boolean'
        },
        pool: {
          type: 'object',
          properties: {
            min: { type: 'number', minimum: 0 },
            max: { type: 'number', minimum: 1 },
            idle: { type: 'number', minimum: 0 }
          }
        }
      },
      required: ['host', 'port', 'database', 'username', 'password']
    };
  }

  /**
   * API configuration schema
   */
  static getApiSchema(): JsonSchema {
    return {
      type: 'object',
      properties: {
        baseUrl: {
          type: 'string',
          format: 'uri'
        },
        timeout: {
          type: 'number',
          minimum: 1000,
          maximum: 300000
        },
        retries: {
          type: 'number',
          minimum: 0,
          maximum: 10
        },
        headers: {
          type: 'object',
          additionalProperties: {
            type: 'string'
          }
        },
        auth: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['bearer', 'basic', 'api-key', 'oauth']
            },
            token: { type: 'string' },
            username: { type: 'string' },
            password: { type: 'string' },
            apiKey: { type: 'string' }
          },
          required: ['type']
        }
      },
      required: ['baseUrl']
    };
  }

  /**
   * Redis configuration schema
   */
  static getRedisSchema(): JsonSchema {
    return {
      type: 'object',
      properties: {
        host: {
          type: 'string',
          format: 'hostname'
        },
        port: {
          type: 'number',
          minimum: 1,
          maximum: 65535
        },
        password: {
          type: 'string'
        },
        db: {
          type: 'number',
          minimum: 0,
          maximum: 15
        },
        ttl: {
          type: 'number',
          minimum: 0
        },
        cluster: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            nodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  host: { type: 'string' },
                  port: { type: 'number' }
                },
                required: ['host', 'port']
              }
            }
          }
        }
      },
      required: ['host', 'port']
    };
  }

  /**
   * Environment variables schema
   */
  static getEnvironmentSchema(): JsonSchema {
    return {
      type: 'object',
      properties: {
        NODE_ENV: {
          type: 'string',
          enum: ['development', 'staging', 'production', 'test']
        },
        PORT: {
          type: 'string',
          pattern: '^\\d+$'
        },
        LOG_LEVEL: {
          type: 'string',
          enum: ['error', 'warn', 'info', 'debug', 'trace']
        },
        DEBUG: {
          type: 'string',
          pattern: '^[a-zA-Z0-9:,-]+$'
        }
      },
      required: ['NODE_ENV']
    };
  }

  /**
   * Security configuration schema
   */
  static getSecuritySchema(): JsonSchema {
    return {
      type: 'object',
      properties: {
        jwt: {
          type: 'object',
          properties: {
            secret: {
              type: 'string',
              minLength: 32
            },
            expiresIn: {
              type: 'string',
              pattern: '^\\d+[smhd]$'
            },
            algorithm: {
              type: 'string',
              enum: ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512']
            }
          },
          required: ['secret', 'expiresIn']
        },
        cors: {
          type: 'object',
          properties: {
            origin: {
              type: 'array',
              items: { type: 'string' }
            },
            credentials: { type: 'boolean' },
            methods: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
              }
            }
          }
        },
        rateLimit: {
          type: 'object',
          properties: {
            windowMs: { type: 'number', minimum: 1000 },
            max: { type: 'number', minimum: 1 }
          },
          required: ['windowMs', 'max']
        }
      },
      required: ['jwt']
    };
  }

  /**
   * Create a schema validation rule for a common schema
   */
  static createRule(
    id: string,
    name: string,
    description: string,
    schema: JsonSchema,
    category: 'security' | 'compliance' | 'performance' | 'best-practice' = 'best-practice',
    severity: 'error' | 'warning' | 'info' = 'error'
  ): SchemaValidationRule {
    return {
      id,
      description,
      schema,
      required: true,
      errorMessage: `Configuration does not match ${name} schema`
    };
  }

  /**
   * Get all common schema rules
   */
  static getAllCommonRules(): SchemaValidationRule[] {
    return [
      this.createRule(
        'database-config',
        'Database Configuration',
        'Validates database configuration structure',
        this.getDatabaseSchema(),
        'compliance',
        'error'
      ),
      this.createRule(
        'api-config',
        'API Configuration',
        'Validates API configuration structure',
        this.getApiSchema(),
        'compliance',
        'error'
      ),
      this.createRule(
        'redis-config',
        'Redis Configuration',
        'Validates Redis configuration structure',
        this.getRedisSchema(),
        'compliance',
        'error'
      ),
      this.createRule(
        'environment-vars',
        'Environment Variables',
        'Validates environment variables structure',
        this.getEnvironmentSchema(),
        'compliance',
        'warning'
      ),
      this.createRule(
        'security-config',
        'Security Configuration',
        'Validates security configuration structure',
        this.getSecuritySchema(),
        'security',
        'error'
      )
    ];
  }
}
