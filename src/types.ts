export const LINGO: string[] = ["También", "Además", "Adicionalmente", "Igualmente", "Conjuntamente"];

export interface SpeakerImage {
  type: string
, link: string
}
export interface SpeakerDetails {
  name: string
, title: string
, bio: string
, twitter: string
, linkedin: string
, github: string
, blog: string
}

export interface SpeakerSession {
    date: string
  , startTime: string
  , endTime: string
  , title: string
  , description: string
  , track: string
  , level: string
  , speakers: string
  , location: string
  , keywords: string
  , link: string
  , type: string
  , images?: SpeakerImage[]
  , speakerDetails?: SpeakerDetails
}
