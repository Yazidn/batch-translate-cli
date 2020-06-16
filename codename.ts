import Spinner from 'https://raw.githubusercontent.com/ameerthehacker/cli-spinners/master/mod.ts';
const spinner = Spinner.getInstance();

import { parse } from "https://deno.land/std/flags/mod.ts";
const flags = parse(Deno.args);

import { jsonTree } from "https://deno.land/x/json_tree/mod.ts";
import { open } from "https://raw.githubusercontent.com/denjucks/opener/master/mod.ts";

import { key } from './env.ts';

if (flags.t || flags.translate) getSupportedLanguages(flags.t || flags.translate, key);
if (flags.h || flags.help) help();

async function getSupportedLanguages(flag: any, key: string) {
    const supportedLanguages :any[] = [];
    spinner.setSpinnerType('moon');
    spinner.start('Preparing..');
    const response = await fetch(`https://translate.yandex.net/api/v1.5/tr.json/getLangs?key=${key}&ui=en`);
    const data = await response.json();
    let [keys, values] = [Object.keys(data.langs), Object.values(data.langs)]
    keys.forEach((key, index) => supportedLanguages.push({name: values[index], code: key}))
    translate(supportedLanguages, flag, key);
}

async function translate(supportedLanguages: any, flag:any, key: string) {
    const reg_ex = /([\w])/g;
    const translations :any[] = [];
    let fmt_translations :any[] = [];
    const urls :string[] = supportedLanguages.map((language :any) => `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${key}&text=${flag}&lang=${language.code}`);
    
    spinner.setText('Translating. Hold tight, good things take time!');
    for (let index = 0; index < urls.length; index++) {
        const req = await fetch(urls[index]);
        const res = await req.json();
        
        if (flags.a || flags.all) translations.push(res);
        else if (reg_ex.exec(res.text[0])) translations.push(res);
    }

    fmt_translations = translations.map(t => {
        return {
            [t.text[0]]: t.text[0],
            [t.lang]: t.lang,
            'Powered by Yandex.Translate': '',
        };
    })

    spinner.stop();
    console.log(jsonTree(fmt_translations, false));
    
    if (!flags.b && !flags.browser) await open("http://translate.yandex.com");
}

async function help() { console.log(await Deno.readTextFile('./help')) }