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
//getMyData()

async function getUserTop(){
    const data = await spotifyApi.getMyTopArtists();
    let topArtists = [];
    
    for(let i = 0; i < data.body.items.length; i++) {
        if(i < 5) {
            topArtists.push(data.body.items[i].name);
        }
        else{
            break;
        }
    }

    var genresFreq = topGenre(data.body.items);
    return { topArtists, genresFreq };
    
    ///console.log(genresFreq)
}
//getUserTop()

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

    return freqArr.slice(0,5);
}

async function getSongs(){
   // const data = await spotifyApi.getMyTopTracks();
    //console.log(Object.keys(data.body.items[0]));
    //console.log(data.body.items[0].id)
    // var id = data.body.items[0].id
    // const data1 = await spotifyApi.getTrack(id)
    // console.log(Object.keys(data1.body));
    const data2 = await spotifyApi.get
    console.log(Object.keys(data2.body));
    //console.log(data.body)
}
//getSongs()

// async function getSongs(){
//     const data = await spotifyApi.getArtistTopTracks('Mariah the '
//     )
//     console.log(data.body)
// }
// getSongs()

exports.getMyData = getMyData;
exports.getUserTop = getUserTop;