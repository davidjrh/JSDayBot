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
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botbuilder_ai_1 = require("botbuilder-ai");
const greeting_1 = require("./dialogs/greeting");
const functions_1 = require("./functions");
const parser_1 = require("./parser");
const cards_1 = require("./cards");
const analytics_1 = require("./analytics");
// Greeting Dialog ID
const GREETING_DIALOG = 'greetingDialog';
// State Accessor Properties
const DIALOG_STATE_PROPERTY = 'dialogState';
const USER_PROFILE_PROPERTY = 'greetingStateProperty';
// this is the LUIS service type entry in the .bot file.
const LUIS_CONFIGURATION = 'jsDay-LUIS';
const QNA_CONFIGURATION = 'jsDay-QNA';
// Supported LUIS Intents
const GREETING_INTENT = 'Greeting';
const CANCEL_INTENT = 'Cancel';
const HELP_INTENT = 'Help';
const NONE_INTENT = 'None';
const TIME_INTENT = 'Time';
const LOCATION_INTENT = 'Location';
const SESSIONDETAILS_INTENT = 'SessionDetails';
const TOPIC_INTENT = 'Topic';
const SPEAKER_INTENT = 'Speaker';
// Supported LUIS Entities, defined in ./dialogs/greeting/resources/greeting.lu
const USER_NAME_ENTITIES = ['userName', 'userName_paternAny'];
const USER_LOCATION_ENTITIES = ['userLocation', 'userLocation_patternAny'];
/**
 * Demonstrates the following concepts:
 *  Displaying a Welcome Card, using Adaptive Card technology
 *  Use LUIS to model Greetings, Help, and Cancel interactions
 *  Use a Waterfall dialog to model multi-turn conversation flow
 *  Use custom prompts to validate user input
 *  Store conversation and user state
 *  Handle conversation interruptions
 */
class JSDayBot {
    /**
     * Constructs the three pieces necessary for this bot to operate:
     * 1. StatePropertyAccessor for conversation state
     * 2. StatePropertyAccess for user state
     * 3. LUIS client
     * 4. DialogSet to handle our GreetingDialog
     *
     * @param {ConversationState} conversationState property accessor
     * @param {UserState} userState property accessor
     * @param {BotConfiguration} botConfig contents of the .bot file
     */
    constructor(conversationState, userState, botConfig) {
        /**
         * Driver code that does one of the following:
         * 1. Display a welcome card upon receiving ConversationUpdate activity
         * 2. Use LUIS to recognize intents for incoming user message
         * 3. Start a greeting dialog
         * 4. Optionally handle Cancel or Help interruptions
         *
         * @param {Context} context turn context from the adapter
         */
        this.onTurn = (context) => __awaiter(this, void 0, void 0, function* () {
            // Handle Message activity type, which is the main activity type for shown within a conversational interface
            // Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
            // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
            if (context.activity.type === botbuilder_1.ActivityTypes.Message) {
                let dialogResult;
                // Create a dialog context
                const dc = yield this.dialogs.createContext(context);
                // Perform a call to LUIS to retrieve results for the current activity message.
                const results = yield this.luisRecognizer.recognize(context);
                const topIntent = botbuilder_ai_1.LuisRecognizer.topIntent(results);
                const data = parser_1.getData(results.entities);
                // update user profile property with any entities captured by LUIS
                // This could be user responding with their name or city while we are in the middle of greeting dialog,
                // or user saying something like 'i'm {userName}' while we have no active multi-turn dialog.
                yield this.updateUserProfile(results, context);
                // Based on LUIS topIntent, evaluate if we have an interruption.
                // Interruption here refers to user looking for help/ cancel existing dialog
                const interrupted = yield this.isTurnInterrupted(dc, results);
                if (interrupted) {
                    if (dc.activeDialog !== undefined) {
                        // issue a re-prompt on the active dialog
                        yield dc.repromptDialog();
                    } // Else: We dont have an active dialog so nothing to continue here.
                }
                else {
                    // No interruption. Continue any active dialogs.
                    dialogResult = yield dc.continueDialog();
                }
                // If no active dialog or no active dialog has responded,
                if (!dc.context.responded) {
                    // Switch on return results from any active dialog.
                    switch (dialogResult.status) {
                        // dc.continueDialog() returns DialogTurnStatus.empty if there are no active dialogs
                        case botbuilder_dialogs_1.DialogTurnStatus.empty:
                            // Determine what we should do based on the top intent from LUIS.
                            switch (topIntent) {
                                /* Using QnA Greeting message this time :) */
                                /*case GREETING_INTENT:
                                  await dc.beginDialog(GREETING_DIALOG);
                                  break;*/
                                case TIME_INTENT:
                                    yield dc.context.sendActivities(functions_1.getTime(data));
                                    this.botAnalytics.logIntent(topIntent, dc, results, false);
                                    break;
                                case TOPIC_INTENT:
                                case SPEAKER_INTENT:
                                case LOCATION_INTENT:
                                    if (data.length > 1) {
                                        yield context.sendActivity(cards_1.createCarousel(data, topIntent));
                                        this.botAnalytics.logIntent(topIntent, dc, results, false);
                                    }
                                    else if (data.length === 1) {
                                        yield context.sendActivity({ attachments: [cards_1.createHeroCard(data[0], topIntent)] });
                                        this.botAnalytics.logIntent(topIntent, dc, results, false);
                                    }
                                    else {
                                        yield context.sendActivity("No tengo ninguna sesión en la agenda para eso. Prueba a preguntarme por el nombre del speaker o de lo que se va a hablar en la misma.");
                                        this.botAnalytics.logIntent(topIntent, dc, results, true);
                                    }
                                    break;
                                case SESSIONDETAILS_INTENT:
                                    yield dc.context.sendActivities(functions_1.getSessionDetails(data));
                                    this.botAnalytics.logIntent(topIntent, dc, results, false);
                                    break;
                                case NONE_INTENT:
                                default:
                                    // Perform a call to the QnA Maker service to retrieve matching Question and Answer pairs.
                                    const qnaResults = yield this.qnaMaker.generateAnswer(context.activity.text);
                                    // If an answer was received from QnA Maker, send the answer back to the user.
                                    if (qnaResults[0]) {
                                        yield context.sendActivity(qnaResults[0].answer);
                                        this.botAnalytics.logIntent(topIntent + "-QnA", dc, results, false);
                                    }
                                    else {
                                        // help or no intent identified, either way, let's provide some help
                                        // to the user
                                        yield dc.context.sendActivity(`Lo siento, no entendí lo que quisiste decirme.`);
                                        this.botAnalytics.logIntent(topIntent, dc, results, true);
                                    }
                                    break;
                            }
                            break;
                        case botbuilder_dialogs_1.DialogTurnStatus.waiting:
                            // The active dialog is waiting for a response from the user, so do nothing.
                            break;
                        case botbuilder_dialogs_1.DialogTurnStatus.complete:
                            // All child dialogs have ended. so do nothing.
                            break;
                        default:
                            // Unrecognized status from child dialog. Cancel all dialogs.
                            yield dc.cancelAllDialogs();
                            break;
                    }
                }
            }
            // Handle ConversationUpdate activity type, which is used to indicates new members add to
            // the conversation.
            // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
            else if (context.activity.type === botbuilder_1.ActivityTypes.ConversationUpdate) {
                // Do we have any new members added to the conversation?
                if (context.activity.membersAdded.length !== 0) {
                    // Iterate over all new members added to the conversation
                    for (var idx in context.activity.membersAdded) {
                        // Greet anyone that was not the target (recipient) of this message
                        // the 'bot' is the recipient for events from the channel,
                        // context.activity.membersAdded == context.activity.recipient.Id indicates the
                        // bot was added to the conversation.
                        if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
                            // Welcome user.
                            // When activity type is "conversationUpdate" and the member joining the conversation is the bot
                            // we will send our Welcome Adaptive Card.  This will only be sent once, when the Bot joins conversation
                            // To learn more about Adaptive Cards, see https://aka.ms/msbot-adaptivecards for more details.
                            //const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                            // Using local card instead of adaptive card to work on all channels
                            let images = [];
                            images.push("https://jsday.blob.core.windows.net/images/Welcome.png");
                            const welcomeCard = botbuilder_1.CardFactory.heroCard("¡Bienvenido al JSDay Canarias 2018!", botbuilder_1.CardFactory.images(images), botbuilder_1.CardFactory.actions([
                                {
                                    type: botbuilder_1.ActionTypes.ImBack,
                                    title: "Sesiones",
                                    value: "Horarios"
                                },
                                {
                                    type: botbuilder_1.ActionTypes.ImBack,
                                    title: "Ponentes",
                                    value: "Ponentes"
                                },
                                {
                                    type: botbuilder_1.ActionTypes.ImBack,
                                    title: "Ayuda",
                                    value: "Ayuda"
                                }
                            ]), {
                                subtitle: "",
                                text: "Te puedo ayudar a conocer las sesiones y los speakers que las impartirán, sigue alguna de estas opciones para no perderte."
                            });
                            yield context.sendActivity({ attachments: [welcomeCard] });
                        }
                    }
                }
            }
            // make sure to persist state at the end of a turn.
            yield this.conversationState.saveChanges(context);
            yield this.userState.saveChanges(context);
        });
        /**
         * Look at the LUIS results and determine if we need to handle
         * an interruptions due to a Help or Cancel intent
         *
         * @param {DialogContext} dc - dialog context
         * @param {LuisResults} luisResults - LUIS recognizer results
         */
        this.isTurnInterrupted = (dc, luisResults) => __awaiter(this, void 0, void 0, function* () {
            const topIntent = botbuilder_ai_1.LuisRecognizer.topIntent(luisResults);
            // see if there are anh conversation interrupts we need to handle
            if (topIntent === CANCEL_INTENT) {
                if (dc.activeDialog) {
                    // cancel all active dialog (clean the stack)
                    yield dc.cancelAllDialogs();
                    yield dc.context.sendActivity(`Vale, he cancelado nuestra última actividad.`);
                }
                else {
                    yield dc.context.sendActivity(`No tengo nada que cancelar.`);
                }
                return true; // this is an interruption
            }
            if (topIntent === HELP_INTENT) {
                let message = "Prueba a preguntarme por el nombre del speaker o de lo que se va a hablar en la misma. También puedes preguntarme sesiones por el nombre de la sala. Te dejo algunos ejemplos:\n";
                message += `* sesiones del track 1\n`;
                message += `* sesiones en el aula 12\n`;
                message += `* sesión de David\n`;
                message += `* sesiones sobre bots\n`;
                message += `* sesiones sobre javascript\n`;
                message += `* qué hay en el aula magna\n`;
                message += `* a qué hora es la sesión de kiko?\n`;
                message += `* cómo llego al evento\n`;
                message += `* a qué hora empieza\n`;
                message += `* tengo que estudiar algo\n`;
                message += `* dónde puedo ver el streaming\n`;
                message += `* nombres de los speakers\n`;
                message += `* qué es el JSDay\n`;
                message += `* cuánto dura el evento\n`;
                message += `* objetivo del evento\n`;
                message += `* horarios\n`;
                message += `* hablar por Skype\n`;
                message += `* hablar en Telegram\n`;
                message += `* quién es Dailos\n`;
                yield dc.context.sendActivity(message);
                return true; // this is an interruption
            }
            return false; // this is not an interruption
        });
        /**
         * Helper function to update user profile with entities returned by LUIS.
         *
         * @param {LuisResults} luisResults - LUIS recognizer results
         * @param {DialogContext} dc - dialog context
         */
        this.updateUserProfile = (luisResult, context) => __awaiter(this, void 0, void 0, function* () {
            // Do we have any entities?
            if (Object.keys(luisResult.entities).length !== 1) {
                // get greetingState object using the accessor
                let userProfile = yield this.userProfileAccessor.get(context);
                if (userProfile === undefined)
                    userProfile = new greeting_1.UserProfile();
                // see if we have any user name entities
                USER_NAME_ENTITIES.forEach(name => {
                    if (luisResult.entities[name] !== undefined) {
                        let lowerCaseName = luisResult.entities[name][0];
                        // capitalize and set user name
                        userProfile.name = lowerCaseName.charAt(0).toUpperCase() + lowerCaseName.substr(1);
                    }
                });
                USER_LOCATION_ENTITIES.forEach(city => {
                    if (luisResult.entities[city] !== undefined) {
                        let lowerCaseCity = luisResult.entities[city][0];
                        // capitalize and set user name
                        userProfile.city = lowerCaseCity.charAt(0).toUpperCase() + lowerCaseCity.substr(1);
                    }
                });
                // set the new values
                yield this.userProfileAccessor.set(context, userProfile);
            }
        });
        if (!conversationState)
            throw new Error('Missing parameter.  conversationState is required');
        if (!userState)
            throw new Error('Missing parameter.  userState is required');
        if (!botConfig)
            throw new Error('Missing parameter.  botConfig is required');
        // add the LUIS recogizer
        let luisConfig;
        luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION);
        if (!luisConfig || !luisConfig.appId)
            throw ('Missing LUIS configuration. Please follow README.MD to create required LUIS applications.\n\n');
        this.luisRecognizer = new botbuilder_ai_1.LuisRecognizer({
            applicationId: luisConfig.appId,
            // CAUTION: Its better to assign and use a subscription key instead of authoring key here.
            endpointKey: luisConfig.authoringKey,
            endpoint: luisConfig.getEndpoint()
        });
        // add the QnA maker 
        let qnaMakerConfig;
        qnaMakerConfig = botConfig.findServiceByNameOrId(QNA_CONFIGURATION);
        if (!qnaMakerConfig || !qnaMakerConfig.kbId)
            throw ('Missing QnA configuration. Please follow README.MD to create required QnA applications.\n\n');
        this.qnaMaker = new botbuilder_ai_1.QnAMaker({
            knowledgeBaseId: qnaMakerConfig.kbId,
            endpointKey: qnaMakerConfig.endpointKey,
            host: qnaMakerConfig.hostname
        }, {
            top: 1
        });
        // Create the property accessors for user and conversation state
        this.userProfileAccessor = userState.createProperty(USER_PROFILE_PROPERTY);
        this.dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        // Create top-level dialog(s)
        this.dialogs = new botbuilder_dialogs_1.DialogSet(this.dialogState);
        this.dialogs.add(new greeting_1.GreetingDialog(GREETING_DIALOG, this.userProfileAccessor));
        this.conversationState = conversationState;
        this.userState = userState;
        this.botAnalytics = new analytics_1.BotAnalytics();
    }
}
exports.JSDayBot = JSDayBot;
;
//# sourceMappingURL=bot.js.map