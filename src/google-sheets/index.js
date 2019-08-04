const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'src/google-sheets/token.json';

// Load client secrets from a local file.
fs.readFile('src/google-sheets/credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), writeValues);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

const spreadsheetId = process.env.SPREADSHEET_ID;
const rawValues = JSON.parse(fs.readFileSync('./scraper-output/data.json', 'utf8')).data;
const values = rawValues.map(val => {
  val.transDate = `=DATEVALUE("${ val.transDate }")`;
  let indexOfNewline = val.description.indexOf('\n');
  if (indexOfNewline > -1 ) {
    val.description = val.description.substring(0, indexOfNewline).trim();
  }
  val.postDate = `=DATEVALUE("${ val.postDate }")`;
  return Object.values(val)
});

function writeValues(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  const resource = {
    values,
  };
  sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'AllTransactions!A2:E1000',
    valueInputOption: 'USER_ENTERED',
    resource,
  }, (err, result) => {
    if (err) {
      // Handle error
      console.log(err);
    } else {
      console.log('%d rows updated.', result.data.updatedRows);
      console.log('%d columns updated.', result.data.updatedColumns);
      console.log('%d cells updated.', result.data.updatedCells);
    }
  });
}