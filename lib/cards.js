"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const metronical_proto_1 = require("metronical.proto");
function createCarousel(data, topIntent) {
    var heroCards = [];
    for (let i = 0; i < data.length; i++) {
        heroCards.push(createHeroCard(data[i], topIntent));
    }
    return botbuilder_1.MessageFactory.carousel(heroCards);
}
exports.createCarousel = createCarousel;
function createHeroCard(data, topIntent) {
    let images = [];
    if (data.images != null && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
            images.push(data.images[i].link);
        }
    }
    let title;
    let subtitle;
    let text = metronical_proto_1.s(data.description).stripHtml().truncateWords(30).toString();
    switch (topIntent) {
        case "Speaker":
            title = data.speakers;
            subtitle = `${data.location}, ${data.date} ${data.startTime}`;
            break;
        case "Location":
            title = `${data.location}, ${data.date} ${data.startTime}`;
            subtitle = `${data.speakers}, ${data.title}`;
            break;
        case "Topic":
            title = data.title;
            subtitle = `${data.speakers}, ${data.date} ${data.startTime}`;
            break;
        default:
            throw new Error(`No way to handle ${topIntent}`);
    }
    return botbuilder_1.CardFactory.heroCard(title, botbuilder_1.CardFactory.images(images), botbuilder_1.CardFactory.actions([
        /*            {
                        type: ActionTypes.PostBack,
                        title: "Guardar",
                        value: `SAVE:${data.title}`
                    },*/
        {
            type: botbuilder_1.ActionTypes.ImBack,
            title: "Ver más...",
            value: `Ver más sobre "${data.title}"`
        }
    ]), {
        subtitle: subtitle,
        text: text
    });
}
exports.createHeroCard = createHeroCard;
//# sourceMappingURL=cards.js.map