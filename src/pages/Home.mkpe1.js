// Guia de API: https://www.wix.com/velo/reference/api-overview/introduction

import { authentication } from 'wix-members';
import { currentMember } from 'wix-members';

import {
    utils_set_sections_history,
    utils_config_items,
    SECTION_STATE_LOADING,
    SECTION_STATE_DATA,
    SECTION_STATE_NO_DATA,
} from 'public/utils';

import {
    be_mod_utils_get_history,
} from 'backend/be_mod_utils';

const QTDE_ITENS_RESUMO = 2; // max number of transactions on resume


async function fill_member_picture() {
	let member = await currentMember.getMember({fieldsets: [ 'FULL' ]});
	if (member.profile.profilePhoto.url)
		$w("#imageProfile").src = member.profile.profilePhoto.url;
	$w("#textOlaNome").text = `Olá, ${member.contactDetails.firstName}`;
}

async function load_resumed_history() {
    $w("#repeaterHist").onItemReady( ($item, itemData, index) => {
        utils_config_items($item, itemData)
        utils_set_sections_history(SECTION_STATE_DATA);
    });
    
    let history = (await be_mod_utils_get_history()).reverse();
    history = history.length >= QTDE_ITENS_RESUMO ? history.slice(0 , QTDE_ITENS_RESUMO) : history; // limits items on resume
    $w("#repeaterHist").data = history; 
    
    if (!history.length)
        utils_set_sections_history(SECTION_STATE_NO_DATA);
}

$w.onReady(function () {
    utils_set_sections_history(SECTION_STATE_LOADING);
    load_resumed_history();
	fill_member_picture();

    // Escreva seu código JavaScript aqui usando o API de framework do Velo

    // Exiba hello world:
    // console.log("Hello world!");

    // Chame funções em elementos da página, por exemplo:
    // $w("#button1").label = "Clique aqui!";

    // Clique em "Executar" ou visualize seu site para executar seu código

});

/**
*	Adds an event handler that runs when the element is clicked.
	[Read more](https://www.wix.com/corvid/reference/$w.ClickableMixin.html#onClick)
*	 @param {$w.MouseEvent} event
*/
export function button1_click(event) {
    authentication.logout();
}