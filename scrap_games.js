var request = require('request');
const fs = require('fs');   


// Read the existing JSON file
let data = fs.readFileSync('games.json');
let games_json = JSON.parse(data);
let game_array = games_json.games;
let url = 'https://www.speedrun.com/api/v1/games?_bulk=yes&offset=0&unofficial=off&max=1000';

function fetch_all_games(url) {
    var options = {
    'method': 'GET',
    'url': url,
    'headers': {
    }
    };
    request(options, function (error, response) {
    if (error) throw new Error(error);

    let json_response = JSON.parse(response.body);
    for (let game of json_response.data) {
        if (!game_array.includes(game.id) && !game.names.international.includes("Roblox") && !game.names.international.includes("Extension")) {
            game_array.push({
                "id": game.id,
                "name": game.names.international
            });
        }
    }

    let next_bool = false;
    for (let link of json_response.pagination.links) {
        if (link.rel == "next") {
            next_bool = true;
            fetch_all_games(link.uri);
        } 
    }
    if (!next_bool) {
        fs.writeFileSync('games.json', JSON.stringify({
            "game_count": game_array.length,
            "games": game_array
        }));
    }

    });
}

fetch_all_games(url);