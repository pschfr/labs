// Require dependencies
const dotenv = require('dotenv').config();
const fs = require('fs');
const timeago = require('timeago.js');
const repos = require('github-user-repos');
const captureWebsite = require('capture-website');

// My constants
const repo_opts = {
	'token': process.env.GITHUB_TOKEN,
	'username': 'pschfr',
	'type': 'public'
};
const capture_opts = {
	'overwrite': true,
	'width': 800,
	'scaleFactor': 1,
	'type': 'jpeg',
	'quality': 0
};
const paths = {
	'repo': __dirname + '/public/repos',
	'data': __dirname + '/public/repos/_data.json',
	'imgs': __dirname + '/public/repos/img'
};

// Request the repos!
repos(repo_opts, function callback(error, results, info) {
	// Check for rate limit information...
	if (info) {
		console.error('Limit: %d', info.limit);
		console.error('Remaining: %d', info.remaining);
		console.error('Reset: %s', (new Date(info.reset*1000)).toISOString());
	}
	if (error) {
		throw new Error(error.message);
	}

	// Create directories if they don't already exist
	if (!fs.existsSync(paths['repo'])) {
		fs.mkdir(paths['repo'], { recursive: true }, (error) => {
			if (error) throw error;

			if (!fs.existsSync(paths['imgs'])) {
				fs.mkdir(paths['imgs'], { recursive: true }, (error) => {
					if (error) throw error;
				});
			}
		});
	}

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

		// If there is a homepage link, and it's not a fork,
		if (result['homepage'] && result['fork'] == false) {
			// and if the image doesn't already exist,
			if (!fs.existsSync(`${paths['imgs']}/${result['name']}.jpg`)) {
				// capture an image of it!
				(async () => {
					await captureWebsite.file(result['homepage'], `${paths['imgs']}/${result['name']}.jpg`, capture_opts);
				})();
			}
		}
	});
	
	fs.writeFile(paths['data'], JSON.stringify(results), function(err) {
		if(err) {
			return console.log(err);
		}
	
		console.log("The file was saved!");
	});
});
