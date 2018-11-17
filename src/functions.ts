import { SpeakerSession, LINGO } from "./types";

function getRandom(min, max): number {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}

export function getTime(data: SpeakerSession[]): any[] {
    let messages: any = [];
    for(let i = 0; i < data.length; i++) {
        let message = "";
        if(i !== 0) {
            message += `${LINGO[getRandom(0, LINGO.length - 1)]}, `;
        }
        message += `${data[i].speakers} está hablando sobre ${data[i].title} a las ${data[i].startTime} el ${data[i].date} en el ${data[i].location}.`;
        messages.push({ type: "message", text: message});
    }
    if (messages.length === 0)
        messages.push({ type: "message", text: "No tengo ninguna sesión en la agenda para eso. Prueba a preguntarme por el nombre del speaker o de lo que se va a hablar en la misma."});
    return messages;
}

export function getSessionDetails(data: SpeakerSession[]): any[] {
    let messages: any = [];
    for(let i = 0; i < data.length; i++) {
        let message = "";
        if(i !== 0) {
            message += `${LINGO[getRandom(0, LINGO.length - 1)]}, `;
        }
        message += `${data[i].speakers} está hablando sobre "${data[i].keywords}" a las ${data[i].startTime} el ${data[i].date} en el ${data[i].location}.\n\n`;
        message += `**Título**: ${data[i].title}\n`;        
        message += `**Nivel**: ${data[i].level}\n`;
        message += `**Track**: ${data[i].track}\n`;
        message += `**Descripción**: ${data[i].description}\n`;

        if (data[i].speakerDetails !== null) {
            message += `**Ponente**: ${data[i].speakerDetails.name}, ${data[i].speakerDetails.title}\n`;
            message += `**Biografía**: ${data[i].speakerDetails.bio}\n`;
            if (data[i].speakerDetails.twitter !== "")
                message += `**Twitter**: ${data[i].speakerDetails.twitter}\n`;
            if (data[i].speakerDetails.linkedin !== "")
                message += `**LinkedIn**: ${data[i].speakerDetails.linkedin}\n`;
            if (data[i].speakerDetails.github !== "")
                message += `**GitHub**: ${data[i].speakerDetails.github}\n`;
            if (data[i].speakerDetails.blog !== "")
                message += `**Blog**: ${data[i].speakerDetails.blog}\n`;
        }

        messages.push({ type: "message", text: message});
    }
    if (messages.length === 0)
        messages.push({ type: "message", text: "No tengo ninguna sesión en la agenda para eso. Prueba a preguntarme por el nombre del speaker o de lo que se va a hablar en la misma. También puedes preguntarme sesiones por el nombre de la sala. (i.e. sesiones sobre nodejs, sesión de david, sesiones en el aula magna). Si necesitas más detalles, escribe 'ayuda'."});
    return messages;
}

