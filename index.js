const Whiptail = require('whiptail'); // checkbox in shell
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
		deleteImages
	} = require('./functions'),
	whiptail = new Whiptail();
// run as async for wait until getFirstHtml got finished.
(async function() {
	await getFistHtml();
	let topics = getTheTopics(); // all topics

	let config = await readConfig();
	// let selectedTopics = await selectTopics(returnTitle(topics));
	let selectedTopics = config.selectedTopics;
	console.log(config);

	let randomTopic = topics[selectRandomItem(selectedTopics)];
	// console.log(topics[1]);
	// let randomTopic = topics[1];

	let imageLink = await gotoImage(randomTopic);
	let lastImage = await downloadImage(imageLink, './config/', imageNameCreator(imageLink));
	// download image and set the address of it in index

	config.lastImage = lastImage[1];
	await createConfig(config);
	// add the image address for a special argument
	await setWallpaper(lastImage[1]).then(() => {
		console.log('wallpaper changed succesfully');
	});
	await deleteImages(imageNameCreator(imageLink));

	await timeout(config.delay);
	await process.exit(1);
})();
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

// var whiptail = new Whiptail(); //some options
// (async function() {

// 	res = await whiptail.checklist('Choose anoter stuff');
// 	console.log({ res });
// })();
