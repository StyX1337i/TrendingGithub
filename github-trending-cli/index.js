#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios'); // <-- REPARAT: axioxs în axios

program
    .name('trending repos')
    .description('CLI to get trending repos from github')
    .option('-d --duration <time>', 'time range (day week month)', 'week')
    .option('-l --limit <number>', 'limit number of repos', 10)
    .parse(process.argv);

const options = program.opts();

function getStartDate(duration) {
    const date = new Date();
    switch (duration.toLowerCase()) { // <-- REPARAT: toLowerCase cu L mare
        case 'day':
            date.setDate(date.getDate() - 1);
            break;
        case 'week':
            date.setDate(date.getDate() - 7);
            break;
        case 'month':
            date.setMonth(date.getMonth() - 1);
            break;
        default:
            console.error('Invalid duration. Please use "day", "week", or "month".');
            process.exit(1);
    }
    return date.toISOString().split('T')[0];
} // <-- REPARAT: Acolada asta lipsea!

async function fetchTrendingRepos(duration, limit) {
    const startDate = getStartDate(duration);
    const parsedLimit = parseInt(limit, 10);

    if(isNaN(parsedLimit) || parsedLimit <= 0) {
        console.error('Invalid limit. Please provide a positive number.');
        process.exit(1);
    }

    const url = `https://api.github.com/search/repositories?q=created:>${startDate}&sort=stars&order=desc&per_page=${parsedLimit}`;

    try {
        console.log(`Fetching trending repositories created since ${startDate}...`);
        
        const response = await axios.get(url,{
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'github-trending-cli'
            }
        });

        const repos = response.data.items;
        if (repos.length === 0) {
            console.log('No trending repositories found for the specified duration.');
            return;
        }

        repos.forEach((repo, index) => {
            console.log(`${index + 1}. ${repo.full_name} - ⭐ ${repo.stargazers_count}`);
            console.log(`   ${repo.description}`);
            console.log(`   ${repo.html_url}\n`);
        });

    } catch (error) {
        console.error('Error fetching trending repositories:', error.message);
        process.exit(1);
    }
}

// <-- REPARAT: Apelul e scos în afară, ca să fie executat de Node la rularea scriptului
fetchTrendingRepos(options.duration, options.limit);