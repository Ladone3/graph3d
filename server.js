const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const Server = {
    app: function () {
        const app = express();

        // we need parser to get sparql query
        const indexPath = path.join(__dirname, 'index.html');

        app.get('/', function(_, res) { res.sendFile(indexPath)});
        // app.get('/*', function(_, res) { res.sendFile(indexPath)});
        
        const publicPath = express.static(__dirname);
        app.use(publicPath);

        app.use(bodyParser.text());
        app.post('/convertToImage', (req, res, next) => {
            (async () => {
              const browser = await puppeteer.launch();
              const page = await browser.newPage();
              await page.setContent(req.body);
              await page.setViewport({width: 160, height: 90});
              const image = await page.screenshot({path: 'example.png'});
              await browser.close();
              const base64 = Buffer.from(image, 'binary').toString('base64');
              const base64Image =  `data:png;base64,${base64}`;
              console.log(base64Image)
              res.send(base64Image);
            })();
        });

        return app;
    }
};

const port = (process.env.PORT || 5001);
const app = Server.app();

app.listen(port);
console.log(`Listening at http://localhost:${port}`);

