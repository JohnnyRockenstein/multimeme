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

let post = {

        all: {
            image: { [
                url: "http://www.image1.com/image.jpg",
                textTop: "Top Text image",
                bottomText: "1 Bottom Text"
            },
            image: {
                url: "http://www.image1.com/image.jpg",
                textTop: "Top Text image",
                bottomText: "2 Bottom Text"
            }
        ]
        }

    };

console.log(post.all.image);