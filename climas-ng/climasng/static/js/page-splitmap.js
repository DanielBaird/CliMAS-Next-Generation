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
    threshold = 'message';
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
      leftForm: _.template("<p>\n<button class=\"btn-copy-rtl\">copy right map &laquo;</button>\n</p><p>\n<select class=\"left\" id=\"leftmapyear\">\n    <option value=\"baseline\">baseline</option>\n    <option>2015</option>\n    <option>2025</option>\n    <option>2035</option>\n    <option>2045</option>\n    <option>2055</option>\n    <option>2065</option>\n    <option>2075</option>\n    <option>2085</option>\n</select>\n</p><p>\n<select class=\"left\" id=\"leftmapscenario\">\n    <option value=\"RCP3PD\">RCP 3PD</option>\n    <option value=\"RCP45\">RCP 4.5</option>\n    <option value=\"RCP6\">RCP 6</option>\n    <option value=\"RCP85\" selected=\"selected\">RCP 8.5</option>\n</select>\n</p><p>\n<select class=\"left\" id=\"leftmapgcm\">\n    <option value=\"all\">median</option>\n    <option value=\"csiro-mk30\">CSIRO Mark 3.0</option>\n    <option value=\"giss-modeleh\">GISS E20/HYCOM</option>\n    <option value=\"ncar-ccsm30\">NCAR CCSM 3.0</option>\n    <option value=\"ukmo-hadgem1\">UK Met Office HadGEM1</option>\n</select>\n</p><p>\n<button class=\"btn-change\">hide settings</button>\n</p><p>\n<button class=\"btn-compare\">compare +/-</button>\n</p>"),
      rightForm: _.template("<p>\n<button class=\"btn-copy-ltr\">&raquo; copy left map</button>\n</p><p>\n<select class=\"right\" id=\"rightmapyear\">\n    <option value=\"baseline\">baseline</option>\n    <option>2015</option>\n    <option>2025</option>\n    <option>2035</option>\n    <option>2045</option>\n    <option>2055</option>\n    <option>2065</option>\n    <option>2075</option>\n    <option>2085</option>\n</select>\n</p><p>\n<select class=\"right\" id=\"rightmapscenario\">\n    <option value=\"RCP3PD\">RCP 3PD</option>\n    <option value=\"RCP45\">RCP 4.5</option>\n    <option value=\"RCP6\">RCP 6</option>\n    <option value=\"RCP85\" selected=\"selected\">RCP 8.5</option>\n</select>\n</p><p>\n<select class=\"right\" id=\"rightmapgcm\">\n    <option value=\"all\">median</option>\n    <option value=\"csiro-mk30\">CSIRO Mark 3.0</option>\n    <option value=\"giss-modeleh\">GISS E20/HYCOM</option>\n    <option value=\"ncar-ccsm30\">NCAR CCSM 3.0</option>\n    <option value=\"ukmo-hadgem1\">UK Met Office HadGEM1</option>\n</select>\n</p><p>\n<button class=\"btn-change\">hide settings</button>\n</p><p>\n<button class=\"btn-compare\">compare +/-</button>\n</p>")
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9mYWtlXzQyNDlmNTFiLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvbW9kZWxzL21hcGxheWVyLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L3V0aWwvc2hpbXMuanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tZW51c2FuZHBhbmVscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxucmVxdWlyZSgnLi9tYXB2aWV3L21haW4nKTtcbnJlcXVpcmUoJy4vbWVudXNhbmRwYW5lbHMnKTtcblxuJChmdW5jdGlvbigpIHtcbiAgICAvLyAkKCdoZWFkZXInKS5kaXNhYmxlU2VsZWN0aW9uKCk7IC8vIHVucG9wdWxhciBidXQgc3RpbGwgYmV0dGVyXG4gICAgJCgnbmF2ID4gdWwnKS5tc3BwKHt9KTtcbn0pO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldztcblxuICBpZiAoIXdpbmRvdy5jb25zb2xlKSB7XG4gICAgd2luZG93LmNvbnNvbGUgPSB7XG4gICAgICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIEFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FwcCcpO1xuXG4gICQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFwcHZpZXc7XG4gICAgYXBwdmlldyA9IG5ldyBBcHBWaWV3KCk7XG4gICAgcmV0dXJuIGFwcHZpZXcucmVuZGVyKCk7XG4gIH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgTWFwTGF5ZXI7XG5cbiAgTWFwTGF5ZXIgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbihzaG9ydE5hbWUsIGxvbmdOYW1lLCBwYXRoKSB7XG4gICAgICB0aGlzLnNob3J0TmFtZSA9IHNob3J0TmFtZTtcbiAgICAgIHRoaXMubG9uZ05hbWUgPSBsb25nTmFtZTtcbiAgICAgIHRoaXMucGF0aCA9IHBhdGg7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gTWFwTGF5ZXI7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5mb3JFYWNoKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihmbiwgc2NvcGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgX3Jlc3VsdHMucHVzaChfX2luZGV4T2YuY2FsbCh0aGlzLCBpKSA+PSAwID8gZm4uY2FsbChzY29wZSwgdGhpc1tpXSwgaSwgdGhpcykgOiB2b2lkIDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgIH07XG4gIH1cblxuICBpZiAoIUFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihuZWVkbGUpIHtcbiAgICAgIHZhciBpLCBfaSwgX3JlZjtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIGlmICh0aGlzW2ldID09PSBuZWVkbGUpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXcsIE1hcExheWVyLCBkZWJ1ZyxcbiAgICBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuICBNYXBMYXllciA9IHJlcXVpcmUoJy4uL21vZGVscy9tYXBsYXllcicpO1xuXG4gIHJlcXVpcmUoJy4uL3V0aWwvc2hpbXMnKTtcblxuXG4gIC8qIGpzaGludCAtVzA5MyAqL1xuXG4gIGRlYnVnID0gZnVuY3Rpb24oaXRlbVRvTG9nLCBpdGVtTGV2ZWwpIHtcbiAgICB2YXIgbGV2ZWxzLCBtZXNzYWdlTnVtLCB0aHJlc2hvbGQsIHRocmVzaG9sZE51bTtcbiAgICBsZXZlbHMgPSBbJ3ZlcnlkZWJ1ZycsICdkZWJ1ZycsICdtZXNzYWdlJywgJ3dhcm5pbmcnXTtcbiAgICB0aHJlc2hvbGQgPSAnbWVzc2FnZSc7XG4gICAgaWYgKCFpdGVtTGV2ZWwpIHtcbiAgICAgIGl0ZW1MZXZlbCA9ICdkZWJ1Zyc7XG4gICAgfVxuICAgIHRocmVzaG9sZE51bSA9IGxldmVscy5pbmRleE9mKHRocmVzaG9sZCk7XG4gICAgbWVzc2FnZU51bSA9IGxldmVscy5pbmRleE9mKGl0ZW1MZXZlbCk7XG4gICAgaWYgKHRocmVzaG9sZE51bSA+IG1lc3NhZ2VOdW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGl0ZW1Ub0xvZyArICcnID09PSBpdGVtVG9Mb2cpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIltcIiArIGl0ZW1MZXZlbCArIFwiXSBcIiArIGl0ZW1Ub0xvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhpdGVtVG9Mb2cpO1xuICAgIH1cbiAgfTtcblxuICBBcHBWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgIGNsYXNzTmFtZTogJ3NwbGl0bWFwIHNob3dmb3JtcycsXG4gICAgaWQ6ICdzcGxpdG1hcCcsXG4gICAgc3BlY2llc0RhdGFVcmw6IFwiXCIgKyBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3QgKyBcIi9zcGVjaWVzZGF0YVwiLFxuICAgIHJhc3RlckFwaVVybDogXCJcIiArIGxvY2F0aW9uLnByb3RvY29sICsgXCIvL2xvY2FsaG9zdDoxMDYwMC9hcGkvcmFzdGVyLzEvd21zX2RhdGFfdXJsXCIsXG4gICAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gICAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgICBldmVudHM6IHtcbiAgICAgICdjbGljayAuYnRuLWNoYW5nZSc6ICd0b2dnbGVGb3JtcycsXG4gICAgICAnY2xpY2sgLmJ0bi1jb21wYXJlJzogJ3RvZ2dsZVNwbGl0dGVyJyxcbiAgICAgICdjbGljayAuYnRuLWNvcHktbHRyJzogJ2NvcHlNYXBMZWZ0VG9SaWdodCcsXG4gICAgICAnY2xpY2sgLmJ0bi1jb3B5LXJ0bCc6ICdjb3B5TWFwUmlnaHRUb0xlZnQnLFxuICAgICAgJ2xlZnRtYXB1cGRhdGUnOiAnbGVmdFNpZGVVcGRhdGUnLFxuICAgICAgJ3JpZ2h0bWFwdXBkYXRlJzogJ3JpZ2h0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIHNlbGVjdC5sZWZ0JzogJ2xlZnRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2Ugc2VsZWN0LnJpZ2h0JzogJ3JpZ2h0U2lkZVVwZGF0ZSdcbiAgICB9LFxuICAgIHRpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGZhbHNlKSB7XG4gICAgICAgIGRlYnVnKHRoaXMubWFwLmdldFBpeGVsT3JpZ2luKCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNldFRpbWVvdXQodGhpcy50aWNrLCAyMDAwKTtcbiAgICB9LFxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuaW5pdGlhbGl6ZScpO1xuICAgICAgXy5iaW5kQWxsLmFwcGx5KF8sIFt0aGlzXS5jb25jYXQoXy5mdW5jdGlvbnModGhpcykpKTtcbiAgICAgIHJldHVybiB0aGlzLnNwZWNpZXNJbmZvRmV0Y2hQcm9jZXNzID0gdGhpcy5mZXRjaFNwZWNpZXNJbmZvKCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVuZGVyJyk7XG4gICAgICB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy50ZW1wbGF0ZXMubGF5b3V0KHtcbiAgICAgICAgbGVmdFRhZzogQXBwVmlldy50ZW1wbGF0ZXMubGVmdFRhZygpLFxuICAgICAgICByaWdodFRhZzogQXBwVmlldy50ZW1wbGF0ZXMucmlnaHRUYWcoKSxcbiAgICAgICAgbGVmdEZvcm06IEFwcFZpZXcudGVtcGxhdGVzLmxlZnRGb3JtKCksXG4gICAgICAgIHJpZ2h0Rm9ybTogQXBwVmlldy50ZW1wbGF0ZXMucmlnaHRGb3JtKClcbiAgICAgIH0pKTtcbiAgICAgICQoJyNjb250ZW50d3JhcCcpLmFwcGVuZCh0aGlzLiRlbCk7XG4gICAgICB0aGlzLm1hcCA9IEwubWFwKCdtYXAnLCB7XG4gICAgICAgIGNlbnRlcjogWy0yMCwgMTM2XSxcbiAgICAgICAgem9vbTogNVxuICAgICAgfSk7XG4gICAgICB0aGlzLm1hcC5vbignbW92ZScsIHRoaXMucmVzaXplVGhpbmdzKTtcbiAgICAgIEwudGlsZUxheWVyKCdodHRwOi8vb3RpbGV7c30ubXFjZG4uY29tL3RpbGVzLzEuMC4wL21hcC97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICAgIHN1YmRvbWFpbnM6ICcxMjM0JyxcbiAgICAgICAgbWF4Wm9vbTogMTgsXG4gICAgICAgIGF0dHJpYnV0aW9uOiAnTWFwIGRhdGEgJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3BlbnN0cmVldG1hcC5vcmdcIj5PcGVuU3RyZWV0TWFwPC9hPixcXG50aWxlcyAmY29weTsgPGEgaHJlZj1cImh0dHA6Ly93d3cubWFwcXVlc3QuY29tL1wiIHRhcmdldD1cIl9ibGFua1wiPk1hcFF1ZXN0PC9hPidcbiAgICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcbiAgICAgIHRoaXMubGVmdEZvcm0gPSB0aGlzLiQoJy5sZWZ0LmZvcm0nKTtcbiAgICAgIHRoaXMuYnVpbGRMZWZ0Rm9ybSgpO1xuICAgICAgdGhpcy5yaWdodEZvcm0gPSB0aGlzLiQoJy5yaWdodC5mb3JtJyk7XG4gICAgICB0aGlzLmJ1aWxkUmlnaHRGb3JtKCk7XG4gICAgICB0aGlzLmxlZnRUYWcgPSB0aGlzLiQoJy5sZWZ0LnRhZycpO1xuICAgICAgdGhpcy5yaWdodFRhZyA9IHRoaXMuJCgnLnJpZ2h0LnRhZycpO1xuICAgICAgdGhpcy5zcGxpdExpbmUgPSB0aGlzLiQoJy5zcGxpdGxpbmUnKTtcbiAgICAgIHJldHVybiB0aGlzLnNwbGl0VGh1bWIgPSB0aGlzLiQoJy5zcGxpdHRodW1iJyk7XG4gICAgfSxcbiAgICBjb3B5TWFwTGVmdFRvUmlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuY29weU1hcExlZnRUb1JpZ2h0Jyk7XG4gICAgICBpZiAoIXRoaXMubGVmdEluZm8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy4kKCcjcmlnaHRtYXBzcHAnKS52YWwodGhpcy5sZWZ0SW5mby5zcGVjaWVzTmFtZSk7XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcHllYXInKS52YWwodGhpcy5sZWZ0SW5mby55ZWFyKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwc2NlbmFyaW8nKS52YWwodGhpcy5sZWZ0SW5mby5zY2VuYXJpbyk7XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcGdjbScpLnZhbCh0aGlzLmxlZnRJbmZvLmdjbSk7XG4gICAgICByZXR1cm4gdGhpcy5yaWdodFNpZGVVcGRhdGUoKTtcbiAgICB9LFxuICAgIGNvcHlNYXBSaWdodFRvTGVmdDogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jb3B5TWFwUmlnaHRUb0xlZnQnKTtcbiAgICAgIGlmICghdGhpcy5yaWdodEluZm8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy4kKCcjbGVmdG1hcHNwcCcpLnZhbCh0aGlzLnJpZ2h0SW5mby5zcGVjaWVzTmFtZSk7XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFweWVhcicpLnZhbCh0aGlzLnJpZ2h0SW5mby55ZWFyKTtcbiAgICAgIHRoaXMuJCgnI2xlZnRtYXBzY2VuYXJpbycpLnZhbCh0aGlzLnJpZ2h0SW5mby5zY2VuYXJpbyk7XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFwZ2NtJykudmFsKHRoaXMucmlnaHRJbmZvLmdjbSk7XG4gICAgICByZXR1cm4gdGhpcy5sZWZ0U2lkZVVwZGF0ZSgpO1xuICAgIH0sXG4gICAgbGVmdFNpZGVVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5ld0xlZnRJbmZvLCBzcHBOYW1lO1xuICAgICAgZGVidWcoJ0FwcFZpZXcubGVmdFNpZGVVcGRhdGUnKTtcbiAgICAgIHNwcE5hbWUgPSB0aGlzLiQoJyNsZWZ0bWFwc3BwJykudmFsKCk7XG4gICAgICBpZiAoX19pbmRleE9mLmNhbGwodGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QsIHNwcE5hbWUpID49IDApIHtcbiAgICAgICAgdGhpcy4kKCcuYnRuLWNvcHktcnRsJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiQoJy5idG4tY29weS1ydGwnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBuZXdMZWZ0SW5mbyA9IHtcbiAgICAgICAgc3BlY2llc05hbWU6IHNwcE5hbWUsXG4gICAgICAgIHllYXI6IHRoaXMuJCgnI2xlZnRtYXB5ZWFyJykudmFsKCksXG4gICAgICAgIHNjZW5hcmlvOiB0aGlzLiQoJyNsZWZ0bWFwc2NlbmFyaW8nKS52YWwoKSxcbiAgICAgICAgZ2NtOiB0aGlzLiQoJyNsZWZ0bWFwZ2NtJykudmFsKClcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5sZWZ0SW5mbyAmJiBfLmlzRXF1YWwobmV3TGVmdEluZm8sIHRoaXMubGVmdEluZm8pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxlZnRJbmZvICYmIG5ld0xlZnRJbmZvLnNwZWNpZXNOYW1lID09PSB0aGlzLmxlZnRJbmZvLnNwZWNpZXNOYW1lICYmIG5ld0xlZnRJbmZvLnllYXIgPT09IHRoaXMubGVmdEluZm8ueWVhciAmJiBuZXdMZWZ0SW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRoaXMubGVmdEluZm8gPSBuZXdMZWZ0SW5mbztcbiAgICAgIHRoaXMuYWRkTWFwTGF5ZXIoJ2xlZnQnKTtcbiAgICAgIHJldHVybiB0aGlzLmFkZE1hcFRhZygnbGVmdCcpO1xuICAgIH0sXG4gICAgcmlnaHRTaWRlVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuZXdSaWdodEluZm8sIHNwcE5hbWU7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yaWdodFNpZGVVcGRhdGUnKTtcbiAgICAgIHNwcE5hbWUgPSB0aGlzLiQoJyNyaWdodG1hcHNwcCcpLnZhbCgpO1xuICAgICAgaWYgKF9faW5kZXhPZi5jYWxsKHRoaXMuc3BlY2llc1NjaU5hbWVMaXN0LCBzcHBOYW1lKSA+PSAwKSB7XG4gICAgICAgIHRoaXMuJCgnLmJ0bi1jb3B5LWx0cicpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kKCcuYnRuLWNvcHktbHRyJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgbmV3UmlnaHRJbmZvID0ge1xuICAgICAgICBzcGVjaWVzTmFtZTogc3BwTmFtZSxcbiAgICAgICAgeWVhcjogdGhpcy4kKCcjcmlnaHRtYXB5ZWFyJykudmFsKCksXG4gICAgICAgIHNjZW5hcmlvOiB0aGlzLiQoJyNyaWdodG1hcHNjZW5hcmlvJykudmFsKCksXG4gICAgICAgIGdjbTogdGhpcy4kKCcjcmlnaHRtYXBnY20nKS52YWwoKVxuICAgICAgfTtcbiAgICAgIGlmICh0aGlzLnJpZ2h0SW5mbyAmJiBfLmlzRXF1YWwobmV3UmlnaHRJbmZvLCB0aGlzLnJpZ2h0SW5mbykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucmlnaHRJbmZvICYmIG5ld1JpZ2h0SW5mby5zcGVjaWVzTmFtZSA9PT0gdGhpcy5yaWdodEluZm8uc3BlY2llc05hbWUgJiYgbmV3UmlnaHRJbmZvLnllYXIgPT09IHRoaXMucmlnaHRJbmZvLnllYXIgJiYgbmV3UmlnaHRJbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdGhpcy5yaWdodEluZm8gPSBuZXdSaWdodEluZm87XG4gICAgICB0aGlzLmFkZE1hcExheWVyKCdyaWdodCcpO1xuICAgICAgcmV0dXJuIHRoaXMuYWRkTWFwVGFnKCdyaWdodCcpO1xuICAgIH0sXG4gICAgYWRkTWFwVGFnOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgaW5mbywgdGFnO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYWRkTWFwVGFnJyk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIGluZm8gPSB0aGlzLmxlZnRJbmZvO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgaW5mbyA9IHRoaXMucmlnaHRJbmZvO1xuICAgICAgfVxuICAgICAgdGFnID0gXCI8Yj48aT5cIiArIGluZm8uc3BlY2llc05hbWUgKyBcIjwvaT48L2I+XCI7XG4gICAgICBpZiAoaW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgIHRhZyA9IFwiY3VycmVudCBcIiArIHRhZyArIFwiIGRpc3RyaWJ1dGlvblwiO1xuICAgICAgfSBlbHNlIGlmIChpbmZvLmdjbSA9PT0gJ2FsbCcpIHtcbiAgICAgICAgdGFnID0gXCI8Yj5tZWRpYW48L2I+IHByb2plY3Rpb25zIGZvciBcIiArIHRhZyArIFwiIGluIDxiPlwiICsgaW5mby55ZWFyICsgXCI8L2I+IGlmIDxiPlwiICsgaW5mby5zY2VuYXJpbyArIFwiPC9iPlwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFnID0gXCI8Yj5cIiArIGluZm8uZ2NtICsgXCI8L2I+IHByb2plY3Rpb25zIGZvciBcIiArIHRhZyArIFwiIGluIDxiPlwiICsgaW5mby55ZWFyICsgXCI8L2I+IGlmIDxiPlwiICsgaW5mby5zY2VuYXJpbyArIFwiPC9iPlwiO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICB0aGlzLmxlZnRUYWcuZmluZCgnLmxlZnRsYXllcm5hbWUnKS5odG1sKHRhZyk7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICByZXR1cm4gdGhpcy5yaWdodFRhZy5maW5kKCcucmlnaHRsYXllcm5hbWUnKS5odG1sKHRhZyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhZGRNYXBMYXllcjogZnVuY3Rpb24oc2lkZSkge1xuICAgICAgdmFyIGZ1dHVyZU1vZGVsUG9pbnQsIGxheWVyLCBsb2FkQ2xhc3MsIG1hcERhdGEsIHNpZGVJbmZvO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYWRkTWFwTGF5ZXInKTtcbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgc2lkZUluZm8gPSB0aGlzLmxlZnRJbmZvO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgc2lkZUluZm8gPSB0aGlzLnJpZ2h0SW5mbztcbiAgICAgIH1cbiAgICAgIGZ1dHVyZU1vZGVsUG9pbnQgPSBbc2lkZUluZm8uc2NlbmFyaW8sIHNpZGVJbmZvLmdjbSwgc2lkZUluZm8ueWVhcl0uam9pbignXycpO1xuICAgICAgaWYgKHNpZGVJbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgZnV0dXJlTW9kZWxQb2ludCA9ICcxOTkwJztcbiAgICAgIH1cbiAgICAgIG1hcERhdGEgPSBbdGhpcy5zcGVjaWVzRGF0YVVybCwgc2lkZUluZm8uc3BlY2llc05hbWUucmVwbGFjZSgnICcsICdfJyksICdvdXRwdXQnLCBmdXR1cmVNb2RlbFBvaW50ICsgJy5hc2MuZ3onXS5qb2luKCcvJyk7XG4gICAgICBsYXllciA9IEwudGlsZUxheWVyLndtcyh0aGlzLnJhc3RlckFwaVVybCwge1xuICAgICAgICBEQVRBX1VSTDogbWFwRGF0YSxcbiAgICAgICAgbGF5ZXJzOiAnREVGQVVMVCcsXG4gICAgICAgIGZvcm1hdDogJ2ltYWdlL3BuZycsXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlXG4gICAgICB9KTtcbiAgICAgIGxvYWRDbGFzcyA9ICcnICsgc2lkZSArICdsb2FkaW5nJztcbiAgICAgIGxheWVyLm9uKCdsb2FkaW5nJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLmFkZENsYXNzKGxvYWRDbGFzcyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBsYXllci5vbignbG9hZCcsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC5yZW1vdmVDbGFzcyhsb2FkQ2xhc3MpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgbGF5ZXIuYWRkVG8odGhpcy5tYXApO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLmxlZnRMYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sZWZ0TGF5ZXIgPSBsYXllcjtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLnJpZ2h0TGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmlnaHRMYXllciA9IGxheWVyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgfSxcbiAgICBjZW50cmVNYXA6IGZ1bmN0aW9uKHJlcGVhdGVkbHlGb3IpIHtcbiAgICAgIHZhciBsYXRlciwgcmVjZW50cmUsIF9pLCBfcmVzdWx0cztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNlbnRyZU1hcCcpO1xuICAgICAgaWYgKCFyZXBlYXRlZGx5Rm9yKSB7XG4gICAgICAgIHJlcGVhdGVkbHlGb3IgPSA1MDA7XG4gICAgICB9XG4gICAgICByZWNlbnRyZSA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMubWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGxhdGVyID0gX2kgPSAwOyBfaSA8PSByZXBlYXRlZGx5Rm9yOyBsYXRlciA9IF9pICs9IDI1KSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2goc2V0VGltZW91dChyZWNlbnRyZSwgbGF0ZXIpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9LFxuICAgIHRvZ2dsZUZvcm1zOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnRvZ2dsZUZvcm1zJyk7XG4gICAgICB0aGlzLiRlbC50b2dnbGVDbGFzcygnc2hvd2Zvcm1zJyk7XG4gICAgICByZXR1cm4gdGhpcy5jZW50cmVNYXAoKTtcbiAgICB9LFxuICAgIHRvZ2dsZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnRvZ2dsZVNwbGl0dGVyJyk7XG4gICAgICB0aGlzLiRlbC50b2dnbGVDbGFzcygnc3BsaXQnKTtcbiAgICAgIGlmICh0aGlzLiRlbC5oYXNDbGFzcygnc3BsaXQnKSkge1xuICAgICAgICB0aGlzLmFjdGl2YXRlU3BsaXR0ZXIoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGVhY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5jZW50cmVNYXAoKTtcbiAgICB9LFxuICAgIGZldGNoU3BlY2llc0luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hTcGVjaWVzSW5mbycpO1xuICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgIHVybDogJy9zcGVjaWVzZGF0YS9zcGVjaWVzLmpzb24nXG4gICAgICB9KS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBjb21tb25OYW1lV3JpdGVyLCBzcGVjaWVzTG9va3VwTGlzdCwgc3BlY2llc1NjaU5hbWVMaXN0O1xuICAgICAgICAgIHNwZWNpZXNMb29rdXBMaXN0ID0gW107XG4gICAgICAgICAgc3BlY2llc1NjaU5hbWVMaXN0ID0gW107XG4gICAgICAgICAgY29tbW9uTmFtZVdyaXRlciA9IGZ1bmN0aW9uKHNjaU5hbWUpIHtcbiAgICAgICAgICAgIHZhciBzY2lOYW1lUG9zdGZpeDtcbiAgICAgICAgICAgIHNjaU5hbWVQb3N0Zml4ID0gXCIgKFwiICsgc2NpTmFtZSArIFwiKVwiO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNuSW5kZXgsIGNuKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzcGVjaWVzTG9va3VwTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICBsYWJlbDogY24gKyBzY2lOYW1lUG9zdGZpeCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogc2NpTmFtZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfTtcbiAgICAgICAgICAkLmVhY2goZGF0YSwgZnVuY3Rpb24oc2NpTmFtZSwgY29tbW9uTmFtZXMpIHtcbiAgICAgICAgICAgIHNwZWNpZXNTY2lOYW1lTGlzdC5wdXNoKHNjaU5hbWUpO1xuICAgICAgICAgICAgaWYgKGNvbW1vbk5hbWVzKSB7XG4gICAgICAgICAgICAgIHJldHVybiAkLmVhY2goY29tbW9uTmFtZXMsIGNvbW1vbk5hbWVXcml0ZXIoc2NpTmFtZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNwZWNpZXNMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBzY2lOYW1lLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzY2lOYW1lXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIF90aGlzLnNwZWNpZXNMb29rdXBMaXN0ID0gc3BlY2llc0xvb2t1cExpc3Q7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnNwZWNpZXNTY2lOYW1lTGlzdCA9IHNwZWNpZXNTY2lOYW1lTGlzdDtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIGJ1aWxkTGVmdEZvcm06IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRMZWZ0Rm9ybScpO1xuICAgICAgcmV0dXJuIHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkbGVmdG1hcHNwcDtcbiAgICAgICAgICAkbGVmdG1hcHNwcCA9IF90aGlzLiQoJyNsZWZ0bWFwc3BwJyk7XG4gICAgICAgICAgcmV0dXJuICRsZWZ0bWFwc3BwLmF1dG9jb21wbGV0ZSh7XG4gICAgICAgICAgICBzb3VyY2U6IF90aGlzLnNwZWNpZXNMb29rdXBMaXN0LFxuICAgICAgICAgICAgYXBwZW5kVG86IF90aGlzLiRlbCxcbiAgICAgICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC50cmlnZ2VyKCdsZWZ0bWFwdXBkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICBidWlsZFJpZ2h0Rm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFJpZ2h0Rm9ybScpO1xuICAgICAgcmV0dXJuIHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkcmlnaHRtYXBzcHA7XG4gICAgICAgICAgJHJpZ2h0bWFwc3BwID0gX3RoaXMuJCgnI3JpZ2h0bWFwc3BwJyk7XG4gICAgICAgICAgcmV0dXJuICRyaWdodG1hcHNwcC5hdXRvY29tcGxldGUoe1xuICAgICAgICAgICAgc291cmNlOiBfdGhpcy5zcGVjaWVzTG9va3VwTGlzdCxcbiAgICAgICAgICAgIGFwcGVuZFRvOiBfdGhpcy4kZWwsXG4gICAgICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwudHJpZ2dlcigncmlnaHRtYXB1cGRhdGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIHN0YXJ0U3BsaXR0ZXJUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zdGFydFNwbGl0dGVyVHJhY2tpbmcnKTtcbiAgICAgIHRoaXMudHJhY2tTcGxpdHRlciA9IHRydWU7XG4gICAgICB0aGlzLnNwbGl0TGluZS5hZGRDbGFzcygnZHJhZ2dpbmcnKTtcbiAgICAgIHJldHVybiB0aGlzLmxvY2F0ZVNwbGl0dGVyKCk7XG4gICAgfSxcbiAgICBsb2NhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5sb2NhdGVTcGxpdHRlcicpO1xuICAgICAgaWYgKHRoaXMudHJhY2tTcGxpdHRlcikge1xuICAgICAgICB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgICBpZiAodGhpcy50cmFja1NwbGl0dGVyID09PSAwKSB7XG4gICAgICAgICAgdGhpcy50cmFja1NwbGl0dGVyID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy50cmFja1NwbGl0dGVyICE9PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy50cmFja1NwbGl0dGVyIC09IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQodGhpcy5sb2NhdGVTcGxpdHRlciwgdGhpcy50cmFja1BlcmlvZCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXNpemVUaGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRtYXBCb3gsIGJvdHRvbVJpZ2h0LCBsYXllckJvdHRvbSwgbGF5ZXJUb3AsIGxlZnRMZWZ0LCBsZWZ0TWFwLCBtYXBCb3VuZHMsIG1hcEJveCwgbmV3TGVmdFdpZHRoLCByaWdodE1hcCwgcmlnaHRSaWdodCwgc3BsaXRQb2ludCwgc3BsaXRYLCB0b3BMZWZ0O1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVzaXplVGhpbmdzJyk7XG4gICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgbGVmdE1hcCA9ICQodGhpcy5sZWZ0TGF5ZXIuZ2V0Q29udGFpbmVyKCkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICByaWdodE1hcCA9ICQodGhpcy5yaWdodExheWVyLmdldENvbnRhaW5lcigpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLiRlbC5oYXNDbGFzcygnc3BsaXQnKSkge1xuICAgICAgICBuZXdMZWZ0V2lkdGggPSB0aGlzLnNwbGl0VGh1bWIucG9zaXRpb24oKS5sZWZ0ICsgKHRoaXMuc3BsaXRUaHVtYi53aWR0aCgpIC8gMi4wKTtcbiAgICAgICAgbWFwQm94ID0gdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCk7XG4gICAgICAgICRtYXBCb3ggPSAkKG1hcEJveCk7XG4gICAgICAgIG1hcEJvdW5kcyA9IG1hcEJveC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdG9wTGVmdCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFswLCAwXSk7XG4gICAgICAgIHNwbGl0UG9pbnQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbbmV3TGVmdFdpZHRoLCAwXSk7XG4gICAgICAgIGJvdHRvbVJpZ2h0ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoWyRtYXBCb3gud2lkdGgoKSwgJG1hcEJveC5oZWlnaHQoKV0pO1xuICAgICAgICBsYXllclRvcCA9IHRvcExlZnQueTtcbiAgICAgICAgbGF5ZXJCb3R0b20gPSBib3R0b21SaWdodC55O1xuICAgICAgICBzcGxpdFggPSBzcGxpdFBvaW50LnggLSBtYXBCb3VuZHMubGVmdDtcbiAgICAgICAgbGVmdExlZnQgPSB0b3BMZWZ0LnggLSBtYXBCb3VuZHMubGVmdDtcbiAgICAgICAgcmlnaHRSaWdodCA9IGJvdHRvbVJpZ2h0Lng7XG4gICAgICAgIHRoaXMuc3BsaXRMaW5lLmNzcygnbGVmdCcsIG5ld0xlZnRXaWR0aCk7XG4gICAgICAgIHRoaXMubGVmdFRhZy5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdCgwLCBcIiArIG5ld0xlZnRXaWR0aCArIFwicHgsIGF1dG8sIDApXCIpO1xuICAgICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICBsZWZ0TWFwLmF0dHIoJ3N0eWxlJywgXCJjbGlwOiByZWN0KFwiICsgbGF5ZXJUb3AgKyBcInB4LCBcIiArIHNwbGl0WCArIFwicHgsIFwiICsgbGF5ZXJCb3R0b20gKyBcInB4LCBcIiArIGxlZnRMZWZ0ICsgXCJweClcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgIHJldHVybiByaWdodE1hcC5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdChcIiArIGxheWVyVG9wICsgXCJweCwgXCIgKyByaWdodFJpZ2h0ICsgXCJweCwgXCIgKyBsYXllckJvdHRvbSArIFwicHgsIFwiICsgc3BsaXRYICsgXCJweClcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGVmdFRhZy5hdHRyKCdzdHlsZScsICdjbGlwOiBpbmhlcml0Jyk7XG4gICAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgIGxlZnRNYXAuYXR0cignc3R5bGUnLCAnY2xpcDogaW5oZXJpdCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmlnaHRNYXAuYXR0cignc3R5bGUnLCAnY2xpcDogcmVjdCgwLDAsMCwwKScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBzdG9wU3BsaXR0ZXJUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zdG9wU3BsaXR0ZXJUcmFja2luZycpO1xuICAgICAgdGhpcy5zcGxpdExpbmUucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XG4gICAgICByZXR1cm4gdGhpcy50cmFja1NwbGl0dGVyID0gNTtcbiAgICB9LFxuICAgIGFjdGl2YXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYWN0aXZhdGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy5zcGxpdFRodW1iLmRyYWdnYWJsZSh7XG4gICAgICAgIGNvbnRhaW5tZW50OiAkKCcjbWFwd3JhcHBlcicpLFxuICAgICAgICBzY3JvbGw6IGZhbHNlLFxuICAgICAgICBzdGFydDogdGhpcy5zdGFydFNwbGl0dGVyVHJhY2tpbmcsXG4gICAgICAgIGRyYWc6IHRoaXMucmVzaXplVGhpbmdzLFxuICAgICAgICBzdG9wOiB0aGlzLnN0b3BTcGxpdHRlclRyYWNraW5nXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgIH0sXG4gICAgZGVhY3RpdmF0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmRlYWN0aXZhdGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy5zcGxpdFRodW1iLmRyYWdnYWJsZSgnZGVzdHJveScpO1xuICAgICAgcmV0dXJuIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgfVxuICB9LCB7XG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICBsYXlvdXQ6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzcGxpdGxpbmVcXFwiPiZuYnNwOzwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInNwbGl0dGh1bWJcXFwiPjxzcGFuPiYjeDI3NmU7ICYjeDI3NmY7PC9zcGFuPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgdGFnXFxcIj48JT0gbGVmdFRhZyAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJpZ2h0IHRhZ1xcXCI+PCU9IHJpZ2h0VGFnICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCBmb3JtXFxcIj48JT0gbGVmdEZvcm0gJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCBmb3JtXFxcIj48JT0gcmlnaHRGb3JtICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCBsb2FkZXJcXFwiPjxpbWcgc3JjPVxcXCIvc3RhdGljL2ltYWdlcy9zcGlubmVyLmxvYWRpbmZvLm5ldC5naWZcXFwiIC8+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgbG9hZGVyXFxcIj48aW1nIHNyYz1cXFwiL3N0YXRpYy9pbWFnZXMvc3Bpbm5lci5sb2FkaW5mby5uZXQuZ2lmXFxcIiAvPjwvZGl2PlxcbjxkaXYgaWQ9XFxcIm1hcHdyYXBwZXJcXFwiPjxkaXYgaWQ9XFxcIm1hcFxcXCI+PC9kaXY+PC9kaXY+XCIpLFxuICAgICAgbGVmdFRhZzogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNob3dcXFwiPlxcbiAgICA8c3BhbiBjbGFzcz1cXFwibGVmdGxheWVybmFtZVxcXCI+cGxhaW4gbWFwPC9zcGFuPlxcbiAgICA8YnI+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPnNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5zaG93L2hpZGUgY29tcGFyaXNvbiBtYXA8L2J1dHRvbj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJlZGl0XFxcIj5cXG4gICAgPGlucHV0IGlkPVxcXCJsZWZ0bWFwc3BwXFxcIiBuYW1lPVxcXCJsZWZ0bWFwc3BwXFxcIiBwbGFjZWhvbGRlcj1cXFwiJmhlbGxpcDsgc3BlY2llcyBvciBncm91cCAmaGVsbGlwO1xcXCIgLz5cXG4gICAgPCEtLVxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5oaWRlIHNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5jb21wYXJlICsvLTwvYnV0dG9uPlxcbiAgICAtLT5cXG48L2Rpdj5cIiksXG4gICAgICByaWdodFRhZzogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNob3dcXFwiPlxcbiAgICA8c3BhbiBjbGFzcz1cXFwicmlnaHRsYXllcm5hbWVcXFwiPihubyBkaXN0cmlidXRpb24pPC9zcGFuPlxcbiAgICA8YnI+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPnNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5zaG93L2hpZGUgY29tcGFyaXNvbiBtYXA8L2J1dHRvbj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJlZGl0XFxcIj5cXG4gICAgPGlucHV0IGlkPVxcXCJyaWdodG1hcHNwcFxcXCIgbmFtZT1cXFwicmlnaHRtYXBzcHBcXFwiIHBsYWNlaG9sZGVyPVxcXCImaGVsbGlwOyBzcGVjaWVzIG9yIGdyb3VwICZoZWxsaXA7XFxcIiAvPlxcbjwvZGl2PlwiKSxcbiAgICAgIGxlZnRGb3JtOiBfLnRlbXBsYXRlKFwiPHA+XFxuPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvcHktcnRsXFxcIj5jb3B5IHJpZ2h0IG1hcCAmbGFxdW87PC9idXR0b24+XFxuPC9wPjxwPlxcbjxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFweWVhclxcXCI+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcImJhc2VsaW5lXFxcIj5iYXNlbGluZTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uPjIwMTU8L29wdGlvbj5cXG4gICAgPG9wdGlvbj4yMDI1PC9vcHRpb24+XFxuICAgIDxvcHRpb24+MjAzNTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uPjIwNDU8L29wdGlvbj5cXG4gICAgPG9wdGlvbj4yMDU1PC9vcHRpb24+XFxuICAgIDxvcHRpb24+MjA2NTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uPjIwNzU8L29wdGlvbj5cXG4gICAgPG9wdGlvbj4yMDg1PC9vcHRpb24+XFxuPC9zZWxlY3Q+XFxuPC9wPjxwPlxcbjxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFwc2NlbmFyaW9cXFwiPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJSQ1AzUERcXFwiPlJDUCAzUEQ8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiUkNQNDVcXFwiPlJDUCA0LjU8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiUkNQNlxcXCI+UkNQIDY8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiUkNQODVcXFwiIHNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCI+UkNQIDguNTwvb3B0aW9uPlxcbjwvc2VsZWN0PlxcbjwvcD48cD5cXG48c2VsZWN0IGNsYXNzPVxcXCJsZWZ0XFxcIiBpZD1cXFwibGVmdG1hcGdjbVxcXCI+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcImFsbFxcXCI+bWVkaWFuPC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcImNzaXJvLW1rMzBcXFwiPkNTSVJPIE1hcmsgMy4wPC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcImdpc3MtbW9kZWxlaFxcXCI+R0lTUyBFMjAvSFlDT008L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwibmNhci1jY3NtMzBcXFwiPk5DQVIgQ0NTTSAzLjA8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwidWttby1oYWRnZW0xXFxcIj5VSyBNZXQgT2ZmaWNlIEhhZEdFTTE8L29wdGlvbj5cXG48L3NlbGVjdD5cXG48L3A+PHA+XFxuPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+aGlkZSBzZXR0aW5nczwvYnV0dG9uPlxcbjwvcD48cD5cXG48YnV0dG9uIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+Y29tcGFyZSArLy08L2J1dHRvbj5cXG48L3A+XCIpLFxuICAgICAgcmlnaHRGb3JtOiBfLnRlbXBsYXRlKFwiPHA+XFxuPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvcHktbHRyXFxcIj4mcmFxdW87IGNvcHkgbGVmdCBtYXA8L2J1dHRvbj5cXG48L3A+PHA+XFxuPHNlbGVjdCBjbGFzcz1cXFwicmlnaHRcXFwiIGlkPVxcXCJyaWdodG1hcHllYXJcXFwiPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJiYXNlbGluZVxcXCI+YmFzZWxpbmU8L29wdGlvbj5cXG4gICAgPG9wdGlvbj4yMDE1PC9vcHRpb24+XFxuICAgIDxvcHRpb24+MjAyNTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uPjIwMzU8L29wdGlvbj5cXG4gICAgPG9wdGlvbj4yMDQ1PC9vcHRpb24+XFxuICAgIDxvcHRpb24+MjA1NTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uPjIwNjU8L29wdGlvbj5cXG4gICAgPG9wdGlvbj4yMDc1PC9vcHRpb24+XFxuICAgIDxvcHRpb24+MjA4NTwvb3B0aW9uPlxcbjwvc2VsZWN0PlxcbjwvcD48cD5cXG48c2VsZWN0IGNsYXNzPVxcXCJyaWdodFxcXCIgaWQ9XFxcInJpZ2h0bWFwc2NlbmFyaW9cXFwiPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJSQ1AzUERcXFwiPlJDUCAzUEQ8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiUkNQNDVcXFwiPlJDUCA0LjU8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiUkNQNlxcXCI+UkNQIDY8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiUkNQODVcXFwiIHNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCI+UkNQIDguNTwvb3B0aW9uPlxcbjwvc2VsZWN0PlxcbjwvcD48cD5cXG48c2VsZWN0IGNsYXNzPVxcXCJyaWdodFxcXCIgaWQ9XFxcInJpZ2h0bWFwZ2NtXFxcIj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiYWxsXFxcIj5tZWRpYW48L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiY3Npcm8tbWszMFxcXCI+Q1NJUk8gTWFyayAzLjA8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiZ2lzcy1tb2RlbGVoXFxcIj5HSVNTIEUyMC9IWUNPTTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJuY2FyLWNjc20zMFxcXCI+TkNBUiBDQ1NNIDMuMDwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJ1a21vLWhhZGdlbTFcXFwiPlVLIE1ldCBPZmZpY2UgSGFkR0VNMTwvb3B0aW9uPlxcbjwvc2VsZWN0PlxcbjwvcD48cD5cXG48YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5oaWRlIHNldHRpbmdzPC9idXR0b24+XFxuPC9wPjxwPlxcbjxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5jb21wYXJlICsvLTwvYnV0dG9uPlxcbjwvcD5cIilcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gQXBwVmlldztcblxufSkuY2FsbCh0aGlzKTtcbiIsIlxuLy8galF1ZXJ5IHBsdWdpblxuLy8gYXV0aG9yOiBEYW5pZWwgQmFpcmQgPGRhbmllbEBkYW5pZWxiYWlyZC5jb20+XG4vLyB2ZXJzaW9uOiAwLjEuMjAxNDAyMDVcblxuLy9cbi8vIFRoaXMgbWFuYWdlcyBtZW51cywgc3VibWVudXMsIHBhbmVscywgYW5kIHBhZ2VzLlxuLy8gTGlrZSB0aGlzOlxuLy8gLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0uLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLi0tLVxuLy8gICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgfCAgU2VsZWN0ZWQgTWFpbiBNZW51IEl0ZW0gICAuLS0tLS0tLS0tLS0uIC4tLS0tLS0tLS0uICAgfCAgQWx0IE1haW4gTWVudSBJdGVtICB8ICBUaGlyZCBNYWluIE1lbnUgSXRlbSAgfFxuLy8gICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8gIFN1Yml0ZW0gMSAgXFwgU3ViaXRlbSAyIFxcICB8ICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAtLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nICAgICAgICAgICAgICAgJy0tLS0tLS0tLS0tLS0nLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nLS0tXG4vLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICBQYW5lbCBmb3IgU3ViaXRlbSAxLCB0aGlzIGlzIFBhZ2UgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgRWFjaCBQYW5lbCBjYW4gaGF2ZSBtdWx0aXBsZSBwYWdlcywgb25lIHBhZ2Ugc2hvd2luZyBhdCBhIHRpbWUuICBCdXR0b25zIG9uIHBhZ2VzIHN3aXRjaCAgICAgIHxcbi8vICAgICAgIHwgICBiZXR3ZWVuIHBhZ2VzLiAgUGFuZWwgaGVpZ2h0IGFkanVzdHMgdG8gdGhlIGhlaWdodCBvZiB0aGUgcGFnZS4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgWyBzZWUgcGFnZSAyIF0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nXG4vL1xuLy8gLSBtZW51cyBhcmUgYWx3YXlzIDx1bD4gdGFnczsgZWFjaCA8bGk+IGlzIGEgbWVudSBpdGVtXG4vLyAtIGEgbWFpbiBtZW51IDxsaT4gbXVzdCBjb250YWluIGFuIDxhPiB0YWcgYW5kIG1heSBhbHNvIGNvbnRhaW4gYSA8dWw+IHN1Ym1lbnVcbi8vIC0gYSBzdWJtZW51IDxsaT4gbXVzdCBjb250YWluIGFuIDxhPiB0YWcgd2l0aCBhIGRhdGEtdGFyZ2V0cGFuZWwgYXR0cmlidXRlIHNldFxuLy8gLSBUaGVyZSBpcyBhbHdheXMgYSBzaW5nbGUgc2VsZWN0ZWQgbWFpbiBtZW51IGl0ZW1cbi8vIC0gQSBtYWluIG1lbnUgaXRlbSBtYXkgZWl0aGVyIGxpbmsgdG8gYW5vdGhlciB3ZWJwYWdlLCBvciBoYXZlIGEgc3VibWVudVxuLy8gLSBTZWxlY3RpbmcgYSBtYWluIG1lbnUgaXRlbSB3aWxsIHNob3cgaXRzIHN1Ym1lbnUsIGlmIGl0IGhhcyBvbmVcbi8vIC0gQSBzdWJtZW51IGFsd2F5cyBoYXMgYSBzaW5nbGUgaXRlbSBzZWxlY3RlZFxuLy8gLSBDbGlja2luZyBhbiBpbmFjdGl2ZSBzdWJtZW51IGl0ZW0gd2lsbCBzaG93IGl0cyBwYW5lbFxuLy8gLSBDbGlja2luZyBhIHNlbGVjdGVkIHN1Ym1lbnUgaXRlbSB3aWxsIHRvZ2dsZSBpdHMgcGFuZWwgc2hvd2luZyA8LT4gaGlkaW5nICgoKCBOQjogbm90IHlldCBpbXBsZW1lbnRlZCApKSlcbi8vIC0gQSBwYW5lbCBpbml0aWFsbHkgc2hvd3MgaXRzIGZpcnN0IHBhZ2Vcbi8vIC0gU3dpdGNoaW5nIHBhZ2VzIGluIGEgcGFuZWwgY2hhbmdlcyB0aGUgcGFuZWwgaGVpZ2h0IHRvIHN1aXQgaXRzIGN1cnJlbnQgcGFnZVxuLy8gLSBBIHBhbmVsIGlzIGEgSFRNTCBibG9jayBlbGVtZW50IHdpdGggdGhlIGNsYXNzIC5tc3BwLXBhbmVsIChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSBJZiBhIHBhbmVsIGNvbnRhaW5zIHBhZ2VzLCBvbmUgcGFnZSBzaG91bGQgaGF2ZSB0aGUgY2xhc3MgLmN1cnJlbnQgKGNhbiBiZSBvdmVycmlkZGVuIHZpYSBvcHRpb24pXG4vLyAtIEEgcGFnZSBpcyBhIEhUTUwgYmxvY2sgZWxlbWVudCB3aXRoIHRoZSBjbGFzcyAubXNwcC1wYWdlIChjYW4gYmUgb3ZlcnJpZGRlbiB2aWEgb3B0aW9uKVxuLy8gLSA8YnV0dG9uPiBvciA8YT4gdGFncyBpbiBwYWdlcyB0aGF0IGhhdmUgYSBkYXRhLXRhcmdldHBhZ2UgYXR0cmlidXRlIHNldCB3aWxsIHN3aXRjaCB0byB0aGUgaW5kaWNhdGVkIHBhZ2Vcbi8vXG4vL1xuLy8gVGhlIEhUTUwgc2hvdWxkIGxvb2sgbGlrZSB0aGlzOlxuLy9cbi8vICA8dWwgY2xhc3M9XCJtZW51XCI+ICAgICAgICAgICAgICAgICAgIDwhLS0gdGhpcyBpcyB0aGUgbWFpbiBtZW51IC0tPlxuLy8gICAgICA8bGkgY2xhc3M9XCJjdXJyZW50XCI+ICAgICAgICAgICAgPCEtLSB0aGlzIGlzIGEgbWFpbiBtZW51IGl0ZW0sIGN1cnJlbnRseSBzZWxlY3RlZCAtLT5cbi8vICAgICAgICAgIDxhPkZpcnN0IEl0ZW08L2E+ICAgICAgICAgICA8IS0tIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBtYWluIG1lbnUgLS0+XG4vLyAgICAgICAgICA8dWw+ICAgICAgICAgICAgICAgICAgICAgICAgPCEtLSBhIHN1Ym1lbnUgaW4gdGhlIGZpcnN0IG1haW4gbWVudSBpdGVtIC0tPlxuLy8gICAgICAgICAgICAgIDxsaSBjbGFzcz1cImN1cnJlbnRcIj4gICAgPCEtLSB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHN1Ym1lbnUgaXRlbSAtLT5cbi8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8IS0tIC5wYW5lbHRyaWdnZXIgYW5kIHRoZSBkYXRhLXBhbmVsaWQgYXR0cmlidXRlIGFyZSByZXF1aXJlZCAtLT5cbi8vICAgICAgICAgICAgICAgICAgPGEgZGF0YS10YXJnZXRwYW5lbD1cInBhbmVsMVwiPmRvIHRoZSBwYW5lbDEgdGhpbmc8L2E+XG4vLyAgICAgICAgICAgICAgPC9saT5cbi8vICAgICAgICAgICAgICA8bGk+Li4uPC9saT4gICAgICAgICAgICA8IS0tIGFub3RoZXIgc3VibWVudSBpdGVtIC0tPlxuLy8gICAgICAgICAgPC91bD5cbi8vICAgICAgPC9saT5cbi8vICAgICAgPGxpPiA8YSBocmVmPVwiYW5vdGhlcl9wYWdlLmh0bWxcIj5hbm90aGVyIHBhZ2U8L2E+IDwvbGk+XG4vLyAgICAgIDxsaT4gPGE+d2hhdGV2ZXI8L2E+IDwvbGk+XG4vLyAgPC91bD5cbi8vXG4vLyAgPGRpdiBpZD1cInBhbmVsMVwiIGNsYXNzPVwibXNwcC1wYW5lbFwiPlxuLy8gICAgICA8ZGl2IGlkPVwicGFnZTExXCIgY2xhc3M9XCJtc3BwLXBhZ2UgY3VycmVudFwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgY3VycmVudCBwYWdlIG9uIHBhbmVsIDEuXG4vLyAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMTJcIj5zaG93IHBhZ2UgMjwvYnV0dG9uPlxuLy8gICAgICA8L2Rpdj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UxMlwiIGNsYXNzPVwibXNwcC1wYWdlXCI+XG4vLyAgICAgICAgICBUaGlzIGlzIHRoZSBvdGhlciBwYWdlIG9uIHBhbmVsIDEuXG4vLyAgICAgICAgICA8YSBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMTFcIj5zZWUgdGhlIGZpcnN0IHBhZ2UgYWdhaW48L2E+XG4vLyAgICAgIDwvZGl2PlxuLy8gIDwvZGl2PlxuLy8gIDxkaXYgaWQ9XCJwYW5lbDJcIiBjbGFzcz1cIm1zcHAtcGFuZWxcIj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UyMVwiIGNsYXNzPVwibXNwcC1wYWdlIGN1cnJlbnRcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIGN1cnJlbnQgcGFnZSBvbiBwYW5lbCAyLlxuLy8gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgZGF0YS10YXJnZXRwYWdlPVwicGFnZTIyXCI+c2hvdyBwYWdlIDI8L2J1dHRvbj5cbi8vICAgICAgPC9kaXY+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMjJcIiBjbGFzcz1cIm1zcHAtcGFnZVwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgb3RoZXIgcGFnZSBvbiBwYW5lbCAyLlxuLy8gICAgICAgICAgPGEgZGF0YS10YXJnZXRwYWdlPVwicGFnZTIxXCI+c2VlIHRoZSBmaXJzdCBwYWdlIGFnYWluPC9hPlxuLy8gICAgICA8L2Rpdj5cbi8vICA8L2Rpdj5cblxuXG47KCBmdW5jdGlvbigkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuICAgIC8vIG5hbWVzcGFjZSBjbGltYXMsIHdpZGdldCBuYW1lIG1zcHBcbiAgICAvLyBzZWNvbmQgYXJnIGlzIHVzZWQgYXMgdGhlIHdpZGdldCdzIFwicHJvdG90eXBlXCIgb2JqZWN0XG4gICAgJC53aWRnZXQoIFwiY2xpbWFzLm1zcHBcIiAsIHtcblxuICAgICAgICAvL09wdGlvbnMgdG8gYmUgdXNlZCBhcyBkZWZhdWx0c1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBhbmltYXRpb25GYWN0b3I6IDIsXG5cbiAgICAgICAgICAgIG1haW5NZW51Q2xhc3M6ICdtc3BwLW1haW4tbWVudScsXG5cbiAgICAgICAgICAgIHBhbmVsQ2xhc3M6ICdtc3BwLXBhbmVsJyxcbiAgICAgICAgICAgIHBhZ2VDbGFzczogJ21zcHAtcGFnZScsXG5cbiAgICAgICAgICAgIGNsZWFyZml4Q2xhc3M6ICdtc3BwLWNsZWFyZml4JyxcbiAgICAgICAgICAgIGFjdGl2ZUNsYXNzOiAnY3VycmVudCdcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvL1NldHVwIHdpZGdldCAoZWcuIGVsZW1lbnQgY3JlYXRpb24sIGFwcGx5IHRoZW1pbmdcbiAgICAgICAgLy8gLCBiaW5kIGV2ZW50cyBldGMuKVxuICAgICAgICBfY3JlYXRlOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIG9wdHMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgICAgIC8vIHBvcHVsYXRlIHNvbWUgY29udmVuaWVuY2UgdmFyaWFibGVzXG4gICAgICAgICAgICB2YXIgJG1lbnUgPSB0aGlzLmVsZW1lbnQ7XG4gICAgICAgICAgICB0aGlzLm1haW5NZW51SXRlbXMgPSAkbWVudS5jaGlsZHJlbignbGknKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzID0gJCgnLicgKyBvcHRzLnBhbmVsQ2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBkaXNhcHBlYXIgd2hpbGUgd2Ugc29ydCB0aGluZ3Mgb3V0XG4gICAgICAgICAgICAkbWVudS5jc3MoeyBvcGFjaXR5OiAwIH0pO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMuY3NzKHsgb3BhY2l0eTogMCB9KTtcblxuICAgICAgICAgICAgLy8gbWFrZSBzb21lIERPTSBtb2RzXG4gICAgICAgICAgICAkbWVudS5hZGRDbGFzcyhvcHRzLm1haW5NZW51Q2xhc3MpO1xuICAgICAgICAgICAgJG1lbnUuYWRkQ2xhc3Mob3B0cy5jbGVhcmZpeENsYXNzKTtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmFkZENsYXNzKG9wdHMuY2xlYXJmaXhDbGFzcyk7XG5cbiAgICAgICAgICAgIC8vIGxheW91dCB0aGUgbWVudVxuICAgICAgICAgICAgdGhpcy5fbGF5b3V0TWVudSgpO1xuXG4gICAgICAgICAgICAvLyBsYXlvdXQgdGhlIHBhbmVsc1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0UGFuZWxzKCk7XG5cbiAgICAgICAgICAgIC8vIGhvb2sgdXAgY2xpY2sgaGFuZGxpbmcgZXRjXG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dtZW51JywgdGhpcy5fc2hvd01lbnUpO1xuICAgICAgICAgICAgJG1lbnUub24oJ21zcHBzaG93c3VibWVudScsIHRoaXMuX3Nob3dTdWJNZW51KTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3BhbmVsJywgdGhpcy5fc2hvd1BhbmVsKTtcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd3BhZ2UnLCB0aGlzLl9zaG93UGFnZSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgbWVudS10cmlnZ2Vyc1xuICAgICAgICAgICAgdGhpcy5tYWluTWVudUl0ZW1zLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIGxpIG1lbnUgaXRlbSBoYXMgYSBjaGlsZCBhIHRoYXQgaXMgaXQncyB0cmlnZ2VyXG4gICAgICAgICAgICAgICAgJChpdGVtKS5jaGlsZHJlbignYScpLmNsaWNrKCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93bWVudScsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW51aXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldDogYmFzZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIHN1Ym1lbnUgaXRlbXNcbiAgICAgICAgICAgICAgICAkKGl0ZW0pLmZpbmQoJ2xpJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHN1Yk1lbnVJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICQoc3ViTWVudUl0ZW0pLmZpbmQoJ2EnKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dzdWJtZW51JywgZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZW51aXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJtZW51aXRlbTogc3ViTWVudUl0ZW0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gYXR0YWNoIGhhbmRsZXJzIHRvIHRoZSBwYW5lbCB0cmlnZ2Vyc1xuICAgICAgICAgICAgJG1lbnUuZmluZCgnW2RhdGEtdGFyZ2V0cGFuZWxdJykuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHRyaWdnZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHRyaWdnZXIgPSQodHJpZ2dlcik7XG4gICAgICAgICAgICAgICAgJHRyaWdnZXIuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYW5lbCcsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYW5lbDogJCgnIycgKyAkdHJpZ2dlci5kYXRhKCd0YXJnZXRwYW5lbCcpKS5maXJzdCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgcGFnZSBzd2l0Y2hlcnNcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBwYW5lbCkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKHBhbmVsKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuZmluZCgnW2RhdGEtdGFyZ2V0cGFnZV0nKS5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd3BhZ2UnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFuZWw6ICRwYW5lbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6ICQoJyMnICsgJCh0aGlzKS5kYXRhKCd0YXJnZXRwYWdlJykpLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGFjdGl2YXRlIHRoZSBjdXJyZW50IG1lbnVzLCBwYW5lbHMgZXRjXG4gICAgICAgICAgICB2YXIgJGN1cnJlbnRNYWluID0gdGhpcy5tYWluTWVudUl0ZW1zLmZpbHRlcignLicgKyBvcHRzLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICRjdXJyZW50TWFpbi5yZW1vdmVDbGFzcyhvcHRzLmFjdGl2ZUNsYXNzKS5jaGlsZHJlbignYScpLmNsaWNrKCk7XG5cbiAgICAgICAgICAgIC8vIGZpbmFsbHksIGZhZGUgYmFjayBpblxuICAgICAgICAgICAgJG1lbnUuYW5pbWF0ZSh7IG9wYWNpdHk6IDEgfSwgJ2Zhc3QnKTtcblxuICAgICAgICAgICAgLy8gcGFuZWxzIHN0YXkgaW52aXNpYmxlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3N3aXRjaENsYXNzT3B0aW9uOiBmdW5jdGlvbihjbGFzc05hbWUsIG5ld0NsYXNzKSB7XG4gICAgICAgICAgICB2YXIgb2xkQ2xhc3MgPSB0aGlzLm9wdGlvbnNbY2xhc3NOYW1lXTtcbiAgICAgICAgICAgIGlmIChvbGRDbGFzcyAhPT0gbmV3Q2xhc3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgZ3JvdXAgPSB0aGlzLmVsZW1lbnQuZmluZCgnLicgKyBvbGRDbGFzcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2NsYXNzTmFtZV0gPSBuZXdDbGFzcztcbiAgICAgICAgICAgICAgICBncm91cC5yZW1vdmVDbGFzcyhvbGRDbGFzcyk7XG4gICAgICAgICAgICAgICAgZ3JvdXAuYWRkQ2xhc3MobmV3Q2xhc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIFJlc3BvbmQgdG8gYW55IGNoYW5nZXMgdGhlIHVzZXIgbWFrZXMgdG8gdGhlXG4gICAgICAgIC8vIG9wdGlvbiBtZXRob2RcbiAgICAgICAgX3NldE9wdGlvbjogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwibWFpbk1lbnVDbGFzc1wiOlxuICAgICAgICAgICAgICAgIGNhc2UgXCJjbGVhcmZpeENsYXNzXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImFjdGl2ZUNsYXNzXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N3aXRjaENsYXNzT3B0aW9uKGtleSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vIGl0J3Mgb2theSB0aGF0IHRoZXJlJ3Mgbm8gfSBoZXJlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyByZW1lbWJlciB0byBjYWxsIG91ciBzdXBlcidzIF9zZXRPcHRpb24gbWV0aG9kXG4gICAgICAgICAgICB0aGlzLl9zdXBlciggXCJfc2V0T3B0aW9uXCIsIGtleSwgdmFsdWUgKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBEZXN0cm95IGFuIGluc3RhbnRpYXRlZCBwbHVnaW4gYW5kIGNsZWFuIHVwXG4gICAgICAgIC8vIG1vZGlmaWNhdGlvbnMgdGhlIHdpZGdldCBoYXMgbWFkZSB0byB0aGUgRE9NXG4gICAgICAgIF9kZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMubWFpbk1lbnVDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsZWFyZml4Q2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmNsZWFyZml4Q2xhc3MpO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIGRvIHRoZSBsYXlvdXQgY2FsY3VsYXRpb25zXG4gICAgICAgIF9sYXlvdXRNZW51OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggZWFjaCBzdWJtZW51IGFuZCByZWNvcmQgaXRzIHdpZHRoXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuZmluZCgndWwnKS5lYWNoKCBmdW5jdGlvbihpbmRleCwgc3ViTWVudSkge1xuICAgICAgICAgICAgICAgIHZhciAkc20gPSAkKHN1Yk1lbnUpO1xuICAgICAgICAgICAgICAgICRzbS5jc3Moe3dpZHRoOiAnYXV0byd9KTtcbiAgICAgICAgICAgICAgICAkc20uZGF0YSgnb3JpZ2luYWxXaWR0aCcsICRzbS53aWR0aCgpKTtcblxuICAgICAgICAgICAgICAgIC8vIGxlYXZlIGVhY2ggc3VibWVudSBoaWRkZW4sIHdpdGggd2lkdGggMFxuICAgICAgICAgICAgICAgICRzbS5jc3MoeyB3aWR0aDogMCwgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dNZW51OiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgdmFyICRpdGVtID0gJChkYXRhLm1lbnVpdGVtKTtcbiAgICAgICAgICAgIHZhciBiYXNlID0gZGF0YS53aWRnZXQ7XG4gICAgICAgICAgICAvLyAkaXRlbSBpcyBhIGNsaWNrZWQtb24gbWVudSBpdGVtLi5cbiAgICAgICAgICAgIGlmICgkaXRlbS5oYXNDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgICAgICAgICAgLy8gPz9cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5faGlkZVBhbmVscygpO1xuICAgICAgICAgICAgICAgIGJhc2UubWFpbk1lbnVJdGVtcy5yZW1vdmVDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgIHZhciAkbmV3U3ViTWVudSA9ICRpdGVtLmZpbmQoJ3VsJyk7XG4gICAgICAgICAgICAgICAgdmFyICRvbGRTdWJNZW51cyA9IGJhc2UuZWxlbWVudC5maW5kKCd1bCcpLm5vdCgkbmV3U3ViTWVudSk7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1dpZHRoID0gJG5ld1N1Yk1lbnUuZGF0YSgnb3JpZ2luYWxXaWR0aCcpO1xuXG4gICAgICAgICAgICAgICAgJG9sZFN1Yk1lbnVzLmFuaW1hdGUoeyB3aWR0aDogMCB9LCAoNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRvbGRTdWJNZW51cy5jc3MoeyBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgICAgICAkbmV3U3ViTWVudVxuICAgICAgICAgICAgICAgICAgICAuY3NzKHtkaXNwbGF5OiAnYmxvY2snIH0pXG4gICAgICAgICAgICAgICAgICAgIC5hbmltYXRlKHsgd2lkdGg6IG5ld1dpZHRoIH0sICgxMjUgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkbmV3U3ViTWVudS5jc3MoeyB3aWR0aDogJ2F1dG8nIH0pLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdtZW51c2hvd24nLCBldmVudCwgeyBpdGVtOiAkaXRlbSwgd2lkZ2V0OiBiYXNlIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgbmV3IHN1Ym1lbnUgaGFzIGFuIGFjdGl2ZSBpdGVtLCBjbGljayBpdFxuICAgICAgICAgICAgICAgICRuZXdTdWJNZW51LmZpbmQoJy4nICsgYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzICsgJyBhJykuY2xpY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd1N1Yk1lbnU6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICAvLyBkZS1hY3RpdmVpZnkgYWxsIHRoZSBzdWJtZW51IGl0ZW1zXG4gICAgICAgICAgICAkKGRhdGEubWVudWl0ZW0pLmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoZGF0YS53aWRnZXQub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAvLyBhY3RpdmUtaWZ5IHRoZSBvbmUgdHJ1ZSBzdWJtZW51IGl0ZW1cbiAgICAgICAgICAgICQoZGF0YS5zdWJtZW51aXRlbSkuYWRkQ2xhc3MoZGF0YS53aWRnZXQub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy8gZG8gdGhlIGxheW91dCBjYWxjdWxhdGlvbnNcbiAgICAgICAgX2xheW91dFBhbmVsczogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHZhciAkcGFnZXMgPSB0aGlzLnBhbmVscy5maW5kKCcuJyArIHRoaXMub3B0aW9ucy5wYWdlQ2xhc3MpO1xuXG4gICAgICAgICAgICAvLyBnbyB0aHJvdWdoIGVhY2ggcGFnZSBhbmQgcmVjb3JkIGl0cyBoZWlnaHRcbiAgICAgICAgICAgICRwYWdlcy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFnZSkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFnZSA9ICQocGFnZSk7XG4gICAgICAgICAgICAgICAgJHBhZ2UuY3NzKHtoZWlnaHQ6ICdhdXRvJ30pO1xuICAgICAgICAgICAgICAgICRwYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0JywgJHBhZ2Uub3V0ZXJIZWlnaHQoKSk7XG5cbiAgICAgICAgICAgICAgICAvLyBsZWF2ZSBlYWNoIHBhZ2UgaGlkZGVuLCB3aXRoIGhlaWdodCAwXG4gICAgICAgICAgICAgICAgJHBhZ2UuY3NzKHsgaGVpZ2h0OiAwLCBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCBlYWNoIHBhbmVsIGFuZCBoaWRlIGl0XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5lYWNoKCBmdW5jdGlvbihpbmRleCwgcGFuZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgJHBhbmVsID0gJChwYW5lbCk7XG4gICAgICAgICAgICAgICAgJHBhbmVsLmNzcyh7IGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9oaWRlUGFuZWxzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5hY3RpdmVDbGFzcykuY3NzKHsgZGlzcGxheTogJ25vbmUnLCBoZWlnaHQ6IDAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX3Nob3dQYW5lbDogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKGRhdGEucGFuZWwpO1xuICAgICAgICAgICAgdmFyIGJhc2UgPSBkYXRhLndpZGdldDtcbiAgICAgICAgICAgIC8vICRwYW5lbCBpcyBhIHBhbmVsIHRvIHNob3cuLlxuICAgICAgICAgICAgaWYgKCRwYW5lbC5oYXNDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpKSB7XG4gICAgICAgICAgICAgICAgLy8gPz9cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5faGlkZVBhbmVscygpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5hZGRDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5jc3MoeyBkaXNwbGF5OiAnYmxvY2snLCBvcGFjaXR5OiAxIH0pO1xuICAgICAgICAgICAgICAgIHZhciAkcGFnZSA9ICQoJHBhbmVsLmZpbmQoJy4nICsgYmFzZS5vcHRpb25zLnBhZ2VDbGFzcyArICcuJyArIGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykpO1xuICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dwYWdlJywgZXZlbnQsIHsgcGFuZWw6ICRwYW5lbCwgcGFnZTogJHBhZ2UsIHdpZGdldDogYmFzZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd1BhZ2U6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IGRhdGEud2lkZ2V0O1xuICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQoZGF0YS5wYW5lbCk7XG4gICAgICAgICAgICB2YXIgJHBhZ2UgPSAkKGRhdGEucGFnZSk7XG4gICAgICAgICAgICB2YXIgbmV3SGVpZ2h0ID0gJHBhZ2UuZGF0YSgnb3JpZ2luYWxIZWlnaHQnKTtcblxuICAgICAgICAgICAgLy8gZml4IHRoZSBwYW5lbCdzIGN1cnJlbnQgaGVpZ2h0XG4gICAgICAgICAgICAkcGFuZWwuY3NzKHtoZWlnaHQ6ICRwYW5lbC5oZWlnaHQoKSB9KTtcblxuICAgICAgICAgICAgLy8gZGVhbCB3aXRoIHRoZSBwYWdlIGN1cnJlbnRseSBiZWluZyBkaXNwbGF5ZWRcbiAgICAgICAgICAgIHZhciAkb2xkUGFnZSA9ICRwYW5lbC5maW5kKCcuJyArIGJhc2Uub3B0aW9ucy5wYWdlQ2xhc3MgKyAnLicgKyBiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLm5vdCgkcGFnZSk7XG4gICAgICAgICAgICBpZiAoJG9sZFBhZ2UubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICRvbGRQYWdlLmRhdGEoJ29yaWdpbmFsSGVpZ2h0JywgJG9sZFBhZ2Uub3V0ZXJIZWlnaHQoKSk7XG4gICAgICAgICAgICAgICAgJG9sZFBhZ2UucmVtb3ZlQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5mYWRlT3V0KCg1MCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJG9sZFBhZ2UuY3NzKHsgaGVpZ2h0OiAwIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzd2l0Y2ggb24gdGhlIG5ldyBwYWdlIGFuZCBncm93IHRoZSBvcGFuZWwgdG8gaG9sZCBpdFxuICAgICAgICAgICAgJHBhZ2UuY3NzKHsgaGVpZ2h0OiAnYXV0bycgfSkuYWRkQ2xhc3MoYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKS5mYWRlSW4oKDEwMCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkcGFnZS5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgYW5pbVRpbWUgPSAoJG9sZFBhZ2UubGVuZ3RoID4gMCA/ICgxMDAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSA6ICgxNTAgKiBiYXNlLm9wdGlvbnMuYW5pbWF0aW9uRmFjdG9yKSk7IC8vIGFuaW1hdGUgZmFzdGVyIGlmIGl0J3Mgc3dpdGNoaW5nIHBhZ2VzXG4gICAgICAgICAgICAkcGFuZWwuYW5pbWF0ZSh7IGhlaWdodDogbmV3SGVpZ2h0IH0sIGFuaW1UaW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAkcGFuZWwucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgXzogbnVsbCAvLyBubyBmb2xsb3dpbmcgY29tbWFcbiAgICB9KTtcblxufSkoalF1ZXJ5LCB3aW5kb3csIGRvY3VtZW50KTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cbiJdfQ==
