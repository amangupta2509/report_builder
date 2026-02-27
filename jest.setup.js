import "@testing-library/jest-dom";

// Mock environment variables for tests
process.env.JWT_SECRET = "test-jwt-secret-min-32-characters-long";
process.env.ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      pathname: "/",
      query: {},
      asPath: "/",
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
}));

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock NextRequest/NextResponse for testing
global.NextRequest = class NextRequest {
  constructor(input, options = {}) {
    this.url = input;
    this.method = options.method || "GET";
    this.headers = new Map(Object.entries(options.headers || {}));
    this.body = options.body;
    this.cookies = options.cookies || {};
  }
  async json() {
    if (typeof this.body === "string") {
      return JSON.parse(this.body);
    }
    return this.body;
  }
};

global.NextResponse = class NextResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.headers = new Map(Object.entries(options.headers || {}));
  }
  json() {
    return {
      status: this.status,
      json: async () => this.body,
    };
  }
};

// Mock Request API for jsdom
if (typeof global.Request === "undefined") {
  global.Request = class Request {
    constructor(input, options = {}) {
      this.url = input;
      this.method = options.method || "GET";
      this.headers = new Headers(options.headers);
      this.body = options.body;
    }
    async json() {
      if (typeof this.body === "string") {
        return JSON.parse(this.body);
      }
      return this.body;
    }
  };
}

// Mock Headers for jsdom
if (typeof global.Headers === "undefined") {
  global.Headers = class Headers {
    constructor(init = {}) {
      this.map = new Map(Object.entries(init));
    }
    get(name) {
      return this.map.get(name?.toLowerCase());
    }
    set(name, value) {
      this.map.set(name?.toLowerCase(), value);
    }
    has(name) {
      return this.map.has(name?.toLowerCase());
    }
  };
}
