from flask import *
import json, time 
import json 
import spotipy
from spotipy.oauth2 import SpotifyOAuth

client_ID="f31b167398674cc0927db70382e0e77f"
client_SECRET= "740d35ffede4430ab281ec0f83916e3d"
redirect_url= "http://localhost:3000/callback"

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

API_BASE = 'https://accounts.spotify.com'

@app.route('/', methods = ['GET'])
def verify():
    sp_oauth = spotipy.oauth2.SpotifyOAuth(client_id = client_ID, client_secret = client_SECRET, redirect_uri = redirect_url, scope = scopes)
    auth_url = sp_oauth.get_authorize_url()
    print(auth_url)
    return redirect(auth_url)
    dataset = {'Page': 'Home', 'Message': 'Successfully loaded the Home page', 'Timestamp': time.time() }
    json_dump = json.dumps(dataset)
    
    return json_dump 

# @app.route('/user/', methods = ['GET'])
# def user_page():
#     user_query = str(request.args.get('user'))
#     #url format- /user/?user=USERNAME
#     dataset = {'Page': 'Request', 'Message': f'Successfully got the request for {user_query}', 'Timestamp': time.time() }
#     json_dump = json.dumps(dataset)
    
#     return json_dump 

@app.route("/api_callback/", methods = ['GET'])
def api_callback():
    # Don't reuse a SpotifyOAuth object because they store token info and you could leak user tokens if you reuse a SpotifyOAuth object
    sp_oauth = spotipy.oauth2.SpotifyOAuth(client_id = client_ID, client_secret = client_SECRET, redirect_uri = "http://localhost:3000/callback", scope = scopes)
    session.clear()
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)

    # Saving the access token along with all other token related info
    session["token_info"] = token_info
    
    return redirect("recs/")
    

@app.route('/recs/', methods = ['POST'])
def recommendation_page():
    """
    TF-IDF reccommendation alg using users top artists/genres and the genres of emerging artists. 
    Combines general user data as well as a users listening history to generate reccommendations for emerging artists 
    we deifned emerging artists at those with a spotify-defined popularity score of between 25 and 50 or between about
    75,000 - 800,00 monthly listeners #cap
    """
    # customizable 
    term_len = "long_term"
    num_items = 50
    session['token_info'], authorized = get_token(session)
    session.modified = True
    if not authorized:
        return redirect('/')
    data = request.form
    sp = spotipy.Spotify(auth=session.get('token_info').get('access_token'))
    #get top artists 
    top_artists = sp.current_user_top_artists(limit= 50, time_range=term_len)
    #get top tracks
    top_tracks = sp.current_user_top_tracks(limit= 50, time_range=term_len)
        
    #used to make ratings of artists assigning an aritficial score between 5 and 2 based on rank in top tracks 
    num_artists = len(top_tracks['items'])
    increment = 4/num_artists
    ratings = {}

    #saves totals of genres observed used in tf-idf algorithm 
    genres = {}

    #set ratings and gets genres 
    ea_dict = {}

    total_genres = 0 
    for idx in range(num_artists): #loop through artists 
        
        this_artist = top_artists['items'][idx]
        artists_genres = this_artist['genres']
        rating_genres = 5 - (idx*increment)*0.6
        ratings[top_artists['items'][idx]["name"]] = rating_genres
        for genre in artists_genres:
            if genre in genres.keys():
                genre_artists = genres[genre][1]
                if this_artist["name"] not in genre_artists:
                    genres[genre][1].append(this_artist["name"])
                else:
                    genres[genre][0]+=1
                    total_genres+=1 
            else:
                genres[genre]= (1, [this_artist["name"]])
                total_genres+=1
        similar_artists = sp.artist_related_artists(artist_id=this_artist["id"])
        
        for artist in similar_artists["artists"]:
            if (artist["popularity"]<50) and (artist["popularity"]>25) and len(ea_dict)<50:
                #may be better for retrieving from api to send artist id 
                ea_dict[artist["name"]] = artist["genres"]
        print(ea_dict)
        json_dump = json.dumps(ea_dict)
        
        return json_dump 
    # Checks to see if token is valid and gets a new token if not
def get_token(session):
    token_valid = False
    token_info = session.get("token_info", {})

    # Checking if the session already has a token stored
    if not (session.get('token_info', False)):
        token_valid = False
        return token_info, token_valid

    # Checking if token has expired
    now = int(time.time())
    is_token_expired = session.get('token_info').get('expires_at') - now < 60

    # Refreshing token if it has expired
    if (is_token_expired):
        # Don't reuse a SpotifyOAuth object because they store token info and you could leak user tokens if you reuse a SpotifyOAuth object
        sp_oauth = spotipy.oauth2.SpotifyOAuth(client_id = client_ID, client_secret = client_SECRET, redirect_uri = "http://localhost:3000/callback", scope = scopes)
        token_info = sp_oauth.refresh_access_token(session.get('token_info').get('refresh_token'))

    token_valid = True
    return token_info, token_valid


if __name__ == '__main__':
    app.run(port = 3000 )