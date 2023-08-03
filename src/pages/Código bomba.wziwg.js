// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixStorage from 'wix-storage';

import { utils_config_items, 
    utils_fmt_only_number,
    utils_get_elements_values,
    utils_show_hide_section,
    SECTION_STATE_LOADING,
    SECTION_STATE_DATA,
    SECTION_STATE_NO_DATA,
    app_colors,
} from "public/utils";

import {
    be_mod_utils_get_bombas_code,
} from "backend/be_mod_utils";


let g_codigo_bomba = [
    {ui: "#inputCodBomba1", type: "value", format: utils_fmt_only_number, onChange: get_bomba_suggestion, onInput: onInput_go_to_next_bomba_input, onKeyPress: onKeyPress_go_to_prev_bomba_input},
    {ui: "#inputCodBomba2", type: "value", format: utils_fmt_only_number, onChange: get_bomba_suggestion, onInput: onInput_go_to_next_bomba_input, onKeyPress: onKeyPress_go_to_prev_bomba_input},
    {ui: "#inputCodBomba3", type: "value", format: utils_fmt_only_number, onChange: get_bomba_suggestion, onInput: onInput_go_to_next_bomba_input, onKeyPress: onKeyPress_go_to_prev_bomba_input},
    {ui: "#inputCodBomba4", type: "value", format: utils_fmt_only_number, onChange: get_bomba_suggestion, onInput: onInput_go_to_next_bomba_input, onKeyPress: onKeyPress_go_to_prev_bomba_input},
    {ui: "#inputCodBomba5", type: "value", format: utils_fmt_only_number, onChange: get_bomba_suggestion, onInput: onInput_go_to_next_bomba_input, onKeyPress: onKeyPress_go_to_prev_bomba_input},
];

let g_bombas_map = [
    {ui: "#textNomePosto", db: "cod_e_posto", type: "text"},
    {ui: "#textEnderecoPosto", db: "endereco_posto", type: "text"},
    {ui: "#imagePosto", db: "img_posto", type: "src"},
    {ui: "#boxItemRepeaterPosto", onClick: onclick_bomba_selected}
];

const map_bombas = {"bomba1": "#inputCodBomba1", "bomba2": "#inputCodBomba2", "bomba3": "#inputCodBomba3", "bomba4": "#inputCodBomba4", "bomba5": "#inputCodBomba5"};

const no_digits = "-----";

let all_bombas = [];


function set_sections(state) {
    switch (state){
        case SECTION_STATE_LOADING:
            return utils_show_hide_section(["#sectionLoading"], ["#sectionPostos", "#sectionNoData"]);
        case SECTION_STATE_DATA:
            return utils_show_hide_section(["#sectionPostos"], ["#sectionLoading", "#sectionNoData"]);
        case SECTION_STATE_NO_DATA:
            return utils_show_hide_section(["#sectionNoData"], ["#sectionLoading", "#sectionPostos"]);
    }
}

function onclick_bomba_selected(event) {
    let $item = $w.at(event.context)
    let cod_bomba = $item("#textNomePosto").text.split(" - ")[0];

    Array.from(cod_bomba).forEach((char, index) => {
        $w(map_bombas[`bomba${index + 1}`]).value = char;
    });

    get_bomba_suggestion(); // to update the suggestions
    save_to_local_storage(cod_bomba);
}

function filter_possible_bombas(cod_bomba) {
    if (cod_bomba == no_digits) 
        return all_bombas;
    return all_bombas.filter(bomba => {
        return !Array.from(cod_bomba).some((char, i) => {
            return char !== '-' && char !== bomba.codBomba[i];
        });
    });
}

async function get_bomba_suggestion() {
    $w("#boxItemRepeaterPosto").style.borderColor = app_colors.transparent;
    set_sections (SECTION_STATE_LOADING);

    // catch and treat 'bomba' information
    let bomba_values = utils_get_elements_values(map_bombas);
    let cod_bomba = Object.values(bomba_values).map(val => val === '' ? '-' : val).join('');

    if (cod_bomba.includes('-')){
        $w("#buttonCodBombaAvancar").disable();
    }

    $w("#repeaterBombas").onItemReady( ($item, itemData, index) => {
        set_sections (SECTION_STATE_DATA);
        utils_config_items($item, g_bombas_map, itemData);
    });

    let possible_bombas = filter_possible_bombas(cod_bomba);
    $w("#repeaterBombas").data = possible_bombas;

    if (possible_bombas.length == 1){
        $w("#boxItemRepeaterPosto").style.borderColor = app_colors.main;
        save_to_local_storage(possible_bombas[0].codBomba);
    }

    if (!possible_bombas.length){
        set_sections(SECTION_STATE_NO_DATA);
        $w("#buttonCodBombaAvancar").disable();
    }
}

function onInput_go_to_next_bomba_input(event) {
    let input = event.target.id;
    let num_bomba = input.match(/\d+/g)[0];
    num_bomba = parseInt(num_bomba);
    if (num_bomba == 5){
        $w(g_codigo_bomba[(num_bomba-1)].ui).blur();
        $w(g_codigo_bomba[(num_bomba-1)].ui).focus();
        return 
    }
    $w(g_codigo_bomba[num_bomba].ui).focus();
}

function onKeyPress_go_to_prev_bomba_input(event) {
    if (event.key == "Backspace"){
        let input = event.target.id;
        let num_bomba = input.match(/\d+/g)[0];
        num_bomba = parseInt(num_bomba);
        if (num_bomba == 1)
            return 
        $w(g_codigo_bomba[(num_bomba-2)].ui).focus();
    }
}

async function save_to_local_storage(cod_bomba) {
    let bomba = filter_possible_bombas(cod_bomba);
    wixStorage.local.setItem('bomba_information', JSON.stringify(bomba[0]));
    $w("#buttonCodBombaAvancar").enable();
}

function render_values() {
    let cod_bomba = JSON.parse(wixStorage.local.getItem('bomba_information'))?.codBomba ?? "";
    if (cod_bomba) {
        Array.from(cod_bomba).forEach((char, index) => {
            $w(map_bombas[`bomba${index + 1}`]).value = char;
        });
        $w("#buttonCodBombaAvancar").enable();
        $w("#inputCodBomba5").focus();
    }
    get_bomba_suggestion();
}

async function get_all_bombas() {
    all_bombas = await be_mod_utils_get_bombas_code();
    render_values();
}

$w.onReady(function () {
    // while the person is typing or not select a 'posto' yet, disable option 'Avancar'
    $w("#buttonCodBombaAvancar").disable();
    get_all_bombas();
    $w("#inputCodBomba1").focus();
    set_sections (SECTION_STATE_LOADING);
    utils_config_items($w, g_codigo_bomba);

    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
