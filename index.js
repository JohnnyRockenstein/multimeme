const uuid = require('uuid/v1');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const download = require('image-downloader');
const gm = require('gm').subClass({ imageMagick: true });
const sizeOf = require('image-size');

/*
 * Set-up and run the Express app.
 */
const app = express();
app.set('views', './views');
app.use(express.static('./public'));
app.engine('html', require('ejs').renderFile);
app.listen(process.env.PORT || 3000);
app.use(bodyParser());
console.log('Up and running on port 3000');


//This object simulates the body of a request from the client
let post = {
	memes: [{
		url: 'https://prequelmemes.s3.amazonaws.com/3a762d50-55e3-11e7-aed3-2b2e38f1a510',
		topText: 'This is the image one Top Text',
		bottomText: 'This is image one bottom text'
	},
	{
		url: 'https://prequelmemes.s3.amazonaws.com/1db15eb0-55e3-11e7-aed3-2b2e38f1a510',
		topText: 'This is image two top text',
		bottomText: 'This is image two bottom text'
	},
	{
		url: 'https://prequelmemes.s3.amazonaws.com/31ed1e50-55e3-11e7-aed3-2b2e38f1a510',
		topText: 'This is image three top text',
		bottomText: 'This is image three bottom text'
	}
	]
}

const baseUrl = 'https://prequelmemes.s3.amazonaws.com/';

const imageOptions = collectImageOptions(post.memes);

Promise
	.all(imageOptions.map(options => Promise.resolve(downloadImage(options))))
	.then(done => {
		//TO DO: Once the for loop downloads the images, and makes the them meme cell jpgs
		// And the loop is complete, I want to then have GM() attach all the completed images
		// like this https://superuser.com/questions/290656/combine-multiple-images-using-imagemagick
		// But only append the images together once the for loop as finished.
		console.log(done);
		console.log('we are done!');
	})

/**
 * Collect the options for each passed image to create a single meme option.
 * @param {array} memes List of memes used to create meme
 */
function collectImageOptions(memes) {
	return memes.map(meme => {
		const downloadOptions = {
			url: meme.url,
			dest: `${meme.url.substring(baseUrl.length, meme.url.length)}.jpg`
		}

		const options = {
			image: downloadOptions.dest,
			outfile: `${uuid()}.jpg`,
			topText: meme.topText,
			bottomText: meme.bottomText,
			font: 'impact.ttf',
			fontSize: 28,
			fontFill: '#FFF',
			textPos: 'Center',
			strokeColor: '#000',
			strokeWeight: 2,
		};

		return {
			downloadOptions,
			options,
		}
	});
}

/**
 * Download and use image magic on passed photos
 * @param {downloadOptions, options} 
 */
function downloadImage({ downloadOptions, options }) {
	return download.image(downloadOptions)
		.then(({ filename, image }) => {
			console.log('Image-Downloader saved file saved to', filename);

			const dimensions = sizeOf(options.image);

			return new Promise((res, rej) => {
				gm(options.image)
					.region(dimensions.width, dimensions.height, 0, 0)
					.gravity(options.textPos)
					.font('Roboto-Regular.ttf', 10)
					.fill('#F8E81C')
					.drawText(350, 165, "prequelmemes.com")
					.stroke(options.strokeColor)
					.strokeWidth(options.strokeWeight)
					.font(options.font, 40)
					.fill(options.fontFill)
					.drawText(0, -150, options.topText)
					.drawText(0, 150, options.bottomText)
					//Saves the Meme to a local file
					.write(options.outfile, function (err) {

						//Delete the no longer needed downloaded Image
						fs.unlink(downloadOptions.dest, (err) => {
							if (err) throw err;
							console.log('successfully deleted source image ' + downloadOptions.dest);
						});
						if (!err) {
							console.log('Meme Created!');
							res(options.outfile);
						}
					});
			}).catch((err) => {
				rej(err);
				throw err
			})
		});

}


