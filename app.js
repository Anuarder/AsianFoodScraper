const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;

const links = require('./links');


const url = 'mongodb://localhost:27017';
const mongoClient = new MongoClient(url, { useNewUrlParser: true });

let path = 'japanese';
let urls = links[path];

function getURLData(path, urls){
    urls.forEach(url => {
        request(url, (error, response, html) => {
            if(!error && response.statusCode == 200){
                let $ = cheerio.load(html);
    
                let recipe_header = $('.wprm-recipe-name').text().trim();
                let recipe_summary = $('.wprm-recipe-summary p').text().trim();
                let recipe_time = $('.wprm-recipe-total-time-container').text().trim();
                let recipe_img = $('.wprm-recipe-image img').attr('src');
                let recipe_ingredients = [];
                let recipe_instructions = [];
                $('.wprm-recipe-ingredient').each((i, el) => recipe_ingredients.push($(el).text().trim()));
                $('.wprm-recipe-instruction-text').each((i, el) => recipe_instructions.push($(el).text().trim()));
                
                let data = {
                    title: recipe_header,
                    summary: recipe_summary,
                    img: recipe_img,
                    time: recipe_time,
                    ingredients: recipe_ingredients,
                    instructions: recipe_instructions,
                    category: path
                }
                let jsonData = JSON.stringify(data);
                fs.appendFileSync(`JSON/${path}.json`, `${jsonData},\n`);
                console.log("OK");
            }else{
                console.log(error);
            }
        });
    });
}
function getDataFromFile(file){
    fs.readFile(file, 'utf8', (err, data) => {
        if(err) throw err;

        let jsonData = JSON.parse(data);
        console.log(jsonData);
    });
}
function setDataToDB(file){
    fs.readFile(file, 'utf8', (err, data) => {
        if(err) throw err;

        let jsonData = JSON.parse(data);
        mongoClient.connect(function(err, client) {
            if (err) throw err;
            let db = client.db("AsianFood");
            let collection = db.collection("Recipes");
    
            collection.insertMany(jsonData, function(err, res) {
              if (err) throw err;
              console.log(`Inserted ${res.insertedCount} documents`);
              client.close();
            });
        });
    });
}


// getDataFromFile(`JSON/${path}.json`);