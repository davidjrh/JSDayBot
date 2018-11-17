"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// greeting.js defines the greeting dialog
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
// User state for greeting dialog
const userProfile_1 = require("./userProfile");
// Minimum lengh requirements for city and name
const CITY_LENGTH_MIN = 5;
const NAME_LENGTH_MIN = 3;
// Dialog IDs
const PROFILE_DIALOG = 'profileDialog';
// Prompt IDs
const NAME_PROMPT = 'namePrompt';
const CITY_PROMPT = 'cityPrompt';
const VALIDATION_SUCCEEDED = true;
const VALIDATION_FAILED = !VALIDATION_SUCCEEDED;
/**
 * Demonstrates the following concepts:
 *  Use a subclass of ComponentDialog to implement a multi-turn conversation
 *  Use a Waterfall dialog to model multi-turn conversation flow
 *  Use custom prompts to validate user input
 *  Store conversation and user state
 *
 * @param {String} dialogId unique identifier for this dialog instance
 * @param {PropertyStateAccessor} userProfileAccessor property accessor for user state
 */
class GreetingDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(dialogId, userProfileAccessor) {
        super(dialogId);
        /**
         * Waterfall Dialog step functions.
         *
         * Initialize our state.  See if the WaterfallDialog has state pass to it
         * If not, then just new up an empty UserProfile object
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.initializeStateStep = (step) => __awaiter(this, void 0, void 0, function* () {
            const userProfile = yield this.userProfileAccessor.get(step.context);
            if (userProfile === undefined) {
                yield this.userProfileAccessor.set(step.context, new userProfile_1.UserProfile());
            }
            return yield step.next();
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Using a text prompt, prompt the user for their name.
         * Only prompt if we don't have this information already.
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.promptForNameStep = (step) => __awaiter(this, void 0, void 0, function* () {
            const userProfile = yield this.userProfileAccessor.get(step.context);
            // if we have everything we need, greet user and return
            if (userProfile !== undefined && userProfile.name !== undefined && userProfile.city !== undefined) {
                return yield this.greetUser(step);
            }
            if (!userProfile.name) {
                // prompt for name, if missing
                return yield step.prompt(NAME_PROMPT, 'Hola, soy el bot del JS Day Canarias. ¿Cómo te llamas?');
            }
            else {
                return yield step.next();
            }
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Using a text prompt, prompt the user for the city in which they live.
         * Only prompt if we don't have this information already.
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.promptForCityStep = (step) => __awaiter(this, void 0, void 0, function* () {
            // save name, if prompted for
            const userProfile = yield this.userProfileAccessor.get(step.context);
            if (userProfile.name === undefined && step.result) {
                let lowerCaseName = step.result;
                // capitalize and set name
                userProfile.name = lowerCaseName.charAt(0).toUpperCase() + lowerCaseName.substr(1);
                yield this.userProfileAccessor.set(step.context, userProfile);
            }
            if (!userProfile.city) {
                // prompt for city, if missing
                return yield step.prompt(CITY_PROMPT, `Hola ${userProfile.name}, ¿en qué ciudad vives?`);
            }
            else {
                return yield step.next();
            }
        });
        /**
         * Waterfall Dialog step functions.
         *
         * Having all the data we need, simply display a summary back to the user.
         *
         * @param {WaterfallStepContext} step contextual information for the current step being executed
         */
        this.displayGreetingStateStep = (step) => __awaiter(this, void 0, void 0, function* () {
            // Save city, if prompted for
            const userProfile = yield this.userProfileAccessor.get(step.context);
            if (userProfile.city === undefined && step.result) {
                let lowerCaseCity = step.result;
                // capitalize and set city
                userProfile.city = lowerCaseCity.charAt(0).toUpperCase() + lowerCaseCity.substr(1);
                yield this.userProfileAccessor.set(step.context, userProfile);
            }
            return yield this.greetUser(step);
        });
        /**
         * Validator function to verify that user name meets required constraints.
         *
         * @param {PromptValidatorContext} validation context for this validator.
         */
        this.validateName = (validatorContext) => __awaiter(this, void 0, void 0, function* () {
            // Validate that the user entered a minimum lenght for their name
            const value = (validatorContext.recognized.value || '').trim();
            if (value.length >= NAME_LENGTH_MIN) {
                return VALIDATION_SUCCEEDED;
            }
            else {
                yield validatorContext.context.sendActivity(`El nombre debe tener al menos ${NAME_LENGTH_MIN} caracteres.`);
                return VALIDATION_FAILED;
            }
        });
        /**
         * Validator function to verify if city meets required constraints.
         *
         * @param {PromptValidatorContext} validation context for this validator.
         */
        this.validateCity = (validatorContext) => __awaiter(this, void 0, void 0, function* () {
            // Validate that the user entered a minimum lenght for their name
            const value = (validatorContext.recognized.value || '').trim();
            if (value.length >= CITY_LENGTH_MIN) {
                return VALIDATION_SUCCEEDED;
            }
            else {
                yield validatorContext.context.sendActivity(`El nombre de la ciudad tiene que tener al menos ${CITY_LENGTH_MIN} caracteres.`);
                return VALIDATION_FAILED;
            }
        });
        // validate what was passed in
        if (!dialogId)
            throw ('Missing parameter.  dialogId is required');
        if (!userProfileAccessor)
            throw ('Missing parameter.  userProfileAccessor is required');
        // Add a water fall dialog with 4 steps.
        // The order of step function registration is importent
        // as a water fall dialog executes steps registered in order
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(PROFILE_DIALOG, [
            this.initializeStateStep.bind(this),
            this.promptForNameStep.bind(this),
            this.promptForCityStep.bind(this),
            this.displayGreetingStateStep.bind(this)
        ]));
        // Add text prompts for name and city
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(NAME_PROMPT, this.validateName));
        this.addDialog(new botbuilder_dialogs_1.TextPrompt(CITY_PROMPT, this.validateCity));
        // Save off our state accessor for later use
        this.userProfileAccessor = userProfileAccessor;
    }
    /**
     * Helper function to greet user with information in greetingState.
     *
     * @param {WaterfallStepContext} step contextual information for the current step being executed
     */
    greetUser(step) {
        return __awaiter(this, void 0, void 0, function* () {
            const userProfile = yield this.userProfileAccessor.get(step.context);
            // Display to the user their profile information and end dialog
            yield step.context.sendActivity(`Hola ${userProfile.name}, de ${userProfile.city}, ¡encantado de saludarte!`);
            yield step.context.sendActivity(`Siempre puedes decir 'Mi nombre es <tu nombre> para volver a presentarte.`);
            return yield step.endDialog();
        });
    }
}
exports.GreetingDialog = GreetingDialog;
//# sourceMappingURL=greeting.js.map