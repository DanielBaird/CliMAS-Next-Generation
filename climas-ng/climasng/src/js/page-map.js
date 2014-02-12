
// jquery plugin - hopefully you have jquery loaded already :(
// TODO shim in jquery properly
require('./menusandpanels');
// speciespanel uses jq to hook up the species panel form elements
require('./speciespanel');


$('nav > ul').mspp(); // turn on the menu/panels/pages handling
$('header').disableSelection(); // unpopular but still better
