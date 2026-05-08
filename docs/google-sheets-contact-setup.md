# Google Sheets Contact Form Setup

This project sends Contact and Free Consultation form entries to a Google Apps Script webhook.

Target spreadsheet provided:
- `https://docs.google.com/spreadsheets/d/1D8NQS3YZoY1KV9WGoz_kYpCwl_XAXJ0jARaTUlJHiAM/edit?gid=0#gid=0`
- `SHEET_ID = 1D8NQS3YZoY1KV9WGoz_kYpCwl_XAXJ0jARaTUlJHiAM`

## 1) Create Google Sheet
- Log in with `gamaa.pvt@gmail.com`
- Create a new Google Sheet
- Rename first tab to `GaMaa Tech`
- Add header row:
  - `id`
  - `createdAt`
  - `name`
  - `email`
  - `subject`
  - `message`

## 2) Create Apps Script
- Open this sheet with `gamaa.pvt@gmail.com`:
  `https://docs.google.com/spreadsheets/d/1D8NQS3YZoY1KV9WGoz_kYpCwl_XAXJ0jARaTUlJHiAM/edit?gid=0#gid=0`
- In the sheet: Extensions -> Apps Script
- Replace script content with:

```javascript
const SHEET_NAME = "GaMaa Tech";
const NOTIFY_EMAIL = "gamaa.pvt@gmail.com";
const SHEET_ID = "1D8NQS3YZoY1KV9WGoz_kYpCwl_XAXJ0jARaTUlJHiAM";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["id", "createdAt", "name", "email", "subject", "message"]);
    }

    sheet.appendRow([
      payload.id || "",
      payload.createdAt || new Date().toISOString(),
      payload.name || "",
      payload.email || "",
      payload.subject || "",
      payload.message || "",
    ]);

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `New Website Enquiry: ${payload.subject || "No Subject"}`,
      body:
        "A new website submission was received.\n\n" +
        `Name: ${payload.name || ""}\n` +
        `Email: ${payload.email || ""}\n` +
        `Subject: ${payload.subject || ""}\n` +
        `Message: ${payload.message || ""}\n` +
        `Created At: ${payload.createdAt || ""}`,
    });

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(error) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3) Deploy Web App
- Click Deploy -> New deployment
- Type: Web app
- Execute as: Me
- Who has access: Anyone
- Deploy and copy the Web App URL

## 4) Add environment variable
- In project root, create `.env` and set:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/your-web-app-id/exec
```

Important:
- Do not put the spreadsheet link in `GOOGLE_SHEETS_WEBHOOK_URL`.
- This variable must be the Apps Script Web App `.../exec` URL from Deploy.

## 5) Restart dev server
- Restart your app after editing `.env`

## Behavior in this project
- Contact form sends email notification on submit (when webhook is available)
- Free Consultation form sends email notification on submit (when webhook is available)
- Each new entry appends as a new row in the same Google Sheet
