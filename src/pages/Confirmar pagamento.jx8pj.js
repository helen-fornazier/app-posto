// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world

import wixStorage from 'wix-storage';


function render_abastecer_values() {
    let abastecer_values = JSON.parse(wixStorage.local.getItem('abastecer_values'));
    $w("#textValorAbastecer").text = abastecer_values.valor;
    $w("#textTipoCombustivel").text = abastecer_values.tipo_combustivel;
}
$w.onReady(function () {
    render_abastecer_values();
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
