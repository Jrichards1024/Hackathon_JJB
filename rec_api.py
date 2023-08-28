from flask import *
import json, time 
import json 
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import os

# client_ID="f31b167398674cc0927db70382e0e77f"
# client_SECRET= "740d35ffede4430ab281ec0f83916e3d"
client_ID="75b707d2ec804db8a3e4de1a59080bce"
client_SECRET= "e8031c36f2a744aea3e3edebfa602ac0"
redirect_url= "http://localhost:3000/callback"
SSK = os.urandom(12)

scopes = 'user-top-read'
# [
#   'ugc-image-upload',
#   'user-read-playback-state',
#   'user-modify-playback-state',
#   'user-read-currently-playing',
#   'streaming',
#   'app-remote-control',
#   'user-read-email',
#   'user-read-private',
#   'playlist-read-collaborative',
#   'playlist-modify-public',
#   'playlist-read-private',
#   'playlist-modify-private',
#   'user-library-modify',
#   'user-library-read',
#   'user-top-read',
#   'user-read-playback-position',
#   'user-read-recently-played',
#   'user-follow-read',
#   'user-follow-modify'
# ]
app = Flask(__name__)
app.secret_key = SSK
API_BASE = 'https://accounts.spotify.com'

# @app.route('/', methods = ['GET'])

# @app.route('/user/', methods = ['GET'])
# def user_page():
#     user_query = str(request.args.get('user'))
#     #url format- /user/?user=USERNAME
#     dataset = {'Page': 'Request', 'Message': f'Successfully got the request for {user_query}', 'Timestamp': time.time() }
#     json_dump = json.dumps(dataset)
    
#     return json_dump 




if __name__ == '__main__':
    app.run(port = 3000 )