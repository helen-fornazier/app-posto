// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

import {
    utils_set_sections_history,
    utils_load_history,
    utils_get_filters_values,
    hist_filters,
    SECTION_STATE_LOADING,
} from 'public/utils';


$w.onReady(function () {
    utils_set_sections_history(SECTION_STATE_LOADING);
    utils_load_history(false, "");

    $w("#dropdownFilterDate").onChange((event) => {
        utils_set_sections_history(SECTION_STATE_LOADING);
        utils_load_history(false, utils_get_filters_values(hist_filters));
    })

    $w("#dropdownFilterTransaction").onChange((event) => {
        utils_set_sections_history(SECTION_STATE_LOADING);
        utils_load_history(false, utils_get_filters_values(hist_filters));
    })
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
