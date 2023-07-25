// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixLocation from 'wix-location'
import wixStorage from 'wix-storage';

import {
    utils_show_hide_section,
    utils_fmt_strip_non_digits,
    utils_fmt_money_with_prefix,
    TRANSACAO_APROVADA,
    TRANSACAO_RECUSADA,
    TRANSACAO_EXPIRADA,
    SECTION_STATE_LOADING,
    SECTION_STATE_DATA,
    SECTION_STATE_NO_DATA,
} from "public/utils";

import {
    be_mod_utils_get_transaction_detail,
    be_mod_utils_update_transaction,
} from "backend/be_mod_utils";

const transaction_id = wixLocation.query.id;

let wait_change;

let abastecer_values = JSON.parse(wixStorage.local.getItem('abastecer_values'));
let valor_abastecimento = parseInt(utils_fmt_strip_non_digits(abastecer_values.valor));

const time_limit = 120000; // Limite de tempo em milissegundos (2 minutos)


function set_sections(state) {
    switch (state){
        case SECTION_STATE_LOADING:
            return utils_show_hide_section(["#sectionAguardando"], ["#sectionConcluido", "#sectionRecusado"]);
        case SECTION_STATE_DATA:
            return utils_show_hide_section(["#sectionConcluido"], ["#sectionAguardando", "#sectionRecusado"]);
        case SECTION_STATE_NO_DATA:
            return utils_show_hide_section(["#sectionRecusado"], ["#sectionAguardando", "#sectionConcluido"]);
    }
}

function stop_wait_change() {
    clearInterval(wait_change);
}

function approve_wait() {
    const update_interval = 500; // Intervalo de tempo em milissegundos para realizar as consultas
    let elapsed_time = 0; // Tempo total transcorrido
    console.log("AGUARDANDO APROVAÇÃO...");

    wait_change = setInterval(() => {
        be_mod_utils_get_transaction_detail(transaction_id)
        .then((result) => {
            if (result.situacao == TRANSACAO_APROVADA){
                console.log("TRANSACAO APROVADA");
                set_sections(SECTION_STATE_DATA);
                stop_wait_change();
            } else if (result.situacao == TRANSACAO_RECUSADA){
                console.log("TRANSACAO RECUSADA");
                set_sections(SECTION_STATE_NO_DATA);
                stop_wait_change();
            }
        });
        elapsed_time += update_interval;
        if (elapsed_time >= time_limit) {
            console.log("TRANSACAO EXPIRADA");
            be_mod_utils_update_transaction(transaction_id, TRANSACAO_EXPIRADA);
            set_sections(SECTION_STATE_NO_DATA);
            stop_wait_change();
        }
    }, update_interval);
}
  

$w.onReady(function () {
    approve_wait();
    set_sections(SECTION_STATE_LOADING);
    $w("#textWaitApproveDescription").text = "​Aguardando autorização do abastecimento no posto no valor de " + utils_fmt_money_with_prefix(valor_abastecimento)
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
