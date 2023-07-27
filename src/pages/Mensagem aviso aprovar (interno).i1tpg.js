// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import wixWindowFrontend from 'wix-window-frontend';
import wixWindow from 'wix-window';

import {
    TRANSACAO_APROVADA,
    utils_config_items,
} from "public/utils";

import {
    be_mod_utils_update_transaction,
    be_mod_utils_update_client_saldo,
} from "backend/be_mod_utils";

let receivedData = wixWindowFrontend.lightbox.getContext();

let g_aprovar = [
    {ui: "#buttonAprovar", type: "button", onClick: onclick_update_transaction},
    {ui: "#buttonCancelar", type: "button", onClick: onclick_cancelar},
];


function onclick_update_transaction() {
    be_mod_utils_update_transaction(receivedData._id, TRANSACAO_APROVADA);
    be_mod_utils_update_client_saldo(receivedData.cliente_id, receivedData._id);
    wixWindow.openLightbox("Operação realizada com sucesso (interno)");
}

function onclick_cancelar() {
    wixWindow.lightbox.close();
}

$w.onReady(function () {
    utils_config_items($w, g_aprovar);
    //be_mod_utils_update_transaction(TRANSACAO_APROVADA);
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
