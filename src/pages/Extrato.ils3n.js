// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

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


async function load_history() {
    $w("#repeaterHist").onItemReady( ($item, itemData, index) => {
        utils_config_items($item, itemData)
        utils_set_sections_history(SECTION_STATE_DATA);
    });
    
    let history = (await be_mod_utils_get_history()).reverse();
    $w("#repeaterHist").data = history;
    
    if (!history.length)
        utils_set_sections_history(SECTION_STATE_NO_DATA);
}

$w.onReady(function () {
    utils_set_sections_history(SECTION_STATE_LOADING);
    load_history();
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
