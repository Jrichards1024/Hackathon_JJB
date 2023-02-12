const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
// const token = ""
const spotifyApi = new SpotifyWebApi();
// spotifyApi.setAccessToken(token);

async function getMyData(token){
    spotifyApi.setAccessToken(token);
    const me = await spotifyApi.getMe();
    return me.body.id;
}

async function getUserTop(){
    const data = await spotifyApi.getMyTopArtists();
    console.log(data.body.items[0].images[0])
    let topArtists = [];
    let images = [];
    
    
    for(let i = 0; i < data.body.items.length; i++) {
        if(i < 6) {
            topArtists.push(data.body.items[i].name);
            images.push(data.body.items[i].images[0].url);
        }
        else{
            break;
        }
    }
    var genresFreq = topGenre(data.body.items);
    return { topArtists, genresFreq, images};

    return { topArtists, genresFreq };
}

function topGenre(items) {
    let frequency = {};
    for(let i = 0; i < items.length; i++) {
        var currGenres = items[i].genres;
        for(let j = 0; j < currGenres.length; j++) {
            if(currGenres[j] in frequency) {
                frequency[currGenres[j]] += 1;
            } else {
                frequency[currGenres[j]] = 1;
            }
        }
    }

    var freqArr = Object.keys(frequency).map(function(key) {
        return [key, frequency[key]]
    });

    freqArr.sort(function(first, second) {
        return second[1] - first[1];
    })

    return freqArr.slice(0,8);
}

exports.getMyData = getMyData;
exports.getUserTop = getUserTop;