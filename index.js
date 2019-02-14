const fs = require('fs');
const repos = require('github-user-repos');
const opts = {
	'token': process.env.GITHUB_TOKEN,
	'username': 'pschfr',
	'type': 'public'
};

function callback(error, results, info) {
	// Check for rate limit information...
	if (info) {
		console.error('Limit: %d', info.limit);
		console.error('Remaining: %d', info.remaining);
		console.error('Reset: %s', (new Date(info.reset*1000)).toISOString());
	}
	if (error) {
		throw new Error(error.message);
	}
	console.log(JSON.stringify(results));
	// returns <repo_data>

	fs.mkdir('public/repos', { recursive: true }, (err) => {
		// if (err) throw err;
	});
	  
	fs.writeFile('public/repos/_data.json', JSON.stringify(results), function(err) {
		if(err) {
			return console.log(err);
		}
	
		console.log("The file was saved!");
	});
}

repos(opts, callback);