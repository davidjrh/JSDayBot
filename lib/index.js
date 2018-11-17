"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const restify = require("restify");
const dotenv_1 = require("dotenv");
// Import required bot services. See https://aka.ms/bot-services to learn more about the different parts of a bot.
const botbuilder_1 = require("botbuilder");
// Import required bot configuration.
const botframework_config_1 = require("botframework-config");
const bot_1 = require("./bot");
// Read botFilePath and botFileSecret from .env file
// Note: Ensure you have a .env file and include botFilePath and botFileSecret.
const ENV_FILE = path.join(__dirname, '..', '.env');
const loadFromEnv = dotenv_1.config({ path: ENV_FILE });
// Get the .bot file path.
// See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.
const BOT_FILE = path.join(__dirname, '..', (process.env.botFilePath || ''));
let botConfig;
try {
    // Read bot configuration from .bot file.
    botConfig = botframework_config_1.BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret);
}
catch (err) {
    console.error(`\nError reading bot file. Please ensure you have valid botFilePath and botFileSecret set for your environment.`);
    console.error(`\n - The error was:` + err.message);
    console.error(`\n - The botFileSecret is available under appsettings for your Azure Bot Service bot.`);
    console.error(`\n - If you are running this bot locally, consider adding a .env file with botFilePath and botFileSecret.`);
    console.error(`\n - See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.\n\n`);
    process.exit();
}
// For local development configuration as defined in .bot file
const DEV_ENVIRONMENT = 'development';
// Setup Application Insights. Instrumentation key is stored on environment variable APPINSIGHTS_INSTRUMENTATIONKEY
const appInsights = require("applicationinsights");
appInsights.setup()
    .setAutoDependencyCorrelation(false)
    .setAutoCollectDependencies(false)
    /*.setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)*/
    .start();
let appInsightsClient = appInsights.defaultClient;
// Define name of the endpoint configuration section from the .bot file.
const BOT_CONFIGURATION = (process.env.NODE_ENV || DEV_ENVIRONMENT);
// Get bot endpoint configuration by service name.
// Bot configuration as defined in .bot file.
const endpointConfig = botConfig.findServiceByNameOrId(BOT_CONFIGURATION);
// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration .
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: endpointConfig.appId || process.env.microsoftAppID,
    appPassword: endpointConfig.appPassword || process.env.microsoftAppPassword
});
// Catch-all for errors.
adapter.onTurnError = (context, error) => __awaiter(this, void 0, void 0, function* () {
    // This check writes out errors to console log
    // NOTE: In production environment, you should consider logging this to Azure
    //       application insights.
    console.error(`\n [onTurnError]: ${error}`);
    appInsightsClient.trackException({ exception: new Error(`${error}`) });
    // Send a message to the user
    context.sendActivity(`Oops. Something went wrong!`);
    // Clear out state
    yield conversationState.load(context);
    yield conversationState.clear(context);
    // Save state changes.
    yield conversationState.saveChanges(context);
});
// Define a state store for your bot. See https://aka.ms/about-bot-state to learn more about using MemoryStorage.
// A bot requires a state store to persist the dialog and user state between messages.
let conversationState, userState;
// For local development, in-memory storage is used.
// CAUTION: The Memory Storage used here is for local bot debugging only. When the bot
// is restarted, anything stored in memory will be gone.
// const memoryStorage = new MemoryStorage();
// conversationState = new ConversationState(memoryStorage);
// userState = new UserState(memoryStorage);
// CAUTION: You must ensure your product environment has the NODE_ENV set
//          to use the Azure Blob storage or Azure Cosmos DB providers.
// Add botbuilder-azure when using any Azure services.
const botbuilder_azure_1 = require("botbuilder-azure");
// Get service configuration
const STORAGE_CONFIGURATION_ID = 'jsDay-STORAGE-' + BOT_CONFIGURATION;
const DEFAULT_BOT_CONTAINER = 'botstate';
const blobStorageConfig = botConfig.findServiceByNameOrId(STORAGE_CONFIGURATION_ID);
const blobStorage = new botbuilder_azure_1.BlobStorage({
    containerName: (blobStorageConfig.container || DEFAULT_BOT_CONTAINER),
    storageAccountOrConnectionString: blobStorageConfig.connectionString,
});
conversationState = new botbuilder_1.ConversationState(blobStorage);
userState = new botbuilder_1.UserState(blobStorage);
//Create the main dialog.
let bot;
try {
    bot = new bot_1.JSDayBot(conversationState, userState, botConfig);
}
catch (err) {
    console.error(`[botInitializationError]: ${err}`);
    process.exit();
}
// Create HTTP server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open jsDay.bot file in the Emulator`);
});
// Allow static content for webchat hosting
server.get(/\/(.*)?.*/, restify.plugins.serveStatic({
    directory: ((BOT_CONFIGURATION != DEV_ENVIRONMENT) ? '.' : '') + './webchat',
    appendRequestPath: false,
    default: 'index.html'
}));
// Listen for incoming activities and route them to your bot main dialog.
server.post('/api/messages', (req, res) => {
    // Route received a request to adapter for processing
    adapter.processActivity(req, res, (turnContext) => __awaiter(this, void 0, void 0, function* () {
        // route to bot activity handler.
        appInsightsClient.trackNodeHttpRequest({ request: req, response: res });
        yield bot.onTurn(turnContext);
    }));
});
//# sourceMappingURL=index.js.map