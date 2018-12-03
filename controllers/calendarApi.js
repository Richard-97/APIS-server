const calendarApi = (name, location, description, users_field) => {
    const fs = require('fs');
    const readline = require('readline');
    const {google} = require('googleapis');

    // If modifying these scopes, delete token.json.
    const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    const TOKEN_PATH = 'token.json';

    // Load client secrets from a local file.
    fs.readFile('./credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), listEvents);
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
        if (err) return getAccessToken(oAuth2Client, callback);
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
    function getAccessToken(oAuth2Client, callback) {
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
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) console.error(err);
            console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
        });
    });
    }

    /**
     * Lists the next 10 events on the user's primary calendar.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    function listEvents(auth) {
    const calendar = google.calendar({version: 'v3', auth});
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
        console.log('Upcoming 10 events:');
        events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
            console.log(`${start} - ${event.summary}`);
        });
        } else {
        console.log('No upcoming events found.');
        }
    });
    }



    //const {google} = require('googleapis');
    const calendar = google.calendar("v3");
    var googleAuth = require('google-auth-library');
    var googleapis = require("googleapis");
    var OAuth2 = google.auth.OAuth2
    var auth = googleAuth;

    const oauth2Client = new OAuth2(
        "52937241797-ll34ifi5kofc0bus9d0pm9d0bcqe6jk1.apps.googleusercontent.com",
        "t3fH5OYiRo27GeqUFbdQ55nd",
        "urn:ietf:wg:oauth:2.0:oob"
    );
    
    oauth2Client.setCredentials({
        access_token: "ya29.GltaBoot1rkKduZLCw0ngXgfVCQfB1ACyTWizu9SIBrvNBxZWX1tvyDfbueI-zj_vmaouLIq12I0Dg0f4VOhR8wHjd0n_JrGL73L8yMydyuY5SEGOwQPejN3DP0X",
        refresh_token: "1/EKDsvwvhZpsqrxemYJs5EFcxpI461OOFAUH-X_SuRw4",
        expiry_date: true
    });

    var event = {
        'summary': `${name}`,
        'location': `${location}`,
        'description': `${description}`,
        'start': {
        'dateTime': "2018-12-21T18:03:00+01:00",
        'timeZone': 'Europe/Prague',
        },
        'end': {
        'dateTime': `2018-12-21T19:03:00+01:00`,
        'timeZone': 'Europe/Prague',
        },
        /* 'recurrence': [
        'RRULE:FREQ=DAILY;COUNT=2'
        ], */
        'attendees': [
        {'email': 'najlepsierakety@gmail.com'},
        //{'email': 'savko.igor@gmail.com'}
        ],
    };


    calendar.events.insert({
        auth: oauth2Client,
        calendarId: 'primary',
        sendNotifications: true,
        resource: event
        },function(err,resp) {
            if (err) {
                console.log('There was an error :',err);
            return;
        }
        console.log(/* resp */'Event created succesfully' /* resp.htmlLink */);
        });
}

module.exports = { calendarApi }