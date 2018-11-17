"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MessageReceived = "MBFEvent.UserMessage";
const MessageSent = "MBFEvent.BotMessage";
const LuisIntentDialog = "MBFEvent.Intent";
const MessageSentiment = "MBFEvent.Sentiment";
const ConvertionStarted = "MBFEvent.StartTransaction";
const ConvertionEnded = "MBFEvent.EndTransactiond";
const OtherActivity = "MBFEvent.Other";
const ConversationUpdate = "MBFEvent.StartConversation";
const ConversationEnded = "MBFEvent.EndConversation";
const QnaEvent = "MBFEvent.QNAEvent";
const CustomEvent = "MBFEvent.CustomEvent";
const GoalTriggeredEvent = "MBFEvent.GoalEvent";
class BotAnalytics {
    constructor() {
        this.logIntent = (topIntent, dc, result, notHandled) => {
            if (topIntent === "")
                return;
            // Log to chatbase
            if (process.env.CHATBASE_KEY !== "") {
                this.logIntentChatbase(topIntent, dc, result, notHandled);
            }
            // Log to application insights
            if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY !== "") {
                this.logIntentAppInsights(topIntent, dc, result, notHandled);
            }
        };
        this.logIntentChatbase = (topIntent, dc, result, notHandled) => {
            if (!this.chatBase)
                return;
            //console.info(`CHATBASE:\nKey:${process.env.CHATBASE_KEY}\nChannel:${dc.context.activity.channelId}\nMessage:${dc.context.activity.text}\nIntent:${topIntent}\nConversationId:${dc.context.activity.conversation.id}\nUserId:${dc.context.activity.from.id.replace(' ', '-')}`);
            var msg = this.chatBase.newMessage(process.env.CHATBASE_KEY)
                .setPlatform(dc.context.activity.channelId)
                .setMessage(dc.context.activity.text)
                .setIntent(topIntent)
                .setCustomSessionId(dc.context.activity.conversation.id)
                .setVersion("1.0.0")
                .setUserId(this.cleanupBadCharsFromId(dc.context.activity.from.id));
            if (notHandled) {
                msg.setAsNotHandled();
            }
            else {
                msg.setAsHandled();
            }
            msg.send()
                .catch(err => console.error(err));
        };
        this.logIntentAppInsights = (topIntent, dc, result, notHandled) => {
            if (!this.appInsightsClient)
                return;
            this.appInsightsClient.trackEvent({ name: "MBFEvent.Intent",
                properties: {
                    intent: topIntent,
                    score: result.intents.topIntent ? result.intents.topIntent.score.toString() : "n/a",
                    notHandled: (!notHandled).toString(),
                    timestamp: Date.now().toString(),
                    type: dc.context.activity.type,
                    name: this.getEventName(dc.context.activity.type, dc.context.activity.replyToId != undefined),
                    channel: dc.context.activity.channelId,
                    userId: dc.context.activity.replyToId != undefined ? dc.context.activity.replyToId : dc.context.activity.from.id,
                    userName: dc.context.activity.replyToId != undefined ? dc.context.activity.replyToId : dc.context.activity.from.name,
                    text: dc.context.activity.text,
                    conversationId: dc.context.activity.conversation.id,
                }
            });
        };
        if (process.env.CHATBASE_KEY !== "") {
            this.chatBase = require('@google/chatbase');
        }
        if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY !== "") {
            let appInsights = require("applicationinsights");
            this.appInsightsClient = appInsights.defaultClient;
        }
    }
    cleanupBadCharsFromId(id) {
        return id.toLowerCase()
            .replace(' ', '')
            .replace('á', 'a')
            .replace('é', 'e')
            .replace('í', 'i')
            .replace('ó', 'o')
            .replace('ú', 'u');
    }
    getEventName(activityType, isReply) {
        switch (activityType) {
            case "message":
                return isReply ? MessageReceived : MessageSent;
            case "conversationUpdate":
                return ConversationUpdate;
            case "endOfConversation":
                return ConversationEnded;
            default:
                return OtherActivity;
        }
    }
}
exports.BotAnalytics = BotAnalytics;
//# sourceMappingURL=analytics.js.map