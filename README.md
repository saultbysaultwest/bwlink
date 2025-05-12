# URL Shortener Service

A customizable URL shortening service with MongoDB storage and configurable API routes.

## Features

- Custom API endpoint names via environment variables
- MongoDB for persistent storage
- Parameter preservation during redirects
- Password-protected API for creating short URLs
- Web interface for easy URL shortening
- UUID-based short codes for security

## Installation

1. Clone the repository or create the files from the artifacts above
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up MongoDB (local or cloud)
4. Configure environment variables (see `.env` file)
5. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## Configuration

Edit the `.env` file to customize your service:

```env
# Port for the server to run on
PORT=3000

# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/urlshortener

# Custom API route names
REDIRECT_URL_PARAMS=lwp
SHORTEN_URL=su

# Password for API authentication
API_PASSWORD=your_secure_password_here
```

## API Usage

### Shorten a URL

**Endpoint:** `POST /{SHORTEN_URL}`

```bash
curl -X POST http://localhost:3000/su \
  -H "Content-Type: application/json" \
  -d '{
    "password": "your_secure_password_here",
    "longURL": "https://example.com/very/long/url"
  }'
```

**Response:**

```json
{
  "success": true,
  "shortCode": "8ab3c4d5",
  "shortenedUrl": "http://localhost:3000/lwp/8ab3c4d5"
}
```

### Access a Shortened URL

**Endpoint:** `GET /{REDIRECT_URL_PARAMS}/:shortCode`

Simply visit the shortened URL in a browser or make a GET request:

```bash
curl -L http://localhost:3000/lwp/8ab3c4d5
```

The service will redirect you to the original URL, preserving any query parameters.

## Web Interface

Visit `http://localhost:3000` to use the web interface for shortening URLs.

## Database Schema

The service stores URLs in MongoDB with the following schema:

```javascript
{
  shortCode: String,    // Unique identifier for the short URL
  originalUrl: String,  // The original long URL
  createdAt: Date      // Timestamp when the URL was created
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `401` - Unauthorized (invalid password)
- `400` - Bad Request (missing required parameters)
- `404` - Not Found (short code doesn't exist)
- `500` - Internal Server Error

## Security Considerations

1. **API Password**: Change the default password in your `.env` file
2. **MongoDB Security**: Use authentication for your MongoDB instance
3. **HTTPS**: In production, use HTTPS to protect API calls
4. **Rate Limiting**: Consider adding rate limiting to prevent abuse

## Example Use Cases

With the default configuration (`REDIRECT_URL_PARAMS=lwp`, `SHORTEN_URL=su`):

1. Create a short URL:

   ```bash
   POST /su
   ```

2. Access the short URL:
   ```bash
   GET /lwp/abc123def
   ```

You can customize these endpoints by changing the environment variables. For example, if you set `REDIRECT_URL_PARAMS=redirect` and `SHORTEN_URL=create`, then:

1. Create a short URL:

   ```bash
   POST /create
   ```

2. Access the short URL:
   ```bash
   GET /redirect/abc123def
   ```

## Development

The code is structured to be easily extensible:

- Add authentication middleware for more security options
- Implement analytics tracking
- Add custom short code support
- Implement expiration dates for URLs
- Add bulk URL shortening capabilities
