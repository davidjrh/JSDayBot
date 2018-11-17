import * as fs from "fs";
import { load as CheerioLoad } from "cheerio";
import { SpeakerSession, SpeakerImage, SpeakerDetails } from "./types";

const file: string = fs.readFileSync((process.env.NODE_ENV && process.env.NODE_ENV.toString() === "production" ? ".": "") + "./data/jsDay2018.schedule.xml", "utf-8");
const xml: CheerioStatic = CheerioLoad(file);
const fileSpeakers: string = fs.readFileSync((process.env.NODE_ENV && process.env.NODE_ENV.toString() === "production" ? ".": "") + "./data/jsDay2018.speakers.xml", "utf-8");
const xmlSpeakers: CheerioStatic = CheerioLoad(fileSpeakers);


export function getData(entities: any): SpeakerSession[] {
    if(entities != null) {
        let subject = entities["Subject"];
        let location = entities["Location"];
        let person = entities["Person"];
        let level = entities["Level"];
        let track = entities["Track"];
        let sessionTitle = entities["SessionTitle"];
        if (sessionTitle != null) {                    
            return getSessionByTitle((sessionTitle instanceof Array) ? sessionTitle[0] : sessionTitle);
        }        
        if(person != null) {
            return getSessionByPerson((person instanceof Array) ? person[0] : person);
        }
        if(subject != null) {
            return getSessionBySubject((subject instanceof Array) ? subject[0] : subject);
        }
        if(location != null) {
            return getSessionByLocation((location instanceof Array) ? location[0] : location);
        }
        if(level != null) {
            return getSessionByLevel((level instanceof Array) ? level[0] : level);
        }
        if(track != null) {
            return getSessionByTrack((track instanceof Array) ? track[0] : track);
        }


    }
    return [];
}

export function getExact(t: string): SpeakerSession {
    var e = writeEvent(getEventNodes("title", t));
    return (e.length > 0) ? e[0] : null;
}

function getSessionBySubject(subject: string): SpeakerSession[] {
    let eventsByKeyword: CheerioElement[], eventsByTitle: CheerioElement[];
    eventsByKeyword = getEventNodes("keywords", subject);
    eventsByTitle = getEventNodes("title", subject);
    for (var i = 0; i< eventsByTitle.length; i++) {
        var found = false;
        let ele1 = xml(eventsByTitle[i]);
        for (var j=0; j< eventsByKeyword.length; j++) {
            var ele2 = xml(eventsByKeyword[j]);
            if (ele1.find("title").text() == ele2.find("title").text()) {
                found = true;
                break;
            }
        }
        if (!found)
            eventsByKeyword.push(eventsByTitle[i]);
    }
    return writeEvent(eventsByKeyword);
}

function getSessionByTitle(title: string, data?: SpeakerSession): SpeakerSession[] {
    title = title.toString().split('"').join('');
    return writeEvent(getEventNodes("title", title));
}

function getSessionByLocation(location: string, data?: SpeakerSession): SpeakerSession[] {
    return writeEvent(getEventNodes("location", location));
}

function getSessionByPerson(person: string, data?: SpeakerSession): SpeakerSession[] {
    return writeEvent(getEventNodes("speakers", person));
}

function getSessionByLevel(level: string, data?: SpeakerSession): SpeakerSession[] {
    return writeEvent(getEventNodes("level", level));
}

function getSessionByTrack(track: string, data?: SpeakerSession): SpeakerSession[] {
    return writeEvent(getEventNodes("trackname", track));
}

function getEventNodes(s: string, t: string): CheerioElement[] {
    var events: CheerioElement[] = [];
    xml(s).each((idx: number, elem: CheerioElement) => {
        if(xml(elem.parent).find("speakers").text() !== "" && xml(elem).text().toLowerCase().indexOf(t.toString().toLowerCase()) > -1) {
            events.push(elem.parent);
        }
    });
    return events;
}

function writeEvent(events: Array<CheerioElement>): SpeakerSession[] {
    var results: SpeakerSession[] = [];
    for(let i = 0; i < events.length; i++) {
        let elem = xml(events[i]);
        let r: SpeakerSession = {
              date: elem.parent().attr("date")
            , startTime: elem.attr("start-time")
            , endTime: elem.attr("end-time")
            , title: elem.find("title").text()
            , description: elem.find("description").text()
            , track: elem.find("trackname").text()
            , level: elem.find("level").text()
            , speakers: elem.find("speakers").text()
            , location: elem.find("location").text()
            , keywords: elem.find("keywords").text()
            , link: elem.find("page").text()
            , type: elem.attr("type")
        };
        let img = elem.find("photo");
        if(img != null) {
            let imgs: SpeakerImage[] = [];
            img.each((idx: number, el: CheerioElement) => {
                imgs.push({
                      type: xml(el).attr("type")
                    , link: xml(el).text()
                });
            });
            r.images = imgs;
        }

        let speaker = xmlSpeakers("speaker").filter((i:number, el:CheerioElement) => { 
            return xmlSpeakers(el).find("name").text() === elem.find("speakers").text();
        }).first();        
        if (speaker != null) {
            r.speakerDetails = {
                name: speaker.find("name").text()
                , title: speaker.find("title").text()
                , bio: speaker.find("bio").text()
                , twitter: speaker.find("twitter").text()
                , linkedin: speaker.find("linkedin").text()
                , github: speaker.find("github").text()
                , blog: speaker.find("blog").text()
            };
        }        
        results.push(r);
    }
    return results;
}
