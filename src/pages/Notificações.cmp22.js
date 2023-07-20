// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixLocation from 'wix-location'

import {
    utils_show_hide_section,
    SECTION_STATE_LOADING,
    SECTION_STATE_DATA,
    SECTION_STATE_NO_DATA,
} from 'public/utils';


function set_sections(state) {
    switch (state) {
        case SECTION_STATE_LOADING:
            return utils_show_hide_section(["#sectionLoading"], ["#sectionHeaderNotificacoes, #sectionBorderNotificacoes", "#sectionNotificacoes", "#sectionNoData"]);
        case SECTION_STATE_DATA:
            return utils_show_hide_section(["#sectionHeaderNotificacoes, #sectionBorderNotificacoes", "#sectionNotificacoes"], ["#sectionLoading, #sectionNoData"]);
        case SECTION_STATE_NO_DATA:
            return utils_show_hide_section(["#sectionBorderNotificacoes", "#sectionHeaderNotificacoes", "#sectionNoData"], ["#sectionNotificacoes, #sectionLoading"]);
    }
}


$w.onReady(function () {
    set_sections(SECTION_STATE_LOADING);
    wixLocation.to("/acesso");
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
