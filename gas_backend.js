/**
 * Google Apps Script Backend for Stock Data Collector
 * 
 * Instructions:
 * 1. Create a new Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Copy and paste this entire code into Code.gs.
 * 4. Click Deploy > New Deployment > Select type: Web App.
 * 5. Set 'Execute as': Me.
 * 6. Set 'Who has access': Anyone.
 * 7. Click Deploy and copy the 'Web App URL'.
 */

function doGet(e) {
    return handleRequest(e);
}

function doPost(e) {
    return handleRequest(e);
}

function handleRequest(e) {
    try {
        const params = e.parameter;
        const action = params.action;

        if (action === 'test') {
            return responseJSON({ status: 'ok', message: 'GAS Backend is running!' });
        }

        if (action === 'fetch_stock') {
            const ticker = params.ticker;
            const startDate = params.start_date; // YYYY-MM-DD
            const endDate = params.end_date;     // YYYY-MM-DD

            if (!ticker || !startDate || !endDate) {
                return responseJSON({ error: 'Missing parameters: ticker, start_date, end_date' });
            }

            const data = getStockData(ticker, startDate, endDate);
            return responseJSON({ success: true, ticker: ticker, data: data });
        }

        return responseJSON({ error: 'Invalid action' });

    } catch (error) {
        return responseJSON({ error: error.toString() });
    }
}

function getStockData(ticker, startDate, endDate) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    sheet.clear();

    // Set formula: =GOOGLEFINANCE("TICKER", "price", "START", "END", "DAILY")
    // Note: GOOGLEFINANCE returns Date and Close columns for historical data
    const formula = `=GOOGLEFINANCE("${ticker}", "price", "${startDate}", "${endDate}", "DAILY")`;
    sheet.getRange("A1").setFormula(formula);

    // Force flush to calculate formula
    SpreadsheetApp.flush();
    Utilities.sleep(500); // Wait for calculation

    // Read back data
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return []; // No data returned (maybe just header or error)

    const values = sheet.getRange(2, 1, lastRow - 1, 2).getValues(); // Skip header

    const results = values.map(row => {
        // Row: [Date object, Price]
        try {
            if (!row[0] || row[1] === "#N/A") return null;

            const dateObj = new Date(row[0]);
            // Format date as YYYY-MM-DD
            const dateStr = Utilities.formatDate(dateObj, Session.getScriptTimeZone(), "yyyy-MM-dd");

            return {
                date: dateStr,
                price: row[1]
            };
        } catch (err) {
            return null;
        }
    }).filter(item => item !== null);

    return results;
}

function responseJSON(data) {
    return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}
