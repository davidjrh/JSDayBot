import { SpeakerSession } from "./types";
import { MessageFactory, Activity, CardFactory, Attachment, ActionTypes } from "botbuilder";
import { s } from "metronical.proto";

export function createCarousel(data: SpeakerSession[], topIntent: string): Partial<Activity> {
    var heroCards = [];
    for(let i = 0; i < data.length; i ++) {
        heroCards.push(createHeroCard(data[i], topIntent));
    }
    return MessageFactory.carousel(heroCards);
}

export function createHeroCard(data: SpeakerSession, topIntent: string): Attachment {
    let images: string[] = [];
    if(data.images != null && data.images.length > 0) {
        for(let i = 0; i < data.images.length; i++) {
            images.push(data.images[i].link);
        }
    }
    let title: string;
    let subtitle: string;
    let text: string = s(data.description).stripHtml().truncateWords(30).toString();
    switch(topIntent) {
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
    return CardFactory.heroCard(
        title,
        CardFactory.images(images),
        CardFactory.actions([
/*            {
                type: ActionTypes.PostBack,
                title: "Guardar",
                value: `SAVE:${data.title}`
            },*/
            {
                type: ActionTypes.ImBack,
                title: "Ver más...",
                value: `Ver más sobre "${data.title}"`
            }
        ]),
        {
            subtitle: subtitle,
            text: text
        }
    );
}
