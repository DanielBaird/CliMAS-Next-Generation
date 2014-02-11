
require('./menusandpanels'); // jquery plugin - hopefully you have jquery loaded already :( TODO shim in jquery properly
require('./speciespanel');

$('nav > ul').mspp(); // turn on the menu/submenus/panels/pages handling via plugin
$('header').disableSelection();
