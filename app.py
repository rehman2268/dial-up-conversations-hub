
from flask import Flask, render_template, redirect, url_for, request, jsonify
import os
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
from dotenv import load_dotenv
import json
from datetime import datetime
import uuid

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Get Twilio credentials from environment variables
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Initialize Twilio client
try:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
except Exception as e:
    print(f"Error initializing Twilio client: {e}")
    twilio_client = None

# Create a in-memory call history store for demo
# In production, use a database
call_history = []

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/api/call', methods=['POST'])
def make_call():
    """Make an outbound call using Twilio"""
    if not twilio_client:
        return jsonify({"error": "Twilio client not initialized"}), 500
    
    try:
        data = request.get_json()
        phone_number = data.get('phone_number')
        
        # Format the phone number (remove any non-digits)
        formatted_number = ''.join(filter(str.isdigit, phone_number))
        
        # Ensure the number has proper formatting (+1 for US)
        if not formatted_number.startswith('+'):
            if formatted_number.startswith('1'):
                formatted_number = f"+{formatted_number}"
            else:
                formatted_number = f"+1{formatted_number}"
        
        # Make the call through Twilio
        call = twilio_client.calls.create(
            to=formatted_number,
            from_=TWILIO_PHONE_NUMBER,
            url="https://handler.twilio.com/twiml/EH0ccd79cf42c4509cdd7c23b94aa9f1a3"  # TwiML Bin URL - you'll need to create this
        )
        
        # Create a call record
        call_record = {
            "id": call.sid,
            "phone_number": phone_number,
            "direction": "outbound",
            "status": "initiated",
            "duration": 0,
            "timestamp": datetime.now().isoformat()
        }
        
        # Add to call history
        call_history.append(call_record)
        
        return jsonify(call_record)
    except Exception as e:
        return jsonify({"error": f"Error making call: {str(e)}"}), 500

@app.route('/api/calls', methods=['GET'])
def get_call_history():
    """Get call history"""
    return jsonify(call_history)

@app.route('/api/webhook/voice', methods=['POST'])
def voice_webhook():
    """Handle Twilio voice webhook"""
    form_data = request.form
    
    # Create TwiML response
    response = VoiceResponse()
    response.say("Hello from your Twilio dialer application. This call is now active.")
    response.pause(length=1)
    response.say("Goodbye.")
    
    # Update call history for inbound calls
    call_sid = form_data.get("CallSid")
    if call_sid and form_data.get("Direction") == "inbound":
        # Create a new call record for inbound calls
        call_record = {
            "id": call_sid,
            "phone_number": form_data.get("From", "unknown"),
            "direction": "inbound",
            "status": "in-progress",
            "duration": 0,
            "timestamp": datetime.now().isoformat()
        }
        call_history.append(call_record)
    
    return str(response)

@app.route('/api/call/<call_id>/end', methods=['POST'])
def end_call(call_id):
    """End an active call"""
    if not twilio_client:
        return jsonify({"error": "Twilio client not initialized"}), 500
    
    try:
        # End the call through Twilio API
        call = twilio_client.calls(call_id).update(status="completed")
        
        # Update call history
        for call_record in call_history:
            if call_record["id"] == call_id:
                call_record["status"] = "completed"
                break
        
        return jsonify({"status": "success", "message": "Call ended successfully"})
    except Exception as e:
        return jsonify({"error": f"Error ending call: {str(e)}"}), 500

@app.route('/api/call/<call_id>/mute', methods=['POST'])
def mute_call(call_id):
    """Mute or unmute an active call"""
    if not twilio_client:
        return jsonify({"error": "Twilio client not initialized"}), 500
    
    try:
        data = request.get_json()
        mute = data.get('mute', True)
        
        # Update call through Twilio API
        call = twilio_client.calls(call_id).update(muted=mute)
        
        action = "muted" if mute else "unmuted"
        return jsonify({"status": "success", "message": f"Call {action} successfully"})
    except Exception as e:
        return jsonify({"error": f"Error updating call: {str(e)}"}), 500

@app.route('/api/call/<call_id>/hold', methods=['POST'])
def hold_call(call_id):
    """Put a call on hold or resume it"""
    if not twilio_client:
        return jsonify({"error": "Twilio client not initialized"}), 500
    
    try:
        data = request.get_json()
        hold = data.get('hold', True)
        
        # For hold/resume functionality, you would typically use Twilio's Conference APIs
        # This is a simplified example
        status = "in-progress"
        if hold:
            # In real implementation, you would use conference hold/resume features
            status = "on-hold"
        
        # Update call history
        for call_record in call_history:
            if call_record["id"] == call_id:
                call_record["status"] = status
                break
        
        action = "put on hold" if hold else "resumed"
        return jsonify({"status": "success", "message": f"Call {action} successfully"})
    except Exception as e:
        return jsonify({"error": f"Error updating call: {str(e)}"}), 500

@app.route('/api/simulate/inbound-call', methods=['POST'])
def simulate_inbound_call():
    """Simulate an inbound call (for testing)"""
    try:
        data = request.get_json()
        phone_number = data.get('phone_number')
        
        # Create a simulated inbound call record
        call_record = {
            "id": str(uuid.uuid4()),
            "phone_number": phone_number,
            "direction": "inbound",
            "status": "ringing",
            "duration": 0,
            "timestamp": datetime.now().isoformat()
        }
        
        # Add to call history
        call_history.append(call_record)
        
        return jsonify(call_record)
    except Exception as e:
        return jsonify({"error": f"Error simulating call: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8000)
