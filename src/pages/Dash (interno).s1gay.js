// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world


import {
    utils_config_items,
    utils_fmt_money_with_prefix,
} from "public/utils";

import {
    be_mod_utils_get_dashboard_data,
} from "backend/be_mod_utils";


let g_dashboard_items = [
    {ui: "#totalDeClientes", type: "text", db: "clients_total"},
    {ui: "#mediaDeAbastecimento", type: "text", db: "average_abastecimento", format: utils_fmt_money_with_prefix},
    {ui: "#cashbackUsado", type: "text", db: "cashback_used", format: utils_fmt_money_with_prefix},
    {ui: "#cashbackASerUsado", type: "text", db: "cashback_to_be_used", format: utils_fmt_money_with_prefix},
    {ui: "#totalAbastecidoPeloApp", type: "text", db: "total_abastecido_app", format: utils_fmt_money_with_prefix},
    {ui: "#totalPago", type: "text", db: "total_paid", format: utils_fmt_money_with_prefix},
];


async function get_dashboard_information() {
    utils_config_items($w, g_dashboard_items, await be_mod_utils_get_dashboard_data());
}

$w.onReady(function () {
    get_dashboard_information();
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
