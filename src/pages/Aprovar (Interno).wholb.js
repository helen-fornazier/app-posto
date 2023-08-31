// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixWindow from 'wix-window';

import {
    utils_fmt_date,
    utils_config_items,
    utils_fmt_money_with_prefix,
    utils_show_hide_section,
    utils_onclick_logout,
    TRANSACAO_PENDENTE,
    TRANSACAO_EXPIRADA,
    SECTION_STATE_LOADING,
    SECTION_STATE_DATA,
    SECTION_STATE_NO_DATA,
} from "public/utils";

import {
    be_mod_utils_get_pending_transactions,
    be_mod_utils_get_transaction_detail,
    be_mod_utils_update_transaction,
    be_mod_utils_get_client_name,
} from "backend/be_mod_utils";


let g_transacoes_pendentes = [
    {ui: "#textClientName", type: "text", db: "client_name"},
    {ui: "#textCodBomba", type: "text", db: "cod_bomba", format: fmt_cod_bomba},
    {ui: "#textData", type: "text", db: "data", format: fmt_date_with_hour},
    {ui: "#textValorAPagar", type: "text", db: "valor_a_pagar", format: fmt_valor_a_pagar},
    {ui: "#buttonDetalhes", type: "button", onClick: onclick_ver_detalhes},
];

const g_max_hours_of_pending_transactions = 5; // time in hours


function fmt_cod_bomba(val) {
    return "Cod. Bomba: " + val;
}

function fmt_valor_a_pagar(val) {
    return "Valor a pagar: " + utils_fmt_money_with_prefix(val);
}

function fmt_date_with_hour(val) {
    let date = utils_fmt_date(val);
    let hour = val.getHours().toString().padStart(2, '0');
    let minutes = val.getMinutes().toString().padStart(2, '0');
    let seconds = val.getSeconds().toString().padStart(2, '0');

    return `${date} - ${hour}:${minutes}:${seconds}`;
}

async function onclick_ver_detalhes(event) {
    let id_transacao = event.context.itemId;
    let transacao_info = await get_transaction_selected_information(id_transacao);
    wixWindow.openLightbox("Janela Aprovar (interno)", transacao_info);
}

async function load_pending_transactions() {
    $w("#repeaterTransacoesPendentes").onItemReady( ($item, itemData, index) => {
        set_sections(SECTION_STATE_DATA);
        utils_config_items($item, g_transacoes_pendentes, itemData);
    });

    let transacoes_pendentes = await be_mod_utils_get_pending_transactions(TRANSACAO_PENDENTE);

    let now = new Date();
    transacoes_pendentes = transacoes_pendentes.filter( (transacao) => {
        let item_time = new Date(transacao.data);
        let time_diff = Math.abs((now.getTime() - item_time.getTime())/(1000*60*60));

        if (time_diff > g_max_hours_of_pending_transactions)
            be_mod_utils_update_transaction(transacao._id, TRANSACAO_EXPIRADA);
        else
            return transacao;
    });

    $w("#repeaterTransacoesPendentes").data = transacoes_pendentes;

    if (!transacoes_pendentes.length)
        set_sections(SECTION_STATE_NO_DATA);
}

async function get_transaction_selected_information(transaction_id) {
    let transacao_detail = await be_mod_utils_get_transaction_detail(transaction_id);
    let cliente_nome = await be_mod_utils_get_client_name(transacao_detail.cliente_id);
    transacao_detail.nome = cliente_nome;

    return transacao_detail;
}

function set_sections(state) {
    switch (state){
        case SECTION_STATE_LOADING:
            return utils_show_hide_section(["#sectionLoading"], ["#sectionPendingTransactions", "#sectionNoData"]);
        case SECTION_STATE_DATA:
            return utils_show_hide_section(["#sectionPendingTransactions"], ["#sectionLoading", "#sectionNoData"]);
        case SECTION_STATE_NO_DATA:
            return utils_show_hide_section(["#sectionNoData"], ["#sectionLoading", "#sectionPendingTransactions"]);
    }
}


$w.onReady(function () {
    set_sections(SECTION_STATE_LOADING);
    load_pending_transactions();
    setInterval(load_pending_transactions, 5000);
    $w("#buttonLogout").onClick(utils_onclick_logout);
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
