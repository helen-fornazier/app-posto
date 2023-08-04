// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

import wixStorage from 'wix-storage';

import { utils_config_items, 
         utils_fmt_money_with_prefix,
         utils_get_elements_values,
         utils_fmt_strip_non_digits,
} from "public/utils";

let g_abastecer = [
    {ui: "#inputAbastecerValue", type: "value", format: utils_fmt_money_with_prefix, onChange:save_values_abastecer, onInput: onInput_value},
    {ui: "#buttonAbastecerValueOp1", onClick: onclick_value_op, raw: 5000},
    {ui: "#buttonAbastecerValueOp2", onClick: onclick_value_op, raw: 10000},
    {ui: "#buttonAbastecerValueOp3", onClick: onclick_value_op, raw: 15000},
    {ui: "#dropdownAbastecerTipoCombustivel", onChange: save_values_abastecer}
];

let g_map_abastecer = {"tipo_combustivel": "#dropdownAbastecerTipoCombustivel", "valor": "#inputAbastecerValue"};
let g_abastecer_values = {};

const g_min_value_abastecimento = 500; // value in cents


function onclick_value_op(event, val) {
    $w("#inputAbastecerValue").value = utils_fmt_money_with_prefix(val);
    // function also add here because 'onChange' function is not applied for assignments using '.value'
    save_values_abastecer();
}

function onInput_value(event) {
    $w("#buttonAbastecerAvancar").disable();
}

function save_values_abastecer() {
    g_abastecer_values = utils_get_elements_values(g_map_abastecer);
    let valor = parseInt(utils_fmt_strip_non_digits(g_abastecer_values.valor));
    if (valor >= g_min_value_abastecimento){
        $w("#buttonAbastecerAvancar").enable();
        $w("#textAviso").hide();
        wixStorage.local.setItem('abastecer_values', JSON.stringify(g_abastecer_values));
    }
    else {
        $w("#textAviso").show();
        $w("#buttonAbastecerAvancar").disable();
    }
}

function render_values() {
    if (JSON.parse(wixStorage.local.getItem('abastecer_values'))) {
        g_abastecer_values = JSON.parse(wixStorage.local.getItem('abastecer_values'));
        $w("#inputAbastecerValue").value = g_abastecer_values.valor;
        $w("#dropdownAbastecerTipoCombustivel").value = g_abastecer_values.tipo_combustivel;
        $w("#buttonAbastecerAvancar").enable();
    }
}

$w.onReady(function () {
    utils_config_items($w, g_abastecer);
    render_values();

    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
