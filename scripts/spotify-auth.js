const express = require('express');
const querystring = require('querystring');
const axios = require('axios');
const app = express();

const CLIENT_ID = '5b320b387d9248f2ab5cf3ab32a4f8bb';
const CLIENT_SECRET = '5c6f4b47fbec4162b636601c15dc92a8';
const REDIRECT_URI = 'http://localhost:3333/callback';
const SCOPE = 'user-read-currently-playing user-read-playback-state';

app.get('/login', (req, res) => {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: SCOPE,
      redirect_uri: REDIRECT_URI,
    }));
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { refresh_token } = response.data;
    res.send(`Your refresh token is: ${refresh_token}`);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error);
    res.send('Error getting refresh token');
  }
});

console.log('Please visit http://localhost:3333/login to authorize your Spotify account');
app.listen(3333);
