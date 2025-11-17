import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { validator } from 'hono/validator';
import { etag } from 'hono/etag';
import { secureHeaders } from 'hono/secure-headers';
import { faker, Faker, allFakers } from '@faker-js/faker';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type SupportedLocale = keyof typeof allFakers;

type OutputFormat = 'json' | 'xml' | 'csv' | 'yaml' | 'plain';

interface AddressQuery {
  locale?: SupportedLocale;
  count?: number;
  seed?: number;
  format?: OutputFormat;
}

interface FullAddress {
  id: string;
  street: string;
  streetName: string;
  streetAddress: string;
  secondaryAddress: string;
  city: string;
  cityPrefix: string;
  citySuffix: string;
  state: string;
  stateAbbr: string;
  zipCode: string;
  zipCodeByState: string;
  country: string;
  countryCode: string;
  latitude: string;
  longitude: string;
  timeZone: string;
  buildingNumber: string;
  cardinalDirection: string;
  ordinalDirection: string;
  direction: string;
  county: string;
  nearbyGPSCoordinate: [number, number];
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface PersonWithAddress {
  person: {
    id: string;
    prefix: string;
    firstName: string;
    middleName: string;
    lastName: string;
    fullName: string;
    suffix: string;
    gender: string;
    sex: string;
    jobTitle: string;
    jobDescriptor: string;
    jobArea: string;
    jobType: string;
    bio: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    age: number;
    avatar: string;
  };
  address: FullAddress;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
  internet: {
    username: string;
    email: string;
    password: string;
    emoji: string;
    protocol: string;
    httpMethod: string;
    url: string;
    domainName: string;
    domainSuffix: string;
    domainWord: string;
    ip: string;
    ipv6: string;
    port: number;
    userAgent: string;
    mac: string;
  };
  finance: {
    accountName: string;
    accountNumber: string;
    iban: string;
    bic: string;
    creditCardNumber: string;
    creditCardCVV: string;
    creditCardIssuer: string;
    currency: {
      code: string;
      name: string;
      symbol: string;
    };
    bitcoinAddress: string;
    ethereumAddress: string;
    amount: string;
    transactionDescription: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  timestamp: string;
  locale: string;
  count?: number;
  data: T;
  meta?: {
    seed?: number;
    format: string;
    version: string;
  };
}

interface RateLimitStore {
  requests: Map<string, { count: number; resetTime: number }>;
}

// ============================================================================
// UTILITIES
// ============================================================================

const API_VERSION = '2.0.0';
const MAX_BATCH_SIZE = 1000;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100;

const getSupportedLocales = (): SupportedLocale[] => {
  return Object.keys(allFakers) as SupportedLocale[];
};

const getFakerInstance = (locale?: SupportedLocale): Faker => {
  if (locale && allFakers[locale]) {
    return allFakers[locale];
  }
  return faker;
};

const setSeed = (fakerInstance: Faker, seed?: number) => {
  if (seed !== undefined) {
    fakerInstance.seed(seed);
  }
};

const generateFullAddress = (fakerInstance: Faker): FullAddress => {
  const lat = parseFloat(fakerInstance.location.latitude());
  const lng = parseFloat(fakerInstance.location.longitude());
  const state = fakerInstance.location.state();
  
  return {
    id: fakerInstance.string.uuid(),
    street: fakerInstance.location.street(),
    streetName: fakerInstance.location.streetName(),
    streetAddress: fakerInstance.location.streetAddress(),
    secondaryAddress: fakerInstance.location.secondaryAddress(),
    city: fakerInstance.location.city(),
    cityPrefix: fakerInstance.location.cityPrefix?.() || '',
    citySuffix: fakerInstance.location.citySuffix?.() || '',
    state: state,
    stateAbbr: fakerInstance.location.state({ abbreviated: true }),
    zipCode: fakerInstance.location.zipCode(),
    zipCodeByState: fakerInstance.location.zipCode(),
    country: fakerInstance.location.country(),
    countryCode: fakerInstance.location.countryCode(),
    latitude: fakerInstance.location.latitude(),
    longitude: fakerInstance.location.longitude(),
    timeZone: fakerInstance.location.timeZone(),
    buildingNumber: fakerInstance.location.buildingNumber(),
    cardinalDirection: fakerInstance.location.cardinalDirection(),
    ordinalDirection: fakerInstance.location.ordinalDirection(),
    direction: fakerInstance.location.direction(),
    county: fakerInstance.location.county?.() || '',
    nearbyGPSCoordinate: fakerInstance.location.nearbyGPSCoordinate({
      origin: [lat, lng],
    }) as [number, number],
    coordinates: { lat, lng },
  };
};

const generatePersonWithAddress = (fakerInstance: Faker): PersonWithAddress => {
  const firstName = fakerInstance.person.firstName();
  const lastName = fakerInstance.person.lastName();
  const sex = fakerInstance.person.sex();
  const dob = fakerInstance.date.birthdate();
  const age = new Date().getFullYear() - dob.getFullYear();
  
  return {
    person: {
      id: fakerInstance.string.uuid(),
      prefix: fakerInstance.person.prefix(),
      firstName,
      middleName: fakerInstance.person.middleName(),
      lastName,
      fullName: fakerInstance.person.fullName(),
      suffix: fakerInstance.person.suffix(),
      gender: fakerInstance.person.gender(),
      sex,
      jobTitle: fakerInstance.person.jobTitle(),
      jobDescriptor: fakerInstance.person.jobDescriptor(),
      jobArea: fakerInstance.person.jobArea(),
      jobType: fakerInstance.person.jobType(),
      bio: fakerInstance.person.bio(),
      email: fakerInstance.internet.email({ firstName, lastName }),
      phone: fakerInstance.phone.number(),
      dateOfBirth: dob.toISOString(),
      age,
      avatar: fakerInstance.image.avatar(),
    },
    address: generateFullAddress(fakerInstance),
    company: {
      name: fakerInstance.company.name(),
      catchPhrase: fakerInstance.company.catchPhrase(),
      bs: fakerInstance.company.buzzPhrase(),
    },
    internet: {
      username: fakerInstance.internet.username({ firstName, lastName }),
      email: fakerInstance.internet.email({ firstName, lastName }),
      password: fakerInstance.internet.password(),
      emoji: fakerInstance.internet.emoji(),
      protocol: fakerInstance.internet.protocol(),
      httpMethod: fakerInstance.internet.httpMethod(),
      url: fakerInstance.internet.url(),
      domainName: fakerInstance.internet.domainName(),
      domainSuffix: fakerInstance.internet.domainSuffix(),
      domainWord: fakerInstance.internet.domainWord(),
      ip: fakerInstance.internet.ip(),
      ipv6: fakerInstance.internet.ipv6(),
      port: fakerInstance.internet.port(),
      userAgent: fakerInstance.internet.userAgent(),
      mac: fakerInstance.internet.mac(),
    },
    finance: {
      accountName: fakerInstance.finance.accountName(),
      accountNumber: fakerInstance.finance.accountNumber(),
      iban: fakerInstance.finance.iban(),
      bic: fakerInstance.finance.bic(),
      creditCardNumber: fakerInstance.finance.creditCardNumber(),
      creditCardCVV: fakerInstance.finance.creditCardCVV(),
      creditCardIssuer: fakerInstance.finance.creditCardIssuer(),
      currency: {
        code: fakerInstance.finance.currencyCode(),
        name: fakerInstance.finance.currencyName(),
        symbol: fakerInstance.finance.currencySymbol(),
      },
      bitcoinAddress: fakerInstance.finance.bitcoinAddress(),
      ethereumAddress: fakerInstance.finance.ethereumAddress(),
      amount: fakerInstance.finance.amount(),
      transactionDescription: fakerInstance.finance.transactionDescription(),
    },
  };
};

// ============================================================================
// FORMAT CONVERTERS
// ============================================================================

const convertToXML = (data: any, rootElement = 'response'): string => {
  const toXML = (obj: any, indent = ''): string => {
    let xml = '';
    for (const key in obj) {
      const value = obj[key];
      if (Array.isArray(value)) {
        value.forEach(item => {
          xml += `${indent}<${key}>${typeof item === 'object' ? '\n' + toXML(item, indent + '  ') + indent : item}</${key}>\n`;
        });
      } else if (typeof value === 'object' && value !== null) {
        xml += `${indent}<${key}>\n${toXML(value, indent + '  ')}${indent}</${key}>\n`;
      } else {
        xml += `${indent}<${key}>${value}</${key}>\n`;
      }
    }
    return xml;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n${toXML(data, '  ')}</${rootElement}>`;
};

const convertToCSV = (data: any): string => {
  const flatten = (obj: any, prefix = ''): any => {
    return Object.keys(obj).reduce((acc: any, key) => {
      const pre = prefix.length ? `${prefix}_` : '';
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flatten(obj[key], pre + key));
      } else {
        acc[pre + key] = obj[key];
      }
      return acc;
    }, {});
  };

  const items = Array.isArray(data) ? data : [data];
  const flatItems = items.map(item => flatten(item));
  const headers = Object.keys(flatItems[0] || {});
  
  const csvRows = [
    headers.join(','),
    ...flatItems.map(item => 
      headers.map(header => {
        const value = item[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    ),
  ];
  
  return csvRows.join('\n');
};

const convertToYAML = (data: any, indent = 0): string => {
  const spaces = '  '.repeat(indent);
  
  if (Array.isArray(data)) {
    return data.map(item => `${spaces}- ${convertToYAML(item, indent + 1).trimStart()}`).join('\n');
  }
  
  if (typeof data === 'object' && data !== null) {
    return Object.entries(data)
      .map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`;
        }
        return `${spaces}${key}: ${value}`;
      })
      .join('\n');
  }
  
  return `${spaces}${data}`;
};

const convertToPlain = (data: any): string => {
  const stringify = (obj: any, indent = 0): string => {
    const spaces = '  '.repeat(indent);
    let result = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result += `${spaces}${key}:\n${stringify(value, indent + 1)}`;
      } else if (Array.isArray(value)) {
        result += `${spaces}${key}: [${value.join(', ')}]\n`;
      } else {
        result += `${spaces}${key}: ${value}\n`;
      }
    }
    return result;
  };
  
  return Array.isArray(data) 
    ? data.map((item, i) => `--- Item ${i + 1} ---\n${stringify(item)}`).join('\n')
    : stringify(data);
};

const formatResponse = (data: any, format: OutputFormat, contentType: { type: string }): string => {
  switch (format) {
    case 'xml':
      contentType.type = 'application/xml';
      return convertToXML(data);
    case 'csv':
      contentType.type = 'text/csv';
      return convertToCSV(data);
    case 'yaml':
      contentType.type = 'application/x-yaml';
      return convertToYAML(data);
    case 'plain':
      contentType.type = 'text/plain';
      return convertToPlain(data);
    default:
      contentType.type = 'application/json';
      return JSON.stringify(data, null, 2);
  }
};

// ============================================================================
// RATE LIMITING
// ============================================================================

class RateLimiter {
  private store: Map<string, { count: number; resetTime: number }>;

  constructor() {
    this.store = new Map();
  }

  check(identifier: string, limit = RATE_LIMIT_MAX, window = RATE_LIMIT_WINDOW): boolean {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record || now > record.resetTime) {
      this.store.set(identifier, { count: 1, resetTime: now + window });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }

  reset(identifier: string) {
    this.store.delete(identifier);
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const rateLimiter = new RateLimiter();

// Cleanup old entries every 5 minutes
setInterval(() => rateLimiter.cleanup(), 5 * 60 * 1000);

// ============================================================================
// MIDDLEWARE
// ============================================================================

const rateLimitMiddleware = async (c: any, next: any) => {
  const identifier = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
  
  if (!rateLimiter.check(identifier)) {
    return c.json({
      success: false,
      error: 'Rate limit exceeded',
      message: `Maximum ${RATE_LIMIT_MAX} requests per minute allowed`,
      retryAfter: 60,
    }, 429);
  }
  
  await next();
};

const queryValidator = validator('query', (value, c) => {
  const { locale, count, seed, format } = value;
  
  if (locale && !getSupportedLocales().includes(locale as SupportedLocale)) {
    return c.json({ 
      success: false,
      error: 'Invalid locale',
      message: `Locale must be one of: ${getSupportedLocales().join(', ')}`,
    }, 400);
  }
  
  if (count && (isNaN(Number(count)) || Number(count) < 1 || Number(count) > MAX_BATCH_SIZE)) {
    return c.json({ 
      success: false,
      error: 'Invalid count',
      message: `Count must be between 1 and ${MAX_BATCH_SIZE}`,
    }, 400);
  }
  
  if (seed && isNaN(Number(seed))) {
    return c.json({ 
      success: false,
      error: 'Invalid seed',
      message: 'Seed must be a valid number',
    }, 400);
  }
  
  const validFormats: OutputFormat[] = ['json', 'xml', 'csv', 'yaml', 'plain'];
  if (format && !validFormats.includes(format as OutputFormat)) {
    return c.json({ 
      success: false,
      error: 'Invalid format',
      message: `Format must be one of: ${validFormats.join(', ')}`,
    }, 400);
  }
  
  return {
    locale: locale as SupportedLocale | undefined,
    count: count ? Number(count) : undefined,
    seed: seed ? Number(seed) : undefined,
    format: (format as OutputFormat) || 'json',
  };
});

// ============================================================================
// APPLICATION SETUP
// ============================================================================

const app = new Hono();

// Apply middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', etag());
app.use('*', rateLimitMiddleware);
app.use('*', prettyJSON());

// ============================================================================
// ROUTES
// ============================================================================

// Root - API Documentation
app.get('/', (c) => {
  const baseUrl = new URL(c.req.url).origin;
  
  return c.json({
    name: 'Address Generator API',
    version: API_VERSION,
    description: 'Comprehensive random address generator with multi-language support',
    documentation: `${baseUrl}/docs`,
    endpoints: {
      system: {
        '/': 'API documentation',
        '/health': 'Health check',
        '/locales': 'List all supported locales',
        '/stats': 'API statistics',
      },
      addresses: {
        '/address': 'Generate single address',
        '/addresses': 'Generate multiple addresses',
        '/address/full': 'Generate detailed address',
        '/addresses/full': 'Generate multiple detailed addresses',
      },
      persons: {
        '/person': 'Generate person with address',
        '/persons': 'Generate multiple persons with addresses',
        '/person/complete': 'Generate complete person profile',
      },
      components: {
        '/address/street': 'Generate street information',
        '/address/city': 'Generate city information',
        '/address/coordinates': 'Generate GPS coordinates',
        '/address/country': 'Generate country information',
      },
    },
    parameters: {
      locale: `Locale code (${getSupportedLocales().length} available)`,
      count: `Number of items (1-${MAX_BATCH_SIZE})`,
      seed: 'Seed for reproducible results',
      format: 'Output format (json, xml, csv, yaml, plain)',
    },
    features: [
      `${getSupportedLocales().length}+ supported locales`,
      'Multiple output formats',
      'Seeded generation',
      'Rate limiting protection',
      'Batch operations',
      'Complete person profiles',
    ],
    rateLimit: {
      maxRequests: RATE_LIMIT_MAX,
      window: '1 minute',
    },
    examples: {
      basic: `${baseUrl}/address?locale=en`,
      batch: `${baseUrl}/addresses?count=10&locale=es`,
      seeded: `${baseUrl}/address?seed=12345`,
      xml: `${baseUrl}/person?format=xml`,
      csv: `${baseUrl}/addresses?count=5&format=csv`,
    },
  });
});

// Health Check
app.get('/health', (c) => {
  return c.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: API_VERSION,
    uptime: process.uptime?.() || 'N/A',
  });
});

// List Supported Locales
app.get('/locales', (c) => {
  const locales = getSupportedLocales();
  return c.json({
    success: true,
    count: locales.length,
    locales: locales.sort(),
    timestamp: new Date().toISOString(),
  });
});

// API Statistics
app.get('/stats', (c) => {
  return c.json({
    success: true,
    timestamp: new Date().toISOString(),
    statistics: {
      supportedLocales: getSupportedLocales().length,
      maxBatchSize: MAX_BATCH_SIZE,
      outputFormats: ['json', 'xml', 'csv', 'yaml', 'plain'],
      version: API_VERSION,
      endpoints: 20,
    },
  });
});

// Generate Single Address
app.get('/address', queryValidator, (c) => {
  const { locale, seed, format } = c.req.valid('query');
  const fakerInstance = getFakerInstance(locale);
  setSeed(fakerInstance, seed);
  
  const address = {
    id: fakerInstance.string.uuid(),
    streetAddress: fakerInstance.location.streetAddress(),
    city: fakerInstance.location.city(),
    state: fakerInstance.location.state(),
    zipCode: fakerInstance.location.zipCode(),
    country: fakerInstance.location.country(),
    countryCode: fakerInstance.location.countryCode(),
  };
  
  const response: ApiResponse<typeof address> = {
    success: true,
    timestamp: new Date().toISOString(),
    locale: locale || 'en',
    data: address,
    meta: { seed, format, version: API_VERSION },
  };
  
  const contentType = { type: 'application/json' };
  const formatted = formatResponse(response, format, contentType);
  
  return c.text(formatted, 200, { 'Content-Type': contentType.type });
});

// Generate Multiple Addresses
app.get('/addresses', queryValidator, (c) => {
  const { locale, count = 10, seed, format } = c.req.valid('query');
  const fakerInstance = getFakerInstance(locale);
  setSeed(fakerInstance, seed);
  
  const addresses = Array.from({ length: count }, () => ({
    id: fakerInstance.string.uuid(),
    streetAddress: fakerInstance.location.streetAddress(),
    city: fakerInstance.location.city(),
    state: fakerInstance.location.state(),
    zipCode: fakerInstance.location.zipCode(),
    country: fakerInstance.location.country(),
    countryCode: fakerInstance.location.countryCode(),
  }));
  
  const response: ApiResponse<typeof addresses> = {
    success: true,
    timestamp: new Date().toISOString(),
    locale: locale || 'en',
    count: addresses.length,
    data: addresses,
    meta: { seed, format, version: API_VERSION },
  };
  
  const contentType = { type: 'application/json' };
  const formatted = formatResponse(response, format, contentType);
  
  return c.text(formatted, 200, { 'Content-Type': contentType.type });
});

// Generate Full Address
app.get('/address/full', queryValidator, (c) => {
  const { locale, seed, format } = c.req.valid('query');
  const fakerInstance = getFakerInstance(locale);
  setSeed(fakerInstance, seed);
  
  const address = generateFullAddress(fakerInstance);
  
  const response: ApiResponse<typeof address> = {
    success: true,
    timestamp: new Date().toISOString(),
    locale: locale || 'en',
    data: address,
    meta: { seed, format, version: API_VERSION },
  };
  
  const contentType = { type: 'application/json' };
  const formatted = formatResponse(response, format, contentType);
  
  return c.text(formatted, 200, { 'Content-Type': contentType.type });
});

// Generate Multiple Full Addresses
app.get('/addresses/full', queryValidator, (c) => {
  const { locale, count = 10, seed, format } = c.req.valid('query');
  const fakerInstance = getFakerInstance(locale);
  setSeed(fakerInstance, seed);
  
  const addresses = Array.from({ length: count }, () => generateFullAddress(fakerInstance));
  
  const response: ApiResponse<typeof addresses> = {
    success: true,
    timestamp: new Date().toISOString(),
    locale: locale || 'en',
    count: addresses.length,
    data: addresses,
    meta: { seed, format, version: API_VERSION },
  };
  
  const contentType = { type: 'application/json' };
  const formatted = formatResponse(response, format, contentType);
  
  return c.text(formatted, 200, { 'Content-Type': contentType.type });
});

// Generate Person with Address
app.get('/person', queryValidator, (c) => {
  const { locale, seed, format } = c.req.valid('query');
  const fakerInstance = getFakerInstance(locale);
  setSeed(fakerInstance, seed);
  
  const person = generatePersonWithAddress(fakerInstance);
  
  const response: ApiResponse<typeof person> = {
    success: true,
    timestamp: new Date().toISOString(),
    locale: locale || 'en',
    data: person,
    meta: { seed, format, version: API_VERSION },
  };
  
  const contentType = { type: 'application/json' };
  const formatted = formatResponse(response, format, contentType);
  
  return c.text(formatted, 200, { 'Content-Type': contentType.type });
});

// Generate Multiple Persons
app.get('/persons', queryValidator, (c) => {
  const { locale, count = 10, seed, format } = c.req.valid('query');
  const fakerInstance = getFakerInstance(locale);
  setSeed(fakerInstance, seed);
  
  const persons = Array.from({ length: count }, () => generatePersonWithAddress(fakerInstance));
  
  const response: ApiResponse<typeof persons> = {
    success: true,
    timestamp: new Date().toISOString(),
    locale: locale || 'en',
    count: persons.length,
    data: persons,
    meta: { seed, format, version: API_VERSION },
  };
  
  const contentType = { type: 'application/json' };
  const formatted = formatResponse(response, format, contentType);
  
  return c.text(formatted, 200, { 'Content-Type': contentType.type });
});

// Generate Street Information
app.get('/address/street', queryValidator, (c) => {
  const { locale, seed, format } = c.req.valid('query');
  const fakerInstance = getFakerInstance(locale);
  setSeed(fakerInstance, seed);
  
  const street = {
    id: fakerInstance.string.uuid(),
    street: fakerInstance.location.street(),
    streetName: fakerInstance.location.streetName(),
    streetAddress: fakerInstance.location.streetAddress(),
    secondaryAddress: fakerInstance.location.secondaryAddress(),
    buildingNumber: fakerInstance.location.buildingNumber(),
  };
  
  const response: ApiResponse<typeof street> = {
    success: true,
    timestamp: new Date().toISOString(),
    locale: locale || 'en',
    data: street,
    meta: { seed, format, version: API_VERSION },
  };
  
  const contentType = { type: 'application/json' };
  const formatted = formatResponse(response, format, contentType);
  
  return c.text(formatted, 200, { 'Content-Type': contentType.type });
});

// Generate City Information
app.get('/address/city', queryValidator, (c) => {
  const { locale, seed, format } = c.req.valid('query');
  const fakerInstance = getFakerInstance(locale);
  setSeed(fakerInstance, seed);
  
  const city = {
    id: fakerInstance.string.uuid(),
    city: fakerInstance.location.city(),
    cityPrefix: fakerInstance.location.cityPrefix?.() || '',
    citySuffix: fakerInstance.location.citySuffix?.() || '',
    state: fakerInstance.location.state(),
    stateAbbr: fakerInstance.location.state({ abbreviated: true }),
    county: fakerInstance.location.county?.() || '',
    zipCode: fakerInstance.location.zipCode(),
    timeZone: fakerInstance.location.timeZone(),
  };
  
  const response: ApiResponse<typeof city> = {
    success: true,
    timestamp: new Date().toISOString(),
    locale: locale || 'en',
    data: city,
    meta: { seed, format, version: API_VERSION },
  };
  
  const contentType = { type: 'application/json' };
  const formatted = formatResponse(response, format, contentType);
  
  return c.text(formatted, 200, { 'Content-Type': contentType.type });
});

// Generate GPS Coordinates
app.get('/address/coordinates', queryValidator, (c) => {
  const { locale, seed, count = 1, format } = c.req.valid('query');
  const fakerInstance = getFakerInstance(locale);
  setSeed(fakerInstance, seed);
  
  const generateCoordinate = () => {
    const lat = parseFloat(fakerInstance.location.latitude());
    const lng = parseFloat(fakerInstance.location.longitude());
    
    return {
      id: fakerInstance.string.uuid(),
      latitude: lat,
      longitude: lng,
      cardinalDirection: fakerInstance.location.cardinalDirection(),
      ordinalDirection: fakerInstance.location.ordinalDirection(),
      direction: fakerInstance.location.direction(),
      nearbyCoordinate: fakerInstance.location.nearbyGPSCoordinate({ origin: [lat, lng] }),
    };
  };
  
  const coordinates = count === 1 ? generateCoordinate() : Array.from({ length: count }, generateCoordinate);
  
  const response: ApiResponse<typeof coordinates> = {
    success: true,
    timestamp: new Date().toISOString(),
    locale: locale || 'en',
    count: count > 1 ? count : undefined,
    data: coordinates,
    meta: { seed, format, version: API_VERSION },
  };
  
  const contentType = { type: 'application/json' };
  const formatted = formatResponse(response, format, contentType);
  
  return c.text(formatted, 200, { 'Content-Type': contentType.type });
});

// Generate Country Information
app.get('/address/country', queryValidator, (c) => {
  const { locale, seed, format } = c.req.valid('query');
  const fakerInstance = getFakerInstance(locale);
  setSeed(fakerInstance, seed);
  
  const country = {
    id: fakerInstance.string.uuid(),
    country: fakerInstance.location.country(),
    countryCode: fakerInstance.location.countryCode(),
  };
  
  const response: ApiResponse<typeof country> = {
    success: true,
    timestamp: new Date().toISOString(),
    locale: locale || 'en',
    data: country,
    meta: { seed, format, version: API_VERSION },
  };
  
  const contentType = { type: 'application/json' };
  const formatted = formatResponse(response, format, contentType);
  
  return c.text(formatted, 200, { 'Content-Type': contentType.type });
});

// 404 Handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/',
      '/health',
      '/locales',
      '/stats',
      '/address',
      '/addresses',
      '/address/full',
      '/addresses/full',
      '/person',
      '/persons',
      '/address/street',
      '/address/city',
      '/address/coordinates',
      '/address/country',
    ],
  }, 404);
});

// Error Handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString(),
  }, 500);
});

export default app;
