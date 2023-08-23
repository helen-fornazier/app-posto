// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world


import {
    utils_config_items,
    utils_fmt_money_with_prefix,
} from "public/utils";

import {
    be_mod_utils_get_dashboard_data,
    be_mod_utils_graph_movimento,
} from "backend/be_mod_utils";


let g_dashboard_items = [
    {ui: "#totalDeClientes", type: "text", db: "clients_total"},
    {ui: "#mediaDeAbastecimento", type: "text", db: "average_abastecimento", format: utils_fmt_money_with_prefix},
    {ui: "#cashbackUsado", type: "text", db: "cashback_used", format: utils_fmt_money_with_prefix},
    {ui: "#cashbackASerUsado", type: "text", db: "cashback_to_be_used", format: utils_fmt_money_with_prefix},
    {ui: "#totalAbastecidoPeloApp", type: "text", db: "total_abastecido_app", format: utils_fmt_money_with_prefix},
    {ui: "#totalPago", type: "text", db: "total_paid", format: utils_fmt_money_with_prefix},
];

let g_dashboard_infos = [
    {ui: "#vectorImageInfoTotalClientes", target: "#boxInfoTotalClientes", onMouseIn: onMouseIn_show_info, onMouseOut: onMouseOut_hide_info},
    {ui: "#vectorImageInfoMediaAbast", target: "#boxinfoMediaAbastec", onMouseIn: onMouseIn_show_info, onMouseOut: onMouseOut_hide_info},
    {ui: "#vectorImageInfoGraphMovimento", target: "#boxInfoGraphMoviment", onMouseIn: onMouseIn_show_info, onMouseOut: onMouseOut_hide_info},
    {ui: "#vectorImageInfoOperacoesApp", target: "#boxInfoOperacoesApp", onMouseIn: onMouseIn_show_info, onMouseOut: onMouseOut_hide_info},
    {ui: "#vectorImageInfoCashback", target: "#boxInfoCashback", onMouseIn: onMouseIn_show_info, onMouseOut: onMouseOut_hide_info},
]

let fadeOptions = {
    "duration":   300,
};


async function get_dashboard_information() {
    utils_config_items($w, g_dashboard_items, await be_mod_utils_get_dashboard_data());
    let data = await be_mod_utils_graph_movimento();
    const serie = [{
        name: "Movimento",
        data: data,
    }];
    $w("#htmlMovimentoGrafico").postMessage(serie);
}

function onMouseIn_show_info(event, target) {
    $w(target).show("fade", fadeOptions);
}

function onMouseOut_hide_info(event, target) {
    $w(target).hide();
}

$w.onReady(function () {
    utils_config_items($w, g_dashboard_infos);
    get_dashboard_information();
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
