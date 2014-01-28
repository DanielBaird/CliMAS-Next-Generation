
// REQUIRES jQuery (or Zepto or whatever).  At the moment this isn't handled properly when in AMD mode, so
// feel free to fix that -- yay open source!

//
// This manages menus, submenus, panels, and pages.
// Like this:
// ---.--------------------------------------------------------.----------------------.------------------------.---
//    |                                                        |                      |                        |
//    |  Selected Main Menu Item   .-----------. .---------.   |  Alt Main Menu Item  |  Third Main Menu Item  |
//    |                           /  Subitem 1  \ Subitem 2 \  |                      |                        |
// ---'--------------------------'               '-------------'----------------------'------------------------'---
//       |                                                                                                 |
//       |   Panel for Subitem 1, this is Page 1                                                           |
//       |                                                                                                 |
//       |   Each Panel can have multiple pages, one page showing at a time.  Buttons on pages switch      |
//       |   between pages.  Panel height adjusts to the height of the page.                               |
//       |                                                                                                 |
//       |   [ see page 2 ]                                                                                |
//       |                                                                                                 |
//       '-------------------------------------------------------------------------------------------------'
//
// - menus are always <ul> tags; each <li> is a menu item
// - a main menu <li> must contain an <a> tag and may also contain a <ul> submenu
// - a submenu <li> must contain an <a> tag with a data-targetpanel attribute set
// - There is always a single selected main menu item
// - A main menu item may either link to another webpage, or have a submenu
// - Selecting a main menu item will show its submenu, if it has one
// - A submenu always has a single item selected
// - Clicking an inactive submenu item will show its panel
// - Clicking a selected submenu item will toggle its panel showing <-> hiding
// - A panel initially shows its first page
// - Switching pages in a panel changes the panel height to suite it's current page
// - A panel must have the class .panel
// - If a panel contains pages, one page should have the class .current
// - A page must have the class .page
// - <button> or <a> tags in pages that have a data-targetpage attribute set will switch to the indicated page
//
//
// The HTML should look like this:
//
//  <ul class="menu">                   <!-- this is the main menu -->
//      <li class="current">            <!-- this is a main menu item, currently selected -->
//          <a>First Item</a>           <!-- the first item in the main menu -->
//          <ul>                        <!-- a submenu in the first main menu item -->
//              <li class="current">    <!-- the currently selected submenu item -->
//                                      <!-- .paneltrigger and the data-panelid attribute are required -->
//                  <a data-targetpanel="panel1">do the panel1 thing</a>
//              </li>
//              <li>...</li>            <!-- another submenu item -->
//          </ul>
//      </li>
//      <li> <a href="another_page.html">another page</a> </li>
//      <li> <a>whatever</a> </li>
//  </ul>
//
//  <div id="panel1" class="panel">
//      <div id="page1" class="page current">
//          This is the current page.
//          <button type="button" data-targetpage="page2">show page 2</button>
//      </div>
//      <div id="page2" class="page">
//          This is the other page.
//          <a data-targetpage="page1">see the first page again</a>
//      </div>
//  </div>
//

// AMD compatibility copied from https://github.com/umdjs/umd/blob/master/amdWeb.js
(function (root, factory) {
    // maybe we're in an AMD context..
    if (typeof define === 'function' && define.amd) {
        define(factory); // ...if so, register as an AMD module
    } else {
        root.MSPP = factory(); // ..if not, install as a browser global
    }
}(this, function() {

    // private funcs and vars ================================================


    // default options
    defaultOpts = {
        mainMenuClass: 'mspp-main-menu',
        clearfixClass: 'mspp-clearfix'
    }

    return {
        // public funcs ======================================================

        init: function(selector, userOpts) {
            // merge together user options and default options
            this.options = {};
            var attr;
            for (attr in defaultOpts) { this.options[attr] = defaultOpts[attr]; }
            for (attr in userOpts)    { this.options[attr] = userOpts[attr]; }

            this.$topMenu = $(selector);
            this.$topMenu.addClass(this.options.mainMenuClass);
            this.$topMenu.addClass(this.options.clearfixClass);

            console.log( this.$topMenu.html() );


        },
        // -------------------------------------------------------------------
        asdf: function() {
        }
        // -------------------------------------------------------------------
    }
}));













