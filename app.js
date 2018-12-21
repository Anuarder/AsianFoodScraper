const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');


let urls = []


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
                instructions: recipe_instructions
            }
            let jsonData = JSON.stringify(data);
            let path = 'chinese';
            fs.appendFileSync(`JSON/${path}.json`, `${jsonData},\n`);
            console.log("OK");
        }else{
            console.log(error);
        }
    })
})

