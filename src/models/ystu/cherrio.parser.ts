import * as cheerio from 'cheerio';

export const getName = (html: string) => {
    const $ = cheerio.load(html);
    const nameString = $('.ContentHeader ul lir:nth-child(3)').text();
    const matchResult = nameString.match(
        /(?<name>.+) \((?<login>[a-z0-9\._\-]{1,40})\)( (?<group>[а-я0-9\-]{1,10}))?/i,
    );

    const { name, login, group } = matchResult?.groups || {};
    return name ? { name, login, group } : { name: nameString };
};
