#!/usr/bin/env node
const Whiptail = require('whiptail'),
	Path = require('path'); // checkbox in shell
const {
		getFistHtml,
		getTheTopics,
		selectTopics,
		selectRandomItem,
		gotoImage,
		checkConfig,
		createConfig,
		downloadImage,
		readConfig,
		setWallpaper,
		timeout,
		deleteImages,
		copyFile
	} = require('./functions'),
	whiptail = new Whiptail();
let forever = require('forever-monitor');

let infiniteChild = new forever.Monitor(Path.join(__dirname, './index.js')),
	oneTimeChild = new forever.Monitor(Path.join(__dirname, './index.js'), {
		max    : 1,
		silent : true
	});
// child.start();
const [
	...args
] = process.argv;
for (let counter = 0; counter < args.length; counter++) {
	if (args[counter] == '-s' || !checkConfig()) {
		(async function() {
			await getFistHtml();
			let topics = getTheTopics();
			console.log('hey');
			await whiptail.msgbox('UP, DOWN & SPACE  for  checklist, TAB & ENTER for OK or CANCEL');
			let delay = (await whiptail.inputbox('delay (min) to change the wallpaper')) * 60000 || 3600000;
			await createConfig({
				selectedTopics : await selectTopics(returnTitle(topics)),
				delay
			});
			infiniteChild.start();
		})();
	} else if (!args[2]) {
		if (checkConfig()) {
			infiniteChild.start();
		} else {
			console.log('there is no config, please run the command with -s arg');
		}
	} else if (args[counter] == '-h') {
		console.log(
			"Usage: node run.js [OPTION]... [FILE]...\n    -s      set the config\n    -n      next wallpaper\n    -c [address]      copy the current image to 'address'"
		);
	} else if (args[counter] == '-n') {
		if (checkConfig()) {
			(async function() {
				oneTimeChild.start();
				await timeout(11000);
				process.exit(1);
			})();
		} else {
			console.log('there is no config, please run the command with -s arg');
		}
	} else if (args[counter] == '-c') {
		if (checkConfig()) {
			(async function() {
				let config = await readConfig();
				await copyFile(config.lastImage, args[counter + 1]).then(() => {
					console.log('copied to', args[counter + 1]);
				});
			})();
		} else {
			console.log('there is no config, please run the command with -s arg');
		}
	}
}

function returnTitle(topics) {
	// just for getting the titles and return them as a array
	let titles = [];
	topics.forEach((value) => {
		titles[titles.length] = value.title;
	});
	return titles;
}
function imageNameCreator(imageLink) {
	return imageLink.split('/')[4] + '.jpg';
}
