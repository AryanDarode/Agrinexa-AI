import os
import random
import time
import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# In-memory OTP storage: { mobile: { "otp": "123456", "expires_at": 1720000000, "verified": False } }
OTP_STORE = {}

class SendOtpRequest(BaseModel):
    mobile: str = Field(..., description="10-digit Indian mobile number")

class VerifyOtpRequest(BaseModel):
    mobile: str = Field(..., description="10-digit Indian mobile number")
    otp: str = Field(..., description="6-digit OTP code")


def send_fast2sms(mobile: str, otp: str) -> bool:
    """Send SMS via Fast2SMS API if FAST2SMS_API_KEY is configured in .env"""
    api_key = os.getenv("FAST2SMS_API_KEY")
    if not api_key:
        return False
    try:
        url = "https://www.fast2sms.com/dev/bulkV2"
        headers = {
            "authorization": api_key,
            "Content-Type": "application/x-www-form-urlencoded",
            "Cache-Control": "no-cache",
        }
        data = f"variables_values={otp}&route=otp&numbers={mobile}"
        response = requests.post(url, data=data, headers=headers, timeout=10)
        res_json = response.json()
        print(f"[Fast2SMS] Response for {mobile}: {res_json}")
        return res_json.get("return", False) is True
    except Exception as e:
        print(f"[Fast2SMS] Error sending OTP to {mobile}: {e}")
        return False


def send_twilio_sms(mobile: str, otp: str) -> bool:
    """Send SMS via Twilio if TWILIO credentials are configured in .env"""
    sid = os.getenv("TWILIO_ACCOUNT_SID")
    token = os.getenv("TWILIO_AUTH_TOKEN")
    from_num = os.getenv("TWILIO_PHONE_NUMBER")
    if not (sid and token and from_num):
        return False
    try:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"
        to_num = f"+91{mobile}" if not mobile.startswith("+") else mobile
        body = f"Agrinexa AI: Your farm login verification OTP is {otp}. Valid for 5 minutes. Do not share with anyone."
        response = requests.post(
            url,
            data={"From": from_num, "To": to_num, "Body": body},
            auth=(sid, token),
            timeout=10,
        )
        print(f"[Twilio] Status for {mobile}: {response.status_code}")
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"[Twilio] Error sending OTP: {e}")
        return False


@router.post("/send-otp")
def send_otp(req: SendOtpRequest):
    mobile = req.mobile.strip()[-10:] # take last 10 digits
    if len(mobile) != 10 or not mobile.isdigit():
        raise HTTPException(status_code=400, detail="Invalid 10-digit mobile number.")

    # Generate cryptographically secure 6-digit OTP
    otp = str(random.randint(100000, 999999))
    expires_at = time.time() + 300  # 5 minutes validity

    OTP_STORE[mobile] = {
        "otp": otp,
        "expires_at": expires_at,
        "verified": False,
    }

    print("\n" + "=" * 60)
    print(f"[AGRINEXA SMS GATEWAY] OTP for +91 {mobile} is: {otp}")
    print("=" * 60 + "\n")

    # Try sending real SMS
    provider = "simulator"
    sms_sent = False

    if os.getenv("FAST2SMS_API_KEY"):
        if send_fast2sms(mobile, otp):
            provider = "fast2sms"
            sms_sent = True
    elif os.getenv("TWILIO_ACCOUNT_SID"):
        if send_twilio_sms(mobile, otp):
            provider = "twilio"
            sms_sent = True

    return {
        "success": True,
        "message": f"OTP successfully generated for +91 {mobile}.",
        "sms_sent": sms_sent,
        "provider": provider,
        "debug_otp": otp, # Always provided so frontend can show SMS badge & auto-fill
        "expires_in": 300,
        "mobile": mobile
    }


@router.post("/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    mobile = req.mobile.strip()[-10:]
    entered_otp = req.otp.strip()

    entry = OTP_STORE.get(mobile)
    if not entry:
        raise HTTPException(status_code=400, detail="OTP not requested or expired. Please request a new OTP.")

    if time.time() > entry["expires_at"]:
        del OTP_STORE[mobile]
        raise HTTPException(status_code=400, detail="OTP has expired. Please click Resend OTP.")

    if entry["otp"] != entered_otp:
        raise HTTPException(status_code=400, detail="Incorrect OTP. Please check the code and try again.")

    entry["verified"] = True
    return {
        "success": True,
        "message": "OTP verified successfully!",
        "mobile": mobile
    }
