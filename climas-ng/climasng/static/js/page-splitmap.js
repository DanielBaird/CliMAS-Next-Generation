(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

require('./mapview/main');
require('./menusandpanels');

$(function() {
    // $('header').disableSelection(); // unpopular but still better
    $('nav > ul').mspp({});
});

},{"./mapview/main":2,"./menusandpanels":6}],2:[function(require,module,exports){
(function() {
  var AppView;

  if (!window.console) {
    window.console = {
      log: function() {
        return {};
      }
    };
  }

  AppView = require('./views/app');

  $(function() {
    var appview;
    appview = new AppView();
    return appview.render();
  });

}).call(this);

},{"./views/app":5}],3:[function(require,module,exports){
(function() {
  var MapLayer;

  MapLayer = Backbone.Model.extend({
    constructor: function(shortName, longName, path) {
      this.shortName = shortName;
      this.longName = longName;
      this.path = path;
      return null;
    }
  });

  module.exports = MapLayer;

}).call(this);

},{}],4:[function(require,module,exports){
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fn, scope) {
      var i, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(__indexOf.call(this, i) >= 0 ? fn.call(scope, this[i], i, this) : void 0);
      }
      return _results;
    };
  }

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
      var i, _i, _ref;
      for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (this[i] === needle) {
          return i;
        }
      }
      return -1;
    };
  }

}).call(this);

},{}],5:[function(require,module,exports){
(function() {
  var AppView, MapLayer, debug,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  MapLayer = require('../models/maplayer');

  require('../util/shims');


  /* jshint -W093 */

  debug = function(itemToLog, itemLevel) {
    var levels, messageNum, threshold, thresholdNum;
    levels = ['verydebug', 'debug', 'message', 'warning'];
    threshold = 'verydebug';
    if (!itemLevel) {
      itemLevel = 'debug';
    }
    thresholdNum = levels.indexOf(threshold);
    messageNum = levels.indexOf(itemLevel);
    if (thresholdNum > messageNum) {
      return;
    }
    if (itemToLog + '' === itemToLog) {
      return console.log("[" + itemLevel + "] " + itemToLog);
    } else {
      return console.log(itemToLog);
    }
  };

  AppView = Backbone.View.extend({
    tagName: 'div',
    className: 'splitmap showforms',
    id: 'splitmap',
    speciesDataUrl: "" + location.protocol + "//" + location.host + "/speciesdata",
    rasterApiUrl: "" + location.protocol + "//localhost:10600/api/raster/1/wms_data_url",
    trackSplitter: false,
    trackPeriod: 100,
    events: {
      'click .btn-change': 'toggleForms',
      'click .btn-compare': 'toggleSplitter',
      'click .btn-copy-ltr': 'copyMapLeftToRight',
      'click .btn-copy-rtl': 'copyMapRightToLeft',
      'leftmapupdate': 'leftSideUpdate',
      'rightmapupdate': 'rightSideUpdate',
      'change select.left': 'leftSideUpdate',
      'change select.right': 'rightSideUpdate'
    },
    tick: function() {
      if (false) {
        debug(this.map.getPixelOrigin());
      }
      return setTimeout(this.tick, 2000);
    },
    initialize: function() {
      debug('AppView.initialize');
      _.bindAll.apply(_, [this].concat(_.functions(this)));
      return this.speciesInfoFetchProcess = this.fetchSpeciesInfo();
    },
    render: function() {
      debug('AppView.render');
      this.$el.append(AppView.templates.layout({
        leftTag: AppView.templates.leftTag(),
        rightTag: AppView.templates.rightTag(),
        leftForm: AppView.templates.leftForm(),
        rightForm: AppView.templates.rightForm()
      }));
      $('#contentwrap').append(this.$el);
      this.map = L.map('map', {
        center: [-20, 136],
        zoom: 5
      });
      this.map.on('move', this.resizeThings);
      L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
        subdomains: '1234',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>,\ntiles &copy; <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>'
      }).addTo(this.map);
      this.leftForm = this.$('.left.form');
      this.buildLeftForm();
      this.rightForm = this.$('.right.form');
      this.buildRightForm();
      this.leftTag = this.$('.left.tag');
      this.rightTag = this.$('.right.tag');
      this.splitLine = this.$('.splitline');
      return this.splitThumb = this.$('.splitthumb');
    },
    copyMapLeftToRight: function() {
      debug('AppView.copyMapLeftToRight');
      if (!this.leftInfo) {
        return;
      }
      this.$('#rightmapspp').val(this.leftInfo.speciesName);
      this.$('#rightmapyear').val(this.leftInfo.year);
      this.$('#rightmapscenario').val(this.leftInfo.scenario);
      this.$('#rightmapgcm').val(this.leftInfo.gcm);
      return this.rightSideUpdate();
    },
    copyMapRightToLeft: function() {
      debug('AppView.copyMapRightToLeft');
      if (!this.rightInfo) {
        return;
      }
      this.$('#leftmapspp').val(this.rightInfo.speciesName);
      this.$('#leftmapyear').val(this.rightInfo.year);
      this.$('#leftmapscenario').val(this.rightInfo.scenario);
      this.$('#leftmapgcm').val(this.rightInfo.gcm);
      return this.leftSideUpdate();
    },
    leftSideUpdate: function() {
      var newLeftInfo, sppName;
      debug('AppView.leftSideUpdate');
      sppName = this.$('#leftmapspp').val();
      if (__indexOf.call(this.speciesSciNameList, sppName) >= 0) {
        this.$('.btn-copy-rtl').prop('disabled', false);
      } else {
        this.$('.btn-copy-rtl').prop('disabled', true);
        return false;
      }
      newLeftInfo = {
        speciesName: sppName,
        year: this.$('#leftmapyear').val(),
        scenario: this.$('#leftmapscenario').val(),
        gcm: this.$('#leftmapgcm').val()
      };
      if (this.leftInfo && _.isEqual(newLeftInfo, this.leftInfo)) {
        return false;
      }
      if (this.leftInfo && newLeftInfo.speciesName === this.leftInfo.speciesName && newLeftInfo.year === this.leftInfo.year && newLeftInfo.year === 'baseline') {
        return false;
      }
      this.leftInfo = newLeftInfo;
      this.addMapLayer('left');
      return this.addMapTag('left');
    },
    rightSideUpdate: function() {
      var newRightInfo, sppName;
      debug('AppView.rightSideUpdate');
      sppName = this.$('#rightmapspp').val();
      if (__indexOf.call(this.speciesSciNameList, sppName) >= 0) {
        this.$('.btn-copy-ltr').prop('disabled', false);
      } else {
        this.$('.btn-copy-ltr').prop('disabled', true);
        return false;
      }
      newRightInfo = {
        speciesName: sppName,
        year: this.$('#rightmapyear').val(),
        scenario: this.$('#rightmapscenario').val(),
        gcm: this.$('#rightmapgcm').val()
      };
      if (this.rightInfo && _.isEqual(newRightInfo, this.rightInfo)) {
        return false;
      }
      if (this.rightInfo && newRightInfo.speciesName === this.rightInfo.speciesName && newRightInfo.year === this.rightInfo.year && newRightInfo.year === 'baseline') {
        return false;
      }
      this.rightInfo = newRightInfo;
      this.addMapLayer('right');
      return this.addMapTag('right');
    },
    addMapTag: function(side) {
      var info, tag;
      debug('AppView.addMapTag');
      if (side === 'left') {
        info = this.leftInfo;
      }
      if (side === 'right') {
        info = this.rightInfo;
      }
      tag = "<b><i>" + info.speciesName + "</i></b>";
      if (info.year === 'baseline') {
        tag = "current " + tag + " distribution";
      } else if (info.gcm === 'all') {
        tag = "<b>median</b> projections for " + tag + " in <b>" + info.year + "</b> if <b>" + info.scenario + "</b>";
      } else {
        tag = "<b>" + info.gcm + "</b> projections for " + tag + " in <b>" + info.year + "</b> if <b>" + info.scenario + "</b>";
      }
      if (side === 'left') {
        this.leftTag.find('.leftlayername').html(tag);
      }
      if (side === 'right') {
        return this.rightTag.find('.rightlayername').html(tag);
      }
    },
    addMapLayer: function(side) {
      var futureModelPoint, layer, loadClass, mapData, sideInfo;
      debug('AppView.addMapLayer');
      if (side === 'left') {
        sideInfo = this.leftInfo;
      }
      if (side === 'right') {
        sideInfo = this.rightInfo;
      }
      futureModelPoint = [sideInfo.scenario, sideInfo.gcm, sideInfo.year].join('_');
      if (sideInfo.year === 'baseline') {
        futureModelPoint = '1990';
      }
      mapData = [this.speciesDataUrl, sideInfo.speciesName.replace(' ', '_'), 'output', futureModelPoint + '.asc.gz'].join('/');
      layer = L.tileLayer.wms(this.rasterApiUrl, {
        DATA_URL: mapData,
        layers: 'DEFAULT',
        format: 'image/png',
        transparent: true
      });
      loadClass = '' + side + 'loading';
      layer.on('loading', (function(_this) {
        return function() {
          return _this.$el.addClass(loadClass);
        };
      })(this));
      layer.on('load', (function(_this) {
        return function() {
          return _this.$el.removeClass(loadClass);
        };
      })(this));
      layer.addTo(this.map);
      if (side === 'left') {
        if (this.leftLayer) {
          this.map.removeLayer(this.leftLayer);
        }
        this.leftLayer = layer;
      }
      if (side === 'right') {
        if (this.rightLayer) {
          this.map.removeLayer(this.rightLayer);
        }
        this.rightLayer = layer;
      }
      return this.resizeThings();
    },
    centreMap: function(repeatedlyFor) {
      var later, recentre, _i, _results;
      debug('AppView.centreMap');
      if (!repeatedlyFor) {
        repeatedlyFor = 500;
      }
      recentre = (function(_this) {
        return function() {
          _this.map.invalidateSize(false);
          return _this.resizeThings();
        };
      })(this);
      _results = [];
      for (later = _i = 0; _i <= repeatedlyFor; later = _i += 25) {
        _results.push(setTimeout(recentre, later));
      }
      return _results;
    },
    toggleForms: function() {
      debug('AppView.toggleForms');
      this.$el.toggleClass('showforms');
      return this.centreMap();
    },
    toggleSplitter: function() {
      debug('AppView.toggleSplitter');
      this.$el.toggleClass('split');
      if (this.$el.hasClass('split')) {
        this.activateSplitter();
      } else {
        this.deactivateSplitter();
      }
      return this.centreMap();
    },
    fetchSpeciesInfo: function() {
      debug('AppView.fetchSpeciesInfo');
      return $.ajax({
        url: '/speciesdata/species.json'
      }).done((function(_this) {
        return function(data) {
          var commonNameWriter, speciesLookupList, speciesSciNameList;
          speciesLookupList = [];
          speciesSciNameList = [];
          commonNameWriter = function(sciName) {
            var sciNamePostfix;
            sciNamePostfix = " (" + sciName + ")";
            return function(cnIndex, cn) {
              return speciesLookupList.push({
                label: cn + sciNamePostfix,
                value: sciName
              });
            };
          };
          $.each(data, function(sciName, commonNames) {
            speciesSciNameList.push(sciName);
            if (commonNames) {
              return $.each(commonNames, commonNameWriter(sciName));
            } else {
              return speciesLookupList.push({
                label: sciName,
                value: sciName
              });
            }
          });
          _this.speciesLookupList = speciesLookupList;
          return _this.speciesSciNameList = speciesSciNameList;
        };
      })(this));
    },
    buildLeftForm: function() {
      debug('AppView.buildLeftForm');
      return this.speciesInfoFetchProcess.done((function(_this) {
        return function() {
          var $leftmapspp;
          $leftmapspp = _this.$('#leftmapspp');
          return $leftmapspp.autocomplete({
            source: _this.speciesLookupList,
            appendTo: _this.$el,
            close: function() {
              return _this.$el.trigger('leftmapupdate');
            }
          });
        };
      })(this));
    },
    buildRightForm: function() {
      debug('AppView.buildRightForm');
      return this.speciesInfoFetchProcess.done((function(_this) {
        return function() {
          var $rightmapspp;
          $rightmapspp = _this.$('#rightmapspp');
          return $rightmapspp.autocomplete({
            source: _this.speciesLookupList,
            appendTo: _this.$el,
            close: function() {
              return _this.$el.trigger('rightmapupdate');
            }
          });
        };
      })(this));
    },
    startSplitterTracking: function() {
      debug('AppView.startSplitterTracking');
      this.trackSplitter = true;
      this.splitLine.addClass('dragging');
      return this.locateSplitter();
    },
    locateSplitter: function() {
      debug('AppView.locateSplitter');
      if (this.trackSplitter) {
        this.resizeThings();
        if (this.trackSplitter === 0) {
          this.trackSplitter = false;
        } else if (this.trackSplitter !== true) {
          this.trackSplitter -= 1;
        }
        return setTimeout(this.locateSplitter, this.trackPeriod);
      }
    },
    resizeThings: function() {
      var $mapBox, bottomRight, layerBottom, layerTop, leftLeft, leftMap, mapBounds, mapBox, newLeftWidth, rightMap, rightRight, splitPoint, splitX, topLeft;
      debug('AppView.resizeThings');
      if (this.leftLayer) {
        leftMap = $(this.leftLayer.getContainer());
      }
      if (this.rightLayer) {
        rightMap = $(this.rightLayer.getContainer());
      }
      if (this.$el.hasClass('split')) {
        newLeftWidth = this.splitThumb.position().left + (this.splitThumb.width() / 2.0);
        mapBox = this.map.getContainer();
        $mapBox = $(mapBox);
        mapBounds = mapBox.getBoundingClientRect();
        topLeft = this.map.containerPointToLayerPoint([0, 0]);
        splitPoint = this.map.containerPointToLayerPoint([newLeftWidth, 0]);
        bottomRight = this.map.containerPointToLayerPoint([$mapBox.width(), $mapBox.height()]);
        layerTop = topLeft.y;
        layerBottom = bottomRight.y;
        splitX = splitPoint.x - mapBounds.left;
        leftLeft = topLeft.x - mapBounds.left;
        rightRight = bottomRight.x;
        this.splitLine.css('left', newLeftWidth);
        this.leftTag.attr('style', "clip: rect(0, " + newLeftWidth + "px, auto, 0)");
        if (this.leftLayer) {
          leftMap.attr('style', "clip: rect(" + layerTop + "px, " + splitX + "px, " + layerBottom + "px, " + leftLeft + "px)");
        }
        if (this.rightLayer) {
          return rightMap.attr('style', "clip: rect(" + layerTop + "px, " + rightRight + "px, " + layerBottom + "px, " + splitX + "px)");
        }
      } else {
        this.leftTag.attr('style', 'clip: inherit');
        if (this.leftLayer) {
          leftMap.attr('style', 'clip: inherit');
        }
        if (this.rightLayer) {
          return rightMap.attr('style', 'clip: rect(0,0,0,0)');
        }
      }
    },
    stopSplitterTracking: function() {
      debug('AppView.stopSplitterTracking');
      this.splitLine.removeClass('dragging');
      return this.trackSplitter = 5;
    },
    activateSplitter: function() {
      debug('AppView.activateSplitter');
      this.splitThumb.draggable({
        containment: $('#mapwrapper'),
        scroll: false,
        start: this.startSplitterTracking,
        drag: this.resizeThings,
        stop: this.stopSplitterTracking
      });
      return this.resizeThings();
    },
    deactivateSplitter: function() {
      debug('AppView.deactivateSplitter');
      this.splitThumb.draggable('destroy');
      return this.resizeThings();
    }
  }, {
    templates: {
      layout: _.template("<div class=\"splitline\">&nbsp;</div>\n<div class=\"splitthumb\"><span>&#x276e; &#x276f;</span></div>\n<div class=\"left tag\"><%= leftTag %></div>\n<div class=\"right tag\"><%= rightTag %></div>\n<div class=\"left form\"><%= leftForm %></div>\n<div class=\"right form\"><%= rightForm %></div>\n<div class=\"left loader\"><img src=\"/static/images/spinner.loadinfo.net.gif\" /></div>\n<div class=\"right loader\"><img src=\"/static/images/spinner.loadinfo.net.gif\" /></div>\n<div id=\"mapwrapper\"><div id=\"map\"></div></div>"),
      leftTag: _.template("<div class=\"show\">\n    <span class=\"leftlayername\">plain map</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <input id=\"leftmapspp\" name=\"leftmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n    <!--\n    <button class=\"btn-change\">hide settings</button>\n    <button class=\"btn-compare\">compare +/-</button>\n    -->\n</div>"),
      rightTag: _.template("<div class=\"show\">\n    <span class=\"rightlayername\">(no distribution)</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <input id=\"rightmapspp\" name=\"rightmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n</div>"),
      leftForm: _.template("<p>\n<button class=\"btn-copy-rtl\">copy right map &laquo;</button>\n</p><p>\n<select class=\"left\" id=\"leftmapyear\">\n    <option value=\"baseline\">baseline</option>\n    <option value=\"2015\">2015</option>\n    <option value=\"2035\">2035</option>\n    <option value=\"2055\">2055</option>\n    <option value=\"2075\">2075</option>\n</select>\n</p><p>\n<select class=\"left\" id=\"leftmapscenario\">\n    <option>RCP3PD</option>\n    <option>RCP6</option>\n</select>\n</p><p>\n<select class=\"left\" id=\"leftmapgcm\">\n    <option value=\"all\">median</option>\n    <option value=\"csiro-mk30\">CSIRO Mark 3.0</option>\n</select>\n</p><p>\n<button class=\"btn-change\">hide settings</button>\n</p><p>\n<button class=\"btn-compare\">compare +/-</button>\n</p>"),
      rightForm: _.template("<p>\n<button class=\"btn-copy-ltr\">&raquo; copy left map</button>\n</p><p>\n<select class=\"right\" id=\"rightmapyear\">\n    <option value=\"baseline\">baseline</option>\n    <option value=\"2015\">2015</option>\n    <option value=\"2035\">2035</option>\n    <option value=\"2055\">2055</option>\n    <option value=\"2075\">2075</option>\n</select>\n</p><p>\n<select class=\"right\" id=\"rightmapscenario\">\n    <option>RCP3PD</option>\n    <option>RCP6</option>\n</select>\n</p><p>\n<select class=\"right\" id=\"rightmapgcm\">\n    <option value=\"all\">median</option>\n    <option value=\"csiro-mk30\">CSIRO Mark 3.0</option>\n</select>\n</p><p>\n<button class=\"btn-change\">hide settings</button>\n</p><p>\n<button class=\"btn-compare\">compare +/-</button>\n</p>")
    }
  });

  module.exports = AppView;

}).call(this);

},{"../models/maplayer":3,"../util/shims":4}],6:[function(require,module,exports){

// jQuery plugin
// author: Daniel Baird <daniel@danielbaird.com>
// version: 0.1.20140205

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
// - Clicking a selected submenu item will toggle its panel showing <-> hiding ((( NB: not yet implemented )))
// - A panel initially shows its first page
// - Switching pages in a panel changes the panel height to suit its current page
// - A panel is a HTML block element with the class .mspp-panel (can be overridden via option)
// - If a panel contains pages, one page should have the class .current (can be overridden via option)
// - A page is a HTML block element with the class .mspp-page (can be overridden via option)
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
//  <div id="panel1" class="mspp-panel">
//      <div id="page11" class="mspp-page current">
//          This is the current page on panel 1.
//          <button type="button" data-targetpage="page12">show page 2</button>
//      </div>
//      <div id="page12" class="mspp-page">
//          This is the other page on panel 1.
//          <a data-targetpage="page11">see the first page again</a>
//      </div>
//  </div>
//  <div id="panel2" class="mspp-panel">
//      <div id="page21" class="mspp-page current">
//          This is the current page on panel 2.
//          <button type="button" data-targetpage="page22">show page 2</button>
//      </div>
//      <div id="page22" class="mspp-page">
//          This is the other page on panel 2.
//          <a data-targetpage="page21">see the first page again</a>
//      </div>
//  </div>


;( function($, window, document, undefined) {

    // namespace climas, widget name mspp
    // second arg is used as the widget's "prototype" object
    $.widget( "climas.mspp" , {

        //Options to be used as defaults
        options: {
            animationFactor: 2,

            mainMenuClass: 'mspp-main-menu',

            panelClass: 'mspp-panel',
            pageClass: 'mspp-page',

            clearfixClass: 'mspp-clearfix',
            activeClass: 'current'
        },
        // ----------------------------------------------------------
        //Setup widget (eg. element creation, apply theming
        // , bind events etc.)
        _create: function() {

            var base = this;
            var opts = this.options;

            // populate some convenience variables
            var $menu = this.element;
            this.mainMenuItems = $menu.children('li');
            this.panels = $('.' + opts.panelClass);

            // disappear while we sort things out
            $menu.css({ opacity: 0 });
            this.panels.css({ opacity: 0 });

            // make some DOM mods
            $menu.addClass(opts.mainMenuClass);
            $menu.addClass(opts.clearfixClass);
            this.panels.addClass(opts.clearfixClass);

            // layout the menu
            this._layoutMenu();

            // layout the panels
            this._layoutPanels();

            // hook up click handling etc
            $menu.on('msppshowmenu', this._showMenu);
            $menu.on('msppshowsubmenu', this._showSubMenu);
            $menu.on('msppshowpanel', this._showPanel);
            $menu.on('msppshowpage', this._showPage);

            // attach handlers to the menu-triggers
            this.mainMenuItems.each( function(index, item) {
                // the li menu item has a child a that is it's trigger
                $(item).children('a').click( function(event) {
                    base._trigger('showmenu', event, {
                        menuitem: item,
                        widget: base
                    });
                });
                // attach handlers to the submenu items
                $(item).find('li').each( function(index, subMenuItem) {
                    $(subMenuItem).find('a').click( function(event) {
                        base._trigger('showsubmenu', event, {
                            menuitem: item,
                            submenuitem: subMenuItem,
                            widget: base
                        });
                    });
                });
            });

            // attach handlers to the panel triggers
            $menu.find('[data-targetpanel]').each( function(index, trigger) {
                var $trigger =$(trigger);
                $trigger.click( function(event) {
                    base._trigger('showpanel', event, {
                        panel: $('#' + $trigger.data('targetpanel')).first(),
                        widget: base
                    });
                });
            });

            // attach handlers to the page switchers
            this.panels.each( function(index, panel) {
                var $panel = $(panel);
                $panel.find('[data-targetpage]').click( function(event) {
                    base._trigger('showpage', event, {
                        panel: $panel,
                        page: $('#' + $(this).data('targetpage')),
                        widget: base
                    });
                });
            });

            // activate the current menus, panels etc
            var $currentMain = this.mainMenuItems.filter('.' + opts.activeClass);
            $currentMain.removeClass(opts.activeClass).children('a').click();

            // finally, fade back in
            $menu.animate({ opacity: 1 }, 'fast');

            // panels stay invisible
        },
        // ----------------------------------------------------------
        _switchClassOption: function(className, newClass) {
            var oldClass = this.options[className];
            if (oldClass !== newClass) {
                var group = this.element.find('.' + oldClass);
                this.options[className] = newClass;
                group.removeClass(oldClass);
                group.addClass(newClass);
            }
        },
        // ----------------------------------------------------------
        // Respond to any changes the user makes to the
        // option method
        _setOption: function(key, value) {
            switch (key) {
                case "mainMenuClass":
                case "clearfixClass":
                case "activeClass":
                    this._switchClassOption(key, value);
                    break;

                default:
                    this.options[key] = value;
                    break;
                // it's okay that there's no } here
            }
            // remember to call our super's _setOption method
            this._super( "_setOption", key, value );
        },
        // ----------------------------------------------------------
        // Destroy an instantiated plugin and clean up
        // modifications the widget has made to the DOM
        _destroy: function() {
            this.element.removeClass(this.options.mainMenuClass);
            this.element.removeClass(this.options.clearfixClass);
            this.panels.removeClass(this.options.clearfixClass);
        },
        // ----------------------------------------------------------
        // do the layout calculations
        _layoutMenu: function() {
            // go through each submenu and record its width
            this.element.find('ul').each( function(index, subMenu) {
                var $sm = $(subMenu);
                $sm.css({width: 'auto'});
                $sm.data('originalWidth', $sm.width());

                // leave each submenu hidden, with width 0
                $sm.css({ width: 0, display: 'none' });
            });
        },
        // ----------------------------------------------------------
        _showMenu: function(event, data) {
            var $item = $(data.menuitem);
            var base = data.widget;
            // $item is a clicked-on menu item..
            if ($item.hasClass(base.options.activeClass)) {
                // ??
            } else {
                base._hidePanels();
                base.mainMenuItems.removeClass(base.options.activeClass);
                var $newSubMenu = $item.find('ul');
                var $oldSubMenus = base.element.find('ul').not($newSubMenu);
                var newWidth = $newSubMenu.data('originalWidth');

                $oldSubMenus.animate({ width: 0 }, (50 * base.options.animationFactor), function() {
                    $oldSubMenus.css({ display: 'none' });
                });
                $item.addClass(base.options.activeClass);
                $newSubMenu
                    .css({display: 'block' })
                    .animate({ width: newWidth }, (125 * base.options.animationFactor), function() {
                        $newSubMenu.css({ width: 'auto' }).removeAttr('style');
                        base._trigger('menushown', event, { item: $item, widget: base });
                    })
                ;
                // if the new submenu has an active item, click it
                $newSubMenu.find('.' + base.options.activeClass + ' a').click();
            }
        },
        // ----------------------------------------------------------
        _showSubMenu: function(event, data) {
            // de-activeify all the submenu items
            $(data.menuitem).find('li').removeClass(data.widget.options.activeClass);
            // active-ify the one true submenu item
            $(data.submenuitem).addClass(data.widget.options.activeClass);
        },
        // ----------------------------------------------------------
        // do the layout calculations
        _layoutPanels: function() {

            var $pages = this.panels.find('.' + this.options.pageClass);

            // go through each page and record its height
            $pages.each( function(index, page) {
                var $page = $(page);
                $page.css({height: 'auto'});
                $page.data('originalHeight', $page.outerHeight());

                // leave each page hidden, with height 0
                $page.css({ height: 0, display: 'none' });
            });

            // go through each panel and hide it
            this.panels.each( function(index, panel) {
                var $panel = $(panel);
                $panel.css({ display: 'none' });
            });
        },
        // ----------------------------------------------------------
        _hidePanels: function() {
            this.panels.removeClass(this.options.activeClass).css({ display: 'none', height: 0 });
        },
        // ----------------------------------------------------------
        _showPanel: function(event, data) {
            var $panel = $(data.panel);
            var base = data.widget;
            // $panel is a panel to show..
            if ($panel.hasClass(base.options.activeClass)) {
                // ??
            } else {
                base._hidePanels();
                $panel.addClass(base.options.activeClass);
                $panel.css({ display: 'block', opacity: 1 });
                var $page = $($panel.find('.' + base.options.pageClass + '.' + base.options.activeClass));
                base._trigger('showpage', event, { panel: $panel, page: $page, widget: base });
            }
        },
        // ----------------------------------------------------------
        _showPage: function(event, data) {
            var base = data.widget;
            var $panel = $(data.panel);
            var $page = $(data.page);
            var newHeight = $page.data('originalHeight');

            // fix the panel's current height
            $panel.css({height: $panel.height() });

            // deal with the page currently being displayed
            var $oldPage = $panel.find('.' + base.options.pageClass + '.' + base.options.activeClass).not($page);
            if ($oldPage.length > 0) {
                $oldPage.data('originalHeight', $oldPage.outerHeight());
                $oldPage.removeClass(base.options.activeClass).fadeOut((50 * base.options.animationFactor), function() {
                    $oldPage.css({ height: 0 });
                });
            }

            // switch on the new page and grow the opanel to hold it
            $page.css({ height: 'auto' }).addClass(base.options.activeClass).fadeIn((100 * base.options.animationFactor), function() {
                $page.removeAttr('style');
            });
            var animTime = ($oldPage.length > 0 ? (100 * base.options.animationFactor) : (150 * base.options.animationFactor)); // animate faster if it's switching pages
            $panel.animate({ height: newHeight }, animTime, function() {
                $panel.removeAttr('style');
            });

        },
        // ----------------------------------------------------------
        _: null // no following comma
    });

})(jQuery, window, document);













},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9mYWtlXzcwNTQ2YmVmLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvbW9kZWxzL21hcGxheWVyLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L3V0aWwvc2hpbXMuanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tZW51c2FuZHBhbmVscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxucmVxdWlyZSgnLi9tYXB2aWV3L21haW4nKTtcbnJlcXVpcmUoJy4vbWVudXNhbmRwYW5lbHMnKTtcblxuJChmdW5jdGlvbigpIHtcbiAgICAvLyAkKCdoZWFkZXInKS5kaXNhYmxlU2VsZWN0aW9uKCk7IC8vIHVucG9wdWxhciBidXQgc3RpbGwgYmV0dGVyXG4gICAgJCgnbmF2ID4gdWwnKS5tc3BwKHt9KTtcbn0pO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldztcblxuICBpZiAoIXdpbmRvdy5jb25zb2xlKSB7XG4gICAgd2luZG93LmNvbnNvbGUgPSB7XG4gICAgICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIEFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FwcCcpO1xuXG4gICQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFwcHZpZXc7XG4gICAgYXBwdmlldyA9IG5ldyBBcHBWaWV3KCk7XG4gICAgcmV0dXJuIGFwcHZpZXcucmVuZGVyKCk7XG4gIH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgTWFwTGF5ZXI7XG5cbiAgTWFwTGF5ZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbihzaG9ydE5hbWUsIGxvbmdOYW1lLCBwYXRoKSB7XG4gICAgICB0aGlzLnNob3J0TmFtZSA9IHNob3J0TmFtZTtcbiAgICAgIHRoaXMubG9uZ05hbWUgPSBsb25nTmFtZTtcbiAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gTWFwTGF5ZXI7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihmbiwgc2NvcGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChfX2luZGV4T2YuY2FsbCh0aGlzLCBpKSA+PSAwID8gZm4uY2FsbChzY29wZSwgdGhpc1tpXSwgaSwgdGhpcykgOiB2b2lkIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG4gIH1cblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihuZWVkbGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZjtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIGlmICh0aGlzW2ldID09PSBuZWVkbGUpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXcsIE1hcExheWVyLCBkZWJ1ZyxcbiAgICBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBNYXBMYXllciA9IHJlcXVpcmUoJy4uL21vZGVscy9tYXBsYXllcicpO1xuXG4gIHJlcXVpcmUoJy4uL3V0aWwvc2hpbXMnKTtcblxuXG4gIC8qIGpzaGludCAtVzA5MyAqL1xuXG4gIGRlYnVnID0gZnVuY3Rpb24oaXRlbVRvTG9nLCBpdGVtTGV2ZWwpIHtcbiAgICB2YXIgbGV2ZWxzLCBtZXNzYWdlTnVtLCB0aHJlc2hvbGQsIHRocmVzaG9sZE51bTtcbiAgICBsZXZlbHMgPSBbJ3ZlcnlkZWJ1ZycsICdkZWJ1ZycsICdtZXNzYWdlJywgJ3dhcm5pbmcnXTtcbiAgICB0aHJlc2hvbGQgPSAndmVyeWRlYnVnJztcbiAgICBpZiAoIWl0ZW1MZXZlbCkge1xuICAgICAgaXRlbUxldmVsID0gJ2RlYnVnJztcbiAgICB9XG4gICAgdGhyZXNob2xkTnVtID0gbGV2ZWxzLmluZGV4T2YodGhyZXNob2xkKTtcbiAgICBtZXNzYWdlTnVtID0gbGV2ZWxzLmluZGV4T2YoaXRlbUxldmVsKTtcbiAgICBpZiAodGhyZXNob2xkTnVtID4gbWVzc2FnZU51bSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXRlbVRvTG9nICsgJycgPT09IGl0ZW1Ub0xvZykge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiW1wiICsgaXRlbUxldmVsICsgXCJdIFwiICsgaXRlbVRvTG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKGl0ZW1Ub0xvZyk7XG4gICAgfVxuICB9O1xuXG4gIEFwcFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgdGFnTmFtZTogJ2RpdicsXG4gICAgY2xhc3NOYW1lOiAnc3BsaXRtYXAgc2hvd2Zvcm1zJyxcbiAgICBpZDogJ3NwbGl0bWFwJyxcbiAgICBzcGVjaWVzRGF0YVVybDogXCJcIiArIGxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgbG9jYXRpb24uaG9zdCArIFwiL3NwZWNpZXNkYXRhXCIsXG4gICAgcmFzdGVyQXBpVXJsOiBcIlwiICsgbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vbG9jYWxob3N0OjEwNjAwL2FwaS9yYXN0ZXIvMS93bXNfZGF0YV91cmxcIixcbiAgICB0cmFja1NwbGl0dGVyOiBmYWxzZSxcbiAgICB0cmFja1BlcmlvZDogMTAwLFxuICAgIGV2ZW50czoge1xuICAgICAgJ2NsaWNrIC5idG4tY2hhbmdlJzogJ3RvZ2dsZUZvcm1zJyxcbiAgICAgICdjbGljayAuYnRuLWNvbXBhcmUnOiAndG9nZ2xlU3BsaXR0ZXInLFxuICAgICAgJ2NsaWNrIC5idG4tY29weS1sdHInOiAnY29weU1hcExlZnRUb1JpZ2h0JyxcbiAgICAgICdjbGljayAuYnRuLWNvcHktcnRsJzogJ2NvcHlNYXBSaWdodFRvTGVmdCcsXG4gICAgICAnbGVmdG1hcHVwZGF0ZSc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAncmlnaHRtYXB1cGRhdGUnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2Ugc2VsZWN0LmxlZnQnOiAnbGVmdFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBzZWxlY3QucmlnaHQnOiAncmlnaHRTaWRlVXBkYXRlJ1xuICAgIH0sXG4gICAgdGljazogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoZmFsc2UpIHtcbiAgICAgICAgZGVidWcodGhpcy5tYXAuZ2V0UGl4ZWxPcmlnaW4oKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2V0VGltZW91dCh0aGlzLnRpY2ssIDIwMDApO1xuICAgIH0sXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5pbml0aWFsaXplJyk7XG4gICAgICBfLmJpbmRBbGwuYXBwbHkoXywgW3RoaXNdLmNvbmNhdChfLmZ1bmN0aW9ucyh0aGlzKSkpO1xuICAgICAgcmV0dXJuIHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MgPSB0aGlzLmZldGNoU3BlY2llc0luZm8oKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZW5kZXInKTtcbiAgICAgIHRoaXMuJGVsLmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy5sYXlvdXQoe1xuICAgICAgICBsZWZ0VGFnOiBBcHBWaWV3LnRlbXBsYXRlcy5sZWZ0VGFnKCksXG4gICAgICAgIHJpZ2h0VGFnOiBBcHBWaWV3LnRlbXBsYXRlcy5yaWdodFRhZygpLFxuICAgICAgICBsZWZ0Rm9ybTogQXBwVmlldy50ZW1wbGF0ZXMubGVmdEZvcm0oKSxcbiAgICAgICAgcmlnaHRGb3JtOiBBcHBWaWV3LnRlbXBsYXRlcy5yaWdodEZvcm0oKVxuICAgICAgfSkpO1xuICAgICAgJCgnI2NvbnRlbnR3cmFwJykuYXBwZW5kKHRoaXMuJGVsKTtcbiAgICAgIHRoaXMubWFwID0gTC5tYXAoJ21hcCcsIHtcbiAgICAgICAgY2VudGVyOiBbLTIwLCAxMzZdLFxuICAgICAgICB6b29tOiA1XG4gICAgICB9KTtcbiAgICAgIHRoaXMubWFwLm9uKCdtb3ZlJywgdGhpcy5yZXNpemVUaGluZ3MpO1xuICAgICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly9vdGlsZXtzfS5tcWNkbi5jb20vdGlsZXMvMS4wLjAvbWFwL3t6fS97eH0ve3l9LnBuZycsIHtcbiAgICAgICAgc3ViZG9tYWluczogJzEyMzQnLFxuICAgICAgICBtYXhab29tOiAxOCxcbiAgICAgICAgYXR0cmlidXRpb246ICdNYXAgZGF0YSAmY29weTsgPGEgaHJlZj1cImh0dHA6Ly9vcGVuc3RyZWV0bWFwLm9yZ1wiPk9wZW5TdHJlZXRNYXA8L2E+LFxcbnRpbGVzICZjb3B5OyA8YSBocmVmPVwiaHR0cDovL3d3dy5tYXBxdWVzdC5jb20vXCIgdGFyZ2V0PVwiX2JsYW5rXCI+TWFwUXVlc3Q8L2E+J1xuICAgICAgfSkuYWRkVG8odGhpcy5tYXApO1xuICAgICAgdGhpcy5sZWZ0Rm9ybSA9IHRoaXMuJCgnLmxlZnQuZm9ybScpO1xuICAgICAgdGhpcy5idWlsZExlZnRGb3JtKCk7XG4gICAgICB0aGlzLnJpZ2h0Rm9ybSA9IHRoaXMuJCgnLnJpZ2h0LmZvcm0nKTtcbiAgICAgIHRoaXMuYnVpbGRSaWdodEZvcm0oKTtcbiAgICAgIHRoaXMubGVmdFRhZyA9IHRoaXMuJCgnLmxlZnQudGFnJyk7XG4gICAgICB0aGlzLnJpZ2h0VGFnID0gdGhpcy4kKCcucmlnaHQudGFnJyk7XG4gICAgICB0aGlzLnNwbGl0TGluZSA9IHRoaXMuJCgnLnNwbGl0bGluZScpO1xuICAgICAgcmV0dXJuIHRoaXMuc3BsaXRUaHVtYiA9IHRoaXMuJCgnLnNwbGl0dGh1bWInKTtcbiAgICB9LFxuICAgIGNvcHlNYXBMZWZ0VG9SaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jb3B5TWFwTGVmdFRvUmlnaHQnKTtcbiAgICAgIGlmICghdGhpcy5sZWZ0SW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcHNwcCcpLnZhbCh0aGlzLmxlZnRJbmZvLnNwZWNpZXNOYW1lKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFweWVhcicpLnZhbCh0aGlzLmxlZnRJbmZvLnllYXIpO1xuICAgICAgdGhpcy4kKCcjcmlnaHRtYXBzY2VuYXJpbycpLnZhbCh0aGlzLmxlZnRJbmZvLnNjZW5hcmlvKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwZ2NtJykudmFsKHRoaXMubGVmdEluZm8uZ2NtKTtcbiAgICAgIHJldHVybiB0aGlzLnJpZ2h0U2lkZVVwZGF0ZSgpO1xuICAgIH0sXG4gICAgY29weU1hcFJpZ2h0VG9MZWZ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNvcHlNYXBSaWdodFRvTGVmdCcpO1xuICAgICAgaWYgKCF0aGlzLnJpZ2h0SW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFwc3BwJykudmFsKHRoaXMucmlnaHRJbmZvLnNwZWNpZXNOYW1lKTtcbiAgICAgIHRoaXMuJCgnI2xlZnRtYXB5ZWFyJykudmFsKHRoaXMucmlnaHRJbmZvLnllYXIpO1xuICAgICAgdGhpcy4kKCcjbGVmdG1hcHNjZW5hcmlvJykudmFsKHRoaXMucmlnaHRJbmZvLnNjZW5hcmlvKTtcbiAgICAgIHRoaXMuJCgnI2xlZnRtYXBnY20nKS52YWwodGhpcy5yaWdodEluZm8uZ2NtKTtcbiAgICAgIHJldHVybiB0aGlzLmxlZnRTaWRlVXBkYXRlKCk7XG4gICAgfSxcbiAgICBsZWZ0U2lkZVVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbmV3TGVmdEluZm8sIHNwcE5hbWU7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5sZWZ0U2lkZVVwZGF0ZScpO1xuICAgICAgc3BwTmFtZSA9IHRoaXMuJCgnI2xlZnRtYXBzcHAnKS52YWwoKTtcbiAgICAgIGlmIChfX2luZGV4T2YuY2FsbCh0aGlzLnNwZWNpZXNTY2lOYW1lTGlzdCwgc3BwTmFtZSkgPj0gMCkge1xuICAgICAgICB0aGlzLiQoJy5idG4tY29weS1ydGwnKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJCgnLmJ0bi1jb3B5LXJ0bCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIG5ld0xlZnRJbmZvID0ge1xuICAgICAgICBzcGVjaWVzTmFtZTogc3BwTmFtZSxcbiAgICAgICAgeWVhcjogdGhpcy4kKCcjbGVmdG1hcHllYXInKS52YWwoKSxcbiAgICAgICAgc2NlbmFyaW86IHRoaXMuJCgnI2xlZnRtYXBzY2VuYXJpbycpLnZhbCgpLFxuICAgICAgICBnY206IHRoaXMuJCgnI2xlZnRtYXBnY20nKS52YWwoKVxuICAgICAgfTtcbiAgICAgIGlmICh0aGlzLmxlZnRJbmZvICYmIF8uaXNFcXVhbChuZXdMZWZ0SW5mbywgdGhpcy5sZWZ0SW5mbykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMubGVmdEluZm8gJiYgbmV3TGVmdEluZm8uc3BlY2llc05hbWUgPT09IHRoaXMubGVmdEluZm8uc3BlY2llc05hbWUgJiYgbmV3TGVmdEluZm8ueWVhciA9PT0gdGhpcy5sZWZ0SW5mby55ZWFyICYmIG5ld0xlZnRJbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdGhpcy5sZWZ0SW5mbyA9IG5ld0xlZnRJbmZvO1xuICAgICAgdGhpcy5hZGRNYXBMYXllcignbGVmdCcpO1xuICAgICAgcmV0dXJuIHRoaXMuYWRkTWFwVGFnKCdsZWZ0Jyk7XG4gICAgfSxcbiAgICByaWdodFNpZGVVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5ld1JpZ2h0SW5mbywgc3BwTmFtZTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnJpZ2h0U2lkZVVwZGF0ZScpO1xuICAgICAgc3BwTmFtZSA9IHRoaXMuJCgnI3JpZ2h0bWFwc3BwJykudmFsKCk7XG4gICAgICBpZiAoX19pbmRleE9mLmNhbGwodGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QsIHNwcE5hbWUpID49IDApIHtcbiAgICAgICAgdGhpcy4kKCcuYnRuLWNvcHktbHRyJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiQoJy5idG4tY29weS1sdHInKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBuZXdSaWdodEluZm8gPSB7XG4gICAgICAgIHNwZWNpZXNOYW1lOiBzcHBOYW1lLFxuICAgICAgICB5ZWFyOiB0aGlzLiQoJyNyaWdodG1hcHllYXInKS52YWwoKSxcbiAgICAgICAgc2NlbmFyaW86IHRoaXMuJCgnI3JpZ2h0bWFwc2NlbmFyaW8nKS52YWwoKSxcbiAgICAgICAgZ2NtOiB0aGlzLiQoJyNyaWdodG1hcGdjbScpLnZhbCgpXG4gICAgICB9O1xuICAgICAgaWYgKHRoaXMucmlnaHRJbmZvICYmIF8uaXNFcXVhbChuZXdSaWdodEluZm8sIHRoaXMucmlnaHRJbmZvKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yaWdodEluZm8gJiYgbmV3UmlnaHRJbmZvLnNwZWNpZXNOYW1lID09PSB0aGlzLnJpZ2h0SW5mby5zcGVjaWVzTmFtZSAmJiBuZXdSaWdodEluZm8ueWVhciA9PT0gdGhpcy5yaWdodEluZm8ueWVhciAmJiBuZXdSaWdodEluZm8ueWVhciA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aGlzLnJpZ2h0SW5mbyA9IG5ld1JpZ2h0SW5mbztcbiAgICAgIHRoaXMuYWRkTWFwTGF5ZXIoJ3JpZ2h0Jyk7XG4gICAgICByZXR1cm4gdGhpcy5hZGRNYXBUYWcoJ3JpZ2h0Jyk7XG4gICAgfSxcbiAgICBhZGRNYXBUYWc6IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgIHZhciBpbmZvLCB0YWc7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hZGRNYXBUYWcnKTtcbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgaW5mbyA9IHRoaXMubGVmdEluZm87XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBpbmZvID0gdGhpcy5yaWdodEluZm87XG4gICAgICB9XG4gICAgICB0YWcgPSBcIjxiPjxpPlwiICsgaW5mby5zcGVjaWVzTmFtZSArIFwiPC9pPjwvYj5cIjtcbiAgICAgIGlmIChpbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgdGFnID0gXCJjdXJyZW50IFwiICsgdGFnICsgXCIgZGlzdHJpYnV0aW9uXCI7XG4gICAgICB9IGVsc2UgaWYgKGluZm8uZ2NtID09PSAnYWxsJykge1xuICAgICAgICB0YWcgPSBcIjxiPm1lZGlhbjwvYj4gcHJvamVjdGlvbnMgZm9yIFwiICsgdGFnICsgXCIgaW4gPGI+XCIgKyBpbmZvLnllYXIgKyBcIjwvYj4gaWYgPGI+XCIgKyBpbmZvLnNjZW5hcmlvICsgXCI8L2I+XCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YWcgPSBcIjxiPlwiICsgaW5mby5nY20gKyBcIjwvYj4gcHJvamVjdGlvbnMgZm9yIFwiICsgdGFnICsgXCIgaW4gPGI+XCIgKyBpbmZvLnllYXIgKyBcIjwvYj4gaWYgPGI+XCIgKyBpbmZvLnNjZW5hcmlvICsgXCI8L2I+XCI7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMubGVmdFRhZy5maW5kKCcubGVmdGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJpZ2h0VGFnLmZpbmQoJy5yaWdodGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGFkZE1hcExheWVyOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgZnV0dXJlTW9kZWxQb2ludCwgbGF5ZXIsIGxvYWRDbGFzcywgbWFwRGF0YSwgc2lkZUluZm87XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hZGRNYXBMYXllcicpO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBzaWRlSW5mbyA9IHRoaXMubGVmdEluZm87XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBzaWRlSW5mbyA9IHRoaXMucmlnaHRJbmZvO1xuICAgICAgfVxuICAgICAgZnV0dXJlTW9kZWxQb2ludCA9IFtzaWRlSW5mby5zY2VuYXJpbywgc2lkZUluZm8uZ2NtLCBzaWRlSW5mby55ZWFyXS5qb2luKCdfJyk7XG4gICAgICBpZiAoc2lkZUluZm8ueWVhciA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICBmdXR1cmVNb2RlbFBvaW50ID0gJzE5OTAnO1xuICAgICAgfVxuICAgICAgbWFwRGF0YSA9IFt0aGlzLnNwZWNpZXNEYXRhVXJsLCBzaWRlSW5mby5zcGVjaWVzTmFtZS5yZXBsYWNlKCcgJywgJ18nKSwgJ291dHB1dCcsIGZ1dHVyZU1vZGVsUG9pbnQgKyAnLmFzYy5neiddLmpvaW4oJy8nKTtcbiAgICAgIGxheWVyID0gTC50aWxlTGF5ZXIud21zKHRoaXMucmFzdGVyQXBpVXJsLCB7XG4gICAgICAgIERBVEFfVVJMOiBtYXBEYXRhLFxuICAgICAgICBsYXllcnM6ICdERUZBVUxUJyxcbiAgICAgICAgZm9ybWF0OiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWVcbiAgICAgIH0pO1xuICAgICAgbG9hZENsYXNzID0gJycgKyBzaWRlICsgJ2xvYWRpbmcnO1xuICAgICAgbGF5ZXIub24oJ2xvYWRpbmcnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwuYWRkQ2xhc3MobG9hZENsYXNzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIGxheWVyLm9uKCdsb2FkJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnJlbW92ZUNsYXNzKGxvYWRDbGFzcyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBsYXllci5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubGVmdExheWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxlZnRMYXllciA9IGxheWVyO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMucmlnaHRMYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yaWdodExheWVyID0gbGF5ZXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICB9LFxuICAgIGNlbnRyZU1hcDogZnVuY3Rpb24ocmVwZWF0ZWRseUZvcikge1xuICAgICAgdmFyIGxhdGVyLCByZWNlbnRyZSwgX2ksIF9yZXN1bHRzO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuY2VudHJlTWFwJyk7XG4gICAgICBpZiAoIXJlcGVhdGVkbHlGb3IpIHtcbiAgICAgICAgcmVwZWF0ZWRseUZvciA9IDUwMDtcbiAgICAgIH1cbiAgICAgIHJlY2VudHJlID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBfdGhpcy5tYXAuaW52YWxpZGF0ZVNpemUoZmFsc2UpO1xuICAgICAgICAgIHJldHVybiBfdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAobGF0ZXIgPSBfaSA9IDA7IF9pIDw9IHJlcGVhdGVkbHlGb3I7IGxhdGVyID0gX2kgKz0gMjUpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChzZXRUaW1lb3V0KHJlY2VudHJlLCBsYXRlcikpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH0sXG4gICAgdG9nZ2xlRm9ybXM6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudG9nZ2xlRm9ybXMnKTtcbiAgICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzaG93Zm9ybXMnKTtcbiAgICAgIHJldHVybiB0aGlzLmNlbnRyZU1hcCgpO1xuICAgIH0sXG4gICAgdG9nZ2xlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcudG9nZ2xlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzcGxpdCcpO1xuICAgICAgaWYgKHRoaXMuJGVsLmhhc0NsYXNzKCdzcGxpdCcpKSB7XG4gICAgICAgIHRoaXMuYWN0aXZhdGVTcGxpdHRlcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5kZWFjdGl2YXRlU3BsaXR0ZXIoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmNlbnRyZU1hcCgpO1xuICAgIH0sXG4gICAgZmV0Y2hTcGVjaWVzSW5mbzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFNwZWNpZXNJbmZvJyk7XG4gICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgdXJsOiAnL3NwZWNpZXNkYXRhL3NwZWNpZXMuanNvbidcbiAgICAgIH0pLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIGNvbW1vbk5hbWVXcml0ZXIsIHNwZWNpZXNMb29rdXBMaXN0LCBzcGVjaWVzU2NpTmFtZUxpc3Q7XG4gICAgICAgICAgc3BlY2llc0xvb2t1cExpc3QgPSBbXTtcbiAgICAgICAgICBzcGVjaWVzU2NpTmFtZUxpc3QgPSBbXTtcbiAgICAgICAgICBjb21tb25OYW1lV3JpdGVyID0gZnVuY3Rpb24oc2NpTmFtZSkge1xuICAgICAgICAgICAgdmFyIHNjaU5hbWVQb3N0Zml4O1xuICAgICAgICAgICAgc2NpTmFtZVBvc3RmaXggPSBcIiAoXCIgKyBzY2lOYW1lICsgXCIpXCI7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oY25JbmRleCwgY24pIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNwZWNpZXNMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBjbiArIHNjaU5hbWVQb3N0Zml4LFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzY2lOYW1lXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuICAgICAgICAgICQuZWFjaChkYXRhLCBmdW5jdGlvbihzY2lOYW1lLCBjb21tb25OYW1lcykge1xuICAgICAgICAgICAgc3BlY2llc1NjaU5hbWVMaXN0LnB1c2goc2NpTmFtZSk7XG4gICAgICAgICAgICBpZiAoY29tbW9uTmFtZXMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICQuZWFjaChjb21tb25OYW1lcywgY29tbW9uTmFtZVdyaXRlcihzY2lOYW1lKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gc3BlY2llc0xvb2t1cExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IHNjaU5hbWUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHNjaU5hbWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgX3RoaXMuc3BlY2llc0xvb2t1cExpc3QgPSBzcGVjaWVzTG9va3VwTGlzdDtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuc3BlY2llc1NjaU5hbWVMaXN0ID0gc3BlY2llc1NjaU5hbWVMaXN0O1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgYnVpbGRMZWZ0Rm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZExlZnRGb3JtJyk7XG4gICAgICByZXR1cm4gdGhpcy5zcGVjaWVzSW5mb0ZldGNoUHJvY2Vzcy5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyICRsZWZ0bWFwc3BwO1xuICAgICAgICAgICRsZWZ0bWFwc3BwID0gX3RoaXMuJCgnI2xlZnRtYXBzcHAnKTtcbiAgICAgICAgICByZXR1cm4gJGxlZnRtYXBzcHAuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgICAgIHNvdXJjZTogX3RoaXMuc3BlY2llc0xvb2t1cExpc3QsXG4gICAgICAgICAgICBhcHBlbmRUbzogX3RoaXMuJGVsLFxuICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnRyaWdnZXIoJ2xlZnRtYXB1cGRhdGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIGJ1aWxkUmlnaHRGb3JtOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkUmlnaHRGb3JtJyk7XG4gICAgICByZXR1cm4gdGhpcy5zcGVjaWVzSW5mb0ZldGNoUHJvY2Vzcy5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyICRyaWdodG1hcHNwcDtcbiAgICAgICAgICAkcmlnaHRtYXBzcHAgPSBfdGhpcy4kKCcjcmlnaHRtYXBzcHAnKTtcbiAgICAgICAgICByZXR1cm4gJHJpZ2h0bWFwc3BwLmF1dG9jb21wbGV0ZSh7XG4gICAgICAgICAgICBzb3VyY2U6IF90aGlzLnNwZWNpZXNMb29rdXBMaXN0LFxuICAgICAgICAgICAgYXBwZW5kVG86IF90aGlzLiRlbCxcbiAgICAgICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC50cmlnZ2VyKCdyaWdodG1hcHVwZGF0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgc3RhcnRTcGxpdHRlclRyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnN0YXJ0U3BsaXR0ZXJUcmFja2luZycpO1xuICAgICAgdGhpcy50cmFja1NwbGl0dGVyID0gdHJ1ZTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lLmFkZENsYXNzKCdkcmFnZ2luZycpO1xuICAgICAgcmV0dXJuIHRoaXMubG9jYXRlU3BsaXR0ZXIoKTtcbiAgICB9LFxuICAgIGxvY2F0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmxvY2F0ZVNwbGl0dGVyJyk7XG4gICAgICBpZiAodGhpcy50cmFja1NwbGl0dGVyKSB7XG4gICAgICAgIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgICAgIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIgPT09IDApIHtcbiAgICAgICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgLT0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2V0VGltZW91dCh0aGlzLmxvY2F0ZVNwbGl0dGVyLCB0aGlzLnRyYWNrUGVyaW9kKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc2l6ZVRoaW5nczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJG1hcEJveCwgYm90dG9tUmlnaHQsIGxheWVyQm90dG9tLCBsYXllclRvcCwgbGVmdExlZnQsIGxlZnRNYXAsIG1hcEJvdW5kcywgbWFwQm94LCBuZXdMZWZ0V2lkdGgsIHJpZ2h0TWFwLCByaWdodFJpZ2h0LCBzcGxpdFBvaW50LCBzcGxpdFgsIHRvcExlZnQ7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yZXNpemVUaGluZ3MnKTtcbiAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICBsZWZ0TWFwID0gJCh0aGlzLmxlZnRMYXllci5nZXRDb250YWluZXIoKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgIHJpZ2h0TWFwID0gJCh0aGlzLnJpZ2h0TGF5ZXIuZ2V0Q29udGFpbmVyKCkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuJGVsLmhhc0NsYXNzKCdzcGxpdCcpKSB7XG4gICAgICAgIG5ld0xlZnRXaWR0aCA9IHRoaXMuc3BsaXRUaHVtYi5wb3NpdGlvbigpLmxlZnQgKyAodGhpcy5zcGxpdFRodW1iLndpZHRoKCkgLyAyLjApO1xuICAgICAgICBtYXBCb3ggPSB0aGlzLm1hcC5nZXRDb250YWluZXIoKTtcbiAgICAgICAgJG1hcEJveCA9ICQobWFwQm94KTtcbiAgICAgICAgbWFwQm91bmRzID0gbWFwQm94LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0b3BMZWZ0ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoWzAsIDBdKTtcbiAgICAgICAgc3BsaXRQb2ludCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFtuZXdMZWZ0V2lkdGgsIDBdKTtcbiAgICAgICAgYm90dG9tUmlnaHQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbJG1hcEJveC53aWR0aCgpLCAkbWFwQm94LmhlaWdodCgpXSk7XG4gICAgICAgIGxheWVyVG9wID0gdG9wTGVmdC55O1xuICAgICAgICBsYXllckJvdHRvbSA9IGJvdHRvbVJpZ2h0Lnk7XG4gICAgICAgIHNwbGl0WCA9IHNwbGl0UG9pbnQueCAtIG1hcEJvdW5kcy5sZWZ0O1xuICAgICAgICBsZWZ0TGVmdCA9IHRvcExlZnQueCAtIG1hcEJvdW5kcy5sZWZ0O1xuICAgICAgICByaWdodFJpZ2h0ID0gYm90dG9tUmlnaHQueDtcbiAgICAgICAgdGhpcy5zcGxpdExpbmUuY3NzKCdsZWZ0JywgbmV3TGVmdFdpZHRoKTtcbiAgICAgICAgdGhpcy5sZWZ0VGFnLmF0dHIoJ3N0eWxlJywgXCJjbGlwOiByZWN0KDAsIFwiICsgbmV3TGVmdFdpZHRoICsgXCJweCwgYXV0bywgMClcIik7XG4gICAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgIGxlZnRNYXAuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoXCIgKyBsYXllclRvcCArIFwicHgsIFwiICsgc3BsaXRYICsgXCJweCwgXCIgKyBsYXllckJvdHRvbSArIFwicHgsIFwiICsgbGVmdExlZnQgKyBcInB4KVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgcmV0dXJuIHJpZ2h0TWFwLmF0dHIoJ3N0eWxlJywgXCJjbGlwOiByZWN0KFwiICsgbGF5ZXJUb3AgKyBcInB4LCBcIiArIHJpZ2h0UmlnaHQgKyBcInB4LCBcIiArIGxheWVyQm90dG9tICsgXCJweCwgXCIgKyBzcGxpdFggKyBcInB4KVwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5sZWZ0VGFnLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IGluaGVyaXQnKTtcbiAgICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgbGVmdE1hcC5hdHRyKCdzdHlsZScsICdjbGlwOiBpbmhlcml0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgIHJldHVybiByaWdodE1hcC5hdHRyKCdzdHlsZScsICdjbGlwOiByZWN0KDAsMCwwLDApJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHN0b3BTcGxpdHRlclRyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnN0b3BTcGxpdHRlclRyYWNraW5nJyk7XG4gICAgICB0aGlzLnNwbGl0TGluZS5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcbiAgICAgIHJldHVybiB0aGlzLnRyYWNrU3BsaXR0ZXIgPSA1O1xuICAgIH0sXG4gICAgYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5hY3RpdmF0ZVNwbGl0dGVyJyk7XG4gICAgICB0aGlzLnNwbGl0VGh1bWIuZHJhZ2dhYmxlKHtcbiAgICAgICAgY29udGFpbm1lbnQ6ICQoJyNtYXB3cmFwcGVyJyksXG4gICAgICAgIHNjcm9sbDogZmFsc2UsXG4gICAgICAgIHN0YXJ0OiB0aGlzLnN0YXJ0U3BsaXR0ZXJUcmFja2luZyxcbiAgICAgICAgZHJhZzogdGhpcy5yZXNpemVUaGluZ3MsXG4gICAgICAgIHN0b3A6IHRoaXMuc3RvcFNwbGl0dGVyVHJhY2tpbmdcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgfSxcbiAgICBkZWFjdGl2YXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZGVhY3RpdmF0ZVNwbGl0dGVyJyk7XG4gICAgICB0aGlzLnNwbGl0VGh1bWIuZHJhZ2dhYmxlKCdkZXN0cm95Jyk7XG4gICAgICByZXR1cm4gdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICB9XG4gIH0sIHtcbiAgICB0ZW1wbGF0ZXM6IHtcbiAgICAgIGxheW91dDogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNwbGl0bGluZVxcXCI+Jm5ic3A7PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwic3BsaXR0aHVtYlxcXCI+PHNwYW4+JiN4Mjc2ZTsgJiN4Mjc2Zjs8L3NwYW4+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCB0YWdcXFwiPjwlPSBsZWZ0VGFnICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgdGFnXFxcIj48JT0gcmlnaHRUYWcgJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IGZvcm1cXFwiPjwlPSBsZWZ0Rm9ybSAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJpZ2h0IGZvcm1cXFwiPjwlPSByaWdodEZvcm0gJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IGxvYWRlclxcXCI+PGltZyBzcmM9XFxcIi9zdGF0aWMvaW1hZ2VzL3NwaW5uZXIubG9hZGluZm8ubmV0LmdpZlxcXCIgLz48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCBsb2FkZXJcXFwiPjxpbWcgc3JjPVxcXCIvc3RhdGljL2ltYWdlcy9zcGlubmVyLmxvYWRpbmZvLm5ldC5naWZcXFwiIC8+PC9kaXY+XFxuPGRpdiBpZD1cXFwibWFwd3JhcHBlclxcXCI+PGRpdiBpZD1cXFwibWFwXFxcIj48L2Rpdj48L2Rpdj5cIiksXG4gICAgICBsZWZ0VGFnOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2hvd1xcXCI+XFxuICAgIDxzcGFuIGNsYXNzPVxcXCJsZWZ0bGF5ZXJuYW1lXFxcIj5wbGFpbiBtYXA8L3NwYW4+XFxuICAgIDxicj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+c2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPnNob3cvaGlkZSBjb21wYXJpc29uIG1hcDwvYnV0dG9uPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImVkaXRcXFwiPlxcbiAgICA8aW5wdXQgaWQ9XFxcImxlZnRtYXBzcHBcXFwiIG5hbWU9XFxcImxlZnRtYXBzcHBcXFwiIHBsYWNlaG9sZGVyPVxcXCImaGVsbGlwOyBzcGVjaWVzIG9yIGdyb3VwICZoZWxsaXA7XFxcIiAvPlxcbiAgICA8IS0tXFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPmhpZGUgc2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPmNvbXBhcmUgKy8tPC9idXR0b24+XFxuICAgIC0tPlxcbjwvZGl2PlwiKSxcbiAgICAgIHJpZ2h0VGFnOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2hvd1xcXCI+XFxuICAgIDxzcGFuIGNsYXNzPVxcXCJyaWdodGxheWVybmFtZVxcXCI+KG5vIGRpc3RyaWJ1dGlvbik8L3NwYW4+XFxuICAgIDxicj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+c2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPnNob3cvaGlkZSBjb21wYXJpc29uIG1hcDwvYnV0dG9uPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImVkaXRcXFwiPlxcbiAgICA8aW5wdXQgaWQ9XFxcInJpZ2h0bWFwc3BwXFxcIiBuYW1lPVxcXCJyaWdodG1hcHNwcFxcXCIgcGxhY2Vob2xkZXI9XFxcIiZoZWxsaXA7IHNwZWNpZXMgb3IgZ3JvdXAgJmhlbGxpcDtcXFwiIC8+XFxuPC9kaXY+XCIpLFxuICAgICAgbGVmdEZvcm06IF8udGVtcGxhdGUoXCI8cD5cXG48YnV0dG9uIGNsYXNzPVxcXCJidG4tY29weS1ydGxcXFwiPmNvcHkgcmlnaHQgbWFwICZsYXF1bzs8L2J1dHRvbj5cXG48L3A+PHA+XFxuPHNlbGVjdCBjbGFzcz1cXFwibGVmdFxcXCIgaWQ9XFxcImxlZnRtYXB5ZWFyXFxcIj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiYmFzZWxpbmVcXFwiPmJhc2VsaW5lPC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcIjIwMTVcXFwiPjIwMTU8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiMjAzNVxcXCI+MjAzNTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCIyMDU1XFxcIj4yMDU1PC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcIjIwNzVcXFwiPjIwNzU8L29wdGlvbj5cXG48L3NlbGVjdD5cXG48L3A+PHA+XFxuPHNlbGVjdCBjbGFzcz1cXFwibGVmdFxcXCIgaWQ9XFxcImxlZnRtYXBzY2VuYXJpb1xcXCI+XFxuICAgIDxvcHRpb24+UkNQM1BEPC9vcHRpb24+XFxuICAgIDxvcHRpb24+UkNQNjwvb3B0aW9uPlxcbjwvc2VsZWN0PlxcbjwvcD48cD5cXG48c2VsZWN0IGNsYXNzPVxcXCJsZWZ0XFxcIiBpZD1cXFwibGVmdG1hcGdjbVxcXCI+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcImFsbFxcXCI+bWVkaWFuPC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcImNzaXJvLW1rMzBcXFwiPkNTSVJPIE1hcmsgMy4wPC9vcHRpb24+XFxuPC9zZWxlY3Q+XFxuPC9wPjxwPlxcbjxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPmhpZGUgc2V0dGluZ3M8L2J1dHRvbj5cXG48L3A+PHA+XFxuPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPmNvbXBhcmUgKy8tPC9idXR0b24+XFxuPC9wPlwiKSxcbiAgICAgIHJpZ2h0Rm9ybTogXy50ZW1wbGF0ZShcIjxwPlxcbjxidXR0b24gY2xhc3M9XFxcImJ0bi1jb3B5LWx0clxcXCI+JnJhcXVvOyBjb3B5IGxlZnQgbWFwPC9idXR0b24+XFxuPC9wPjxwPlxcbjxzZWxlY3QgY2xhc3M9XFxcInJpZ2h0XFxcIiBpZD1cXFwicmlnaHRtYXB5ZWFyXFxcIj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiYmFzZWxpbmVcXFwiPmJhc2VsaW5lPC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcIjIwMTVcXFwiPjIwMTU8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiMjAzNVxcXCI+MjAzNTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCIyMDU1XFxcIj4yMDU1PC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcIjIwNzVcXFwiPjIwNzU8L29wdGlvbj5cXG48L3NlbGVjdD5cXG48L3A+PHA+XFxuPHNlbGVjdCBjbGFzcz1cXFwicmlnaHRcXFwiIGlkPVxcXCJyaWdodG1hcHNjZW5hcmlvXFxcIj5cXG4gICAgPG9wdGlvbj5SQ1AzUEQ8L29wdGlvbj5cXG4gICAgPG9wdGlvbj5SQ1A2PC9vcHRpb24+XFxuPC9zZWxlY3Q+XFxuPC9wPjxwPlxcbjxzZWxlY3QgY2xhc3M9XFxcInJpZ2h0XFxcIiBpZD1cXFwicmlnaHRtYXBnY21cXFwiPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJhbGxcXFwiPm1lZGlhbjwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJjc2lyby1tazMwXFxcIj5DU0lSTyBNYXJrIDMuMDwvb3B0aW9uPlxcbjwvc2VsZWN0PlxcbjwvcD48cD5cXG48YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5oaWRlIHNldHRpbmdzPC9idXR0b24+XFxuPC9wPjxwPlxcbjxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5jb21wYXJlICsvLTwvYnV0dG9uPlxcbjwvcD5cIilcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gQXBwVmlldztcblxufSkuY2FsbCh0aGlzKTtcbiIsIlxuLy8galF1ZXJ5IHBsdWdpblxuLy8gYXV0aG9yOiBEYW5pZWwgQmFpcmQgPGRhbmllbEBkYW5pZWxiYWlyZC5jb20+XG4vLyB2ZXJzaW9uOiAwLjEuMjAxNDAyMDVcblxuLy9cbi8vIFRoaXMgbWFuYWdlcyBtZW51cywgc3VibWVudXMsIHBhbmVscywgYW5kIHBhZ2VzLlxuLy8gTGlrZSB0aGlzOlxuLy8gLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0uLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLVxuLy8gICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgfCAgU2VsZWN0ZWQgTWFpbiBNZW51IEl0ZW0gICAuLS0tLS0tLS0tLS0uIC4tLS0tLS0tLS0uICAgfCAgQWx0IE1haW4gTWVudSBJdGVtICB8ICBUaGlyZCBNYWluIE1lbnUgSXRlbSAgfFxuLy8gICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8gIFN1Yml0ZW0gMSAgXFwgU3ViaXRlbSAyIFxcICB8ICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAtLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICAgICAgICAgICAgICAgJy0tLS0tLS0tLS0tLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nLS0tXG4vLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICBQYW5lbCBmb3IgU3ViaXRlbSAxLCB0aGlzIGlzIFBhZ2UgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgRWFjaCBQYW5lbCBjYW4gaGF2ZSBtdWx0aXBsZSBwYWdlcywgb25lIHBhZ2Ugc2hvd2luZyBhdCBhIHRpbWUuICBCdXR0b25zIG9uIHBhZ2VzIHN3aXRjaCAgICAgIHxcbi8vICAgICAgIHwgICBiZXR3ZWVuIHBhZ2VzLiAgUGFuZWwgaGVpZ2h0IGFkanVzdHMgdG8gdGhlIGhlaWdodCBvZiB0aGUgcGFnZS4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgWyBzZWUgcGFnZSAyIF0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nXG4vL1xuLy8gLSBtZW51cyBhcmUgYWx3YXlzIDx1bD4gdGFnczsgZWFjaCA8bGk+IGlzIGEgbWVudSBpdGVtXG4vLyAtIGEgbWFpbiBtZW51IDxsaT4gbXVzdCBjb250YWluIGFuIDxhPiB0YWcgYW5kIG1heSBhbHNvIGNvbnRhaW4gYSA8dWw+IHN1Ym1lbnVcbi8vIC0gYSBzdWJtZW51IDxsaT4gbXVzdCBjb250YWluIGFuIDxhPiB0YWcgd2l0aCBhIGRhdGEtdGFyZ2V0cGFuZWwgYXR0cmlidXRlIHNldFxuLy8gLSBUaGVyZSBpcyBhbHdheXMgYSBzaW5nbGUgc2VsZWN0ZWQgbWFpbiBtZW51IGl0ZW1cbi8vIC0gQSBtYWluIG1lbnUgaXRlbSBtYXkgZWl0aGVyIGxpbmsgdG8gYW5vdGhlciB3ZWJwYWdlLCBvciBoYXZlIGEgc3VibWVudVxuLy8gLSBTZWxlY3RpbmcgYSBtYWluIG1lbnUgaXRlbSB3aWxsIHNob3cgaXRzIHN1Ym1lbnUsIGlmIGl0IGhhcyBvbmVcbi8vIC0gQSBzdWJtZW51IGFsd2F5cyBoYXMgYSBzaW5nbGUgaXRlbSBzZWxlY3RlZFxuLy8gLSBDbGlja2luZyBhbiBpbmFjdGl2ZSBzdWJtZW51IGl0ZW0gd2lsbCBzaG93IGl0cyBwYW5lbFxuLy8gLSBDbGlja2luZyBhIHNlbGVjdGVkIHN1Ym1lbnUgaXRlbSB3aWxsIHRvZ2dsZSBpdHMgcGFuZWwgc2hvd2luZyA8LT4gaGlkaW5nICgoKCBOQjogbm90IHlldCBpbXBsZW1lbnRlZCApKSlcbi8vIC0gQSBwYW5lbCBpbml0aWFsbHkgc2hvd3MgaXRzIGZpcnN0IHBhZ2Vcbi8vIC0gU3dpdGNoaW5nIHBhZ2VzIGluIGEgcGFuZWwgY2hhbmdlcyB0aGUgcGFuZWwgaGVpZ2h0IHRvIHN1aXQgaXRzIGN1cnJlbnQgcGFnZVxuLy8gLSBBIHBhbmVsIGlzIGEgSFRNTCBibG9jayBlbGVtZW50IHdpdGggdGhlIGNsYXNzIC5tc3BwLXBhbmVsIChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSBJZiBhIHBhbmVsIGNvbnRhaW5zIHBhZ2VzLCBvbmUgcGFnZSBzaG91bGQgaGF2ZSB0aGUgY2xhc3MgLmN1cnJlbnQgKGNhbiBiZSBvdmVycmlkZGVuIHZpYSBvcHRpb24pXG4vLyAtIEEgcGFnZSBpcyBhIEhUTUwgYmxvY2sgZWxlbWVudCB3aXRoIHRoZSBjbGFzcyAubXNwcC1wYWdlIChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSA8YnV0dG9uPiBvciA8YT4gdGFncyBpbiBwYWdlcyB0aGF0IGhhdmUgYSBkYXRhLXRhcmdldHBhZ2UgYXR0cmlidXRlIHNldCB3aWxsIHN3aXRjaCB0byB0aGUgaW5kaWNhdGVkIHBhZ2Vcbi8vXG4vL1xuLy8gVGhlIEhUTUwgc2hvdWxkIGxvb2sgbGlrZSB0aGlzOlxuLy9cbi8vICA8dWwgY2xhc3M9XCJtZW51XCI+ICAgICAgICAgICAgICAgICAgIDwhLS0gdGhpcyBpcyB0aGUgbWFpbiBtZW51IC0tPlxuLy8gICAgICA8bGkgY2xhc3M9XCJjdXJyZW50XCI+ICAgICAgICAgICAgPCEtLSB0aGlzIGlzIGEgbWFpbiBtZW51IGl0ZW0sIGN1cnJlbnRseSBzZWxlY3RlZCAtLT5cbi8vICAgICAgICAgIDxhPkZpcnN0IEl0ZW08L2E+ICAgICAgICAgICA8IS0tIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBtYWluIG1lbnUgLS0+XG4vLyAgICAgICAgICA8dWw+ICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSBhIHN1Ym1lbnUgaW4gdGhlIGZpcnN0IG1haW4gbWVudSBpdGVtIC0tPlxuLy8gICAgICAgICAgICAgIDxsaSBjbGFzcz1cImN1cnJlbnRcIj4gICAgPCEtLSB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHN1Ym1lbnUgaXRlbSAtLT5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tIC5wYW5lbHRyaWdnZXIgYW5kIHRoZSBkYXRhLXBhbmVsaWQgYXR0cmlidXRlIGFyZSByZXF1aXJlZCAtLT5cbi8vICAgICAgICAgICAgICAgICAgPGEgZGF0YS10YXJnZXRwYW5lbD1cInBhbmVsMVwiPmRvIHRoZSBwYW5lbDEgdGhpbmc8L2E+XG4vLyAgICAgICAgICAgICAgPC9saT5cbi8vICAgICAgICAgICAgICA8bGk+Li4uPC9saT4gICAgICAgICAgICA8IS0tIGFub3RoZXIgc3VibWVudSBpdGVtIC0tPlxuLy8gICAgICAgICAgPC91bD5cbi8vICAgICAgPC9saT5cbi8vICAgICAgPGxpPiA8YSBocmVmPVwiYW5vdGhlcl9wYWdlLmh0bWxcIj5hbm90aGVyIHBhZ2U8L2E+IDwvbGk+XG4vLyAgICAgIDxsaT4gPGE+d2hhdGV2ZXI8L2E+IDwvbGk+XG4vLyAgPC91bD5cbi8vXG4vLyAgPGRpdiBpZD1cInBhbmVsMVwiIGNsYXNzPVwibXNwcC1wYW5lbFwiPlxuLy8gICAgICA8ZGl2IGlkPVwicGFnZTExXCIgY2xhc3M9XCJtc3BwLXBhZ2UgY3VycmVudFwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgY3VycmVudCBwYWdlIG9uIHBhbmVsIDEuXG4vLyAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMTJcIj5zaG93IHBhZ2UgMjwvYnV0dG9uPlxuLy8gICAgICA8L2Rpdj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UxMlwiIGNsYXNzPVwibXNwcC1wYWdlXCI+XG4vLyAgICAgICAgICBUaGlzIGlzIHRoZSBvdGhlciBwYWdlIG9uIHBhbmVsIDEuXG4vLyAgICAgICAgICA8YSBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMTFcIj5zZWUgdGhlIGZpcnN0IHBhZ2UgYWdhaW48L2E+XG4vLyAgICAgIDwvZGl2PlxuLy8gIDwvZGl2PlxuLy8gIDxkaXYgaWQ9XCJwYW5lbDJcIiBjbGFzcz1cIm1zcHAtcGFuZWxcIj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UyMVwiIGNsYXNzPVwibXNwcC1wYWdlIGN1cnJlbnRcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIGN1cnJlbnQgcGFnZSBvbiBwYW5lbCAyLlxuLy8gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS10YXJnZXRwYWdlPVwicGFnZTIyXCI+c2hvdyBwYWdlIDI8L2J1dHRvbj5cbi8vICAgICAgPC9kaXY+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMjJcIiBjbGFzcz1cIm1zcHAtcGFnZVwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgb3RoZXIgcGFnZSBvbiBwYW5lbCAyLlxuLy8gICAgICAgICAgPGEgZGF0YS10YXJnZXRwYWdlPVwicGFnZTIxXCI+c2VlIHRoZSBmaXJzdCBwYWdlIGFnYWluPC9hPlxuLy8gICAgICA8L2Rpdj5cbi8vICA8L2Rpdj5cblxuXG47KCBmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuICAgIC8vIG5hbWVzcGFjZSBjbGltYXMsIHdpZGdldCBuYW1lIG1zcHBcbiAgICAvLyBzZWNvbmQgYXJnIGlzIHVzZWQgYXMgdGhlIHdpZGdldCdzIFwicHJvdG90eXBlXCIgb2JqZWN0XG4gICAgJC53aWRnZXQoIFwiY2xpbWFzLm1zcHBcIiAsIHtcblxuICAgICAgICAvL09wdGlvbnMgdG8gYmUgdXNlZCBhcyBkZWZhdWx0c1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBhbmltYXRpb25GYWN0b3I6IDIsXG5cbiAgICAgICAgICAgIG1haW5NZW51Q2xhc3M6ICdtc3BwLW1haW4tbWVudScsXG5cbiAgICAgICAgICAgIHBhbmVsQ2xhc3M6ICdtc3BwLXBhbmVsJyxcbiAgICAgICAgICAgIHBhZ2VDbGFzczogJ21zcHAtcGFnZScsXG5cbiAgICAgICAgICAgIGNsZWFyZml4Q2xhc3M6ICdtc3BwLWNsZWFyZml4JyxcbiAgICAgICAgICAgIGFjdGl2ZUNsYXNzOiAnY3VycmVudCdcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvL1NldHVwIHdpZGdldCAoZWcuIGVsZW1lbnQgY3JlYXRpb24sIGFwcGx5IHRoZW1pbmdcbiAgICAgICAgLy8gLCBiaW5kIGV2ZW50cyBldGMuKVxuICAgICAgICBfY3JlYXRlOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIG9wdHMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgICAgIC8vIHBvcHVsYXRlIHNvbWUgY29udmVuaWVuY2UgdmFyaWFibGVzXG4gICAgICAgICAgICB2YXIgJG1lbnUgPSB0aGlzLmVsZW1lbnQ7XG4gICAgICAgICAgICB0aGlzLm1haW5NZW51SXRlbXMgPSAkbWVudS5jaGlsZHJlbignbGknKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzID0gJCgnLicgKyBvcHRzLnBhbmVsQ2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBkaXNhcHBlYXIgd2hpbGUgd2Ugc29ydCB0aGluZ3Mgb3V0XG4gICAgICAgICAgICAkbWVudS5jc3MoeyBvcGFjaXR5OiAwIH0pO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMuY3NzKHsgb3BhY2l0eTogMCB9KTtcblxuICAgICAgICAgICAgLy8gbWFrZSBzb21lIERPTSBtb2RzXG4gICAgICAgICAgICAkbWVudS5hZGRDbGFzcyhvcHRzLm1haW5NZW51Q2xhc3MpO1xuICAgICAgICAgICAgJG1lbnUuYWRkQ2xhc3Mob3B0cy5jbGVhcmZpeENsYXNzKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmFkZENsYXNzKG9wdHMuY2xlYXJmaXhDbGFzcyk7XG5cbiAgICAgICAgICAgIC8vIGxheW91dCB0aGUgbWVudVxuICAgICAgICAgICAgdGhpcy5fbGF5b3V0TWVudSgpO1xuXG4gICAgICAgICAgICAvLyBsYXlvdXQgdGhlIHBhbmVsc1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0UGFuZWxzKCk7XG5cbiAgICAgICAgICAgIC8vIGhvb2sgdXAgY2xpY2sgaGFuZGxpbmcgZXRjXG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dtZW51JywgdGhpcy5fc2hvd01lbnUpO1xuICAgICAgICAgICAgJG1lbnUub24oJ21zcHBzaG93c3VibWVudScsIHRoaXMuX3Nob3dTdWJNZW51KTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3BhbmVsJywgdGhpcy5fc2hvd1BhbmVsKTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3BhZ2UnLCB0aGlzLl9zaG93UGFnZSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgbWVudS10cmlnZ2Vyc1xuICAgICAgICAgICAgdGhpcy5tYWluTWVudUl0ZW1zLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIGxpIG1lbnUgaXRlbSBoYXMgYSBjaGlsZCBhIHRoYXQgaXMgaXQncyB0cmlnZ2VyXG4gICAgICAgICAgICAgICAgJChpdGVtKS5jaGlsZHJlbignYScpLmNsaWNrKCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93bWVudScsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51aXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIHN1Ym1lbnUgaXRlbXNcbiAgICAgICAgICAgICAgICAkKGl0ZW0pLmZpbmQoJ2xpJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHN1Yk1lbnVJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICQoc3ViTWVudUl0ZW0pLmZpbmQoJ2EnKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dzdWJtZW51JywgZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51aXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtZW51aXRlbTogc3ViTWVudUl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gYXR0YWNoIGhhbmRsZXJzIHRvIHRoZSBwYW5lbCB0cmlnZ2Vyc1xuICAgICAgICAgICAgJG1lbnUuZmluZCgnW2RhdGEtdGFyZ2V0cGFuZWxdJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHRyaWdnZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRyaWdnZXIgPSQodHJpZ2dlcik7XG4gICAgICAgICAgICAgICAgJHRyaWdnZXIuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYW5lbCcsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYW5lbDogJCgnIycgKyAkdHJpZ2dlci5kYXRhKCd0YXJnZXRwYW5lbCcpKS5maXJzdCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgcGFnZSBzd2l0Y2hlcnNcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBwYW5lbCkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKHBhbmVsKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuZmluZCgnW2RhdGEtdGFyZ2V0cGFnZV0nKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd3BhZ2UnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWw6ICRwYW5lbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6ICQoJyMnICsgJCh0aGlzKS5kYXRhKCd0YXJnZXRwYWdlJykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGFjdGl2YXRlIHRoZSBjdXJyZW50IG1lbnVzLCBwYW5lbHMgZXRjXG4gICAgICAgICAgICB2YXIgJGN1cnJlbnRNYWluID0gdGhpcy5tYWluTWVudUl0ZW1zLmZpbHRlcignLicgKyBvcHRzLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICRjdXJyZW50TWFpbi5yZW1vdmVDbGFzcyhvcHRzLmFjdGl2ZUNsYXNzKS5jaGlsZHJlbignYScpLmNsaWNrKCk7XG5cbiAgICAgICAgICAgIC8vIGZpbmFsbHksIGZhZGUgYmFjayBpblxuICAgICAgICAgICAgJG1lbnUuYW5pbWF0ZSh7IG9wYWNpdHk6IDEgfSwgJ2Zhc3QnKTtcblxuICAgICAgICAgICAgLy8gcGFuZWxzIHN0YXkgaW52aXNpYmxlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3N3aXRjaENsYXNzT3B0aW9uOiBmdW5jdGlvbihjbGFzc05hbWUsIG5ld0NsYXNzKSB7XG4gICAgICAgICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnNbY2xhc3NOYW1lXTtcbiAgICAgICAgICAgIGlmIChvbGRDbGFzcyAhPT0gbmV3Q2xhc3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSB0aGlzLmVsZW1lbnQuZmluZCgnLicgKyBvbGRDbGFzcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2NsYXNzTmFtZV0gPSBuZXdDbGFzcztcbiAgICAgICAgICAgICAgICBncm91cC5yZW1vdmVDbGFzcyhvbGRDbGFzcyk7XG4gICAgICAgICAgICAgICAgZ3JvdXAuYWRkQ2xhc3MobmV3Q2xhc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIFJlc3BvbmQgdG8gYW55IGNoYW5nZXMgdGhlIHVzZXIgbWFrZXMgdG8gdGhlXG4gICAgICAgIC8vIG9wdGlvbiBtZXRob2RcbiAgICAgICAgX3NldE9wdGlvbjogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwibWFpbk1lbnVDbGFzc1wiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJjbGVhcmZpeENsYXNzXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImFjdGl2ZUNsYXNzXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N3aXRjaENsYXNzT3B0aW9uKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIGl0J3Mgb2theSB0aGF0IHRoZXJlJ3Mgbm8gfSBoZXJlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZW1lbWJlciB0byBjYWxsIG91ciBzdXBlcidzIF9zZXRPcHRpb24gbWV0aG9kXG4gICAgICAgICAgICB0aGlzLl9zdXBlciggXCJfc2V0T3B0aW9uXCIsIGtleSwgdmFsdWUgKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBEZXN0cm95IGFuIGluc3RhbnRpYXRlZCBwbHVnaW4gYW5kIGNsZWFuIHVwXG4gICAgICAgIC8vIG1vZGlmaWNhdGlvbnMgdGhlIHdpZGdldCBoYXMgbWFkZSB0byB0aGUgRE9NXG4gICAgICAgIF9kZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMubWFpbk1lbnVDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsZWFyZml4Q2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsZWFyZml4Q2xhc3MpO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIGRvIHRoZSBsYXlvdXQgY2FsY3VsYXRpb25zXG4gICAgICAgIF9sYXlvdXRNZW51OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggZWFjaCBzdWJtZW51IGFuZCByZWNvcmQgaXRzIHdpZHRoXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCgndWwnKS5lYWNoKCBmdW5jdGlvbihpbmRleCwgc3ViTWVudSkge1xuICAgICAgICAgICAgICAgIHZhciAkc20gPSAkKHN1Yk1lbnUpO1xuICAgICAgICAgICAgICAgICRzbS5jc3Moe3dpZHRoOiAnYXV0byd9KTtcbiAgICAgICAgICAgICAgICAkc20uZGF0YSgnb3JpZ2luYWxXaWR0aCcsICRzbS53aWR0aCgpKTtcblxuICAgICAgICAgICAgICAgIC8vIGxlYXZlIGVhY2ggc3VibWVudSBoaWRkZW4sIHdpdGggd2lkdGggMFxuICAgICAgICAgICAgICAgICRzbS5jc3MoeyB3aWR0aDogMCwgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dNZW51OiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgdmFyICRpdGVtID0gJChkYXRhLm1lbnVpdGVtKTtcbiAgICAgICAgICAgIHZhciBiYXNlID0gZGF0YS53aWRnZXQ7XG4gICAgICAgICAgICAvLyAkaXRlbSBpcyBhIGNsaWNrZWQtb24gbWVudSBpdGVtLi5cbiAgICAgICAgICAgIGlmICgkaXRlbS5oYXNDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgICAgICAgICAgLy8gPz9cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5faGlkZVBhbmVscygpO1xuICAgICAgICAgICAgICAgIGJhc2UubWFpbk1lbnVJdGVtcy5yZW1vdmVDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgIHZhciAkbmV3U3ViTWVudSA9ICRpdGVtLmZpbmQoJ3VsJyk7XG4gICAgICAgICAgICAgICAgdmFyICRvbGRTdWJNZW51cyA9IGJhc2UuZWxlbWVudC5maW5kKCd1bCcpLm5vdCgkbmV3U3ViTWVudSk7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1dpZHRoID0gJG5ld1N1Yk1lbnUuZGF0YSgnb3JpZ2luYWxXaWR0aCcpO1xuXG4gICAgICAgICAgICAgICAgJG9sZFN1Yk1lbnVzLmFuaW1hdGUoeyB3aWR0aDogMCB9LCAoNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRvbGRTdWJNZW51cy5jc3MoeyBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICAkbmV3U3ViTWVudVxuICAgICAgICAgICAgICAgICAgICAuY3NzKHtkaXNwbGF5OiAnYmxvY2snIH0pXG4gICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgd2lkdGg6IG5ld1dpZHRoIH0sICgxMjUgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbmV3U3ViTWVudS5jc3MoeyB3aWR0aDogJ2F1dG8nIH0pLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdtZW51c2hvd24nLCBldmVudCwgeyBpdGVtOiAkaXRlbSwgd2lkZ2V0OiBiYXNlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgbmV3IHN1Ym1lbnUgaGFzIGFuIGFjdGl2ZSBpdGVtLCBjbGljayBpdFxuICAgICAgICAgICAgICAgICRuZXdTdWJNZW51LmZpbmQoJy4nICsgYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzICsgJyBhJykuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd1N1Yk1lbnU6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAvLyBkZS1hY3RpdmVpZnkgYWxsIHRoZSBzdWJtZW51IGl0ZW1zXG4gICAgICAgICAgICAkKGRhdGEubWVudWl0ZW0pLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoZGF0YS53aWRnZXQub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAvLyBhY3RpdmUtaWZ5IHRoZSBvbmUgdHJ1ZSBzdWJtZW51IGl0ZW1cbiAgICAgICAgICAgICQoZGF0YS5zdWJtZW51aXRlbSkuYWRkQ2xhc3MoZGF0YS53aWRnZXQub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy8gZG8gdGhlIGxheW91dCBjYWxjdWxhdGlvbnNcbiAgICAgICAgX2xheW91dFBhbmVsczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciAkcGFnZXMgPSB0aGlzLnBhbmVscy5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5wYWdlQ2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBnbyB0aHJvdWdoIGVhY2ggcGFnZSBhbmQgcmVjb3JkIGl0cyBoZWlnaHRcbiAgICAgICAgICAgICRwYWdlcy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFnZSkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFnZSA9ICQocGFnZSk7XG4gICAgICAgICAgICAgICAgJHBhZ2UuY3NzKHtoZWlnaHQ6ICdhdXRvJ30pO1xuICAgICAgICAgICAgICAgICRwYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0JywgJHBhZ2Uub3V0ZXJIZWlnaHQoKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBsZWF2ZSBlYWNoIHBhZ2UgaGlkZGVuLCB3aXRoIGhlaWdodCAwXG4gICAgICAgICAgICAgICAgJHBhZ2UuY3NzKHsgaGVpZ2h0OiAwLCBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCBlYWNoIHBhbmVsIGFuZCBoaWRlIGl0XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFuZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHBhbmVsID0gJChwYW5lbCk7XG4gICAgICAgICAgICAgICAgJHBhbmVsLmNzcyh7IGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9oaWRlUGFuZWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcykuY3NzKHsgZGlzcGxheTogJ25vbmUnLCBoZWlnaHQ6IDAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dQYW5lbDogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKGRhdGEucGFuZWwpO1xuICAgICAgICAgICAgdmFyIGJhc2UgPSBkYXRhLndpZGdldDtcbiAgICAgICAgICAgIC8vICRwYW5lbCBpcyBhIHBhbmVsIHRvIHNob3cuLlxuICAgICAgICAgICAgaWYgKCRwYW5lbC5oYXNDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgICAgICAgICAgLy8gPz9cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5faGlkZVBhbmVscygpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5hZGRDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5jc3MoeyBkaXNwbGF5OiAnYmxvY2snLCBvcGFjaXR5OiAxIH0pO1xuICAgICAgICAgICAgICAgIHZhciAkcGFnZSA9ICQoJHBhbmVsLmZpbmQoJy4nICsgYmFzZS5vcHRpb25zLnBhZ2VDbGFzcyArICcuJyArIGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykpO1xuICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYWdlJywgZXZlbnQsIHsgcGFuZWw6ICRwYW5lbCwgcGFnZTogJHBhZ2UsIHdpZGdldDogYmFzZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd1BhZ2U6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IGRhdGEud2lkZ2V0O1xuICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQoZGF0YS5wYW5lbCk7XG4gICAgICAgICAgICB2YXIgJHBhZ2UgPSAkKGRhdGEucGFnZSk7XG4gICAgICAgICAgICB2YXIgbmV3SGVpZ2h0ID0gJHBhZ2UuZGF0YSgnb3JpZ2luYWxIZWlnaHQnKTtcblxuICAgICAgICAgICAgLy8gZml4IHRoZSBwYW5lbCdzIGN1cnJlbnQgaGVpZ2h0XG4gICAgICAgICAgICAkcGFuZWwuY3NzKHtoZWlnaHQ6ICRwYW5lbC5oZWlnaHQoKSB9KTtcblxuICAgICAgICAgICAgLy8gZGVhbCB3aXRoIHRoZSBwYWdlIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWRcbiAgICAgICAgICAgIHZhciAkb2xkUGFnZSA9ICRwYW5lbC5maW5kKCcuJyArIGJhc2Uub3B0aW9ucy5wYWdlQ2xhc3MgKyAnLicgKyBiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLm5vdCgkcGFnZSk7XG4gICAgICAgICAgICBpZiAoJG9sZFBhZ2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICRvbGRQYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0JywgJG9sZFBhZ2Uub3V0ZXJIZWlnaHQoKSk7XG4gICAgICAgICAgICAgICAgJG9sZFBhZ2UucmVtb3ZlQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5mYWRlT3V0KCg1MCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJG9sZFBhZ2UuY3NzKHsgaGVpZ2h0OiAwIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzd2l0Y2ggb24gdGhlIG5ldyBwYWdlIGFuZCBncm93IHRoZSBvcGFuZWwgdG8gaG9sZCBpdFxuICAgICAgICAgICAgJHBhZ2UuY3NzKHsgaGVpZ2h0OiAnYXV0bycgfSkuYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5mYWRlSW4oKDEwMCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkcGFnZS5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgYW5pbVRpbWUgPSAoJG9sZFBhZ2UubGVuZ3RoID4gMCA/ICgxMDAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSA6ICgxNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSk7IC8vIGFuaW1hdGUgZmFzdGVyIGlmIGl0J3Mgc3dpdGNoaW5nIHBhZ2VzXG4gICAgICAgICAgICAkcGFuZWwuYW5pbWF0ZSh7IGhlaWdodDogbmV3SGVpZ2h0IH0sIGFuaW1UaW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkcGFuZWwucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgXzogbnVsbCAvLyBubyBmb2xsb3dpbmcgY29tbWFcbiAgICB9KTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiJdfQ==
