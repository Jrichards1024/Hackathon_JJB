const getMe = require('./getMe.js');
const express = require('express');
const expbs = require('express-handlebars');
const port = 3000;
const cookieParser = require('cookie-parser');
const querystring = require('querystring');
const cors = require('cors');
//var python = require('python').shell;
const {spawn} = require('child_process');
var SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId:'f31b167398674cc0927db70382e0e77f', // Your client id
  clientSecret:'740d35ffede4430ab281ec0f83916e3d', // Your secret
  redirectUri:'http://localhost:3000/callback' // Your redirect uri
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
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
});

app.get('/', (req, res) => {
  const error = req.query.error;
  // const code = req.query.code;
  // const state = req.query.state;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }
  
  res.render('index');
});

app.get('/you', async(req, res) =>{
  var process = spawn('python3',["./main.py"]);
  
    // Takes stdout data from script which executed
    // with arguments and send this data to res object
    process.stdout.on('data', function(data) {
        res.send(data.toString());
        console.log(data.toString())
    } )
  // var dataToSend
  // const python = spawn('python3', ['./main.py']);
  // console.log(python);
  // console.log("^^^^^^^^");
  // python.stdout.on("data", (data)=>{
  //   console.log('hi');
  //   dataToSend = data.toString();
  //   console.log(dataToSend);
  // })
  // // python.on("close",(code)=>{
  // //   console.log(code);
  // //   res.send(dataToSend);

  // // })
  //   var mycallback = function(err, data) {
  //   if(err) {
  //     console.error(err);
  //   } else {
  //     console.log("callback function got:", data);
  //   }
  // }
  // process.stdin.resume();
  // process.stdin.setEncoding('utf8');
  // process.stdin.on('data', function(chunk) {
  //   python(chunk, mycallback)
  // })
  username = await getMe.getMyData(access_token);
  userTop = await getMe.getUserTop();
  topArtist = userTop.topArtists;
  topGenre = userTop.genresFreq;
  images = userTop.images;
  console.log(images);
  console.log("^^^^");
  res.render('you', { 
    title: "E-AI", 
    name: username, 
    details: [
        {
            genre: topGenre
        },
        {
            artists: topArtist
        },
        {
          image: images
        }
        
    ],
    style: 'you.css'
    //data: dataToSend
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

      console.log('access_token:', access_token);
      console.log('refresh_token:', refresh_token);

      console.log(
        `Sucessfully retreived access token. Expires in ${expires_in} s.`
      );
      // user = getMe.getMyData(access_token);
      // topArtists = getMe.getUserTop();
      res.redirect('/you');
      console.log("success");
      

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

app.get('/refresh_token', function(req, res) {

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

  request.post(authOptions, function(error, response, body) {
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

app.listen(port, ()=> {
    console.log(`Example app listening to port: ${port}`)
});