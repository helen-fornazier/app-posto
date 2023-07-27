// Guia de API: https://www.wix.com/velo/reference/api-overview/introduction

import { authentication } from 'wix-members';
import wixStorage from 'wix-storage';
import wixLocation from 'wix-location'

import {
    utils_set_sections_history,
    utils_load_history,
    utils_get_member,
    utils_fmt_saldo,
    utils_get_saldo,
    utils_onclick_show_hide_saldo,
    SECTION_STATE_LOADING,
    TRANSACAO_PENDENTE,
    TRANSACAO_EXPIRADA,
} from 'public/utils';

import {
    be_mod_utils_cadastrar_cliente,
    be_mod_utils_check_is_funcionario,
    be_mod_utils_check_have_pending_transactions,
} from "backend/be_mod_utils";

let saldo;


async function fill_member_data() {
    let member = await utils_get_member();
	if (member.profile.profilePhoto)
		$w("#imageProfile").src = member.profile.profilePhoto.url;
    let name = member.contactDetails?.firstName ?? "";
    if (name)
	    $w("#textOlaNome").text = `Olá, ${member.contactDetails.firstName}`;
    else
        $w("#textOlaNome").text = `Olá`;
    utils_fmt_saldo();
}

async function query_database() {
    let member = (await utils_get_member());
    let is_funcionario = await be_mod_utils_check_is_funcionario(member.loginEmail);
    if (is_funcionario){
        console.log("FUNCIONARIO");
        wixLocation.to("/aprovarinterno");
    }

    let cliente_on_database = await be_mod_utils_cadastrar_cliente(member);
    be_mod_utils_check_have_pending_transactions(member._id, TRANSACAO_PENDENTE, TRANSACAO_EXPIRADA);
    /*if (!cliente_on_database)
        console.log("Cadastrado com sucesso!");
    else
        console.log("Cliente já no banco!");*/
}

async function save_saldo() {
    let saldo_total = await utils_get_saldo();
    wixStorage.local.setItem('saldo_total', JSON.stringify(saldo_total));
    saldo = JSON.parse(wixStorage.local.getItem('saldo_total'));
}


$w.onReady(function () {
    wixStorage.local.clear();
    $w("#textSaldoEmConta").text = "";
    utils_set_sections_history(SECTION_STATE_LOADING);
    query_database();
    utils_load_history(true, "");
	fill_member_data();
    save_saldo();

    $w("#buttonHideShowAmount").onClick(() => utils_onclick_show_hide_saldo(saldo));

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