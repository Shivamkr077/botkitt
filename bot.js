//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the botkit packages bot.

// Import Botkit's core features
const { Botkit } = require('botkit');
const { BotkitCMSHelper } = require('botkit-plugin-cms');

// Import a platform-specific adapter for web.

const { WebAdapter } = require('botbuilder-adapter-web');

const { MongoDbStorage } = require('botbuilder-storage-mongodb');

// Load process.env values from .env file
require('dotenv').config();

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url: process.env.MONGO_URI,
        useUnifiedTopology: true
    });
}
const adapter = new WebAdapter({});
const controller = new Botkit({
    webhook_uri: '/api/messages',

    adapter: adapter,

    storage: mongoStorage = new MongoDbStorage({
        url: process.env.MONGO_URI,
        useUnifiedTopology: true
    })
});

if (process.env.CMS_URI) {
    controller.usePlugin(new BotkitCMSHelper({
        uri: process.env.CMS_URI,
        token: process.env.CMS_TOKEN,
        useUnifiedTopology: true
    }));
}

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {

    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');

    /* catch-all that uses the CMS to trigger dialogs */
    if (controller.plugins.cms) {
        controller.on('message,direct_message', async (bot, message) => {
            let results = false;
            results = await controller.plugins.cms.testTrigger(bot, message);

            if (results !== false) {
                // do not continue middleware!
                return false;
            }
        });
    }

});

// Log every message received
controller.middleware.receive.use(function (bot, message, next) {

    // log it
    console.log('RECEIVED: ', message);
    // modify the message
    message.logged = true;
    // continue processing the message
    next();

});

// Log every message sent
controller.middleware.send.use(function (bot, message, next) {

    // log it
    console.log('SENT: ', message);

    // modify the message
    message.logged = true;

    // continue processing the message
    next();

});


var reply = {
    text: 'Look, an image!',
    files: [
        {
          url: 'https://google.com',
          image: false
        }
    ]
  }

// // use the cms to test remote triggers
// controller.on('message', async (bot, message) => {
//     await controller.plugins.cms.testTrigger(bot, message);
// });



 //controller = new Botkit(MY_CONFIGURATION);

// controller.hears('hello','direct_message', function(bot, message) {
//     bot.reply(message,'Hello yourself!');
// });

// // listen for a message containing the word "hello", and send a reply
// controller.hears('hello','message',async(bot, message) => {
//     // do something!
//     await bot.reply(message, 'Hello human')
// });

// wait for a new user to join a channel, then say hi
controller.on('channel_join', async(bot, message) => {
    await bot.reply(message,'Welcome to the channel!');
});

//  controller.usePlugin(new BotkitCMSHelper({
//     uri: process.env.CMS_URI,
//     token: process.env.CMS_TOKEN
// }));
