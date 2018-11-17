/* --- BOT SETTINGS --- */

var botSettings = {
    chatTitle: "JS Day Canarias",
    chatIconColor: "#efb300",
    botIconUrl: "https://bot-framework.azureedge.net/bot-icons-v1/jsday-bot_9Ow6R5FvY9UEGLW5JM5aY5jq41y5LDAla3rZ33qExwBjgB4d.png",
    locale: "es-ES",
    directLine: { secret: '<Directline secret>' },   // DEV bot
    bot: { id: 'JS Day Canarias' },
    showBrandMessage: true,
    brandMessage: 'Powered by Intelequia',
    windowStatus: { visible: true }
}

/* --- /BOT SETTINGS --- */

function addcss(url) {
	var head = document.getElementsByTagName('head')[0];
	var linkElement = document.createElement('link');
	linkElement.setAttribute('rel', 'stylesheet');
	linkElement.setAttribute('type', 'text/css');
	linkElement.setAttribute('href', url);

	head.appendChild(linkElement);
}

function addscript(url){
	var head = document.getElementsByTagName('head')[0];
	var scriptElement = document.createElement('script');
	scriptElement.setAttribute('src', url);

	head.appendChild(scriptElement);
	return scriptElement;
}

addcss('/webchat/botchat-darkyellow.css');
var scriptElement = addscript('/webchat/botchat.js');

scriptElement.onload = function () {
    var scripts = document.getElementsByTagName('script');
    var index = scripts.length - 1;
    var myScript = [].slice.call(scripts).find((element) => element.outerHTML.includes("botchat-launcher.js"));
    var queryString = myScript.src.replace(/^[^\?]+\??/, '');
    var jsParams = new URLSearchParams(queryString);

    if (jsParams.has('locale')) {
        botSettings.locale = jsParams.get('locale');
    }
    if (jsParams.has('visible')) {
        botSettings.windowStatus.visible = jsParams.get('visible');
    }

    BotChat.App(botSettings, document.getElementById("chat-bot"));
};