// Guia de API: https://www.wix.com/velo/reference/api-overview/introduction
import wixLocation from 'wix-location';

$w.onReady(function () {
	$w("#buttonVoltar").onClick(()=> {wixLocation.to("/menu")});
});