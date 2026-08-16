export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  required?: boolean;
  type: string;
  description?: string;
  default?: any;
  example?: any;
}

export interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  tags: string[];
  summary: string;
  description: string;
  requiresAuth: boolean;
  parameters?: ApiParameter[];
  requestBody?: {
    required?: boolean;
    contentType: string;
    schema: Record<string, any>;
    example?: Record<string, any>;
  };
  responses: {
    status: number;
    description: string;
    example?: Record<string, any>;
  }[];
}

export interface ApiTag {
  name: string;
  description: string;
  icon?: string;
}

export interface PredefinedUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  role: string;
  token?: string;
}
