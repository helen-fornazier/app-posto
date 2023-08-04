// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixStorage from 'wix-storage';

import {
    utils_set_sections_history,
    utils_load_history,
    utils_get_elements_values,
    utils_fmt_saldo,
    utils_onclick_show_hide_saldo,
    utils_config_items,
    utils_g_hist_map,
    SECTION_STATE_LOADING,
    SECTION_STATE_DATA,
    SECTION_STATE_NO_DATA,
} from 'public/utils';

let g_saldo_total = JSON.parse(wixStorage.local.getItem('saldo_total'));

const g_hist_filter_transaction = ["cashback", "pagamento"];
const g_hist_filter_period = {"semana": 7, "quinzena": 15, "mes": 30, "trimestre": 90};
const g_hist_filters = {"date": "#dropdownFilterDate", "transaction": "#dropdownFilterTransaction"};
let g_history;


async function get_history() {
    g_history = await utils_load_history(false);
}

function set_filter(_filter, hist) {
    const _filter_date = _filter["date"]
    const filter_transaction = _filter["transaction"]

    $w("#repeaterHist").onItemReady( ($item, itemData, index) => {
        utils_config_items($item, utils_g_hist_map, itemData);
        utils_set_sections_history(SECTION_STATE_DATA);
    });

    if (g_hist_filter_transaction.includes(filter_transaction)){
        hist = hist.filter((value) => value.tipo.includes(filter_transaction));
    }

    if (Object.keys(g_hist_filter_period).includes(_filter_date)){
        const now = new Date();
        let period_of_time = g_hist_filter_period[_filter_date];

        hist = hist.filter((value) => {
            const item_time = new Date(value.data);
            let time_diff = Math.abs((now.getTime() - item_time.getTime())/(1000*60*60*24)); // converting miliseconds to days
            if (time_diff <= period_of_time)
                return value;
        })

    }

    $w("#repeaterHist").data = hist;

    if (!hist.length)
        utils_set_sections_history(SECTION_STATE_NO_DATA);
}

$w.onReady(function () {
    utils_fmt_saldo();
    utils_set_sections_history(SECTION_STATE_LOADING);
    get_history();
    
    $w("#buttonHideShowAmount").onClick(() => utils_onclick_show_hide_saldo(g_saldo_total));

    $w("#dropdownFilterDate").onChange((event) => {
        utils_set_sections_history(SECTION_STATE_LOADING);
        set_filter(utils_get_elements_values(g_hist_filters), g_history);
    })

    $w("#dropdownFilterTransaction").onChange((event) => {
        utils_set_sections_history(SECTION_STATE_LOADING);
        set_filter(utils_get_elements_values(g_hist_filters), g_history);
    })
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
