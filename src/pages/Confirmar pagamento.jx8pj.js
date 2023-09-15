// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

import wixStorage from 'wix-storage';
import wixLocation from 'wix-location'

import {
    utils_fmt_strip_non_digits,
    utils_fmt_money_with_prefix,
    utils_config_items,
    utils_show_hide_section,
    utils_get_saldo,
    utils_get_member,
    APP_COLORS,
    SECTION_STATE_LOADING,
    SECTION_STATE_DATA,
    TRANSACAO_PENDENTE,
    POSTO_SANTA_TEREZA_ID,
} from "public/utils";

import {
    be_mod_utils_cadastrar_transacao,
    be_mod_utils_get_posto_pct_cashback,
} from "backend/be_mod_utils";

let g_porcentagem_cashback;

let g_saldo_total;

let g_abastecer_values = JSON.parse(wixStorage.local.getItem('abastecer_values'));
let g_valor_abastecimento = parseInt(utils_fmt_strip_non_digits(g_abastecer_values.valor));
let g_tipo_combustivel = g_abastecer_values.tipo_combustivel;

let g_bomba_information = JSON.parse(wixStorage.local.getItem('bomba_information'));
let g_posto_id = g_bomba_information?.postoId ?? POSTO_SANTA_TEREZA_ID;
let g_cod_bomba = g_bomba_information?.codBomba ?? "-";

let g_tipo_de_pagamento;

let g_confirmar_pagamento = [
    {ui: "#textValorAbastecer", type: "text", raw: utils_fmt_money_with_prefix(g_valor_abastecimento)},
    {ui: "#textTipoCombustivel", type: "text", raw: g_tipo_combustivel},
    {ui: "#textValorTotalResume", type: "text", raw: utils_fmt_money_with_prefix(g_valor_abastecimento)},
    {ui: "#boxUsarSaldo", onClick: onclick_usar_saldo},
    {ui: "#boxCashback", onClick: onclick_acumular_cashback},
    {ui: "#buttonConfirmarPagamentoAvancar", onClick: onclick_confirmar_pagamento}
];


async function set_saldo() {
    g_saldo_total = await utils_get_saldo()
    let saldo = g_saldo_total;
    if (saldo > g_valor_abastecimento)
        saldo = g_valor_abastecimento;
    $w("#textUsarSaldoDescontar").text = "Descontar " + utils_fmt_money_with_prefix(saldo);
    g_porcentagem_cashback = await be_mod_utils_get_posto_pct_cashback(g_posto_id);
    $w("#textCashback").text = "Ganhar " + utils_fmt_money_with_prefix(calculate_caskback_value());
    set_resume_values(true);
}

function calculate_caskback_value() {
    let cashback = g_valor_abastecimento * g_porcentagem_cashback;
    return Math.trunc(cashback); // Ignore less than 1 cent
}

async function onclick_usar_saldo() {
    set_resume_values(false, await check_saldo());
}

function onclick_acumular_cashback() { 
    set_resume_values(true);
}

function set_resume_values(is_cashback, value) {
    if (is_cashback) {
        $w("#boxUsarSaldo").style.borderColor = APP_COLORS.blue_gray_opacity;
        $w("#boxUsarSaldo").style.borderWidth = "1px";
        $w("#boxCashback").style.borderColor = APP_COLORS.main;
        $w("#boxCashback").style.borderWidth = "4px";
        $w("#textCashbackResume").text = "+ " + utils_fmt_money_with_prefix(calculate_caskback_value());
        $w("#textUsarSaldoResume").text = "- " + utils_fmt_money_with_prefix(0);
        $w("#textValorAPagar").text = utils_fmt_money_with_prefix(g_valor_abastecimento);
        g_tipo_de_pagamento = "cashback";
    } else {
        $w("#boxUsarSaldo").style.borderColor = APP_COLORS.main;
        $w("#boxUsarSaldo").style.borderWidth = "4px";
        $w("#boxCashback").style.borderColor = APP_COLORS.blue_gray_opacity;
        $w("#boxCashback").style.borderWidth = "1px";
        $w("#textCashbackResume").text = "+ " + utils_fmt_money_with_prefix(0);
        $w("#textUsarSaldoResume").text = "- " + utils_fmt_money_with_prefix(value);
        let valor_a_pagar = g_valor_abastecimento + value;
        $w("#textValorAPagar").text = utils_fmt_money_with_prefix(valor_a_pagar);
        g_tipo_de_pagamento = "pagamento_saldo";
    }
    $w("#buttonConfirmarPagamentoAvancar").enable();
}

function set_sections(state) {
    switch (state){
        case SECTION_STATE_LOADING:
            return utils_show_hide_section(["#sectionLoading"], ["#sectionSelectPagamentoOption", "#sectionPagamentoResume", "#sectionValorAPagar"]);
        case SECTION_STATE_DATA:
            return utils_show_hide_section(["#sectionSelectPagamentoOption", "#sectionPagamentoResume", "#sectionValorAPagar"], ["#sectionLoading"]);
    }
}

async function check_saldo() {
    let saldo = g_saldo_total;
    if (saldo <= g_valor_abastecimento)
        return (saldo * -1);
    return g_valor_abastecimento * -1;
}

async function onclick_confirmar_pagamento() {
    let member = await utils_get_member();
    let transacao = {
        clienteId: member._id,
        postoId: g_posto_id,
        tipo: g_tipo_de_pagamento,
        tipoCombustivel: g_tipo_combustivel,
        valor: g_valor_abastecimento,
        valorTipo: g_tipo_de_pagamento == "cashback" ? calculate_caskback_value() : (await check_saldo()),
        situacao: TRANSACAO_PENDENTE,
        codBomba: g_cod_bomba,
    };

    be_mod_utils_cadastrar_transacao(transacao).then((transacao_id) => {
        const urlComId = `/aguardando?id=${transacao_id}`;
        set_sections(SECTION_STATE_LOADING);
        wixLocation.to(urlComId);
    });
}

$w.onReady(function () {
    set_sections(SECTION_STATE_DATA);
    utils_config_items($w, g_confirmar_pagamento);
    set_saldo();
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
