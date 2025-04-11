
# Twilio Dialer Application

A Flask web application for making and receiving phone calls using Twilio.

## Setup

1. Clone this repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Set up your Twilio account:
   - Sign up for a Twilio account at https://www.twilio.com
   - Get your Account SID and Auth Token from the Twilio dashboard
   - Purchase a Twilio phone number with voice capabilities

5. Update the `.env` file with your Twilio credentials:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
   ```

6. Start the application:
   ```
   python app.py
   ```

7. The application will be available at http://localhost:8000

## Features

- Make outbound calls with Twilio
- Receive inbound calls
- View call history
- Control active calls (mute, hold, end)
- Simulate inbound calls for testing

## API Endpoints

- `GET /` - Main application interface
- `GET /health` - Health check endpoint
- `POST /api/call` - Make an outbound call
- `GET /api/calls` - Get call history
- `POST /api/call/{call_id}/end` - End an active call
- `POST /api/call/{call_id}/mute` - Mute/unmute a call
- `POST /api/call/{call_id}/hold` - Put call on hold/resume
- `POST /api/simulate/inbound-call` - Simulate an inbound call (for testing)
- `POST /api/webhook/voice` - Webhook for Twilio voice events
