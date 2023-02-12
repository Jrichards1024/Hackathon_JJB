# import spotipy
# from spotipy.oauth2 import SpotifyOAuth
import cred 
import json 
import sys

"""
TF-IDF reccommendation alg using users top artists/genres and the genres of emerging artists. 
Combines general user data as well as a users listening history to generate reccommendations for emerging artists 
we deifned emerging artists at those with a spotify-defined popularity score of between 25 and 50 or between about
75,000 - 800,00 monthly listeners #cap
"""

def recs_v1(top_artists,top_songs,related_artists):
   
   
    num_artists = len(top_songs)
    increment = 4/num_artists
    ratings = {}

    #saves totals of genres observed used in tf-idf algorithm 
    genres = {}

    #set ratings and gets genres 
    ea_dict = {}
    total_genres = 0 
    for idx in range(num_artists): #loop through artists 
        this_artist = top_artists[idx]
        # print(this_artist)
        artists_genres = this_artist['genres']
        rating_genres = 5 - (idx*increment)*0.6
        ratings[top_artists[idx]["name"]] = rating_genres
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
        # similar_artists = sp.artist_related_artists(artist_id=this_artist["id"])
        
    for artist in related_artists:
        if (artist["popularity"]<50) and (artist["popularity"]>25) and len(ea_dict)<50:
            #may be better for retrieving from api to send artist id 
            ea_dict[artist["id"]] = artist["genres"]
            
    # print(genres, total_genres)
    # generate recs for new stuff - TFIDF 
    final_preds_dict = {}
    for artist in ea_dict:
        prop_sum = 0 
        score = 0 
        ####cannot be condensed####
        for genre in ea_dict[artist]:
            if genre in genres.keys():
                proportion = genres[genre][0] / total_genres
                prop_sum+= proportion
        for genre in ea_dict[artist]:
            if genre in genres.keys():
                proportion = (genres[genre][0]/total_genres) / prop_sum
                for each_artist in genres[genre][1]:
                    score += proportion*ratings[each_artist]
        final_preds_dict[score]= artist
    # print(final_preds_dict)

    new_preds_json = json.dumps(final_preds_dict)
    return new_preds_json
#dont really know what  ajson file should look like 