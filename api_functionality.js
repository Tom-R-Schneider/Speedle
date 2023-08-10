const fs = require('fs'); 
var request = require('request');

var game_details = {
    game_title: "",
    game_image: "",
    link: "",
    category: "",
    run: {
        time_s: 0,
        time_cat: "",
        run_date: 0,
        link: ""

    },
    runners: [] // name, link

}

function get_random_game_id() {
    let data = fs.readFileSync('games.json');
    let games_json = JSON.parse(data);
    let rnd_num = Math.floor(Math.random() * (games_json.game_count - 1));
    let game_id = games_json.games[rnd_num].id;
    game_details.game_title = games_json.games[rnd_num].name;
    return game_id;

}

async function get_runner_data(runners, callback) {
    for (let runner of runners) {
        var options = {
            'method': 'GET',
            'url': 'https://www.speedrun.com/api/v1/users/' + runner.id,
            'headers': {}
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            
            let json_response = JSON.parse(response.body);
            game_details.category = json_response.data.names.international;
            game_details.runners.push({
                name: json_response.data.names.international,
                link: json_response.data.weblink
            });
            
        });
        
    }
    callback();
}

function get_game_data(game_id, callback) {
    var options = {
        'method': 'GET',
        'url': 'https://www.speedrun.com/api/v1/games/' + game_id,
        'headers': {}
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        
        let json_response = JSON.parse(response.body);
        console.log(json_response);
        game_details.game_title = json_response.data.names.international;
        game_details.link = json_response.data.weblink;
        callback(game_id);

        
    });
}

async function get_wr_for_game(game_id, callback) {

    // Get categories of game first
    var options = {
        'method': 'GET',
        'url': 'https://www.speedrun.com/api/v1/games/' + game_id + "/categories",
        'headers': {}
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
        
        let json_response = JSON.parse(response.body);
        game_details.category = json_response.data[0].name;
        
        // Get top 5 runs for category
        options.url = "https://www.speedrun.com/api/v1/categories/" + json_response.data[0].id + "/records?top=5";
        request(options, function (error, response) {
            if (error) throw new Error(error);
            
            let json_response = JSON.parse(response.body);
            console.log(json_response); 
            
            if (json_response.data[0].runs.length >= 5) {
                let wr_run_id = json_response.data[0].runs[0].run.id;
                let runners = json_response.data[0].runs[0].run.players;
                game_details.run.time_s = json_response.data[0].runs[0].run.times.primary_t;
                console.log(game_details);
                get_runner_data(runners, function() {
                    callback();
                }); // TODO somehow put in an await statement 
                
                
            } else {
                // TODO: Get another game and label game as not usable
            }
    
    
    
            
    
    
        
        });
    });
}


// Just for testing

let rnd_game_id = get_random_game_id();
console.log(rnd_game_id);
get_game_data(rnd_game_id, function(game_id) {
    get_wr_for_game(game_id, function(){
        console.log(game_details);
        console.log(1);
    });
});
