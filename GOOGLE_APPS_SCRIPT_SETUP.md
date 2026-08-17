# Setting up Google Apps Script Email Relay

Render blocks SMTP on its free tier, so we use Google Apps Script (GAS) to act as our HTTP-to-SMTP relay. When your backend wants to send an email, it sends a secure `POST` request to this GAS endpoint, which uses your Gmail account to send the email.

## Step 1: Create the Apps Script Project
1. Go to [script.google.com](https://script.google.com/) and sign in with the Google Account you want emails to come from.
2. Click **New Project**.
3. Click on the title at the top left ("Untitled project") and rename it to **AdMind Email Relay**.

## Step 2: Add the Code
Replace all the code in `Code.gs` with the following:

```javascript
// Set a strong secret that matches the GAS_SECRET in your .env file
const SHARED_SECRET = "your-random-shared-secret-here";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    // Authenticate the request
    if (payload.secret !== SHARED_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({"status": "unauthorized"}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    const { to, subject, body } = payload;
    
    if (!to || !subject || !body) {
      return ContentService.createTextOutput(JSON.stringify({"status": "missing_fields"}))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Send email using GmailApp
    GmailApp.sendEmail(to, subject, "", {
      htmlBody: body,
      name: "AdMind Team" // Change to your preferred sender name
    });
    
    return ContentService.createTextOutput(JSON.stringify({"status": "ok"}))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 3: Deploy as a Web App
1. Click the **Deploy** button at the top right, then **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
3. Set the following options:
   - **Description**: `AdMind Email Relay v1`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` *(Don't worry, the `SHARED_SECRET` protects it)*
4. Click **Deploy**.
5. Google will prompt you to authorize access. Click **Authorize access**, choose your account, click **Advanced**, and then **Go to AdMind Email Relay (unsafe)**. Click **Allow**.
6. Copy the **Web app URL** provided. It will look like `https://script.google.com/macros/s/AKfyc.../exec`.

## Step 4: Configure the Backend
Add the following to your `AdMind/backend/.env` file:

```env
# Google Apps Script Email Relay
GAS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_URL_ID/exec
GAS_SECRET=your-random-shared-secret-here
```
*(Make sure the `GAS_SECRET` matches the `SHARED_SECRET` you set in the Apps Script code).*

## Setting up Upstash Redis (For Rate Limiting)
Rate limiting requires Redis. Since Render's free tier does not include Redis, we recommend Upstash:

1. Go to [upstash.com](https://upstash.com/) and create a free account.
2. Click **Create Database**. Name it `admind-redis` and select a region close to your Render server.
3. Once created, scroll down to the **REST API** section or find the **Redis URL**.
4. You need the connection string starting with `rediss://`.
5. Add it to your `.env`:

```env
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379
```

Once these variables are added, the email flows and rate limiters will function perfectly!
