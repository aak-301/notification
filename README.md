# Call Registration API with MongoDB

This is a Node.js API for handling call registrations via Twilio, with MongoDB as the database.

## Features

- Incoming call processing with Twilio
- User registration via API endpoints
- Coordinator assignment system
- SMS notifications
- Email capabilities
- MongoDB database integration

## Prerequisites

- Node.js (v14 or newer)
- MongoDB (local instance or MongoDB Atlas)
- Twilio account (for SMS and call handling)
- SMTP server access (for email functionality)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd call-registration-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example .env file and update it with your settings:

```bash
cp .env.example .env
```

Edit the `.env` file with your specific configuration:

- MongoDB connection string
- Twilio credentials
- Email server settings
- Feature flags

### 4. Set up MongoDB

Make sure MongoDB is running locally, or update the `MONGODB_URI` in your .env file to point to your MongoDB Atlas cluster.

### 5. Start the application

```bash
# For development with auto-reload
npm run dev

# For production
npm start
```

## API Endpoints

### User Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:phoneNumber` - Get user by phone number
- `GET /api/users/test-register?phoneNumber=+1234567890` - Test endpoint to register a user

### Coordinator Endpoints

- `GET /api/coordinators` - Get all coordinators
- `GET /api/coordinators/:id` - Get coordinator by ID

### Webhook Endpoints

- `POST /webhook/voice` - Handle incoming voice calls from Twilio
- `POST /webhook/status` - Handle status updates from Twilio

## Twilio Configuration

To set up Twilio for this application:

1. Log in to your Twilio account
2. Go to the Phone Numbers section
3. Select or purchase a phone number
4. Configure the Voice webhook URL to point to your `/webhook/voice` endpoint
5. Configure the Status Callback URL to point to your `/webhook/status` endpoint

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `AUTO_ASSIGN` - Enable automatic coordinator assignment (true/false)
- `SEND_SMS_ON_REGISTRATION` - Enable SMS sending on registration (true/false)
- `SEND_EMAIL_ON_REGISTRATION` - Enable email sending on registration (true/false)
- `NOTIFY_COORDINATORS` - Enable SMS notifications to coordinators (true/false)
- `APP_DOWNLOAD_LINK` - URL for the app download link sent via SMS
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number
- `EMAIL_*` - Email configuration settings

## License

[MIT](LICENSE)
