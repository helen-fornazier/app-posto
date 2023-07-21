// Guia de API: https://www.wix.com/velo/reference/api-overview/introduction

import { authentication } from 'wix-members';

$w.onReady(function () {
	$w("#textCriarCadastro").onClick(criarcadastro_click);
	$w("#buttonLogin").onClick(login_click);
	$w("#textCriarCadastroDesk").onClick(criarcadastro_click);
    $w("#buttonLoginDesk").onClick(login_click);
});

function criarcadastro_click(event) {
	authentication.promptLogin({mode: "signup"});
}

function login_click(even) {
	authentication.promptLogin({mode: "login"});
}