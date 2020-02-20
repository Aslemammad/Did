const cheerio = require('cheerio'),
	axios = require('axios'),
	Whiptail = require('whiptail'),
	whiptail = new Whiptail(),
	fs = require('fs'),
	Path = require('path'),
	mkdirp = require('mkdirp'),
	wallpaper = require('wallpaper');

async function getFistHtml() {
	let response = await axios.get('https://unsplash.com/').catch((error) => {
		console.log(error, 'restart with forever');
		process.exit(1);
		// will exit on erre ++> to running again with 'forever'
	});
	$ = cheerio.load(response.data);
} // for getting home page and getting the tab items as a favourite topic
async function deleteImages(last) {
	let images = [];
	await fs.readdir(Path.join(__dirname, './config'), async (error, items) => {
		console.log(items);
		await items.forEach(async (value, index) => {
			if (value.endsWith('.jpg') && value !== last) {
				await fs.unlink(Path.join(__dirname, './config/', value), (error) => {
					if (error) {
						console.log(error);
						return;
					}
				});
			}
		});
	});
}
function getTheTopics() {
	let topics = [];
	// return $('#app > div > div:nth-child(4) > ._2Ru_P > div > div > ul ').html();
	$('#app > div > div:nth-child(4) > ._2Ru_P > div > div > ul > li > a').each((index, element) => {
		topics[topics.length] = {
			title : $(element).children().first().text(),
			link  : 'https://unsplash.com' + $(element).attr('href')
		}; // add element as array
	});
	return topics;
}
async function selectTopics(titles) {
	// you know , it will return the indexes as the topics array, so we dont need to search the titles,we just need their index
	// for example : topics[0] : {title:'wall.....',link:'htt...'}
	// titles[0] is 'wallpap...' ++> so the indexes are the same
	// i hope you got
	let allTopics = [];
	titles.forEach((value, index) => {
		// count all topics and return as array like [0,1,2,3]
		allTopics[allTopics.length] = index;
	});
	let selectedTopics = await whiptail.checklist('check the topics to you want', titles);
	console.log();
	return selectedTopics[0] ? convertItemsToNumber(selectedTopics) : allTopics;
	// i dont know what's the problem with whiptail because it set [] to defined statement :/
	// because of that i've to check the first item
}
function selectRandomItem(array) {
	return array[Math.floor(Math.random() * array.length)];
}
function convertItemsToNumber(array) {
	// it just converts
	array.forEach((value, index) => {
		array[index] = Number(value);
	});
	return array;
}
async function returnTopicPage(object) {
	let response = await axios.get(object.link, { timeout: 10000 }).catch((error) => {
		console.log(error, 'restart with forever');
		process.exit(1);
		// will exit on erre ++> to running again with 'forever'
	});
	// $ = cheerio.load(response.data);
	return cheerio.load(response.data);
} // $('#app > div > div:nth-child(5) > div._14IbC._2sCnE.PrOBO._1CR66 > div:nth-child(1)').html()
async function gotoImage(object) {
	let $ = await returnTopicPage(object);
	let randomDiv = Math.floor(Math.random() * (19 - 0 + 1) + 0);
	let links = [];
	$(
		`#app > div:nth-child(1) > div:nth-child(5) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div > figure > a`
	).each((index, element) => {
		// console.log(index, $(element).html(), 'https://unsplash.com' + $(element).attr('href'));
		links[links.length] = 'https://unsplash.com' + $(element).attr('href');
	});
	// go to link of random image
	let response = await axios.get(links[randomDiv]).catch((error) => {
		console.log(error, 'restart with forever');
		process.exit(1);
		// will exit on erre ++> to running again with 'forever'
	});
	$ = cheerio.load(response.data); // change $ to the new web page
	return $(
		'#app > div > div:nth-child(4) > div > div:nth-child(1) > div:nth-child(1) > header > div._3-6v7 > div._13Q-._27vvN._2iWc- > a'
	).attr('href');
}
async function downloadImage(imageLink, configFolder, imageName) {
	const imagePath = Path.resolve(__dirname, configFolder, imageName),
		writer = fs.createWriteStream(imagePath);
	response = await axios({
		url          : imageLink,
		method       : 'GET',
		responseType : 'stream'
	});
	response.data.pipe(writer);
	return [
		new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		}),
		imagePath
	];
}
function checkConfig() {
	if (
		fs.existsSync(Path.join(__dirname, './config/', 'config.json')) &&
		fs.existsSync(Path.join(__dirname, './config/'))
	) {
		return true;
	} else {
		return false;
	}
}
async function createConfig(jsonConfig) {
	if (!await fs.existsSync(Path.join(__dirname, './config'))) {
		await fs.mkdirSync(Path.join(__dirname, './config'));
	}

	await fs.writeFile(Path.join(__dirname, './config/', 'config.json'), JSON.stringify(jsonConfig), function(err) {
		if (err) throw ('hey', err);
		console.log('File is created successfully.');
	});
	await timeout(2000); // wait 2 seconds for saving the file
}
function timeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
async function readConfig() {
	jsonConfigFile = await fs.readFileSync(Path.join(__dirname, './config/', 'config.json'), {
		encoding : 'utf-8'
	});
	return JSON.parse(jsonConfigFile);
}
async function setWallpaper(imagePath) {
	await wallpaper.set(imagePath);
}
async function copyFile(source, destination) {
	fs.copyFile(source, destination, (err) => {
		if (err) throw err;
	});
}
// doesnt need async because we run it after getFirstHtml
exports.getFistHtml = getFistHtml;
exports.getTheTopics = getTheTopics;
exports.selectTopics = selectTopics;
exports.selectRandomItem = selectRandomItem;
exports.gotoImage = gotoImage;
exports.downloadImage = downloadImage;
exports.checkConfig = checkConfig;
exports.createConfig = createConfig;
exports.readConfig = readConfig;
exports.setWallpaper = setWallpaper;
exports.timeout = timeout;
exports.deleteImages = deleteImages;
exports.copyFile = copyFile;
