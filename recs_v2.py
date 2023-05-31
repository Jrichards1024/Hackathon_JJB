import spotipy
from spotipy.oauth2 import SpotifyOAuth
import cred 
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
import sklearn
import pandas as pd
"""
TF-IDF reccommendation alg using users top artists/genres and the genres of emerging artists. 
Combines general user data as well as a users listening history to generate reccommendations for emerging artists 
we deifned emerging artists at those with a spotify-defined popularity score of between 25 and 50 or between about
75,000 - 800,00 monthly listeners #cap
"""
# customizable 
term_len = "long_term"
num_items = 50
#get top artists 
scope = "user-top-read" #authorization scope 
sp = spotipy.Spotify(auth_manager=SpotifyOAuth(client_id=cred.client_ID, client_secret= cred.client_SECRET, redirect_uri=cred.redirect_url, scope=scope))
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
            
            
# #tf idf 
# vectorizer = TfidfVectorizer()
# tf_idf  = vectorizer.fit_transform(genres.keys())
# print(tf_idf)
# print()
# print(genres)
# for genre in genres.keys():
#     print(genre)
#     print(vectorizer.transform(genres[genre][1]))



# print(tf_idf)
headers = ["artist", "genres", "soup"]

table = pd.DataFrame(columns = headers)

for artist in ea_dict:
    row=[]
    row.append(artist)
    row.append(ea_dict[artist])
    cur_artist  = ""
    for genre in ea_dict[artist]:
        cur_artist+=genre+" "
    row.append(cur_artist)
    print(row)
    # table=table.append(row)
# print(table)    
#     # print(linear_kernel(tf_idf, cur_artist))
#     print(sklearn.metrics.pairwise.cosine_similarity(tf_idf, cur_artist, dense_output=False))
#     print()