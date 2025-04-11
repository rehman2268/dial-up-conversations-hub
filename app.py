
from fastapi import FastAPI, HTTPException, Depends, Request, Form
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import List, Optional
import os
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
from dotenv import load_dotenv
import json
from datetime import datetime
import uuid

# Load environment variables
load_dotenv()

app = FastAPI(title="Twilio Dialer API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Specify the allowed origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Data models
class CallRequest(BaseModel):
    phone_number: str
    
class Call(BaseModel):
    id: str
    phone_number: str
    direction: str  # "inbound" or "outbound"
    status: str
    duration: int = 0
    timestamp: datetime
    notes: Optional[str] = None

# Routes
@app.get("/")
async def root():
    return {"message": "Twilio Dialer API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/call", response_model=Call)
async def make_call(call_request: CallRequest):
    """Make an outbound call using Twilio"""
    if not twilio_client:
        raise HTTPException(status_code=500, detail="Twilio client not initialized")
    
    try:
        # Format the phone number (remove any non-digits)
        formatted_number = ''.join(filter(str.isdigit, call_request.phone_number))
        
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
        call_record = Call(
            id=call.sid,
            phone_number=call_request.phone_number,
            direction="outbound",
            status="initiated",
            duration=0,
            timestamp=datetime.now()
        )
        
        # Add to call history
        call_history.append(call_record.dict())
        
        return call_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error making call: {str(e)}")

@app.get("/api/calls", response_model=List[Call])
async def get_call_history():
    """Get call history"""
    return call_history

@app.post("/api/webhook/voice")
async def voice_webhook(request: Request):
    """Handle Twilio voice webhook"""
    form_data = await request.form()
    
    # Create TwiML response
    response = VoiceResponse()
    response.say("Hello from your Twilio dialer application. This call is now active.")
    response.pause(length=1)
    response.say("Goodbye.")
    
    # Update call history for inbound calls
    call_sid = form_data.get("CallSid")
    if call_sid and form_data.get("Direction") == "inbound":
        # Create a new call record for inbound calls
        call_record = Call(
            id=call_sid,
            phone_number=form_data.get("From", "unknown"),
            direction="inbound",
            status="in-progress",
            duration=0,
            timestamp=datetime.now()
        )
        call_history.append(call_record.dict())
    
    return HTMLResponse(content=str(response), status_code=200)

@app.post("/api/call/{call_id}/end")
async def end_call(call_id: str):
    """End an active call"""
    if not twilio_client:
        raise HTTPException(status_code=500, detail="Twilio client not initialized")
    
    try:
        # End the call through Twilio API
        call = twilio_client.calls(call_id).update(status="completed")
        
        # Update call history
        for call_record in call_history:
            if call_record["id"] == call_id:
                call_record["status"] = "completed"
                break
        
        return {"status": "success", "message": "Call ended successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error ending call: {str(e)}")

@app.post("/api/call/{call_id}/mute")
async def mute_call(call_id: str, mute: bool = True):
    """Mute or unmute an active call"""
    if not twilio_client:
        raise HTTPException(status_code=500, detail="Twilio client not initialized")
    
    try:
        # Update call through Twilio API
        call = twilio_client.calls(call_id).update(muted=mute)
        
        action = "muted" if mute else "unmuted"
        return {"status": "success", "message": f"Call {action} successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating call: {str(e)}")

@app.post("/api/call/{call_id}/hold")
async def hold_call(call_id: str, hold: bool = True):
    """Put a call on hold or resume it"""
    if not twilio_client:
        raise HTTPException(status_code=500, detail="Twilio client not initialized")
    
    try:
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
        return {"status": "success", "message": f"Call {action} successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating call: {str(e)}")

@app.post("/api/simulate/inbound-call")
async def simulate_inbound_call(call_request: CallRequest):
    """Simulate an inbound call (for testing)"""
    try:
        # Create a simulated inbound call record
        call_record = Call(
            id=str(uuid.uuid4()),
            phone_number=call_request.phone_number,
            direction="inbound",
            status="ringing",
            duration=0,
            timestamp=datetime.now()
        )
        
        # Add to call history
        call_history.append(call_record.dict())
        
        return call_record
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error simulating call: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
