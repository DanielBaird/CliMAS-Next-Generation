var AppView, MapLayer;

MapLayer = require('../models/maplayer');

AppView = Backbone.View.extend({
  tagName: 'div',
  className: 'splitmap',
  id: 'splitmap',
  events: {
    'click #doit': 'activateSplitter'
  },
  initialize: function() {
    this.mapLayer = new MapLayer('left', 'Left Map', 'left.map');
    _.bindAll(this);
    return this.fetchSpeciesInfo();
  },
  render: function() {
    this.$el.append(AppView.layout());
    $('#contentwrap').append(this.$el);
    this.map = L.map('map', {
      center: [-20, 136],
      zoom: 5
    });
    L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
      maxZoom: 18
    }).addTo(this.map);
    this.leftForm = this.$el.find('.left.form');
    this.buildLeftForm(this.leftForm);
    this.leftTag = this.$el.find('.left.tag');
    this.rightTag = this.$el.find('.right.tag');
    this.splitLine = this.$el.find('.splitline');
    return this.splitThumb = this.$el.find('.splitthumb');
  },
  fetchSpeciesInfo: function() {
    return $.ajax({
      url: '/data/species'
    }).done((function(_this) {
      return function(data) {
        var speciesLookupList, speciesSciNameList;
        speciesLookupList = [];
        speciesSciNameList = [];
        $.each(data, function(sciName, commonNames) {
          speciesSciNameList.push(sciName);
          if (commonNames) {
            return $.each(commonNames, function(cnIndex, cn) {
              return speciesLookupList.push({
                label: cn + ' (' + sciName + ')',
                value: sciName
              });
            });
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
  buildLeftForm: function(wrapper) {
    wrapper.append(AppView.leftForm());
    if (this.speciesLookupList) {
      return this.$el.find('#speciesname').autocomplete({
        source: this.speciesLookupList
      });
    }
  },
  startSplitterTracking: function() {
    if (this.splitterTrackId) {
      this.stopSplitterTracking();
    }
    this.splitterTrackId = setInterval((function(_this) {
      return function() {
        return _this.resizeThings();
      };
    })(this), 200);
    return true;
  },
  stopSplitterTracking: function() {
    clearInterval(this.splitterTrackId);
    return this.resizeThings;
  },
  activateSplitter: function() {
    this.splitThumb.draggable({
      containment: this.$el,
      scroll: false,
      start: this.startSplitterTracking,
      drag: this.resizeThings,
      stop: this.stopSplitterTracking
    });
    this.resizeThings();
    this.splitLine.addClass('active');
    return this.splitThumb.addClass('active');
  },
  deactivateSplitter: function() {
    this.splitThumb.removeClass('active');
    this.splitLine.removeClass('active');
    return this.splitThumb.draggable('destroy');
  },
  resizeThings: function() {
    var newWidth;
    newWidth = this.splitThumb.position().left + (this.splitThumb.width() / 2.0);
    this.splitLine.css('left', newWidth);
    return this.leftTag.css('clip', 'rect(0 ' + newWidth + 'px auto 0)');
  }
}, {
  layout: _.template("<div class=\"splitline\"></div>\n<div class=\"splitthumb\"><span>&#x276e; &#x276f;</span></div>\n<div class=\"left tag\">left tag<button id=\"doit\">do it</button></div>\n<div class=\"right tag\">right tag</div>\n<div class=\"left form\"></div>\n<div id=\"mapwrapper\"><div id=\"map\"></div></div>"),
  leftForm: _.template("<input id=\"speciesname\" name=\"speciesname\" placeholder=\"&hellip; type a species name &hellip;\" />")
});

module.exports = AppView;
