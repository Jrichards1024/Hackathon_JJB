const getMe = require('./getMe.js');
const express = require('express');
const expbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const cors = require('cors');
const util = require('util');
const fs = require('fs')
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;
var access_token = ""
//var python = require('python').shell;
// const {spawn} = require('child_process');
const port = 4000;
var SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  // clientId: 'f31b167398674cc0927db70382e0e77f', // Your client id
  // clientSecret: '740d35ffede4430ab281ec0f83916e3d', // Your secret

  clientId: '75b707d2ec804db8a3e4de1a59080bce', // Your client id
  clientSecret: 'e8031c36f2a744aea3e3edebfa602ac0', // Your secre
  redirectUri: 'http://localhost:4000/callback' // Your redirect uri
});

const scopes = [
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify'
];

const app = express();

app.use(express.json());
app.engine('handlebars', expbs.engine({
  defaultLayout: "main"
}));
app.set('view engine', 'handlebars');
// app.use(express.static('views'))

var stateKey = 'spotify_auth_state';
var access_token;

app.use(express.static(__dirname + '/public'))
  .use(cors())
  .use(cookieParser());

//<---------------------------- ROUTING ---------------------------->
app.get('/login', (req, res) => {
  console.log("login initiated")
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/about', (req, res) => {
  res.render('about', {
    style: "index.css"
  });
})


// res.render('you', {
//   title: "E-AI",
//   name: username,
//   details: [
//     {
//       genre: topGenre
//     },
//     {
//       artistInfo: artistI
//     }
//   ],
//   style: 'you.css'
// });
// let artistI = {}
//   for (let i = 0; i < topArtist.length; i++) {
//     artistI[i + 1] = ({ 'image': images[i], 'artist': topArtist[i] });
//   }

app.get('/suggestion', async (req, res) => {
  username = await getMe.getMyData(access_token);
  names = [];
  names.push(await getMe.getArtists("7p2S6p9yYGhJTtbTQFnsYZ"));
  names.push(await getMe.getArtists("6nvlfxR3ZRCNzw39ZTcGSR"));
  names.push(await getMe.getArtists("12CmFAwzxYnVtJgnzIysvm"));
  names.push(await getMe.getArtists("4AQqBRDKp5y5D7XXMhyq4s"));
  names.push(await getMe.getArtists("6hJkIUy4LmRN3l0Ld99M5x"));
  names.push(await getMe.getArtists("2NmgIfLAFl1DD1FZOY4YqC"));

  images = [];
  images.push(await getMe.getImage("7p2S6p9yYGhJTtbTQFnsYZ"));
  images.push(await getMe.getImage("6nvlfxR3ZRCNzw39ZTcGSR"));
  images.push(await getMe.getImage("12CmFAwzxYnVtJgnzIysvm"));
  images.push(await getMe.getImage("4AQqBRDKp5y5D7XXMhyq4s"));
  images.push(await getMe.getImage("6hJkIUy4LmRN3l0Ld99M5x"));
  images.push(await getMe.getImage("2NmgIfLAFl1DD1FZOY4YqC"));
  console.log(names);
  console.log(images);
  console.log("^^^^")
  let val = {};
  for (let i = 0; i < names.length; i++){
    val[i+1] = ({ 'image': images[i], 'artist': names[i] });
  }
  
 res.render('suggestion', {
  details: [
    {
      suggestion: val
    }
  ],
  style: 'you.css'
});
  // username = await getMe.getMyData(access_token);
  userTop = await getMe.getUserTop();
  topArtist = await userTop.topArtists;
  topGenre = await userTop.genresFreq;
  images = await userTop.images;
  topSongs = await userTop.topSongs;
  artistRelated = await userTop.artistRelated;
  artistInfo = await userTop.artistInfo;

  var dataString = '';
  const spawn = require('child_process').spawn;
  // artistinfor = top artist 
  // top songs is top songs 
  // artists related is elated artists
  var dataSet;
  const py = spawn('python3', ['./main.py']);
  py.stdin.write(JSON.stringify(artistInfo) + "\n");
  py.stdin.write(JSON.stringify(topSongs) + "\n");
  py.stdin.write(JSON.stringify(artistRelated) + "\n");
  py.stdin.end()

  await py.stdout.on('data', (data) => {
    const stdout = data.toString();
    // console.log("stdout", stdout);
    dataString += stdout;
    // console.log("HOELO")
    // console.log("1", data.toString());
    // dataSet = JSON.parse(data.toString());
    // console.log("HIIIII", dataSet);
    // suggestionArr = dataSet;
    // console.log(suggestionArr)
    // console.log("----------------------------")
    // res.send(dataString.toString());
    console.log = function(d) {
      log_file.write(util.format(d) + '\n');
      log_stdout.write(util.format(d) + '\n');
    }

    console.log(dataString.toString());
  });
  py.stderr.on('data', (data) => {
    console.log("2", data.toString());
    console.log("----------------------------")
    return res.status(500).send(data.toString());
  });
  py.on('error', (error) => {
    console.error(error);
  });
  py.on('close', (code) => {
    // console.log("4", 'ext code', code);
    // console.log("----------------------------")
    dataSet = ({ dataString, code });
  });

  fs.readFile('./debug.log', 'utf8', (err, data) => {
    if(err) {
      console.error(err);
      return;
    }
    dataSet = data;
  })

  // console.log(dataSet);
  // console.log("^^^^^^^data");

    //reformatting suggestion
  // console.log(suggestionArr);
  // console.log("^^^^^^ suggestArra");
  // suggestionArr = Object.keys(dataSet).map(function (key) {
  //   return [dataSet[key], parseInt(key)]
  // });
  // suggestionArr.sort(function (first, second) {
  //   return second[1] - first[1];
  // })

  // res.render('debug.log', {
  //   // style: "you.css",

  // });
})

app.get('/', (req, res) => {
  const error = req.query.error;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  res.render('index', {
    style: "index.css"
  });
});

app.get('/you', async (req, res) => {
  console.log("you.html")
  const https = require('https');
  username = await getMe.getMyData(access_token);
  const interest_http = 'http://127.0.0.1:5000/get_you?token=' + access_token;
  const response = await fetch(interest_http);
  const interest_json = await response.json();
  console.log(interest_json);
  console.log('complete');


  res.render('you_2', {
    title: "You - E-AI",
  });

  // res.render('you', {
  //   title: "E-AI",
  //   name: username,
  //   details: [
  //     {
  //       genre: topGenre
  //     },
  //     {
  //       artistInfo: artistI
  //     }
  //   ],
  //   style: 'you.css'
  // });
})

app.get('/recommendations',  async (req, res) => {
  
  const recs = 'http://127.0.0.1:5000/recs?token=' + access_token; //add acces token as ?= thing 
  // console.log(recs)
  const response = await fetch(recs);
  const json = await response.json();
  console.log(json)
  console.log("json")
  
  //display info using longtail idea 

  res.render('you_3', {
    title: "You - E-AI",
  });

})

app.get('/callback', (req, res) => {
  const error = req.query.error;
  const code = req.query.code;
  const state = req.query.state;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      access_token = data.body['access_token'];
      const refresh_token = data.body['refresh_token'];
      const expires_in = data.body['expires_in'];

      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      // console.log('access_token:', access_token);
      // console.log('refresh_token:', refresh_token);

      // console.log(
      //   `Sucessfully retreived access token. Expires in ${expires_in} s.`
      // );
      res.redirect('/you');
      // res.redirect('/you');
      // console.log("success");


      // setInterval(async () => {
      //   const data = await spotifyApi.refreshAccessToken();
      //   access_token = data.body['access_token'];

      //   console.log('The access token has been refreshed!');
      //   console.log('access_token:', access_token);
      //   spotifyApi.setAccessToken(access_token);
      // }, expires_in / 2 * 1000);
    })
    .catch(error => {
      console.error('Error getting Tokens:', error);
      res.send(`Error getting Tokens: ${error}`);
    });
  
});

app.get('/refresh_token', function (req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }

    spotifyApi
      .authorizationCodeGrant(code)
      .then(data => {
        access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];

        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        console.log('access_token:', access_token);
        console.log('refresh_token:', refresh_token);

        console.log(
          `Sucessfully retreived access token. Expires in ${expires_in} s.`
        );
        res.send('Success! You can now close the window.');

        setInterval(async () => {
          const data = await spotifyApi.refreshAccessToken();
          const access_token = data.body['access_token'];

          console.log('The access token has been refreshed!');
          console.log('access_token:', access_token);
          spotifyApi.setAccessToken(access_token);
        }, expires_in / 2 * 1000);
      })
      .catch(error => {
        console.error('Error getting Tokens:', error);
        res.send(`Error getting Tokens: ${error}`);
      });
  });

});

app.listen(port, () => {
  console.log(`Example app listening to port: ${port}`)
});