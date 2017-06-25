const uuid = require('uuid/v1');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const download = require('image-downloader');
const gm = require('gm').subClass({imageMagick: true});
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
      cell: {
        url: 'https://prequelmemes.s3.amazonaws.com/3a762d50-55e3-11e7-aed3-2b2e38f1a510',
        topText: 'This is the image one Top Text',
        bottomText: 'This is image one bottom text'
      }
    },
    {
      cell: {
        url: 'https://prequelmemes.s3.amazonaws.com/1db15eb0-55e3-11e7-aed3-2b2e38f1a510',
        topText: 'This is image two top text',
        bottomText: 'This is image two bottom text'
      }
    },
    {
      cell: {
        url: 'https://prequelmemes.s3.amazonaws.com/31ed1e50-55e3-11e7-aed3-2b2e38f1a510',
        topText: 'This is image three top text',
        bottomText: 'This is image three bottom text'
      }
    }
  ]
}

// Create an array to store the filenames of all the meme cells
let memeArray = [];

//loop through the post object
for (let i = 0; i < post.memes.length; i++) {
  //Setting variables
  let localFileName = post.memes[i].cell.url.substr(38, 75) + '.jpg';
  let downloadOptions = {
    url: post.memes[i].cell.url,
    dest: localFileName
  };
  //Setting up Meme Styles
  let options = {
    image: downloadOptions.dest, // Required
    outfile: uuid() + ".jpg", // Required
    topText: post.memes[i].cell.topText, // Required
    bottomText: post.memes[i].cell.bottomText, // Optional
    font: 'impact.ttf', // Optional
    fontSize: 28, // Optional
    fontFill: '#FFF', // Optional
    textPos: 'Center', // Optional
    strokeColor: '#000', // Optional
    strokeWeight: 2 // Optional
  };
  //Push the completed meme-cell into an array
  memeArray.push(options.outfile)
  //Download image locally to the server
  download.image(downloadOptions)
  .then(({ filename, image }) => {
    console.log('Image-Downloader saved file saved to', filename)
    // Get dimensions of image using sizeOf
    let dimensions = sizeOf(options.image);
    // Create meme with GM using options object
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
        .write(options.outfile, function(err) {

          //Delete the no longer needed downloaded Image
          fs.unlink(downloadOptions.dest, (err) => {
              if (err) throw err;
              console.log('successfully deleted source image ' + downloadOptions.dest);
          });
          if (!err) console.log('Meme Created!');
      });
      }).catch((err) => {
    throw err
  })
};//close for loop
console.log(memeArray)

//TO DO: Once the for loop downloads the images, and makes the them meme cell jpgs
// And the loop is complete, I want to then have GM() attach all the completed images
// like this https://superuser.com/questions/290656/combine-multiple-images-using-imagemagick
// But only append the images together once the for loop as finished.
