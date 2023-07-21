// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixStorage from 'wix-storage';

import {
    utils_set_sections_history,
    utils_load_history,
    utils_get_elements_values,
    utils_fmt_saldo,
    utils_onclick_show_hide_saldo,
    hist_filters,
    SECTION_STATE_LOADING,
} from 'public/utils';

let saldo_total = JSON.parse(wixStorage.local.getItem('saldo_total'));


$w.onReady(function () {
    utils_fmt_saldo();
    utils_set_sections_history(SECTION_STATE_LOADING);
    utils_load_history(false, "");
    
    $w("#buttonHideShowAmount").onClick(() => utils_onclick_show_hide_saldo(saldo_total));

    $w("#dropdownFilterDate").onChange((event) => {
        utils_set_sections_history(SECTION_STATE_LOADING);
        utils_load_history(false, utils_get_elements_values(hist_filters));
    })

    $w("#dropdownFilterTransaction").onChange((event) => {
        utils_set_sections_history(SECTION_STATE_LOADING);
        utils_load_history(false, utils_get_elements_values(hist_filters));
    })
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
