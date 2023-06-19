//Read Our Wix Router API here  http://wix.to/94BuAAs/wix-router.html 

import {ok, notFound, WixRouterSitemapEntry} from "wix-router"; 
import { currentMember } from 'wix-members-backend';

async function is_logged() {
    try {
        let member = await currentMember.getMember();
        if (member)
            return true;
    } catch (error) {
        //console.log(error);
    }

    return false;
}

export async function acesso_Router(request) {

    const isLoggedIn = await is_logged();

    if (isLoggedIn)
        return ok("Home");
    else
        return ok("Introdução");
}

export function acesso_SiteMap(sitemapRequest) {
    return [];
}

export function teste_Router(request) { 
    return ok("teste-page");
 }

export function teste_SiteMap(request) { 
    return [];
 }