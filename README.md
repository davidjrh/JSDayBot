# JSDay Canarias 2018 Bot
Demonstrate the core capabilties of the Microsoft Bot Framework

This bot has been created using [Microsoft Bot Framework][1], based on the [eduiConf bot](https://github.com/szul/conf-edui2018-bot) built by [szul](https://github.com/szul)

This sample shows how to:
- Use [LUIS][2] to implement core AI capabilities
- Use [QnA Maker][12] to implement core AI capabilities
- Handle user interruptions for such things as Help or Cancel
- Prompt for and validate requests for information from the user
- Demonstrate how to handle any unexptected errors
- Use [Application Insights][18] service for telemetry
- Use [Chatbase][17] service for telemetry

## To run this bot
- In a terminal,
  ```bash
  cd JSDayBot
  ```
- Install modules
  ```bash
  npm install
  ```
- Create [required services][3]
- Run the bot
  ```bash
  tsc &amp;&amp; node ./lib/index.js
  ```
  
  NOTE: review the settings on the jsDay.bot and .env files to setup LUIS, QnA, Application Insights and Chatbase services

## Prerequisite
### Install TypeScript
In order to run this sample, you must have TypeScript installed.  To install TypeScript:
- Navigate to the [TypeScript portal](https://www.typescriptlang.org).
- Click the [Download](https://www.typescriptlang.org/#download-links) button.
- Follow the installation instructions for your development environment.

## Testing the bot using Bot Framework Emulator
[Microsoft Bot Framework Emulator][4] is a desktop application that allows bot developers to test and debug their bots on running locally or  or running remotely in Microsoft Azure.

- Install the Bot Framework Emulator from [here][5]

### Connect to the bot using Bot Framework Emulator v4
- Launch Bot Framework Emulator
- File -> Open Bot Configuration and navigate to `jsDay` folder
- Select `jsDay.bot` file

## Deploy this bot to Azure
See [DEPLOYMENT.md][3] to learn more about deploying this bot to Azure and using the CLI tools to build the LUIS models this bot depends on.

## Further Reading
- [Bot Framework Documentation][6]
- [Bot basics][7]
- [Activity processing][8]
- [LUIS][2]
- [Prompt Types][9]
- [Azure Bot Service Introduction][10]
- [Channels and Bot Connector Service][11]
- [QnA Maker][12]

## Additional Resources

### Dependencies

- **[Restify][13]** Used to host the web service for the bot, and for making REST calls
- **[dotenv][14]** Used to manage environmental variables

### Project Structure
`index.ts` references the bot and starts a Restify server. `bot.ts` loads the main dialog router and determines how activities are processed.

### Configuring the bot

The generator created a `.env` file with the two necessary keys `botFilePath` and `botFileSecret`.  The `botFilePath` key is set to `jsDay.bot`.  All of the services and their respective configuration settings are stored in the .bot file.
  - For Azure Bot Service bots, you can find the `botFileSecret` under application settings.
  - It is recommended that you encrypt your bot file before you commit it to your souce control system and/or before you deploy your bot to Azure or similar hosting service.  There are two ways to encrypt your `jsDay.bot` file.  You can use [MSBot CLI][15] to encrypt your bot file or you can use [Bot Framework Emulator **V4**][16] to encrypt your bot file.  Both options will product a `botFileSecret` for you.  You will need to remember this in order to decrypt your .bot file.

### Running the bot

```
tsc &amp;&amp; node ./lib/index.js
```
### Developing the bot

```
tsc &amp;&amp; node ./lib/index.js
```

[1]: https://dev.botframework.com
[2]: https://luis.ai
[3]: ./deploymentScripts/DEPLOYMENT.md
[4]: https://github.com/microsoft/botframework-emulator
[5]: https://aka.ms/botframework-emulator
[6]: https://docs.botframework.com
[7]: https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-basics?view=azure-bot-service-4.0
[8]: https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-activity-processing?view=azure-bot-service-4.0
[9]: https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-prompts?view=azure-bot-service-4.0&tabs=javascript
[10]: https://docs.microsoft.com/en-us/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0
[11]: https://docs.microsoft.com/en-us/azure/bot-service/bot-concepts?view=azure-bot-service-4.0
[12]: https://qnamaker.ai
[13]: http://restify.com
[14]: https://github.com/motdotla/dotenv
[15]: https://github.com/microsoft/botbuilder-tools
[16]: https://github.com/microsoft/botframework-emulator
[17]: https://chatbase.com
[18]: https://docs.microsoft.com/en-us/azure/application-insights/app-insights-overview
