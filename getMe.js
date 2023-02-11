const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
// const token = ""
const spotifyApi = new SpotifyWebApi();
// spotifyApi.setAccessToken(token);

function getMyData(token){
    spotifyApi.setAccessToken(token);
    (async()=>{
        const me = await spotifyApi.getMe();
        console.log(me.body);
        //getUserPlaylist(me.body.id);
    })().catch(e=>{
        console.error(e);
    })
    }
//getMyData()

async function getUserTop(){
    const data = await spotifyApi.getMyTopArtists();
    console.log(data.body.items[0].name)
    console.log("________________________")
    let topArtists = [];
    for(let i = 0; i < data.body.items.length; i++) {
        if(i < 5) {
            topArtists.push(data.body.items[i].name);
        }
        else{
            break;
        }
    }
    console.log(topArtists);
    console.log("^^^^^^^^");


    var genresFreq = topGenre(data.body.items);
    
    ///console.log(genresFreq)
}
getUserTop()

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

export { getMyData }