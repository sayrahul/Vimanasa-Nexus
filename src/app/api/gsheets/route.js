import { google } from 'googleapis';

// Initialize auth with retry configuration
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  clientOptions: {
    retryConfig: {
      retry: 5,
      retryDelay: 1000,
      statusCodesToRetry: [[100, 199], [429, 429], [500, 599]],
      httpMethodsToRetry: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  },
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

// Helper function to retry with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Check if it's a network error
      if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
        console.log(`Network error, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error; // Don't retry non-network errors
      }
    }
  }
}

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
    // Use retry mechanism for network resilience
    const response = await retryWithBackoff(async () => {
      return await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
      });
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
    
    // Check if the error is due to sheet not found (unable to parse range)
    if (error.message && error.message.includes('Unable to parse range')) {
      console.log(`Sheet "${sheetName}" does not exist yet. Returning empty array.`);
      return Response.json([]); // Return empty array instead of error
    }
    
    // Provide more specific error messages for other errors
    let errorMessage = 'Failed to fetch data from Google Sheets';
    let errorDetails = error.message;
    
    if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error: Cannot reach Google Sheets API';
      errorDetails = 'Please check your internet connection and try again';
    } else if (error.code === 403) {
      errorMessage = 'Permission denied';
      errorDetails = 'Service account does not have access to the spreadsheet';
    } else if (error.code === 404) {
      errorMessage = 'Spreadsheet or sheet not found';
      errorDetails = `Sheet "${sheetName}" does not exist`;
    }
    
    return Response.json({ 
      error: errorMessage,
      details: errorDetails,
      sheet: sheetName,
      code: error.code
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

    // Use retry mechanism for network resilience
    await retryWithBackoff(async () => {
      return await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheet}!A:A`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [values] },
      });
    });
    
    return Response.json({ success: true, message: 'Data added successfully' });
  } catch (error) {
    console.error('Google Sheets API Error (POST):', error);
    
    let errorMessage = 'Failed to add data to Google Sheets';
    let errorDetails = error.message;
    
    if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error: Cannot reach Google Sheets API';
      errorDetails = 'Please check your internet connection and try again';
    }
    
    return Response.json({ 
      error: errorMessage,
      details: errorDetails
    }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { sheet, rowIndex, values } = body;
    
    if (!sheet || rowIndex === undefined || !values) {
      return Response.json({ error: 'Sheet name, row index, and values are required' }, { status: 400 });
    }

    if (!spreadsheetId) {
      return Response.json({ error: 'Spreadsheet ID not configured' }, { status: 500 });
    }

    // Row index is 1-based in Google Sheets, +2 to account for header row
    const actualRow = rowIndex + 2;
    
    // Use retry mechanism for network resilience
    await retryWithBackoff(async () => {
      return await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheet}!A${actualRow}:Z${actualRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [values] },
      });
    });
    
    return Response.json({ success: true, message: 'Data updated successfully' });
  } catch (error) {
    console.error('Google Sheets API Error (PUT):', error);
    
    let errorMessage = 'Failed to update data in Google Sheets';
    let errorDetails = error.message;
    
    if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error: Cannot reach Google Sheets API';
      errorDetails = 'Please check your internet connection and try again';
    }
    
    return Response.json({ 
      error: errorMessage,
      details: errorDetails
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { sheet, rowIndex } = body;
    
    if (!sheet || rowIndex === undefined) {
      return Response.json({ error: 'Sheet name and row index are required' }, { status: 400 });
    }

    if (!spreadsheetId) {
      return Response.json({ error: 'Spreadsheet ID not configured' }, { status: 500 });
    }

    // Get sheet ID first
    const sheetMetadata = await retryWithBackoff(async () => {
      return await sheets.spreadsheets.get({
        spreadsheetId,
      });
    });
    
    const sheetInfo = sheetMetadata.data.sheets.find(
      s => s.properties.title === sheet
    );
    
    if (!sheetInfo) {
      return Response.json({ error: `Sheet "${sheet}" not found` }, { status: 404 });
    }
    
    const sheetId = sheetInfo.properties.sheetId;
    const actualRow = rowIndex + 1; // +1 to account for header row
    
    // Delete the row
    await retryWithBackoff(async () => {
      return await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: actualRow,
                endIndex: actualRow + 1,
              },
            },
          }],
        },
      });
    });
    
    return Response.json({ success: true, message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Google Sheets API Error (DELETE):', error);
    
    let errorMessage = 'Failed to delete data from Google Sheets';
    let errorDetails = error.message;
    
    if (error.code === 'ENOTFOUND') {
      errorMessage = 'Network error: Cannot reach Google Sheets API';
      errorDetails = 'Please check your internet connection and try again';
    }
    
    return Response.json({ 
      error: errorMessage,
      details: errorDetails
    }, { status: 500 });
  }
}
