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
    hist_filters,
    g_hist_map,
    SECTION_STATE_LOADING,
    SECTION_STATE_DATA,
    SECTION_STATE_NO_DATA,
} from 'public/utils';

let saldo_total = JSON.parse(wixStorage.local.getItem('saldo_total'));

const hist_filter_transaction = ["cashback", "pagamento"];
const hist_filter_period = {"semana": 7, "quinzena": 15, "mes": 30, "trimestre": 90};
let history;


async function get_history() {
    history = await utils_load_history(false);
}

function set_filter(_filter, hist) {
    const _filter_date = _filter["date"]
    const filter_transaction = _filter["transaction"]

    $w("#repeaterHist").onItemReady( ($item, itemData, index) => {
        utils_config_items($item, g_hist_map, itemData);
        utils_set_sections_history(SECTION_STATE_DATA);
    });

    if (hist_filter_transaction.includes(filter_transaction)){
        hist = hist.filter((value) => value.tipo.includes(filter_transaction));
    }

    if (Object.keys(hist_filter_period).includes(_filter_date)){
        const now = new Date();
        let period_of_time = hist_filter_period[_filter_date];

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
    
    $w("#buttonHideShowAmount").onClick(() => utils_onclick_show_hide_saldo(saldo_total));

    $w("#dropdownFilterDate").onChange((event) => {
        utils_set_sections_history(SECTION_STATE_LOADING);
        set_filter(utils_get_elements_values(hist_filters), history);
    })

    $w("#dropdownFilterTransaction").onChange((event) => {
        utils_set_sections_history(SECTION_STATE_LOADING);
        set_filter(utils_get_elements_values(hist_filters), history);
    })
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
