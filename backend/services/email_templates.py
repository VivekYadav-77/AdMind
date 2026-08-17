import os

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

def verification_email(name: str, plain_token: str) -> str:
    verify_url = f"{FRONTEND_URL}/verify-email?token={plain_token}"
    display_name = name if name else "there"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Inter', sans-serif; background-color: #1a1a1a; color: #ffffff; padding: 40px; text-align: center; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #242424; padding: 40px; border-radius: 12px; border: 1px solid #333; }}
            h1 {{ color: #F59E0B; }}
            p {{ color: #a1a1aa; line-height: 1.6; font-size: 16px; }}
            .btn {{ display: inline-block; background-color: #F59E0B; color: #1a1a1a; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 20px; }}
            .footer {{ margin-top: 40px; font-size: 12px; color: #52525b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to AdMind</h1>
            <p>Hi {display_name},</p>
            <p>Thanks for creating an account with AdMind. Please verify your email address to get started and unlock full-stack AI campaign analysis.</p>
            <a href="{verify_url}" class="btn">Verify Email Address</a>
            <p style="margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
            
            <div class="footer">
                <p>This link expires in 24 hours.</p>
                <p>&copy; 2026 AdMind Inc. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

def password_reset_email(name: str, plain_token: str) -> str:
    reset_url = f"{FRONTEND_URL}/reset-password?token={plain_token}"
    display_name = name if name else "there"
    
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Inter', sans-serif; background-color: #1a1a1a; color: #ffffff; padding: 40px; text-align: center; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #242424; padding: 40px; border-radius: 12px; border: 1px solid #333; }}
            h1 {{ color: #F59E0B; }}
            p {{ color: #a1a1aa; line-height: 1.6; font-size: 16px; }}
            .btn {{ display: inline-block; background-color: #F59E0B; color: #1a1a1a; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 20px; }}
            .footer {{ margin-top: 40px; font-size: 12px; color: #52525b; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Password Reset Request</h1>
            <p>Hi {display_name},</p>
            <p>We received a request to reset the password for your AdMind account. Click the button below to set a new password.</p>
            <a href="{reset_url}" class="btn">Reset Password</a>
            <p style="margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <div class="footer">
                <p>This link expires in 15 minutes.</p>
                <p>&copy; 2026 AdMind Inc. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
