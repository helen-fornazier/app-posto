// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/1-hello-world
import { authentication } from 'wix-members';
import wixLocation from 'wix-location'

import { 
    utils_config_items,
} from "public/utils";


let g_menu = [
    {ui: "#boxProfile", onClick: onclick_profile},
    {ui: "#boxLogout", onClick: onclick_logout},
];


function onclick_profile(event) {
    wixLocation.to("/my-account");
}

export function onclick_logout(event) {
    authentication.logout();
}

$w.onReady(function () {
    utils_config_items($w, g_menu);
    authentication.onLogout( () => {
        console.log("onLogout");
        wixLocation.to("/acesso");
    });
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
