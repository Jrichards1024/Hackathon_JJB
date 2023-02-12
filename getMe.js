const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
// const token = ""
const spotifyApi = new SpotifyWebApi();

async function getMyData(token){
    // console.log('this is token ____');
    // console.log(token);
    spotifyApi.setAccessToken(token);
    const me = await spotifyApi.getMe();
    // console.log(me.body.items);

    return me.body.id;
}
//getMyData()

async function getArtists(artistId){
    const data = await spotifyApi.getArtist(artistId);
    let name = data.body.name;
    return name;

}

async function getImage(artistId){
    const data = await spotifyApi.getArtist(artistId)
    let image = data.body.images[0];
    return image.url;

}

async function getUserTop(){
    const data = await spotifyApi.getMyTopArtists();
    // console.log(data.body.items[0].images[0])
    const artistInfo = data.body.items;
    let topArtists = [];
    let artistId = [];
    let images = [];
    
    for(let i = 0; i < data.body.items.length; i++) {
        if(i < 20) {
            topArtists.push(data.body.items[i].name);
            artistId.push(data.body.items[i].id);
            images.push(data.body.items[i].images[0].url);
        }
        else{
            break;
        }
    }
    const artistRelated = [];
    const topSongs = getSongs();
    //const relatedArtists = [];
    for (let i = 0; i < artistId.length; i++){
        getRelated(artistId[i], artistRelated);
    }

    var genresFreq = topGenre(data.body.items);
    return { topArtists, genresFreq, images, topSongs, artistRelated, artistInfo};
    
    ///console.log(genresFreq)
}


async function getRelated(artistId, artistRelated){
    var data = await spotifyApi.getArtistRelatedArtists(artistId);
    for (let i = 0; i < data.body.artists.length; i++){
        artistRelated.push(data.body.artists[i]);
    }

    
}
//getUserTop()

async function topGenre(items) {
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
   const data = await spotifyApi.getMyTopTracks();
   return data.body.items;
    // console.log(data.body.items);
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
exports.getArtists = getArtists;
exports.getImage = getImage;