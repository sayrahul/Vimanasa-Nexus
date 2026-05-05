import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sheetName = searchParams.get('sheet');
  
  if (!sheetName) {
    return Response.json({ error: 'Sheet name is required' }, { status: 400 });
  }

  if (!spreadsheetId) {
    return Response.json({ error: 'Spreadsheet ID not configured' }, { status: 500 });
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return Response.json([]);
    }
    
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    return Response.json(data);
  } catch (error) {
    console.error('Google Sheets API Error (GET):', error);
    return Response.json({ 
      error: 'Failed to fetch data from Google Sheets',
      details: error.message,
      sheet: sheetName
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { sheet, values } = body;
    
    if (!sheet || !values) {
      return Response.json({ error: 'Sheet name and values are required' }, { status: 400 });
    }

    if (!spreadsheetId) {
      return Response.json({ error: 'Spreadsheet ID not configured' }, { status: 500 });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheet}!A:A`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    });
    
    return Response.json({ success: true, message: 'Data added successfully' });
  } catch (error) {
    console.error('Google Sheets API Error (POST):', error);
    return Response.json({ 
      error: 'Failed to add data to Google Sheets',
      details: error.message
    }, { status: 500 });
  }
}
