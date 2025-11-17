# 🌍 Address Generator API v2.0

<div align="center">

![Address Generator API](https://img.shields.io/badge/API-Address%20Generator-4F46E5?style=for-the-badge&logo=cloudflare&logoColor=white)
![Version](https://img.shields.io/badge/version-2.0.0-10B981?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-F59E0B?style=for-the-badge)

**Production-ready random address generator API with 70+ languages, multiple output formats, and enterprise features**

[🚀 Live Demo](https://random.aicodes.workers.dev/) • [📖 API Docs](https://random.aicodes.workers.dev/docs) • [🐛 Report Bug](https://github.com/aicoderbd/Random-API/issues) • [💡 Request Feature](https://github.com/aicoderbd/Random-API/issues)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [Supported Locales](#-supported-locales)
- [Output Formats](#-output-formats)
- [Usage Examples](#-usage-examples)
- [Rate Limiting](#-rate-limiting)
- [Development](#-development)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🌐 Global Coverage
- ✅ **70+ Locales** supported worldwide
- ✅ All Faker.js languages included
- ✅ Multi-regional address formats
- ✅ Unicode/UTF-8 fully compatible
- ✅ Right-to-left (RTL) language support

</td>
<td width="50%" valign="top">

### ⚡ Performance
- ✅ **< 50ms** response time (P99)
- ✅ **300+** global edge locations
- ✅ **99.99%** uptime SLA
- ✅ Zero cold starts
- ✅ Distributed rate limiting

</td>
</tr>
<tr>
<td valign="top">

### 📊 Output Formats
- ✅ JSON (default, prettified)
- ✅ XML (with proper encoding)
- ✅ CSV (batch exports)
- ✅ YAML (human-readable)
- ✅ Plain Text (simple format)

</td>
<td valign="top">

### 🔒 Security & Reliability
- ✅ Rate limiting (100 req/min)
- ✅ CORS protection
- ✅ Security headers (OWASP)
- ✅ Input validation & sanitization
- ✅ DDoS protection (Cloudflare)

</td>
</tr>
<tr>
<td valign="top">

### 🎯 Developer Experience
- ✅ Type-safe TypeScript
- ✅ Self-documenting API
- ✅ Reproducible results (seeding)
- ✅ Batch operations (up to 1000)
- ✅ RESTful design

</td>
<td valign="top">

### 🚀 Production Ready
- ✅ Comprehensive error handling
- ✅ Observability & monitoring
- ✅ Multi-environment support
- ✅ CI/CD pipeline ready
- ✅ Docker support

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
npm or yarn or pnpm
Cloudflare account (free tier works!)
```

### Installation

```bash
# Clone the repository
git clone https://github.com/aicoderbd/Random-API.git
cd Random-API

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### First API Call

```bash
# Generate a single address
curl http://localhost:8787/address

# Generate 5 addresses in Spanish
curl "http://localhost:8787/addresses?count=5&locale=es"

# Generate full address details in JSON
curl "http://localhost:8787/address/full?locale=ja&format=json"
```

### Deploy to Cloudflare Workers

```bash
# Login to Cloudflare
wrangler login

# Deploy to production
npm run deploy
```

---

## 📖 API Reference

### Base URL

```
Production:  https://api.yourdomain.com
Development: http://localhost:8787
```

### Authentication

**No authentication required.** This is a public API with rate limiting (100 requests/minute per IP).

---

## 🎯 Endpoints

### System Endpoints

#### `GET /` - API Documentation
Returns comprehensive API documentation and available endpoints.

**Response:**
```json
{
  "name": "Address Generator API",
  "version": "2.0.0",
  "description": "Comprehensive random address generator",
  "endpoints": { ... },
  "features": [ ... ]
}
```

#### `GET /health` - Health Check
Check API health status and uptime.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "version": "2.0.0",
  "uptime": 123456
}
```

#### `GET /locales` - List Supported Locales
Returns all 70+ supported language/region codes.

**Response:**
```json
{
  "success": true,
  "count": 72,
  "locales": ["af_ZA", "ar", "az", "bn", "cs_CZ", ...],
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

#### `GET /stats` - API Statistics
Get API statistics and configuration.

**Response:**
```json
{
  "success": true,
  "statistics": {
    "supportedLocales": 72,
    "maxBatchSize": 1000,
    "outputFormats": ["json", "xml", "csv", "yaml", "plain"],
    "version": "2.0.0",
    "endpoints": 14
  }
}
```

---

### Address Endpoints

#### `GET /address` - Generate Single Address

Generate a single basic address.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `locale` | string | `en` | Locale code (see /locales) |
| `seed` | number | random | Seed for reproducibility |
| `format` | string | `json` | Output format (json, xml, csv, yaml, plain) |

**Example Request:**
```bash
curl "https://random.aicodes.workers.dev/address?locale=en&seed=12345"
```

**Example Response:**
```json
{
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "locale": "en",
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "streetAddress": "123 Main Street",
    "city": "Springfield",
    "state": "Illinois",
    "zipCode": "62701",
    "country": "United States",
    "countryCode": "US"
  },
  "meta": {
    "seed": 12345,
    "format": "json",
    "version": "2.0.0"
  }
}
```

#### `GET /addresses` - Generate Multiple Addresses

Generate multiple basic addresses in a single request.

**Query Parameters:**
| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `count` | number | `10` | 1-1000 | Number of addresses to generate |
| `locale` | string | `en` | - | Locale code |
| `seed` | number | random | - | Seed for reproducibility |
| `format` | string | `json` | - | Output format |

**Example Request:**
```bash
curl "https://random.aicodes.workers.dev/addresses?count=5&locale=es&seed=54321"
```

**Example Response:**
```json
{
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "locale": "es",
  "count": 5,
  "data": [
    {
      "id": "uuid-1",
      "streetAddress": "Calle Mayor 42",
      "city": "Madrid",
      "state": "Comunidad de Madrid",
      "zipCode": "28013",
      "country": "España",
      "countryCode": "ES"
    },
    ...
  ],
  "meta": {
    "seed": 54321,
    "format": "json",
    "version": "2.0.0"
  }
}
```

#### `GET /address/full` - Generate Full Address Details

Generate a single address with complete details including GPS coordinates, time zone, and directional information.

**Example Request:**
```bash
curl "https://random.aicodes.workers.dev/address/full?locale=ja"
```

**Example Response:**
```json
{
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "locale": "ja",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "street": "桜通り",
    "streetName": "桜",
    "streetAddress": "東京都渋谷区桜通り1-2-3",
    "secondaryAddress": "マンション101号室",
    "city": "東京都",
    "cityPrefix": "",
    "citySuffix": "都",
    "state": "東京都",
    "stateAbbr": "東京",
    "zipCode": "150-0001",
    "zipCodeByState": "150-0001",
    "country": "日本",
    "countryCode": "JP",
    "latitude": "35.6762",
    "longitude": "139.6503",
    "timeZone": "Asia/Tokyo",
    "buildingNumber": "1-2-3",
    "cardinalDirection": "North",
    "ordinalDirection": "Northeast",
    "direction": "North",
    "county": "渋谷区",
    "nearbyGPSCoordinate": [35.6770, 139.6510],
    "coordinates": {
      "lat": 35.6762,
      "lng": 139.6503
    }
  }
}
```

#### `GET /addresses/full` - Generate Multiple Full Addresses

Generate multiple addresses with complete details.

**Example Request:**
```bash
curl "https://random.aicodes.workers.dev/addresses/full?count=3&locale=fr"
```

---

### Person Endpoints

#### `GET /person` - Generate Person with Address

Generate a complete person profile including address, company, internet presence, and financial data.

**Example Request:**
```bash
curl "https://random.aicodes.workers.dev/person?locale=de"
```

**Example Response:**
```json
{
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "locale": "de",
  "data": {
    "person": {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "prefix": "Dr.",
      "firstName": "Hans",
      "middleName": "Friedrich",
      "lastName": "Müller",
      "fullName": "Dr. Hans Friedrich Müller",
      "suffix": "Jr.",
      "gender": "Male",
      "sex": "male",
      "jobTitle": "Software Engineer",
      "jobDescriptor": "Senior",
      "jobArea": "IT",
      "jobType": "Developer",
      "bio": "Passionate about technology and innovation",
      "email": "hans.muller@example.com",
      "phone": "+49 30 12345678",
      "dateOfBirth": "1985-03-15T00:00:00.000Z",
      "age": 39,
      "avatar": "https://cloudflare-ipfs.com/ipfs/Qm..."
    },
    "address": {
      "streetAddress": "Hauptstraße 42",
      "city": "Berlin",
      "state": "Berlin",
      "zipCode": "10115",
      "country": "Germany",
      "countryCode": "DE",
      ...
    },
    "company": {
      "name": "Tech Solutions GmbH",
      "catchPhrase": "Innovative technology solutions",
      "bs": "leverage cutting-edge technologies"
    },
    "internet": {
      "username": "hans.muller123",
      "email": "hans.muller@example.com",
      "password": "xK9$mP2@vL5#",
      "emoji": "😀",
      "protocol": "https",
      "httpMethod": "GET",
      "url": "https://hans-muller.example.com",
      "domainName": "example.com",
      "domainSuffix": "com",
      "domainWord": "example",
      "ip": "192.168.1.100",
      "ipv6": "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
      "port": 8080,
      "userAgent": "Mozilla/5.0...",
      "mac": "00:1B:44:11:3A:B7"
    },
    "finance": {
      "accountName": "Checking Account",
      "accountNumber": "1234567890",
      "iban": "DE89370400440532013000",
      "bic": "COBADEFFXXX",
      "creditCardNumber": "4111111111111111",
      "creditCardCVV": "123",
      "creditCardIssuer": "Visa",
      "currency": {
        "code": "EUR",
        "name": "Euro",
        "symbol": "€"
      },
      "bitcoinAddress": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      "ethereumAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "amount": "1234.56",
      "transactionDescription": "Payment for services"
    }
  }
}
```

#### `GET /persons` - Generate Multiple Persons

Generate multiple complete person profiles.

**Example Request:**
```bash
curl "https://random.aicodes.workers.dev/persons?count=10&locale=ko"
```

---

### Component Endpoints

#### `GET /address/street` - Generate Street Information

Generate only street-related information.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "street": "Main Street",
    "streetName": "Main",
    "streetAddress": "123 Main Street",
    "secondaryAddress": "Apt 4B",
    "buildingNumber": "123"
  }
}
```

#### `GET /address/city` - Generate City Information

Generate only city-related information.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "city": "Springfield",
    "cityPrefix": "North",
    "citySuffix": "ville",
    "state": "Illinois",
    "stateAbbr": "IL",
    "county": "Sangamon County",
    "zipCode": "62701",
    "timeZone": "America/Chicago"
  }
}
```

#### `GET /address/coordinates` - Generate GPS Coordinates

Generate GPS coordinates with directional information.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `count` | number | `1` | Number of coordinate sets (1-1000) |
| `locale` | string | `en` | Locale code |
| `seed` | number | random | Seed for reproducibility |
| `format` | string | `json` | Output format |

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "cardinalDirection": "North",
    "ordinalDirection": "Northeast",
    "direction": "North",
    "nearbyCoordinate": [40.7135, -74.0055]
  }
}
```

#### `GET /address/country` - Generate Country Information

Generate country name and code.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "country": "United States",
    "countryCode": "US"
  }
}
```

---

## 🌍 Supported Locales (70+)

### 🌎 Americas (10)
`en`, `en_US`, `en_CA`, `es`, `es_MX`, `pt_BR`, `pt_PT`, `fr_CA`, `en_AU_ocker`

### 🇪🇺 Europe (30)
`en_GB`, `en_IE`, `de`, `de_AT`, `de_CH`, `fr`, `fr_BE`, `fr_CH`, `it`, `nl`, `nl_BE`, `pl`, `cs_CZ`, `da`, `el`, `fi`, `hu`, `nb_NO`, `ro`, `ro_MD`, `ru`, `sv`, `tr`, `uk`, `lv`, `sr_RS_latin`, `mk`

### 🌏 Asia Pacific (18)
`zh_CN`, `zh_TW`, `ja`, `ko`, `hi`, `id_ID`, `th`, `vi`, `bn`, `ur`, `ne`, `en_IN`, `en_AU`, `en_NG`, `en_ZA`

### 🌍 Africa & Middle East (12)
`af_ZA`, `ar`, `fa`, `he`, `zu_ZA`

### 🌐 Other (10)
`az`, `hy`, `ka`, `base` (locale-independent)

**View complete list:**
```bash
curl https://random.aicodes.workers.dev/locales
```

---

## 🎨 Output Formats

### JSON (Default)
```bash
curl "https://random.aicodes.workers.dev/address?format=json"
```

**Output:**
```json
{
  "success": true,
  "timestamp": "2025-01-15T10:30:00.000Z",
  "locale": "en",
  "data": {
    "streetAddress": "123 Main Street",
    "city": "Springfield"
  }
}
```

### XML
```bash
curl "https://random.aicodes.workers.dev/address?format=xml"
```

**Output:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<response>
  <success>true</success>
  <timestamp>2025-01-15T10:30:00.000Z</timestamp>
  <locale>en</locale>
  <data>
    <streetAddress>123 Main Street</streetAddress>
    <city>Springfield</city>
  </data>
</response>
```

### CSV
```bash
curl "https://random.aicodes.workers.dev/addresses?count=3&format=csv"
```

**Output:**
```csv
success,timestamp,locale,data_id,data_streetAddress,data_city,data_state
true,2025-01-15T10:30:00.000Z,en,uuid1,123 Main St,Springfield,IL
true,2025-01-15T10:30:00.000Z,en,uuid2,456 Oak Ave,Chicago,IL
true,2025-01-15T10:30:00.000Z,en,uuid3,789 Elm Rd,Boston,MA
```

### YAML
```bash
curl "https://random.aicodes.workers.dev/address?format=yaml"
```

**Output:**
```yaml
success: true
timestamp: 2025-01-15T10:30:00.000Z
locale: en
data:
  id: f47ac10b-58cc-4372-a567-0e02b2c3d479
  streetAddress: 123 Main Street
  city: Springfield
  state: Illinois
```

### Plain Text
```bash
curl "https://random.aicodes.workers.dev/address?format=plain"
```

**Output:**
```
success: true
timestamp: 2025-01-15T10:30:00.000Z
locale: en
data:
  id: f47ac10b-58cc-4372-a567-0e02b2c3d479
  streetAddress: 123 Main Street
  city: Springfield
```

---

## 💻 Usage Examples

### JavaScript / Node.js

```javascript
// Using fetch
const response = await fetch('https://random.aicodes.workers.dev/addresses?count=5&locale=en');
const data = await response.json();
console.log(data);

// Using axios
const axios = require('axios');
const { data } = await axios.get('https://random.aicodes.workers.dev/addresses', {
  params: { count: 10, locale: 'es', seed: 12345 }
});

// With error handling
try {
  const response = await fetch('https://random.aicodes.workers.dev/person?locale=fr');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  console.log(data.data.person.fullName);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Python

```python
import requests

# Single address
response = requests.get('https://random.aicodes.workers.dev/address', 
    params={'locale': 'fr', 'format': 'json'})
data = response.json()
print(data['data']['streetAddress'])

# Multiple addresses
response = requests.get('https://random.aicodes.workers.dev/addresses', 
    params={'count': 20, 'locale': 'de', 'seed': 12345})
addresses = response.json()['data']

# Person profile
response = requests.get('https://random.aicodes.workers.dev/person?locale=ja')
person = response.json()['data']
print(f"{person['person']['fullName']} - {person['address']['city']}")

# Download CSV
response = requests.get('https://random.aicodes.workers.dev/addresses',
    params={'count': 100, 'format': 'csv'})
with open('addresses.csv', 'w') as f:
    f.write(response.text)
```

### cURL

```bash
# Basic request
curl "https://random.aicodes.workers.dev/address"

# With all parameters
curl "https://random.aicodes.workers.dev/addresses?count=10&locale=ja&seed=12345&format=json"

# Full address in XML
curl "https://random.aicodes.workers.dev/address/full?locale=ko&format=xml"

# Person profile
curl "https://random.aicodes.workers.dev/person?locale=de" | jq '.data.person.fullName'

# Download CSV file
curl "https://random.aicodes.workers.dev/addresses?count=100&format=csv" -o addresses.csv

# Pretty print JSON
curl "https://random.aicodes.workers.dev/address" | jq '.'

# Save to file
curl "https://random.aicodes.workers.dev/addresses?count=50" > addresses.json
```

### PHP

```php
<?php
// Simple request
$url = 'https://random.aicodes.workers.dev/addresses?count=10&locale=en';
$response = file_get_contents($url);
$data = json_decode($response, true);

foreach ($data['data'] as $address) {
    echo $address['streetAddress'] . "\n";
}

// Using cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://random.aicodes.workers.dev/person?locale=de');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
echo $data['data']['person']['fullName'];
```

### Go

```go
package main

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

type AddressResponse struct {
    Success bool   `json:"success"`
    Data    []Address `json:"data"`
}

type Address struct {
    StreetAddress string `json:"streetAddress"`
    City          string `json:"city"`
    Country       string `json:"country"`
}

func main() {
    resp, err := http.Get("https://random.aicodes.workers.dev/addresses?count=5")
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    
    body, _ := io.ReadAll(resp.Body)
    
    var result AddressResponse
    json.Unmarshal(body, &result)
    
    for _, addr := range result.Data {
        fmt.Printf("%s, %s\n", addr.StreetAddress, addr.City)
    }
}
```

### Ruby

```ruby
require 'net/http'
require 'json'

# Simple request
uri = URI('https://random.aicodes.workers.dev/addresses?count=5&locale=en')
response = Net::HTTP.get(uri)
data = JSON.parse(response)

data['data'].each do |addr|
  puts "#{addr['streetAddress']}, #{addr['city']}"
end

# Person request
uri = URI('https://random.aicodes.workers.dev/person?locale=fr')
response = Net::HTTP.get(uri)
data = JSON.parse(response)

person = data['data']['person']
puts "#{person['fullName']} <#{person['email']}>"
```

### Rust

```rust
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct ApiResponse {
    success: bool,
    data: Vec<Address>,
}

#[derive(Deserialize, Serialize)]
struct Address {
    #[serde(rename = "streetAddress")]
    street_address: String,
    city: String,
    country: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://random.aicodes.workers.dev/addresses?count=5";
    let response = reqwest::get(url).await?;
    let data: ApiResponse = response.json().await?;
    
    for addr in data.data {
        println!("{}, {}", addr.street_address, addr.city);
    }
    
    Ok(())
}
```

---

## 🔒 Rate Limiting

### Limits

- **100 requests per minute** per IP address
- **1000 maximum** items per batch request
- Rate limit window: **60 seconds (rolling)**

### Rate Limit Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642262400
```

### Rate Limit Exceeded Response

**Status Code:** `429 Too Many Requests`

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Maximum 100 requests per minute allowed",
  "retryAfter": 60,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Best Practices

- **Batch requests** when possible (use `count` parameter)
- **Cache responses** for repeated data needs
- **Implement exponential backoff** for retries
- **Use seeding** for reproducible test data
- **Monitor rate limit headers** in responses
