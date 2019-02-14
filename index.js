const fs = require('fs');
const timeago = require('timeago.js');
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
	// console.log(JSON.stringify(results));

	// Loops over results, allowing me to append or transform values
	results.forEach(result => {
		// Converts each DateTime values to '3 days ago' or similar, appends it to object
		result['updated_at_timeago'] = timeago.format(result['updated_at']);
		result['created_at_timeago'] = timeago.format(result['created_at']);
		result['pushed_at_timeago']  = timeago.format(result['pushed_at']);

		// Converts each DateTime values to '12/25/2015, 3:00:00 PM' or similar, appends it to object
		result['updated_at_formatted'] = new Date(result['updated_at']).toLocaleString('en-US');
		result['created_at_formatted'] = new Date(result['created_at']).toLocaleString('en-US');
		result['pushed_at_formatted']  = new Date(result['pushed_at']).toLocaleString('en-US');
	});

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
