(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

require('./reports/main');


},{"./reports/main":2}],2:[function(require,module,exports){
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

},{"./views/app":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
(function() {
  var AppView, debug;

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
    tagName: 'form',
    className: '',
    id: 'reportform',
    speciesDataUrl: "" + location.protocol + "//" + location.host + "/speciesdata",
    rasterApiUrl: "" + location.protocol + "//localhost:10600/api/raster/1/wms_data_url",
    trackSplitter: false,
    trackPeriod: 100,
    events: {
      'change .sectionselector input': 'updateSectionSelection',
      'change .regionselect input': 'updateRegionSelection',
      'change .regionselect select': 'updateRegionSelection',
      'change .yearselect input': 'updateYearSelection'
    },
    initialize: function() {
      debug('AppView.initialize');
      _.bindAll.apply(_, [this].concat(_.functions(this)));
      this.fetchReportSections();
      this.fetchRegions();
      return this.fetchYears();
    },
    render: function() {
      debug('AppView.render');
      this.$el.append(AppView.templates.layout({}));
      return $('#contentwrap .maincontent').append(this.$el);
    },
    fetchReportSections: function() {
      var fetch;
      debug('AppView.fetchReportSections');
      fetch = $.Deferred();
      fetch.done((function(_this) {
        return function(data) {
          var sectionselect;
          _this.possibleSections = data.sections;
          sectionselect = _this.$('.sectionselect');
          sectionselect.empty().removeClass('loading');
          return _this.buildReportSectionList(_this.possibleSections, sectionselect);
        };
      })(this));
      setTimeout(function() {
        return fetch.resolve({
          sections: [
            {
              id: 'intro',
              name: 'Introduction',
              description: 'title, credits, and introductory paragraphs.',
              presence: 'required',
              sections: []
            }, {
              id: 'climatereview',
              name: 'Climate Review',
              description: 'a description of the region\'s current and projected climate.',
              presence: 'optional',
              sections: [
                {
                  id: 'temperature',
                  name: 'Temperature',
                  description: 'current and projected temperature.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'rainfall',
                  name: 'Rainfall',
                  description: 'current and projected precipitation.',
                  presence: 'optional',
                  sections: []
                }
              ]
            }, {
              id: 'biodiversity',
              name: 'Biodiversity Review',
              description: 'a description of the region\'s current and projected biodiversity. A description of the region\'s current and projected biodiversity. A description of the region\'s current and projected biodiversity. A description of the region\'s current and projected biodiversity.',
              presence: 'optional',
              sections: [
                {
                  id: 'overall',
                  name: 'Overall',
                  description: 'current and projected biodiversity over all modelled species',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'mammals',
                  name: 'Mammals',
                  description: 'current and projected biodiversity over mammal species',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'amphibians',
                  name: 'Amphibians',
                  description: 'current and projected biodiversity over amphibian species',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'reptiles',
                  name: 'Reptiles',
                  description: 'current and projected biodiversity over reptile species',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'birds',
                  name: 'Birds',
                  description: 'current and projected biodiversity over bird species',
                  presence: 'optional',
                  sections: []
                }
              ]
            }, {
              id: 'appendixes',
              name: 'Appendices',
              description: 'tables and other appendices.',
              presence: 'required',
              sections: [
                {
                  id: 'observedmammallist',
                  name: 'Mammals Present',
                  description: 'list of mammals currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedamphibianslist',
                  name: 'Amphibians Present',
                  description: 'list of amphibians currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedreptileslist',
                  name: 'Reptiles Present',
                  description: 'list of reptiles currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedbirdslist',
                  name: 'Birds Present',
                  description: 'list of birds currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'science',
                  name: 'Science',
                  description: 'description of the climate and species distribution modelling used to generate the data in the report.',
                  presence: 'required',
                  sections: []
                }
              ]
            }
          ]
        });
      }, 500 + (500 * Math.random()));
      return fetch.promise();
    },
    buildReportSectionList: function(data, wrapper) {
      debug('AppView.buildReportSectionList');
      return $.each(data, (function(_this) {
        return function(index, item) {
          var selectorRow, subsections;
          selectorRow = $(AppView.templates.sectionSelector(item));
          $(wrapper).append(selectorRow);
          if (item.sections.length > 0) {
            subsections = $(AppView.templates.subsections());
            _this.buildReportSectionList(item.sections, subsections);
            return $(selectorRow).addClass('hassubsections').append(subsections);
          }
        };
      })(this));
    },
    updateSectionSelection: function(event) {
      debug('AppView.updateSectionSelection');
      return this.handleSectionSelection(this.possibleSections);
    },
    handleSectionSelection: function(sectionList, parent) {
      debug('AppView.handleSectionSelection');
      $.each(sectionList, (function(_this) {
        return function(index, item) {
          var selectionControl, selector, _ref;
          selector = _this.$("#section-" + item.id);
          selectionControl = selector.find('input');
          if (selectionControl.prop('checked')) {
            selector.removeClass('unselected');
          } else {
            selector.addClass('unselected');
          }
          debug("handling " + parent + "." + (selectionControl.val()));
          if (((_ref = item.sections) != null ? _ref.length : void 0) > 0) {
            return _this.handleSectionSelection(item.sections, item.id);
          }
        };
      })(this));
      return this.updateSummary();
    },
    fetchRegions: function() {
      var fetch;
      debug('AppView.fetchRegions');
      fetch = $.Deferred();
      fetch.done((function(_this) {
        return function(data) {
          return _this.buildRegionList(data);
        };
      })(this));
      setTimeout(function() {
        return fetch.resolve({
          regiontypes: [
            {
              id: 'nrm',
              name: 'NRM region',
              regions: [
                {
                  id: 'NRM_ACT',
                  name: 'ACT'
                }, {
                  id: 'NRM_Adelaide_and_Mount_Lofty_Ranges',
                  name: 'Adelaide and Mount Lofty Ranges'
                }, {
                  id: 'NRM_Alinytjara_Wilurara',
                  name: 'Alinytjara Wilurara'
                }, {
                  id: 'NRM_Avon',
                  name: 'Avon'
                }, {
                  id: 'NRM_Border_Rivers-Gwydir',
                  name: 'Border Rivers-Gwydir'
                }, {
                  id: 'NRM_Border_Rivers_Maranoa-Balonne',
                  name: 'Border Rivers Maranoa-Balonne'
                }, {
                  id: 'NRM_Burdekin',
                  name: 'Burdekin'
                }, {
                  id: 'NRM_Burnett_Mary',
                  name: 'Burnett Mary'
                }, {
                  id: 'NRM_Cape_York',
                  name: 'Cape York'
                }, {
                  id: 'NRM_Central_West',
                  name: 'Central West'
                }, {
                  id: 'NRM_Condamine',
                  name: 'Condamine'
                }, {
                  id: 'NRM_Cooperative_Management_Area',
                  name: 'Cooperative Management Area'
                }, {
                  id: 'NRM_Corangamite',
                  name: 'Corangamite'
                }, {
                  id: 'NRM_Desert_Channels',
                  name: 'Desert Channels'
                }, {
                  id: 'NRM_East_Gippsland',
                  name: 'East Gippsland'
                }, {
                  id: 'NRM_Eyre_Peninsula',
                  name: 'Eyre Peninsula'
                }, {
                  id: 'NRM_Fitzroy',
                  name: 'Fitzroy'
                }, {
                  id: 'NRM_Glenelg_Hopkins',
                  name: 'Glenelg Hopkins'
                }, {
                  id: 'NRM_Goulburn_Broken',
                  name: 'Goulburn Broken'
                }, {
                  id: 'NRM_Hawkesbury-Nepean',
                  name: 'Hawkesbury-Nepean'
                }, {
                  id: 'NRM_Hunter-Central_Rivers',
                  name: 'Hunter-Central_Rivers'
                }, {
                  id: 'NRM_Kangaroo_Island',
                  name: 'Kangaroo Island'
                }, {
                  id: 'NRM_Lachlan',
                  name: 'Lachlan'
                }, {
                  id: 'NRM_Lower_Murray_Darling',
                  name: 'Lower Murray Darling'
                }, {
                  id: 'NRM_Mackay_Whitsunday',
                  name: 'Mackay Whitsunday'
                }, {
                  id: 'NRM_Mallee',
                  name: 'Mallee'
                }, {
                  id: 'NRM_Murray',
                  name: 'Murray'
                }, {
                  id: 'NRM_Murrumbidgee',
                  name: 'Murrumbidgee'
                }, {
                  id: 'NRM_Namoi',
                  name: 'Namoi'
                }, {
                  id: 'NRM_North',
                  name: 'North'
                }, {
                  id: 'NRM_North_Central',
                  name: 'North Central'
                }, {
                  id: 'NRM_North_East',
                  name: 'North East'
                }, {
                  id: 'NRM_North_West',
                  name: 'North West'
                }, {
                  id: 'NRM_Northern_Agricultural',
                  name: 'Northern Agricultural'
                }, {
                  id: 'NRM_Northern_Gulf',
                  name: 'Northern Gulf'
                }, {
                  id: 'NRM_Northern_Rivers',
                  name: 'Northern Rivers'
                }, {
                  id: 'NRM_Northern_Territory',
                  name: 'Northern Territory'
                }, {
                  id: 'NRM_Northern_and_Yorke',
                  name: 'Northern and Yorke'
                }, {
                  id: 'NRM_Perth',
                  name: 'Perth'
                }, {
                  id: 'NRM_Port_Phillip_and_Western_Port',
                  name: 'Port Phillip and Western Port'
                }, {
                  id: 'NRM_Rangelands',
                  name: 'Rangelands'
                }, {
                  id: 'NRM_South',
                  name: 'South'
                }, {
                  id: 'NRM_South_Australian_Arid_Lands',
                  name: 'South Australian Arid Lands'
                }, {
                  id: 'NRM_South_Australian_Murray_Darling_Basin',
                  name: 'South Australian Murray Darling Basin'
                }, {
                  id: 'NRM_South_Coast',
                  name: 'South Coast'
                }, {
                  id: 'NRM_South_East',
                  name: 'South East'
                }, {
                  id: 'NRM_South_East_Queensland',
                  name: 'South East Queensland'
                }, {
                  id: 'NRM_South_West',
                  name: 'South West'
                }, {
                  id: 'NRM_South_West_Queensland',
                  name: 'South West Queensland'
                }, {
                  id: 'NRM_Southern_Gulf',
                  name: 'Southern Gulf'
                }, {
                  id: 'NRM_Southern_Rivers',
                  name: 'Southern Rivers'
                }, {
                  id: 'NRM_Sydney_Metro',
                  name: 'Sydney Metro'
                }, {
                  id: 'NRM_Torres_Strait',
                  name: 'Torres Strait'
                }, {
                  id: 'NRM_West_Gippsland',
                  name: 'West Gippsland'
                }, {
                  id: 'NRM_Western',
                  name: 'Western'
                }, {
                  id: 'NRM_Wet_Tropics',
                  name: 'Wet Tropics'
                }, {
                  id: 'NRM_Wimmera',
                  name: 'Wimmera'
                }
              ]
            }, {
              id: 'ibra',
              name: 'IBRA bioregion',
              regions: []
            }, {
              id: 'state',
              name: 'State, territory',
              regions: [
                {
                  id: 'State_Australian_Capital_Territory',
                  name: 'ACT'
                }, {
                  id: 'State_New_South_Wales',
                  name: 'New South Wales'
                }, {
                  id: 'State_Northern_Territory',
                  name: 'Northern Territory'
                }, {
                  id: 'State_Queensland',
                  name: 'Queensland'
                }, {
                  id: 'State_South_Australia',
                  name: 'South Australia'
                }, {
                  id: 'State_Tasmania',
                  name: 'Tasmania'
                }, {
                  id: 'State_Victoria',
                  name: 'Victoria'
                }, {
                  id: 'State_Western_Australia',
                  name: 'Western Australia'
                }
              ]
            }
          ]
        });
      }, 500 + (500 * Math.random()));
      return fetch.promise();
    },
    buildRegionList: function(data) {
      var regionselect;
      debug('AppView.buildRegionList');
      this.regions = data.regiontypes;
      regionselect = this.$('.regionselect');
      regionselect.empty().removeClass('loading');
      return $.each(this.regions, (function(_this) {
        return function(index, regionType) {
          var reg, regionTypeRow;
          regionType.optionList = [
            (function() {
              var _i, _len, _ref, _results;
              _ref = regionType.regions;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                reg = _ref[_i];
                _results.push(AppView.templates.regionSelector(reg));
              }
              return _results;
            })()
          ].join("\n");
          regionTypeRow = $(AppView.templates.regionTypeSelector(regionType));
          return regionselect.append(regionTypeRow);
        };
      })(this));
    },
    updateRegionSelection: function(event) {
      var selectedType;
      debug('AppView.updateRegionSelection');
      selectedType = this.$('[name=regiontype]:checked').val();
      $.each(this.regions, (function(_this) {
        return function(index, regionType) {
          var selector;
          selector = _this.$("#regiontype-" + regionType.id);
          if (selectedType === regionType.id) {
            selector.addClass('typeselected');
            _this.selectedRegionType = regionType.id;
            _this.selectedRegion = $(selector.find('select')).val();
            if (_this.selectedRegion === null) {
              return selector.removeClass('regionselected');
            } else {
              selector.addClass('regionselected');
              debug(_this.selectedRegion);
              return _this.selectedRegionInfo = _.find(regionType.regions, function(region) {
                debug(region);
                return region.id === _this.selectedRegion;
              });
            }
          } else {
            return selector.removeClass('typeselected');
          }
        };
      })(this));
      return this.updateSummary();
    },
    fetchYears: function() {
      var fetch;
      debug('AppView.fetchYears');
      fetch = $.Deferred();
      fetch.done((function(_this) {
        return function(data) {
          return _this.buildYearList(data);
        };
      })(this));
      setTimeout(function() {
        return fetch.resolve({
          years: ['2015', '2025', '2035', '2045', '2055', '2065', '2075', '2085']
        });
      }, 500 + (500 * Math.random()));
      return fetch.promise();
    },
    buildYearList: function(data) {
      var yearselect;
      debug('AppView.buildYearList');
      this.years = data.years;
      yearselect = this.$('.yearselect');
      yearselect.empty().removeClass('loading');
      return $.each(this.years, (function(_this) {
        return function(index, year) {
          return yearselect.append(AppView.templates.yearSelector({
            year: year
          }));
        };
      })(this));
    },
    updateYearSelection: function(event) {
      debug('AppView.updateYearSelection');
      this.selectedYear = this.$('[name=yearselector]:checked').val();
      $.each(this.years, (function(_this) {
        return function(index, year) {
          var selector;
          selector = _this.$("#year-" + year);
          if (_this.selectedYear === year) {
            return selector.addClass('yearselected');
          } else {
            return selector.removeClass('yearselected');
          }
        };
      })(this));
      return this.updateSummary();
    },
    sectionId: function(sectionDom) {
      debug('AppView.sectionId');
      return $(sectionDom).find('input').attr('value');
    },
    sectionName: function(sectionDom) {
      debug('AppView.sectionName');
      return this.sectionInfo(sectionDom).name;
    },
    sectionInfo: function(sectionDom) {
      var info, parentIds, parentage;
      debug('AppView.sectionInfo');
      parentage = $(sectionDom).parents('.sectionselector');
      parentIds = parentage.map((function(_this) {
        return function(i, elem) {
          return _this.sectionId(elem);
        };
      })(this)).get();
      parentIds.push(this.sectionId(sectionDom));
      info = {
        sections: this.possibleSections
      };
      parentIds.forEach(function(id) {
        debug('id is ' + id);
        debug(info);
        return info = _.filter(info.sections, function(section) {
          return section.id === id;
        })[0];
      });
      return info;
    },
    subSectionList: function(sectionDom) {
      var list, subsections;
      debug('AppView.sectionList');
      list = [];
      subsections = $(sectionDom).children('.subsections');
      subsections.children('.sectionselector').not('.unselected').each((function(_this) {
        return function(i, elem) {
          var name, subs;
          debug('doing ' + elem.innerHTML);
          name = _this.sectionName(elem);
          subs = _this.subSectionList(elem);
          if (subs !== '') {
            name = name + ' (' + subs + ')';
          }
          return list.push(name);
        };
      })(this));
      return list.join(', ');
    },
    updateSummary: function() {
      var content, contentList, selectedSections, summary, _ref;
      debug('AppView.updateSummary');
      selectedSections = this.$('.sectionselect > .sectionselector').not('.unselected');
      contentList = [];
      selectedSections.each((function(_this) {
        return function(index, section) {
          var info, subList;
          info = _this.sectionName(section);
          subList = _this.subSectionList(section);
          if (subList !== '') {
            info = info + ': ' + subList.toLowerCase();
          }
          return contentList.push(info + '.');
        };
      })(this));
      content = '';
      if (contentList.length > 0) {
        content = '<li>' + contentList.join('</li><li>') + '</li>';
      }
      summary = {
        regionName: (_ref = this.selectedRegionInfo) != null ? _ref.name : void 0,
        year: this.selectedYear,
        content: content
      };
      return this.$('.reviewblock').html(AppView.templates.reviewBlock(summary));
    }
  }, {
    templates: {
      layout: _.template("<div class=\"reviewblock\"></div>\n<div class=\"formblock\">\n    <h1>Report on</h1>\n    <div class=\"loading select regionselect\">loading available regions..</div>\n\n    <h1>In the year</h1>\n    <div class=\"loading select yearselect\">loading available years..</div>\n\n    <h1>Including</h1>\n    <div class=\"loading select sectionselect\">loading available sections..</div>\n</div>"),
      reviewBlock: _.template("<h1>Selected Report</h1>\n<p class=\"coverage\">Covers\n    <% if (regionName) { %><%= regionName %><% } else { %><em>(unspecified region)</em><% } %>\n    in\n    <% if (year) { %><%= year %>.<% } else { %><em>(unspecified year)</em>.<% } %>\n</p>\n<ul class=\"contents\"><%= content %></ul>\n<button type=\"button\" class=\"getreport\">download report</button>"),
      reviewContentItem: _.template("<li>item</li>"),
      regionTypeSelector: _.template("<div class=\"regiontypeselector\" id=\"regiontype-<%= id %>\">\n    <label class=\"name\"><input\n        class=\"regiontype\"\n        name=\"regiontype\"\n        type=\"radio\"\n        value=\"<%= id %>\"\n    /> <%= name %>\n    </label>\n    <div class=\"regionselectorwrapper\"><select class=\"regionselector\">\n        <option value=\"\" disabled=\"disabled\" selected=\"selected\">select a region&hellip;</option>\n        <%= optionList %>\n    </select></div>\n</div>"),
      regionSelector: _.template("<option value=\"<%= id %>\"><%= name %></option>"),
      yearSelector: _.template("<div class=\"yearrow\" id=\"year-<%= year %>\">\n    <label class=\"name\"><input\n        class=\"yearselector\"\n        name=\"yearselector\"\n        type=\"radio\"\n        value=\"<%= year %>\"\n    /> <%= year %></label>\n</div>"),
      sectionSelector: _.template("<div class=\"sectionselector\" id=\"section-<%= id %>\">\n    <label class=\"name\"\n        <% if (presence == 'required') { print('title=\"This section is required\"'); } %>\n    ><input\n        type=\"checkbox\"\n        value=\"<%= id %>\"\n        checked=\"checked\"\n        <% if (presence == 'required') { print('disabled=\"disabled\"'); } %>\n    /> <%= name %></label>\n    <p class=\"description\"><%= description %></p>\n\n</div>"),
      subsections: _.template("<div class=\"subsections clearfix\">\n    <p class=\"subsectionintro\">Contains these subsections:</p>\n</div>")
    }
  });

  module.exports = AppView;

}).call(this);

},{"../util/shims":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9mYWtlXzc2ZGQyMTBkLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9yZXBvcnRzL21haW4uanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NsaW1hc25nL2NsaW1hcy1uZy9jbGltYXNuZy9zcmMvanMvcmVwb3J0cy92aWV3cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxucmVxdWlyZSgnLi9yZXBvcnRzL21haW4nKTtcblxuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldztcblxuICBpZiAoIXdpbmRvdy5jb25zb2xlKSB7XG4gICAgd2luZG93LmNvbnNvbGUgPSB7XG4gICAgICBsb2c6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIEFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FwcCcpO1xuXG4gICQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFwcHZpZXc7XG4gICAgYXBwdmlldyA9IG5ldyBBcHBWaWV3KCk7XG4gICAgcmV0dXJuIGFwcHZpZXcucmVuZGVyKCk7XG4gIH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuZm9yRWFjaCkge1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oZm4sIHNjb3BlKSB7XG4gICAgICB2YXIgaSwgX2ksIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2goX19pbmRleE9mLmNhbGwodGhpcywgaSkgPj0gMCA/IGZuLmNhbGwoc2NvcGUsIHRoaXNbaV0sIGksIHRoaXMpIDogdm9pZCAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24obmVlZGxlKSB7XG4gICAgICB2YXIgaSwgX2ksIF9yZWY7XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBpZiAodGhpc1tpXSA9PT0gbmVlZGxlKSB7XG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3LCBkZWJ1ZztcblxuICByZXF1aXJlKCcuLi91dGlsL3NoaW1zJyk7XG5cblxuICAvKiBqc2hpbnQgLVcwOTMgKi9cblxuICBkZWJ1ZyA9IGZ1bmN0aW9uKGl0ZW1Ub0xvZywgaXRlbUxldmVsKSB7XG4gICAgdmFyIGxldmVscywgbWVzc2FnZU51bSwgdGhyZXNob2xkLCB0aHJlc2hvbGROdW07XG4gICAgbGV2ZWxzID0gWyd2ZXJ5ZGVidWcnLCAnZGVidWcnLCAnbWVzc2FnZScsICd3YXJuaW5nJ107XG4gICAgdGhyZXNob2xkID0gJ3ZlcnlkZWJ1Zyc7XG4gICAgaWYgKCFpdGVtTGV2ZWwpIHtcbiAgICAgIGl0ZW1MZXZlbCA9ICdkZWJ1Zyc7XG4gICAgfVxuICAgIHRocmVzaG9sZE51bSA9IGxldmVscy5pbmRleE9mKHRocmVzaG9sZCk7XG4gICAgbWVzc2FnZU51bSA9IGxldmVscy5pbmRleE9mKGl0ZW1MZXZlbCk7XG4gICAgaWYgKHRocmVzaG9sZE51bSA+IG1lc3NhZ2VOdW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGl0ZW1Ub0xvZyArICcnID09PSBpdGVtVG9Mb2cpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIltcIiArIGl0ZW1MZXZlbCArIFwiXSBcIiArIGl0ZW1Ub0xvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhpdGVtVG9Mb2cpO1xuICAgIH1cbiAgfTtcblxuICBBcHBWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdmb3JtJyxcbiAgICBjbGFzc05hbWU6ICcnLFxuICAgIGlkOiAncmVwb3J0Zm9ybScsXG4gICAgc3BlY2llc0RhdGFVcmw6IFwiXCIgKyBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3QgKyBcIi9zcGVjaWVzZGF0YVwiLFxuICAgIHJhc3RlckFwaVVybDogXCJcIiArIGxvY2F0aW9uLnByb3RvY29sICsgXCIvL2xvY2FsaG9zdDoxMDYwMC9hcGkvcmFzdGVyLzEvd21zX2RhdGFfdXJsXCIsXG4gICAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gICAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgICBldmVudHM6IHtcbiAgICAgICdjaGFuZ2UgLnNlY3Rpb25zZWxlY3RvciBpbnB1dCc6ICd1cGRhdGVTZWN0aW9uU2VsZWN0aW9uJyxcbiAgICAgICdjaGFuZ2UgLnJlZ2lvbnNlbGVjdCBpbnB1dCc6ICd1cGRhdGVSZWdpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAucmVnaW9uc2VsZWN0IHNlbGVjdCc6ICd1cGRhdGVSZWdpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAueWVhcnNlbGVjdCBpbnB1dCc6ICd1cGRhdGVZZWFyU2VsZWN0aW9uJ1xuICAgIH0sXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5pbml0aWFsaXplJyk7XG4gICAgICBfLmJpbmRBbGwuYXBwbHkoXywgW3RoaXNdLmNvbmNhdChfLmZ1bmN0aW9ucyh0aGlzKSkpO1xuICAgICAgdGhpcy5mZXRjaFJlcG9ydFNlY3Rpb25zKCk7XG4gICAgICB0aGlzLmZldGNoUmVnaW9ucygpO1xuICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hZZWFycygpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnJlbmRlcicpO1xuICAgICAgdGhpcy4kZWwuYXBwZW5kKEFwcFZpZXcudGVtcGxhdGVzLmxheW91dCh7fSkpO1xuICAgICAgcmV0dXJuICQoJyNjb250ZW50d3JhcCAubWFpbmNvbnRlbnQnKS5hcHBlbmQodGhpcy4kZWwpO1xuICAgIH0sXG4gICAgZmV0Y2hSZXBvcnRTZWN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmV0Y2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFJlcG9ydFNlY3Rpb25zJyk7XG4gICAgICBmZXRjaCA9ICQuRGVmZXJyZWQoKTtcbiAgICAgIGZldGNoLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIHNlY3Rpb25zZWxlY3Q7XG4gICAgICAgICAgX3RoaXMucG9zc2libGVTZWN0aW9ucyA9IGRhdGEuc2VjdGlvbnM7XG4gICAgICAgICAgc2VjdGlvbnNlbGVjdCA9IF90aGlzLiQoJy5zZWN0aW9uc2VsZWN0Jyk7XG4gICAgICAgICAgc2VjdGlvbnNlbGVjdC5lbXB0eSgpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJ1aWxkUmVwb3J0U2VjdGlvbkxpc3QoX3RoaXMucG9zc2libGVTZWN0aW9ucywgc2VjdGlvbnNlbGVjdCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmV0Y2gucmVzb2x2ZSh7XG4gICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWQ6ICdpbnRybycsXG4gICAgICAgICAgICAgIG5hbWU6ICdJbnRyb2R1Y3Rpb24nLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ3RpdGxlLCBjcmVkaXRzLCBhbmQgaW50cm9kdWN0b3J5IHBhcmFncmFwaHMuJyxcbiAgICAgICAgICAgICAgcHJlc2VuY2U6ICdyZXF1aXJlZCcsXG4gICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ2NsaW1hdGVyZXZpZXcnLFxuICAgICAgICAgICAgICBuYW1lOiAnQ2xpbWF0ZSBSZXZpZXcnLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2EgZGVzY3JpcHRpb24gb2YgdGhlIHJlZ2lvblxcJ3MgY3VycmVudCBhbmQgcHJvamVjdGVkIGNsaW1hdGUuJyxcbiAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgaWQ6ICd0ZW1wZXJhdHVyZScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnVGVtcGVyYXR1cmUnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgdGVtcGVyYXR1cmUuJyxcbiAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdyYWluZmFsbCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnUmFpbmZhbGwnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgcHJlY2lwaXRhdGlvbi4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgaWQ6ICdiaW9kaXZlcnNpdHknLFxuICAgICAgICAgICAgICBuYW1lOiAnQmlvZGl2ZXJzaXR5IFJldmlldycsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnYSBkZXNjcmlwdGlvbiBvZiB0aGUgcmVnaW9uXFwncyBjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5LiBBIGRlc2NyaXB0aW9uIG9mIHRoZSByZWdpb25cXCdzIGN1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkuIEEgZGVzY3JpcHRpb24gb2YgdGhlIHJlZ2lvblxcJ3MgY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eS4gQSBkZXNjcmlwdGlvbiBvZiB0aGUgcmVnaW9uXFwncyBjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5LicsXG4gICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnb3ZlcmFsbCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnT3ZlcmFsbCcsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkgb3ZlciBhbGwgbW9kZWxsZWQgc3BlY2llcycsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnbWFtbWFscycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTWFtbWFscycsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkgb3ZlciBtYW1tYWwgc3BlY2llcycsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnYW1waGliaWFucycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQW1waGliaWFucycsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkgb3ZlciBhbXBoaWJpYW4gc3BlY2llcycsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAncmVwdGlsZXMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1JlcHRpbGVzJyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eSBvdmVyIHJlcHRpbGUgc3BlY2llcycsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnYmlyZHMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0JpcmRzJyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eSBvdmVyIGJpcmQgc3BlY2llcycsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ2FwcGVuZGl4ZXMnLFxuICAgICAgICAgICAgICBuYW1lOiAnQXBwZW5kaWNlcycsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAndGFibGVzIGFuZCBvdGhlciBhcHBlbmRpY2VzLicsXG4gICAgICAgICAgICAgIHByZXNlbmNlOiAncmVxdWlyZWQnLFxuICAgICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnb2JzZXJ2ZWRtYW1tYWxsaXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdNYW1tYWxzIFByZXNlbnQnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdsaXN0IG9mIG1hbW1hbHMgY3VycmVudGx5IG9yIHByb2plY3RlZCB0byBiZSBwcmVzZW50IGluIHJlZ2lvbi4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ29ic2VydmVkYW1waGliaWFuc2xpc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0FtcGhpYmlhbnMgUHJlc2VudCcsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2xpc3Qgb2YgYW1waGliaWFucyBjdXJyZW50bHkgb3IgcHJvamVjdGVkIHRvIGJlIHByZXNlbnQgaW4gcmVnaW9uLicsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnb2JzZXJ2ZWRyZXB0aWxlc2xpc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1JlcHRpbGVzIFByZXNlbnQnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdsaXN0IG9mIHJlcHRpbGVzIGN1cnJlbnRseSBvciBwcm9qZWN0ZWQgdG8gYmUgcHJlc2VudCBpbiByZWdpb24uJyxcbiAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdvYnNlcnZlZGJpcmRzbGlzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQmlyZHMgUHJlc2VudCcsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2xpc3Qgb2YgYmlyZHMgY3VycmVudGx5IG9yIHByb2plY3RlZCB0byBiZSBwcmVzZW50IGluIHJlZ2lvbi4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ3NjaWVuY2UnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NjaWVuY2UnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdkZXNjcmlwdGlvbiBvZiB0aGUgY2xpbWF0ZSBhbmQgc3BlY2llcyBkaXN0cmlidXRpb24gbW9kZWxsaW5nIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGRhdGEgaW4gdGhlIHJlcG9ydC4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdyZXF1aXJlZCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgICAgfSwgNTAwICsgKDUwMCAqIE1hdGgucmFuZG9tKCkpKTtcbiAgICAgIHJldHVybiBmZXRjaC5wcm9taXNlKCk7XG4gICAgfSxcbiAgICBidWlsZFJlcG9ydFNlY3Rpb25MaXN0OiBmdW5jdGlvbihkYXRhLCB3cmFwcGVyKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0Jyk7XG4gICAgICByZXR1cm4gJC5lYWNoKGRhdGEsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICB2YXIgc2VsZWN0b3JSb3csIHN1YnNlY3Rpb25zO1xuICAgICAgICAgIHNlbGVjdG9yUm93ID0gJChBcHBWaWV3LnRlbXBsYXRlcy5zZWN0aW9uU2VsZWN0b3IoaXRlbSkpO1xuICAgICAgICAgICQod3JhcHBlcikuYXBwZW5kKHNlbGVjdG9yUm93KTtcbiAgICAgICAgICBpZiAoaXRlbS5zZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzdWJzZWN0aW9ucyA9ICQoQXBwVmlldy50ZW1wbGF0ZXMuc3Vic2VjdGlvbnMoKSk7XG4gICAgICAgICAgICBfdGhpcy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0KGl0ZW0uc2VjdGlvbnMsIHN1YnNlY3Rpb25zKTtcbiAgICAgICAgICAgIHJldHVybiAkKHNlbGVjdG9yUm93KS5hZGRDbGFzcygnaGFzc3Vic2VjdGlvbnMnKS5hcHBlbmQoc3Vic2VjdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIHVwZGF0ZVNlY3Rpb25TZWxlY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVTZWN0aW9uU2VsZWN0aW9uJyk7XG4gICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uKHRoaXMucG9zc2libGVTZWN0aW9ucyk7XG4gICAgfSxcbiAgICBoYW5kbGVTZWN0aW9uU2VsZWN0aW9uOiBmdW5jdGlvbihzZWN0aW9uTGlzdCwgcGFyZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uJyk7XG4gICAgICAkLmVhY2goc2VjdGlvbkxpc3QsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICB2YXIgc2VsZWN0aW9uQ29udHJvbCwgc2VsZWN0b3IsIF9yZWY7XG4gICAgICAgICAgc2VsZWN0b3IgPSBfdGhpcy4kKFwiI3NlY3Rpb24tXCIgKyBpdGVtLmlkKTtcbiAgICAgICAgICBzZWxlY3Rpb25Db250cm9sID0gc2VsZWN0b3IuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgICBpZiAoc2VsZWN0aW9uQ29udHJvbC5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd1bnNlbGVjdGVkJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCd1bnNlbGVjdGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlYnVnKFwiaGFuZGxpbmcgXCIgKyBwYXJlbnQgKyBcIi5cIiArIChzZWxlY3Rpb25Db250cm9sLnZhbCgpKSk7XG4gICAgICAgICAgaWYgKCgoX3JlZiA9IGl0ZW0uc2VjdGlvbnMpICE9IG51bGwgPyBfcmVmLmxlbmd0aCA6IHZvaWQgMCkgPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMuaGFuZGxlU2VjdGlvblNlbGVjdGlvbihpdGVtLnNlY3Rpb25zLCBpdGVtLmlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBmZXRjaFJlZ2lvbnM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZldGNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hSZWdpb25zJyk7XG4gICAgICBmZXRjaCA9ICQuRGVmZXJyZWQoKTtcbiAgICAgIGZldGNoLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJ1aWxkUmVnaW9uTGlzdChkYXRhKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBmZXRjaC5yZXNvbHZlKHtcbiAgICAgICAgICByZWdpb250eXBlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBpZDogJ25ybScsXG4gICAgICAgICAgICAgIG5hbWU6ICdOUk0gcmVnaW9uJyxcbiAgICAgICAgICAgICAgcmVnaW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0FDVCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQUNUJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0FkZWxhaWRlX2FuZF9Nb3VudF9Mb2Z0eV9SYW5nZXMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0FkZWxhaWRlIGFuZCBNb3VudCBMb2Z0eSBSYW5nZXMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQWxpbnl0amFyYV9XaWx1cmFyYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQWxpbnl0amFyYSBXaWx1cmFyYSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Bdm9uJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdBdm9uJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0JvcmRlcl9SaXZlcnMtR3d5ZGlyJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdCb3JkZXIgUml2ZXJzLUd3eWRpcidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Cb3JkZXJfUml2ZXJzX01hcmFub2EtQmFsb25uZScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQm9yZGVyIFJpdmVycyBNYXJhbm9hLUJhbG9ubmUnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQnVyZGVraW4nLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0J1cmRla2luJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0J1cm5ldHRfTWFyeScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQnVybmV0dCBNYXJ5J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0NhcGVfWW9yaycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQ2FwZSBZb3JrJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0NlbnRyYWxfV2VzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQ2VudHJhbCBXZXN0J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0NvbmRhbWluZScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQ29uZGFtaW5lJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0Nvb3BlcmF0aXZlX01hbmFnZW1lbnRfQXJlYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQ29vcGVyYXRpdmUgTWFuYWdlbWVudCBBcmVhJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0NvcmFuZ2FtaXRlJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdDb3JhbmdhbWl0ZSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9EZXNlcnRfQ2hhbm5lbHMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0Rlc2VydCBDaGFubmVscydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9FYXN0X0dpcHBzbGFuZCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnRWFzdCBHaXBwc2xhbmQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fRXlyZV9QZW5pbnN1bGEnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0V5cmUgUGVuaW5zdWxhJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0ZpdHpyb3knLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0ZpdHpyb3knXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fR2xlbmVsZ19Ib3BraW5zJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdHbGVuZWxnIEhvcGtpbnMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fR291bGJ1cm5fQnJva2VuJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdHb3VsYnVybiBCcm9rZW4nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fSGF3a2VzYnVyeS1OZXBlYW4nLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0hhd2tlc2J1cnktTmVwZWFuJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0h1bnRlci1DZW50cmFsX1JpdmVycycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnSHVudGVyLUNlbnRyYWxfUml2ZXJzJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0thbmdhcm9vX0lzbGFuZCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnS2FuZ2Fyb28gSXNsYW5kJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0xhY2hsYW4nLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0xhY2hsYW4nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTG93ZXJfTXVycmF5X0RhcmxpbmcnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0xvd2VyIE11cnJheSBEYXJsaW5nJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX01hY2theV9XaGl0c3VuZGF5JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdNYWNrYXkgV2hpdHN1bmRheSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9NYWxsZWUnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ01hbGxlZSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9NdXJyYXknLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ011cnJheSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9NdXJydW1iaWRnZWUnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ011cnJ1bWJpZGdlZSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9OYW1vaScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTmFtb2knXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGgnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05vcnRoX0NlbnRyYWwnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoIENlbnRyYWwnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGhfRWFzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTm9ydGggRWFzdCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Ob3J0aF9XZXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aCBXZXN0J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05vcnRoZXJuX0FncmljdWx0dXJhbCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTm9ydGhlcm4gQWdyaWN1bHR1cmFsJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05vcnRoZXJuX0d1bGYnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoZXJuIEd1bGYnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGhlcm5fUml2ZXJzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aGVybiBSaXZlcnMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGhlcm5fVGVycml0b3J5JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aGVybiBUZXJyaXRvcnknXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGhlcm5fYW5kX1lvcmtlJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aGVybiBhbmQgWW9ya2UnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fUGVydGgnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1BlcnRoJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1BvcnRfUGhpbGxpcF9hbmRfV2VzdGVybl9Qb3J0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdQb3J0IFBoaWxsaXAgYW5kIFdlc3Rlcm4gUG9ydCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9SYW5nZWxhbmRzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdSYW5nZWxhbmRzJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aF9BdXN0cmFsaWFuX0FyaWRfTGFuZHMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoIEF1c3RyYWxpYW4gQXJpZCBMYW5kcydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aF9BdXN0cmFsaWFuX011cnJheV9EYXJsaW5nX0Jhc2luJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBBdXN0cmFsaWFuIE11cnJheSBEYXJsaW5nIEJhc2luJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoX0NvYXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBDb2FzdCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aF9FYXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBFYXN0J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoX0Vhc3RfUXVlZW5zbGFuZCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGggRWFzdCBRdWVlbnNsYW5kJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoX1dlc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoIFdlc3QnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU291dGhfV2VzdF9RdWVlbnNsYW5kJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBXZXN0IFF1ZWVuc2xhbmQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU291dGhlcm5fR3VsZicsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGhlcm4gR3VsZidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aGVybl9SaXZlcnMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoZXJuIFJpdmVycydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9TeWRuZXlfTWV0cm8nLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1N5ZG5leSBNZXRybydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Ub3JyZXNfU3RyYWl0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdUb3JyZXMgU3RyYWl0J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1dlc3RfR2lwcHNsYW5kJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdXZXN0IEdpcHBzbGFuZCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9XZXN0ZXJuJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdXZXN0ZXJuJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1dldF9Ucm9waWNzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdXZXQgVHJvcGljcydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9XaW1tZXJhJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdXaW1tZXJhJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ2licmEnLFxuICAgICAgICAgICAgICBuYW1lOiAnSUJSQSBiaW9yZWdpb24nLFxuICAgICAgICAgICAgICByZWdpb25zOiBbXVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgbmFtZTogJ1N0YXRlLCB0ZXJyaXRvcnknLFxuICAgICAgICAgICAgICByZWdpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdTdGF0ZV9BdXN0cmFsaWFuX0NhcGl0YWxfVGVycml0b3J5JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdBQ1QnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdTdGF0ZV9OZXdfU291dGhfV2FsZXMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05ldyBTb3V0aCBXYWxlcydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ1N0YXRlX05vcnRoZXJuX1RlcnJpdG9yeScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTm9ydGhlcm4gVGVycml0b3J5J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnU3RhdGVfUXVlZW5zbGFuZCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnUXVlZW5zbGFuZCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ1N0YXRlX1NvdXRoX0F1c3RyYWxpYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGggQXVzdHJhbGlhJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnU3RhdGVfVGFzbWFuaWEnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1Rhc21hbmlhJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnU3RhdGVfVmljdG9yaWEnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1ZpY3RvcmlhJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnU3RhdGVfV2VzdGVybl9BdXN0cmFsaWEnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1dlc3Rlcm4gQXVzdHJhbGlhJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgfSk7XG4gICAgICB9LCA1MDAgKyAoNTAwICogTWF0aC5yYW5kb20oKSkpO1xuICAgICAgcmV0dXJuIGZldGNoLnByb21pc2UoKTtcbiAgICB9LFxuICAgIGJ1aWxkUmVnaW9uTGlzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHJlZ2lvbnNlbGVjdDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkUmVnaW9uTGlzdCcpO1xuICAgICAgdGhpcy5yZWdpb25zID0gZGF0YS5yZWdpb250eXBlcztcbiAgICAgIHJlZ2lvbnNlbGVjdCA9IHRoaXMuJCgnLnJlZ2lvbnNlbGVjdCcpO1xuICAgICAgcmVnaW9uc2VsZWN0LmVtcHR5KCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIHJldHVybiAkLmVhY2godGhpcy5yZWdpb25zLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCByZWdpb25UeXBlKSB7XG4gICAgICAgICAgdmFyIHJlZywgcmVnaW9uVHlwZVJvdztcbiAgICAgICAgICByZWdpb25UeXBlLm9wdGlvbkxpc3QgPSBbXG4gICAgICAgICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgICAgICAgIF9yZWYgPSByZWdpb25UeXBlLnJlZ2lvbnM7XG4gICAgICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgICAgIHJlZyA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goQXBwVmlldy50ZW1wbGF0ZXMucmVnaW9uU2VsZWN0b3IocmVnKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICAgICAgfSkoKVxuICAgICAgICAgIF0uam9pbihcIlxcblwiKTtcbiAgICAgICAgICByZWdpb25UeXBlUm93ID0gJChBcHBWaWV3LnRlbXBsYXRlcy5yZWdpb25UeXBlU2VsZWN0b3IocmVnaW9uVHlwZSkpO1xuICAgICAgICAgIHJldHVybiByZWdpb25zZWxlY3QuYXBwZW5kKHJlZ2lvblR5cGVSb3cpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgdXBkYXRlUmVnaW9uU2VsZWN0aW9uOiBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIHNlbGVjdGVkVHlwZTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVJlZ2lvblNlbGVjdGlvbicpO1xuICAgICAgc2VsZWN0ZWRUeXBlID0gdGhpcy4kKCdbbmFtZT1yZWdpb250eXBlXTpjaGVja2VkJykudmFsKCk7XG4gICAgICAkLmVhY2godGhpcy5yZWdpb25zLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCByZWdpb25UeXBlKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdG9yO1xuICAgICAgICAgIHNlbGVjdG9yID0gX3RoaXMuJChcIiNyZWdpb250eXBlLVwiICsgcmVnaW9uVHlwZS5pZCk7XG4gICAgICAgICAgaWYgKHNlbGVjdGVkVHlwZSA9PT0gcmVnaW9uVHlwZS5pZCkge1xuICAgICAgICAgICAgc2VsZWN0b3IuYWRkQ2xhc3MoJ3R5cGVzZWxlY3RlZCcpO1xuICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWRSZWdpb25UeXBlID0gcmVnaW9uVHlwZS5pZDtcbiAgICAgICAgICAgIF90aGlzLnNlbGVjdGVkUmVnaW9uID0gJChzZWxlY3Rvci5maW5kKCdzZWxlY3QnKSkudmFsKCk7XG4gICAgICAgICAgICBpZiAoX3RoaXMuc2VsZWN0ZWRSZWdpb24gPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCdyZWdpb25zZWxlY3RlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2VsZWN0b3IuYWRkQ2xhc3MoJ3JlZ2lvbnNlbGVjdGVkJyk7XG4gICAgICAgICAgICAgIGRlYnVnKF90aGlzLnNlbGVjdGVkUmVnaW9uKTtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnNlbGVjdGVkUmVnaW9uSW5mbyA9IF8uZmluZChyZWdpb25UeXBlLnJlZ2lvbnMsIGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgICAgICAgICAgICAgIGRlYnVnKHJlZ2lvbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlZ2lvbi5pZCA9PT0gX3RoaXMuc2VsZWN0ZWRSZWdpb247XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3R5cGVzZWxlY3RlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN1bW1hcnkoKTtcbiAgICB9LFxuICAgIGZldGNoWWVhcnM6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGZldGNoO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hZZWFycycpO1xuICAgICAgZmV0Y2ggPSAkLkRlZmVycmVkKCk7XG4gICAgICBmZXRjaC5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5idWlsZFllYXJMaXN0KGRhdGEpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGZldGNoLnJlc29sdmUoe1xuICAgICAgICAgIHllYXJzOiBbJzIwMTUnLCAnMjAyNScsICcyMDM1JywgJzIwNDUnLCAnMjA1NScsICcyMDY1JywgJzIwNzUnLCAnMjA4NSddXG4gICAgICAgIH0pO1xuICAgICAgfSwgNTAwICsgKDUwMCAqIE1hdGgucmFuZG9tKCkpKTtcbiAgICAgIHJldHVybiBmZXRjaC5wcm9taXNlKCk7XG4gICAgfSxcbiAgICBidWlsZFllYXJMaXN0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgeWVhcnNlbGVjdDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkWWVhckxpc3QnKTtcbiAgICAgIHRoaXMueWVhcnMgPSBkYXRhLnllYXJzO1xuICAgICAgeWVhcnNlbGVjdCA9IHRoaXMuJCgnLnllYXJzZWxlY3QnKTtcbiAgICAgIHllYXJzZWxlY3QuZW1wdHkoKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgcmV0dXJuICQuZWFjaCh0aGlzLnllYXJzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCB5ZWFyKSB7XG4gICAgICAgICAgcmV0dXJuIHllYXJzZWxlY3QuYXBwZW5kKEFwcFZpZXcudGVtcGxhdGVzLnllYXJTZWxlY3Rvcih7XG4gICAgICAgICAgICB5ZWFyOiB5ZWFyXG4gICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgdXBkYXRlWWVhclNlbGVjdGlvbjogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVllYXJTZWxlY3Rpb24nKTtcbiAgICAgIHRoaXMuc2VsZWN0ZWRZZWFyID0gdGhpcy4kKCdbbmFtZT15ZWFyc2VsZWN0b3JdOmNoZWNrZWQnKS52YWwoKTtcbiAgICAgICQuZWFjaCh0aGlzLnllYXJzLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCB5ZWFyKSB7XG4gICAgICAgICAgdmFyIHNlbGVjdG9yO1xuICAgICAgICAgIHNlbGVjdG9yID0gX3RoaXMuJChcIiN5ZWFyLVwiICsgeWVhcik7XG4gICAgICAgICAgaWYgKF90aGlzLnNlbGVjdGVkWWVhciA9PT0geWVhcikge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLmFkZENsYXNzKCd5ZWFyc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd5ZWFyc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBzZWN0aW9uSWQ6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25JZCcpO1xuICAgICAgcmV0dXJuICQoc2VjdGlvbkRvbSkuZmluZCgnaW5wdXQnKS5hdHRyKCd2YWx1ZScpO1xuICAgIH0sXG4gICAgc2VjdGlvbk5hbWU6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25OYW1lJyk7XG4gICAgICByZXR1cm4gdGhpcy5zZWN0aW9uSW5mbyhzZWN0aW9uRG9tKS5uYW1lO1xuICAgIH0sXG4gICAgc2VjdGlvbkluZm86IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHZhciBpbmZvLCBwYXJlbnRJZHMsIHBhcmVudGFnZTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25JbmZvJyk7XG4gICAgICBwYXJlbnRhZ2UgPSAkKHNlY3Rpb25Eb20pLnBhcmVudHMoJy5zZWN0aW9uc2VsZWN0b3InKTtcbiAgICAgIHBhcmVudElkcyA9IHBhcmVudGFnZS5tYXAoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpLCBlbGVtKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnNlY3Rpb25JZChlbGVtKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKS5nZXQoKTtcbiAgICAgIHBhcmVudElkcy5wdXNoKHRoaXMuc2VjdGlvbklkKHNlY3Rpb25Eb20pKTtcbiAgICAgIGluZm8gPSB7XG4gICAgICAgIHNlY3Rpb25zOiB0aGlzLnBvc3NpYmxlU2VjdGlvbnNcbiAgICAgIH07XG4gICAgICBwYXJlbnRJZHMuZm9yRWFjaChmdW5jdGlvbihpZCkge1xuICAgICAgICBkZWJ1ZygnaWQgaXMgJyArIGlkKTtcbiAgICAgICAgZGVidWcoaW5mbyk7XG4gICAgICAgIHJldHVybiBpbmZvID0gXy5maWx0ZXIoaW5mby5zZWN0aW9ucywgZnVuY3Rpb24oc2VjdGlvbikge1xuICAgICAgICAgIHJldHVybiBzZWN0aW9uLmlkID09PSBpZDtcbiAgICAgICAgfSlbMF07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH0sXG4gICAgc3ViU2VjdGlvbkxpc3Q6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHZhciBsaXN0LCBzdWJzZWN0aW9ucztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25MaXN0Jyk7XG4gICAgICBsaXN0ID0gW107XG4gICAgICBzdWJzZWN0aW9ucyA9ICQoc2VjdGlvbkRvbSkuY2hpbGRyZW4oJy5zdWJzZWN0aW9ucycpO1xuICAgICAgc3Vic2VjdGlvbnMuY2hpbGRyZW4oJy5zZWN0aW9uc2VsZWN0b3InKS5ub3QoJy51bnNlbGVjdGVkJykuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGVsZW0pIHtcbiAgICAgICAgICB2YXIgbmFtZSwgc3VicztcbiAgICAgICAgICBkZWJ1ZygnZG9pbmcgJyArIGVsZW0uaW5uZXJIVE1MKTtcbiAgICAgICAgICBuYW1lID0gX3RoaXMuc2VjdGlvbk5hbWUoZWxlbSk7XG4gICAgICAgICAgc3VicyA9IF90aGlzLnN1YlNlY3Rpb25MaXN0KGVsZW0pO1xuICAgICAgICAgIGlmIChzdWJzICE9PSAnJykge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUgKyAnICgnICsgc3VicyArICcpJztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGxpc3QucHVzaChuYW1lKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBsaXN0LmpvaW4oJywgJyk7XG4gICAgfSxcbiAgICB1cGRhdGVTdW1tYXJ5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb250ZW50LCBjb250ZW50TGlzdCwgc2VsZWN0ZWRTZWN0aW9ucywgc3VtbWFyeSwgX3JlZjtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVN1bW1hcnknKTtcbiAgICAgIHNlbGVjdGVkU2VjdGlvbnMgPSB0aGlzLiQoJy5zZWN0aW9uc2VsZWN0ID4gLnNlY3Rpb25zZWxlY3RvcicpLm5vdCgnLnVuc2VsZWN0ZWQnKTtcbiAgICAgIGNvbnRlbnRMaXN0ID0gW107XG4gICAgICBzZWxlY3RlZFNlY3Rpb25zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgc2VjdGlvbikge1xuICAgICAgICAgIHZhciBpbmZvLCBzdWJMaXN0O1xuICAgICAgICAgIGluZm8gPSBfdGhpcy5zZWN0aW9uTmFtZShzZWN0aW9uKTtcbiAgICAgICAgICBzdWJMaXN0ID0gX3RoaXMuc3ViU2VjdGlvbkxpc3Qoc2VjdGlvbik7XG4gICAgICAgICAgaWYgKHN1Ykxpc3QgIT09ICcnKSB7XG4gICAgICAgICAgICBpbmZvID0gaW5mbyArICc6ICcgKyBzdWJMaXN0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjb250ZW50TGlzdC5wdXNoKGluZm8gKyAnLicpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgY29udGVudCA9ICcnO1xuICAgICAgaWYgKGNvbnRlbnRMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29udGVudCA9ICc8bGk+JyArIGNvbnRlbnRMaXN0LmpvaW4oJzwvbGk+PGxpPicpICsgJzwvbGk+JztcbiAgICAgIH1cbiAgICAgIHN1bW1hcnkgPSB7XG4gICAgICAgIHJlZ2lvbk5hbWU6IChfcmVmID0gdGhpcy5zZWxlY3RlZFJlZ2lvbkluZm8pICE9IG51bGwgPyBfcmVmLm5hbWUgOiB2b2lkIDAsXG4gICAgICAgIHllYXI6IHRoaXMuc2VsZWN0ZWRZZWFyLFxuICAgICAgICBjb250ZW50OiBjb250ZW50XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMuJCgnLnJldmlld2Jsb2NrJykuaHRtbChBcHBWaWV3LnRlbXBsYXRlcy5yZXZpZXdCbG9jayhzdW1tYXJ5KSk7XG4gICAgfVxuICB9LCB7XG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICBsYXlvdXQ6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJyZXZpZXdibG9ja1xcXCI+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwiZm9ybWJsb2NrXFxcIj5cXG4gICAgPGgxPlJlcG9ydCBvbjwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHJlZ2lvbnNlbGVjdFxcXCI+bG9hZGluZyBhdmFpbGFibGUgcmVnaW9ucy4uPC9kaXY+XFxuXFxuICAgIDxoMT5JbiB0aGUgeWVhcjwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHllYXJzZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHllYXJzLi48L2Rpdj5cXG5cXG4gICAgPGgxPkluY2x1ZGluZzwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHNlY3Rpb25zZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHNlY3Rpb25zLi48L2Rpdj5cXG48L2Rpdj5cIiksXG4gICAgICByZXZpZXdCbG9jazogXy50ZW1wbGF0ZShcIjxoMT5TZWxlY3RlZCBSZXBvcnQ8L2gxPlxcbjxwIGNsYXNzPVxcXCJjb3ZlcmFnZVxcXCI+Q292ZXJzXFxuICAgIDwlIGlmIChyZWdpb25OYW1lKSB7ICU+PCU9IHJlZ2lvbk5hbWUgJT48JSB9IGVsc2UgeyAlPjxlbT4odW5zcGVjaWZpZWQgcmVnaW9uKTwvZW0+PCUgfSAlPlxcbiAgICBpblxcbiAgICA8JSBpZiAoeWVhcikgeyAlPjwlPSB5ZWFyICU+LjwlIH0gZWxzZSB7ICU+PGVtPih1bnNwZWNpZmllZCB5ZWFyKTwvZW0+LjwlIH0gJT5cXG48L3A+XFxuPHVsIGNsYXNzPVxcXCJjb250ZW50c1xcXCI+PCU9IGNvbnRlbnQgJT48L3VsPlxcbjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiZ2V0cmVwb3J0XFxcIj5kb3dubG9hZCByZXBvcnQ8L2J1dHRvbj5cIiksXG4gICAgICByZXZpZXdDb250ZW50SXRlbTogXy50ZW1wbGF0ZShcIjxsaT5pdGVtPC9saT5cIiksXG4gICAgICByZWdpb25UeXBlU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJyZWdpb250eXBlc2VsZWN0b3JcXFwiIGlkPVxcXCJyZWdpb250eXBlLTwlPSBpZCAlPlxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwibmFtZVxcXCI+PGlucHV0XFxuICAgICAgICBjbGFzcz1cXFwicmVnaW9udHlwZVxcXCJcXG4gICAgICAgIG5hbWU9XFxcInJlZ2lvbnR5cGVcXFwiXFxuICAgICAgICB0eXBlPVxcXCJyYWRpb1xcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0gaWQgJT5cXFwiXFxuICAgIC8+IDwlPSBuYW1lICU+XFxuICAgIDwvbGFiZWw+XFxuICAgIDxkaXYgY2xhc3M9XFxcInJlZ2lvbnNlbGVjdG9yd3JhcHBlclxcXCI+PHNlbGVjdCBjbGFzcz1cXFwicmVnaW9uc2VsZWN0b3JcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXFxcIiBkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiIHNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCI+c2VsZWN0IGEgcmVnaW9uJmhlbGxpcDs8L29wdGlvbj5cXG4gICAgICAgIDwlPSBvcHRpb25MaXN0ICU+XFxuICAgIDwvc2VsZWN0PjwvZGl2PlxcbjwvZGl2PlwiKSxcbiAgICAgIHJlZ2lvblNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPG9wdGlvbiB2YWx1ZT1cXFwiPCU9IGlkICU+XFxcIj48JT0gbmFtZSAlPjwvb3B0aW9uPlwiKSxcbiAgICAgIHllYXJTZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInllYXJyb3dcXFwiIGlkPVxcXCJ5ZWFyLTwlPSB5ZWFyICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIj48aW5wdXRcXG4gICAgICAgIGNsYXNzPVxcXCJ5ZWFyc2VsZWN0b3JcXFwiXFxuICAgICAgICBuYW1lPVxcXCJ5ZWFyc2VsZWN0b3JcXFwiXFxuICAgICAgICB0eXBlPVxcXCJyYWRpb1xcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0geWVhciAlPlxcXCJcXG4gICAgLz4gPCU9IHllYXIgJT48L2xhYmVsPlxcbjwvZGl2PlwiKSxcbiAgICAgIHNlY3Rpb25TZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNlY3Rpb25zZWxlY3RvclxcXCIgaWQ9XFxcInNlY3Rpb24tPCU9IGlkICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIlxcbiAgICAgICAgPCUgaWYgKHByZXNlbmNlID09ICdyZXF1aXJlZCcpIHsgcHJpbnQoJ3RpdGxlPVxcXCJUaGlzIHNlY3Rpb24gaXMgcmVxdWlyZWRcXFwiJyk7IH0gJT5cXG4gICAgPjxpbnB1dFxcbiAgICAgICAgdHlwZT1cXFwiY2hlY2tib3hcXFwiXFxuICAgICAgICB2YWx1ZT1cXFwiPCU9IGlkICU+XFxcIlxcbiAgICAgICAgY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCJcXG4gICAgICAgIDwlIGlmIChwcmVzZW5jZSA9PSAncmVxdWlyZWQnKSB7IHByaW50KCdkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiJyk7IH0gJT5cXG4gICAgLz4gPCU9IG5hbWUgJT48L2xhYmVsPlxcbiAgICA8cCBjbGFzcz1cXFwiZGVzY3JpcHRpb25cXFwiPjwlPSBkZXNjcmlwdGlvbiAlPjwvcD5cXG5cXG48L2Rpdj5cIiksXG4gICAgICBzdWJzZWN0aW9uczogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInN1YnNlY3Rpb25zIGNsZWFyZml4XFxcIj5cXG4gICAgPHAgY2xhc3M9XFxcInN1YnNlY3Rpb25pbnRyb1xcXCI+Q29udGFpbnMgdGhlc2Ugc3Vic2VjdGlvbnM6PC9wPlxcbjwvZGl2PlwiKVxuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBBcHBWaWV3O1xuXG59KS5jYWxsKHRoaXMpO1xuIl19
