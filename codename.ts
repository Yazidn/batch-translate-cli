import { parse } from "https://deno.land/std/flags/mod.ts";
const flags = parse(Deno.args);
const key = 'trnsl.1.1.20200413T163250Z.6743358c267906df.310e0f5e8f0e75528cdf34c2a7040d6a4bcbec64';

if (flags.t || flags.translate) getSupportedLanguages(flags.t || flags.translate, key);
if (flags.h || flags.help) help();

async function getSupportedLanguages(flag: any, key: string) {
    const supportedLanguages :any[] = [];
    console.log('Preparing..');
    const response = await fetch(`https://translate.yandex.net/api/v1.5/tr.json/getLangs?key=${key}&ui=en`);
    const data = await response.json();
    let [keys, values] = [Object.keys(data.langs), Object.values(data.langs)]
    keys.forEach((key, index) => supportedLanguages.push({name: values[index], code: key}))
    translate(supportedLanguages, flag, key);
}

async function translate(supportedLanguages: any, flag:any, key: string) {
    const urls :string[] = supportedLanguages.map((language :any) => `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${key}&text=${flag}&lang=${language.code}`);
    console.log('Translating..');

    Promise.all(urls.map(u =>fetch(u))).then(responses =>
        Promise.all(responses.map(res => res.json()))
    ).then(data => {
        console.table(data);
        console.log('Success!');
    })
}

async function help() { console.log(await Deno.readTextFile('./help')) }