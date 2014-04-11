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


  /* jshint -W041 */

  debug = function(itemToLog, itemLevel) {
    var levels, messageNum, threshold, thresholdNum;
    levels = ['verydebug', 'debug', 'message', 'warning'];
    threshold = 'debug';
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
              description: 'a description of the region\'s current and projected biodiversity.',
              presence: 'optional',
              sections: [
                {
                  id: 'overall',
                  name: 'Overall',
                  description: 'current and projected biodiversity over all modelled species.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'mammals',
                  name: 'Mammals',
                  description: 'current and projected biodiversity over mammal species.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'amphibians',
                  name: 'Amphibians',
                  description: 'current and projected biodiversity over amphibian species.',
                  presence: 'optional',
                  sections: [
                    {
                      id: 'allamphibians',
                      name: 'All',
                      description: 'current and projected biodiversity over all amphibian species.',
                      presence: 'optional',
                      sections: []
                    }, {
                      id: 'streamfrogs',
                      name: 'Stream frogs',
                      description: 'current and projected biodiversity over stream frogs.',
                      presence: 'optional',
                      sections: []
                    }
                  ]
                }, {
                  id: 'reptiles',
                  name: 'Reptiles',
                  description: 'current and projected biodiversity over reptile species.',
                  presence: 'optional',
                  sections: [
                    {
                      id: 'allreptiles',
                      name: 'All',
                      description: 'current and projected biodiversity over all reptile species.',
                      presence: 'optional',
                      sections: []
                    }, {
                      id: 'turtles',
                      name: 'Turtles',
                      description: 'current and projected biodiversity over turtles.',
                      presence: 'optional',
                      sections: []
                    }
                  ]
                }, {
                  id: 'birds',
                  name: 'Birds',
                  description: 'current and projected biodiversity over bird species.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'freshwaterfish',
                  name: 'Freshwater fish',
                  description: 'current and projected biodiversity over freshwater fish species.',
                  presence: 'optional',
                  sections: []
                }
              ]
            }, {
              id: 'pests',
              name: 'Pest Species',
              description: 'climate suitability and distribution of pest species.',
              presence: 'optional',
              sections: [
                {
                  id: 'pestplants',
                  name: 'Pest Plants',
                  description: 'summary of projections for selected pest plants.',
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
                  id: 'observedstreamfrogslist',
                  name: 'Steam Frogs Present',
                  description: 'list of stream frogs currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedreptileslist',
                  name: 'Reptiles Present',
                  description: 'list of reptiles currently or projected to be present in region.',
                  presence: 'optional',
                  sections: []
                }, {
                  id: 'observedturtleslist',
                  name: 'Turtles Present',
                  description: 'list of turtles currently or projected to be present in region.',
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
              id: 'park',
              name: 'Parks, reserves',
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
              return _this.selectedRegionInfo = _.find(regionType.regions, function(region) {
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
      })(this)).get().reverse();
      parentIds.push(this.sectionId(sectionDom));
      info = {
        sections: this.possibleSections
      };
      parentIds.forEach(function(id) {
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
      subsections: _.template("<div class=\"subsections clearfix\">\n</div>")
    }
  });

  module.exports = AppView;

}).call(this);

},{"../util/shims":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9mYWtlXzNmZWY2OWM2LmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9yZXBvcnRzL21haW4uanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL3JlcG9ydHMvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvamN1L2NsaW1hc25nL2NsaW1hcy1uZy9jbGltYXNuZy9zcmMvanMvcmVwb3J0cy92aWV3cy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnJlcXVpcmUoJy4vcmVwb3J0cy9tYWluJyk7XG5cbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXc7XG5cbiAgaWYgKCF3aW5kb3cuY29uc29sZSkge1xuICAgIHdpbmRvdy5jb25zb2xlID0ge1xuICAgICAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBBcHBWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9hcHAnKTtcblxuICAkKGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcHB2aWV3O1xuICAgIGFwcHZpZXcgPSBuZXcgQXBwVmlldygpO1xuICAgIHJldHVybiBhcHB2aWV3LnJlbmRlcigpO1xuICB9KTtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGZuLCBzY29wZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKF9faW5kZXhPZi5jYWxsKHRoaXMsIGkpID49IDAgPyBmbi5jYWxsKHNjb3BlLCB0aGlzW2ldLCBpLCB0aGlzKSA6IHZvaWQgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKG5lZWRsZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgaWYgKHRoaXNbaV0gPT09IG5lZWRsZSkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldywgZGVidWc7XG5cbiAgcmVxdWlyZSgnLi4vdXRpbC9zaGltcycpO1xuXG5cbiAgLyoganNoaW50IC1XMDkzICovXG5cblxuICAvKiBqc2hpbnQgLVcwNDEgKi9cblxuICBkZWJ1ZyA9IGZ1bmN0aW9uKGl0ZW1Ub0xvZywgaXRlbUxldmVsKSB7XG4gICAgdmFyIGxldmVscywgbWVzc2FnZU51bSwgdGhyZXNob2xkLCB0aHJlc2hvbGROdW07XG4gICAgbGV2ZWxzID0gWyd2ZXJ5ZGVidWcnLCAnZGVidWcnLCAnbWVzc2FnZScsICd3YXJuaW5nJ107XG4gICAgdGhyZXNob2xkID0gJ2RlYnVnJztcbiAgICB0aHJlc2hvbGQgPSAnbWVzc2FnZSc7XG4gICAgaWYgKCFpdGVtTGV2ZWwpIHtcbiAgICAgIGl0ZW1MZXZlbCA9ICdkZWJ1Zyc7XG4gICAgfVxuICAgIHRocmVzaG9sZE51bSA9IGxldmVscy5pbmRleE9mKHRocmVzaG9sZCk7XG4gICAgbWVzc2FnZU51bSA9IGxldmVscy5pbmRleE9mKGl0ZW1MZXZlbCk7XG4gICAgaWYgKHRocmVzaG9sZE51bSA+IG1lc3NhZ2VOdW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGl0ZW1Ub0xvZyArICcnID09PSBpdGVtVG9Mb2cpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIltcIiArIGl0ZW1MZXZlbCArIFwiXSBcIiArIGl0ZW1Ub0xvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhpdGVtVG9Mb2cpO1xuICAgIH1cbiAgfTtcblxuICBBcHBWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdmb3JtJyxcbiAgICBjbGFzc05hbWU6ICcnLFxuICAgIGlkOiAncmVwb3J0Zm9ybScsXG4gICAgc3BlY2llc0RhdGFVcmw6IFwiXCIgKyBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3QgKyBcIi9zcGVjaWVzZGF0YVwiLFxuICAgIHJhc3RlckFwaVVybDogXCJcIiArIGxvY2F0aW9uLnByb3RvY29sICsgXCIvL2xvY2FsaG9zdDoxMDYwMC9hcGkvcmFzdGVyLzEvd21zX2RhdGFfdXJsXCIsXG4gICAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gICAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgICBldmVudHM6IHtcbiAgICAgICdjaGFuZ2UgLnNlY3Rpb25zZWxlY3RvciBpbnB1dCc6ICd1cGRhdGVTZWN0aW9uU2VsZWN0aW9uJyxcbiAgICAgICdjaGFuZ2UgLnJlZ2lvbnNlbGVjdCBpbnB1dCc6ICd1cGRhdGVSZWdpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAucmVnaW9uc2VsZWN0IHNlbGVjdCc6ICd1cGRhdGVSZWdpb25TZWxlY3Rpb24nLFxuICAgICAgJ2NoYW5nZSAueWVhcnNlbGVjdCBpbnB1dCc6ICd1cGRhdGVZZWFyU2VsZWN0aW9uJ1xuICAgIH0sXG4gICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5pbml0aWFsaXplJyk7XG4gICAgICBfLmJpbmRBbGwuYXBwbHkoXywgW3RoaXNdLmNvbmNhdChfLmZ1bmN0aW9ucyh0aGlzKSkpO1xuICAgICAgdGhpcy5mZXRjaFJlcG9ydFNlY3Rpb25zKCk7XG4gICAgICB0aGlzLmZldGNoUmVnaW9ucygpO1xuICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hZZWFycygpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnJlbmRlcicpO1xuICAgICAgdGhpcy4kZWwuYXBwZW5kKEFwcFZpZXcudGVtcGxhdGVzLmxheW91dCh7fSkpO1xuICAgICAgcmV0dXJuICQoJyNjb250ZW50d3JhcCAubWFpbmNvbnRlbnQnKS5hcHBlbmQodGhpcy4kZWwpO1xuICAgIH0sXG4gICAgZmV0Y2hSZXBvcnRTZWN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZmV0Y2g7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFJlcG9ydFNlY3Rpb25zJyk7XG4gICAgICBmZXRjaCA9ICQuRGVmZXJyZWQoKTtcbiAgICAgIGZldGNoLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIHNlY3Rpb25zZWxlY3Q7XG4gICAgICAgICAgX3RoaXMucG9zc2libGVTZWN0aW9ucyA9IGRhdGEuc2VjdGlvbnM7XG4gICAgICAgICAgc2VjdGlvbnNlbGVjdCA9IF90aGlzLiQoJy5zZWN0aW9uc2VsZWN0Jyk7XG4gICAgICAgICAgc2VjdGlvbnNlbGVjdC5lbXB0eSgpLnJlbW92ZUNsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmJ1aWxkUmVwb3J0U2VjdGlvbkxpc3QoX3RoaXMucG9zc2libGVTZWN0aW9ucywgc2VjdGlvbnNlbGVjdCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmV0Y2gucmVzb2x2ZSh7XG4gICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWQ6ICdpbnRybycsXG4gICAgICAgICAgICAgIG5hbWU6ICdJbnRyb2R1Y3Rpb24nLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ3RpdGxlLCBjcmVkaXRzLCBhbmQgaW50cm9kdWN0b3J5IHBhcmFncmFwaHMuJyxcbiAgICAgICAgICAgICAgcHJlc2VuY2U6ICdyZXF1aXJlZCcsXG4gICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICBpZDogJ2NsaW1hdGVyZXZpZXcnLFxuICAgICAgICAgICAgICBuYW1lOiAnQ2xpbWF0ZSBSZXZpZXcnLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2EgZGVzY3JpcHRpb24gb2YgdGhlIHJlZ2lvblxcJ3MgY3VycmVudCBhbmQgcHJvamVjdGVkIGNsaW1hdGUuJyxcbiAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgaWQ6ICd0ZW1wZXJhdHVyZScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnVGVtcGVyYXR1cmUnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgdGVtcGVyYXR1cmUuJyxcbiAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdyYWluZmFsbCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnUmFpbmZhbGwnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgcHJlY2lwaXRhdGlvbi4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgaWQ6ICdiaW9kaXZlcnNpdHknLFxuICAgICAgICAgICAgICBuYW1lOiAnQmlvZGl2ZXJzaXR5IFJldmlldycsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnYSBkZXNjcmlwdGlvbiBvZiB0aGUgcmVnaW9uXFwncyBjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5LicsXG4gICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnb3ZlcmFsbCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnT3ZlcmFsbCcsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkgb3ZlciBhbGwgbW9kZWxsZWQgc3BlY2llcy4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ21hbW1hbHMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ01hbW1hbHMnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5IG92ZXIgbWFtbWFsIHNwZWNpZXMuJyxcbiAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdhbXBoaWJpYW5zJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdBbXBoaWJpYW5zJyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eSBvdmVyIGFtcGhpYmlhbiBzcGVjaWVzLicsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZDogJ2FsbGFtcGhpYmlhbnMnLFxuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBbGwnLFxuICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eSBvdmVyIGFsbCBhbXBoaWJpYW4gc3BlY2llcy4nLFxuICAgICAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgaWQ6ICdzdHJlYW1mcm9ncycsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1N0cmVhbSBmcm9ncycsXG4gICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5IG92ZXIgc3RyZWFtIGZyb2dzLicsXG4gICAgICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ3JlcHRpbGVzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdSZXB0aWxlcycsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2N1cnJlbnQgYW5kIHByb2plY3RlZCBiaW9kaXZlcnNpdHkgb3ZlciByZXB0aWxlIHNwZWNpZXMuJyxcbiAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgIGlkOiAnYWxscmVwdGlsZXMnLFxuICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdBbGwnLFxuICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eSBvdmVyIGFsbCByZXB0aWxlIHNwZWNpZXMuJyxcbiAgICAgICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgIGlkOiAndHVydGxlcycsXG4gICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1R1cnRsZXMnLFxuICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eSBvdmVyIHR1cnRsZXMuJyxcbiAgICAgICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnYmlyZHMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0JpcmRzJyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnY3VycmVudCBhbmQgcHJvamVjdGVkIGJpb2RpdmVyc2l0eSBvdmVyIGJpcmQgc3BlY2llcy4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ2ZyZXNod2F0ZXJmaXNoJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdGcmVzaHdhdGVyIGZpc2gnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjdXJyZW50IGFuZCBwcm9qZWN0ZWQgYmlvZGl2ZXJzaXR5IG92ZXIgZnJlc2h3YXRlciBmaXNoIHNwZWNpZXMuJyxcbiAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgIGlkOiAncGVzdHMnLFxuICAgICAgICAgICAgICBuYW1lOiAnUGVzdCBTcGVjaWVzJyxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdjbGltYXRlIHN1aXRhYmlsaXR5IGFuZCBkaXN0cmlidXRpb24gb2YgcGVzdCBzcGVjaWVzLicsXG4gICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICBzZWN0aW9uczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAncGVzdHBsYW50cycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnUGVzdCBQbGFudHMnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdzdW1tYXJ5IG9mIHByb2plY3Rpb25zIGZvciBzZWxlY3RlZCBwZXN0IHBsYW50cy4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgaWQ6ICdhcHBlbmRpeGVzJyxcbiAgICAgICAgICAgICAgbmFtZTogJ0FwcGVuZGljZXMnLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ3RhYmxlcyBhbmQgb3RoZXIgYXBwZW5kaWNlcy4nLFxuICAgICAgICAgICAgICBwcmVzZW5jZTogJ3JlcXVpcmVkJyxcbiAgICAgICAgICAgICAgc2VjdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBpZDogJ29ic2VydmVkbWFtbWFsbGlzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTWFtbWFscyBQcmVzZW50JyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnbGlzdCBvZiBtYW1tYWxzIGN1cnJlbnRseSBvciBwcm9qZWN0ZWQgdG8gYmUgcHJlc2VudCBpbiByZWdpb24uJyxcbiAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdvYnNlcnZlZGFtcGhpYmlhbnNsaXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdBbXBoaWJpYW5zIFByZXNlbnQnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdsaXN0IG9mIGFtcGhpYmlhbnMgY3VycmVudGx5IG9yIHByb2plY3RlZCB0byBiZSBwcmVzZW50IGluIHJlZ2lvbi4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ29ic2VydmVkc3RyZWFtZnJvZ3NsaXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTdGVhbSBGcm9ncyBQcmVzZW50JyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnbGlzdCBvZiBzdHJlYW0gZnJvZ3MgY3VycmVudGx5IG9yIHByb2plY3RlZCB0byBiZSBwcmVzZW50IGluIHJlZ2lvbi4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ29ic2VydmVkcmVwdGlsZXNsaXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdSZXB0aWxlcyBQcmVzZW50JyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnbGlzdCBvZiByZXB0aWxlcyBjdXJyZW50bHkgb3IgcHJvamVjdGVkIHRvIGJlIHByZXNlbnQgaW4gcmVnaW9uLicsXG4gICAgICAgICAgICAgICAgICBwcmVzZW5jZTogJ29wdGlvbmFsJyxcbiAgICAgICAgICAgICAgICAgIHNlY3Rpb25zOiBbXVxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnb2JzZXJ2ZWR0dXJ0bGVzbGlzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnVHVydGxlcyBQcmVzZW50JyxcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnbGlzdCBvZiB0dXJ0bGVzIGN1cnJlbnRseSBvciBwcm9qZWN0ZWQgdG8gYmUgcHJlc2VudCBpbiByZWdpb24uJyxcbiAgICAgICAgICAgICAgICAgIHByZXNlbmNlOiAnb3B0aW9uYWwnLFxuICAgICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtdXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdvYnNlcnZlZGJpcmRzbGlzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQmlyZHMgUHJlc2VudCcsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2xpc3Qgb2YgYmlyZHMgY3VycmVudGx5IG9yIHByb2plY3RlZCB0byBiZSBwcmVzZW50IGluIHJlZ2lvbi4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdvcHRpb25hbCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ3NjaWVuY2UnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NjaWVuY2UnLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdkZXNjcmlwdGlvbiBvZiB0aGUgY2xpbWF0ZSBhbmQgc3BlY2llcyBkaXN0cmlidXRpb24gbW9kZWxsaW5nIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGRhdGEgaW4gdGhlIHJlcG9ydC4nLFxuICAgICAgICAgICAgICAgICAgcHJlc2VuY2U6ICdyZXF1aXJlZCcsXG4gICAgICAgICAgICAgICAgICBzZWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0pO1xuICAgICAgfSwgNTAwICsgKDUwMCAqIE1hdGgucmFuZG9tKCkpKTtcbiAgICAgIHJldHVybiBmZXRjaC5wcm9taXNlKCk7XG4gICAgfSxcbiAgICBidWlsZFJlcG9ydFNlY3Rpb25MaXN0OiBmdW5jdGlvbihkYXRhLCB3cmFwcGVyKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0Jyk7XG4gICAgICByZXR1cm4gJC5lYWNoKGRhdGEsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICB2YXIgc2VsZWN0b3JSb3csIHN1YnNlY3Rpb25zO1xuICAgICAgICAgIHNlbGVjdG9yUm93ID0gJChBcHBWaWV3LnRlbXBsYXRlcy5zZWN0aW9uU2VsZWN0b3IoaXRlbSkpO1xuICAgICAgICAgICQod3JhcHBlcikuYXBwZW5kKHNlbGVjdG9yUm93KTtcbiAgICAgICAgICBpZiAoaXRlbS5zZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzdWJzZWN0aW9ucyA9ICQoQXBwVmlldy50ZW1wbGF0ZXMuc3Vic2VjdGlvbnMoKSk7XG4gICAgICAgICAgICBfdGhpcy5idWlsZFJlcG9ydFNlY3Rpb25MaXN0KGl0ZW0uc2VjdGlvbnMsIHN1YnNlY3Rpb25zKTtcbiAgICAgICAgICAgIHJldHVybiAkKHNlbGVjdG9yUm93KS5hZGRDbGFzcygnaGFzc3Vic2VjdGlvbnMnKS5hcHBlbmQoc3Vic2VjdGlvbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIHVwZGF0ZVNlY3Rpb25TZWxlY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVTZWN0aW9uU2VsZWN0aW9uJyk7XG4gICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uKHRoaXMucG9zc2libGVTZWN0aW9ucyk7XG4gICAgfSxcbiAgICBoYW5kbGVTZWN0aW9uU2VsZWN0aW9uOiBmdW5jdGlvbihzZWN0aW9uTGlzdCwgcGFyZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5oYW5kbGVTZWN0aW9uU2VsZWN0aW9uJyk7XG4gICAgICAkLmVhY2goc2VjdGlvbkxpc3QsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICB2YXIgc2VsZWN0aW9uQ29udHJvbCwgc2VsZWN0b3IsIF9yZWY7XG4gICAgICAgICAgc2VsZWN0b3IgPSBfdGhpcy4kKFwiI3NlY3Rpb24tXCIgKyBpdGVtLmlkKTtcbiAgICAgICAgICBzZWxlY3Rpb25Db250cm9sID0gc2VsZWN0b3IuZmluZCgnaW5wdXQnKTtcbiAgICAgICAgICBpZiAoc2VsZWN0aW9uQ29udHJvbC5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd1bnNlbGVjdGVkJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLmFkZENsYXNzKCd1bnNlbGVjdGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgoKF9yZWYgPSBpdGVtLnNlY3Rpb25zKSAhPSBudWxsID8gX3JlZi5sZW5ndGggOiB2b2lkIDApID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLmhhbmRsZVNlY3Rpb25TZWxlY3Rpb24oaXRlbS5zZWN0aW9ucywgaXRlbS5pZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgZmV0Y2hSZWdpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmZXRjaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoUmVnaW9ucycpO1xuICAgICAgZmV0Y2ggPSAkLkRlZmVycmVkKCk7XG4gICAgICBmZXRjaC5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5idWlsZFJlZ2lvbkxpc3QoZGF0YSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZmV0Y2gucmVzb2x2ZSh7XG4gICAgICAgICAgcmVnaW9udHlwZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgaWQ6ICducm0nLFxuICAgICAgICAgICAgICBuYW1lOiAnTlJNIHJlZ2lvbicsXG4gICAgICAgICAgICAgIHJlZ2lvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9BQ1QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0FDVCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9BZGVsYWlkZV9hbmRfTW91bnRfTG9mdHlfUmFuZ2VzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdBZGVsYWlkZSBhbmQgTW91bnQgTG9mdHkgUmFuZ2VzJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0FsaW55dGphcmFfV2lsdXJhcmEnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0FsaW55dGphcmEgV2lsdXJhcmEnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQXZvbicsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQXZvbidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Cb3JkZXJfUml2ZXJzLUd3eWRpcicsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQm9yZGVyIFJpdmVycy1Hd3lkaXInXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fQm9yZGVyX1JpdmVyc19NYXJhbm9hLUJhbG9ubmUnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0JvcmRlciBSaXZlcnMgTWFyYW5vYS1CYWxvbm5lJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0J1cmRla2luJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdCdXJkZWtpbidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9CdXJuZXR0X01hcnknLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0J1cm5ldHQgTWFyeSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9DYXBlX1lvcmsnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0NhcGUgWW9yaydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9DZW50cmFsX1dlc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0NlbnRyYWwgV2VzdCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Db25kYW1pbmUnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0NvbmRhbWluZSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Db29wZXJhdGl2ZV9NYW5hZ2VtZW50X0FyZWEnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0Nvb3BlcmF0aXZlIE1hbmFnZW1lbnQgQXJlYSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Db3JhbmdhbWl0ZScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnQ29yYW5nYW1pdGUnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fRGVzZXJ0X0NoYW5uZWxzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdEZXNlcnQgQ2hhbm5lbHMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fRWFzdF9HaXBwc2xhbmQnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0Vhc3QgR2lwcHNsYW5kJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0V5cmVfUGVuaW5zdWxhJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdFeXJlIFBlbmluc3VsYSdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9GaXR6cm95JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdGaXR6cm95J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0dsZW5lbGdfSG9wa2lucycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnR2xlbmVsZyBIb3BraW5zJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0dvdWxidXJuX0Jyb2tlbicsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnR291bGJ1cm4gQnJva2VuJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0hhd2tlc2J1cnktTmVwZWFuJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdIYXdrZXNidXJ5LU5lcGVhbidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9IdW50ZXItQ2VudHJhbF9SaXZlcnMnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0h1bnRlci1DZW50cmFsX1JpdmVycydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9LYW5nYXJvb19Jc2xhbmQnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0thbmdhcm9vIElzbGFuZCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9MYWNobGFuJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdMYWNobGFuJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX0xvd2VyX011cnJheV9EYXJsaW5nJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdMb3dlciBNdXJyYXkgRGFybGluZydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9NYWNrYXlfV2hpdHN1bmRheScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTWFja2F5IFdoaXRzdW5kYXknXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTWFsbGVlJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdNYWxsZWUnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTXVycmF5JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdNdXJyYXknXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTXVycnVtYmlkZ2VlJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdNdXJydW1iaWRnZWUnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTmFtb2knLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05hbW9pJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05vcnRoJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Ob3J0aF9DZW50cmFsJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aCBDZW50cmFsJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05vcnRoX0Vhc3QnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoIEVhc3QnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fTm9ydGhfV2VzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTm9ydGggV2VzdCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Ob3J0aGVybl9BZ3JpY3VsdHVyYWwnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ05vcnRoZXJuIEFncmljdWx0dXJhbCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Ob3J0aGVybl9HdWxmJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aGVybiBHdWxmJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05vcnRoZXJuX1JpdmVycycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTm9ydGhlcm4gUml2ZXJzJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05vcnRoZXJuX1RlcnJpdG9yeScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTm9ydGhlcm4gVGVycml0b3J5J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX05vcnRoZXJuX2FuZF9Zb3JrZScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTm9ydGhlcm4gYW5kIFlvcmtlJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1BlcnRoJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdQZXJ0aCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Qb3J0X1BoaWxsaXBfYW5kX1dlc3Rlcm5fUG9ydCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnUG9ydCBQaGlsbGlwIGFuZCBXZXN0ZXJuIFBvcnQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fUmFuZ2VsYW5kcycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnUmFuZ2VsYW5kcydcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGgnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU291dGhfQXVzdHJhbGlhbl9BcmlkX0xhbmRzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBBdXN0cmFsaWFuIEFyaWQgTGFuZHMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU291dGhfQXVzdHJhbGlhbl9NdXJyYXlfRGFybGluZ19CYXNpbicsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGggQXVzdHJhbGlhbiBNdXJyYXkgRGFybGluZyBCYXNpbidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aF9Db2FzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGggQ29hc3QnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU291dGhfRWFzdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGggRWFzdCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aF9FYXN0X1F1ZWVuc2xhbmQnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoIEVhc3QgUXVlZW5zbGFuZCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9Tb3V0aF9XZXN0JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBXZXN0J1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoX1dlc3RfUXVlZW5zbGFuZCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnU291dGggV2VzdCBRdWVlbnNsYW5kJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnTlJNX1NvdXRoZXJuX0d1bGYnLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ1NvdXRoZXJuIEd1bGYnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU291dGhlcm5fUml2ZXJzJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aGVybiBSaXZlcnMnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fU3lkbmV5X01ldHJvJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTeWRuZXkgTWV0cm8nXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fVG9ycmVzX1N0cmFpdCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnVG9ycmVzIFN0cmFpdCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9XZXN0X0dpcHBzbGFuZCcsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnV2VzdCBHaXBwc2xhbmQnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fV2VzdGVybicsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnV2VzdGVybidcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ05STV9XZXRfVHJvcGljcycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnV2V0IFRyb3BpY3MnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdOUk1fV2ltbWVyYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnV2ltbWVyYSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgaWQ6ICdpYnJhJyxcbiAgICAgICAgICAgICAgbmFtZTogJ0lCUkEgYmlvcmVnaW9uJyxcbiAgICAgICAgICAgICAgcmVnaW9uczogW11cbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgaWQ6ICdwYXJrJyxcbiAgICAgICAgICAgICAgbmFtZTogJ1BhcmtzLCByZXNlcnZlcycsXG4gICAgICAgICAgICAgIHJlZ2lvbnM6IFtdXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgIGlkOiAnc3RhdGUnLFxuICAgICAgICAgICAgICBuYW1lOiAnU3RhdGUsIHRlcnJpdG9yeScsXG4gICAgICAgICAgICAgIHJlZ2lvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBpZDogJ1N0YXRlX0F1c3RyYWxpYW5fQ2FwaXRhbF9UZXJyaXRvcnknLFxuICAgICAgICAgICAgICAgICAgbmFtZTogJ0FDVCdcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICBpZDogJ1N0YXRlX05ld19Tb3V0aF9XYWxlcycsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnTmV3IFNvdXRoIFdhbGVzJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnU3RhdGVfTm9ydGhlcm5fVGVycml0b3J5JyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdOb3J0aGVybiBUZXJyaXRvcnknXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdTdGF0ZV9RdWVlbnNsYW5kJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdRdWVlbnNsYW5kJ1xuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgIGlkOiAnU3RhdGVfU291dGhfQXVzdHJhbGlhJyxcbiAgICAgICAgICAgICAgICAgIG5hbWU6ICdTb3V0aCBBdXN0cmFsaWEnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdTdGF0ZV9UYXNtYW5pYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnVGFzbWFuaWEnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdTdGF0ZV9WaWN0b3JpYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnVmljdG9yaWEnXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgaWQ6ICdTdGF0ZV9XZXN0ZXJuX0F1c3RyYWxpYScsXG4gICAgICAgICAgICAgICAgICBuYW1lOiAnV2VzdGVybiBBdXN0cmFsaWEnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgXVxuICAgICAgICB9KTtcbiAgICAgIH0sIDUwMCArICg1MDAgKiBNYXRoLnJhbmRvbSgpKSk7XG4gICAgICByZXR1cm4gZmV0Y2gucHJvbWlzZSgpO1xuICAgIH0sXG4gICAgYnVpbGRSZWdpb25MaXN0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgcmVnaW9uc2VsZWN0O1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRSZWdpb25MaXN0Jyk7XG4gICAgICB0aGlzLnJlZ2lvbnMgPSBkYXRhLnJlZ2lvbnR5cGVzO1xuICAgICAgcmVnaW9uc2VsZWN0ID0gdGhpcy4kKCcucmVnaW9uc2VsZWN0Jyk7XG4gICAgICByZWdpb25zZWxlY3QuZW1wdHkoKS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgcmV0dXJuICQuZWFjaCh0aGlzLnJlZ2lvbnMsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIHJlZ2lvblR5cGUpIHtcbiAgICAgICAgICB2YXIgcmVnLCByZWdpb25UeXBlUm93O1xuICAgICAgICAgIHJlZ2lvblR5cGUub3B0aW9uTGlzdCA9IFtcbiAgICAgICAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgICAgICAgICAgX3JlZiA9IHJlZ2lvblR5cGUucmVnaW9ucztcbiAgICAgICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgcmVnID0gX3JlZltfaV07XG4gICAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChBcHBWaWV3LnRlbXBsYXRlcy5yZWdpb25TZWxlY3RvcihyZWcpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgICAgICB9KSgpXG4gICAgICAgICAgXS5qb2luKFwiXFxuXCIpO1xuICAgICAgICAgIHJlZ2lvblR5cGVSb3cgPSAkKEFwcFZpZXcudGVtcGxhdGVzLnJlZ2lvblR5cGVTZWxlY3RvcihyZWdpb25UeXBlKSk7XG4gICAgICAgICAgcmV0dXJuIHJlZ2lvbnNlbGVjdC5hcHBlbmQocmVnaW9uVHlwZVJvdyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICB1cGRhdGVSZWdpb25TZWxlY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgc2VsZWN0ZWRUeXBlO1xuICAgICAgZGVidWcoJ0FwcFZpZXcudXBkYXRlUmVnaW9uU2VsZWN0aW9uJyk7XG4gICAgICBzZWxlY3RlZFR5cGUgPSB0aGlzLiQoJ1tuYW1lPXJlZ2lvbnR5cGVdOmNoZWNrZWQnKS52YWwoKTtcbiAgICAgICQuZWFjaCh0aGlzLnJlZ2lvbnMsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIHJlZ2lvblR5cGUpIHtcbiAgICAgICAgICB2YXIgc2VsZWN0b3I7XG4gICAgICAgICAgc2VsZWN0b3IgPSBfdGhpcy4kKFwiI3JlZ2lvbnR5cGUtXCIgKyByZWdpb25UeXBlLmlkKTtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWRUeXBlID09PSByZWdpb25UeXBlLmlkKSB7XG4gICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygndHlwZXNlbGVjdGVkJyk7XG4gICAgICAgICAgICBfdGhpcy5zZWxlY3RlZFJlZ2lvblR5cGUgPSByZWdpb25UeXBlLmlkO1xuICAgICAgICAgICAgX3RoaXMuc2VsZWN0ZWRSZWdpb24gPSAkKHNlbGVjdG9yLmZpbmQoJ3NlbGVjdCcpKS52YWwoKTtcbiAgICAgICAgICAgIGlmIChfdGhpcy5zZWxlY3RlZFJlZ2lvbiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IucmVtb3ZlQ2xhc3MoJ3JlZ2lvbnNlbGVjdGVkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWxlY3Rvci5hZGRDbGFzcygncmVnaW9uc2VsZWN0ZWQnKTtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnNlbGVjdGVkUmVnaW9uSW5mbyA9IF8uZmluZChyZWdpb25UeXBlLnJlZ2lvbnMsIGZ1bmN0aW9uKHJlZ2lvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWdpb24uaWQgPT09IF90aGlzLnNlbGVjdGVkUmVnaW9uO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlbW92ZUNsYXNzKCd0eXBlc2VsZWN0ZWQnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICByZXR1cm4gdGhpcy51cGRhdGVTdW1tYXJ5KCk7XG4gICAgfSxcbiAgICBmZXRjaFllYXJzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmZXRjaDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoWWVhcnMnKTtcbiAgICAgIGZldGNoID0gJC5EZWZlcnJlZCgpO1xuICAgICAgZmV0Y2guZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYnVpbGRZZWFyTGlzdChkYXRhKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBmZXRjaC5yZXNvbHZlKHtcbiAgICAgICAgICB5ZWFyczogWycyMDE1JywgJzIwMjUnLCAnMjAzNScsICcyMDQ1JywgJzIwNTUnLCAnMjA2NScsICcyMDc1JywgJzIwODUnXVxuICAgICAgICB9KTtcbiAgICAgIH0sIDUwMCArICg1MDAgKiBNYXRoLnJhbmRvbSgpKSk7XG4gICAgICByZXR1cm4gZmV0Y2gucHJvbWlzZSgpO1xuICAgIH0sXG4gICAgYnVpbGRZZWFyTGlzdDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHllYXJzZWxlY3Q7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFllYXJMaXN0Jyk7XG4gICAgICB0aGlzLnllYXJzID0gZGF0YS55ZWFycztcbiAgICAgIHllYXJzZWxlY3QgPSB0aGlzLiQoJy55ZWFyc2VsZWN0Jyk7XG4gICAgICB5ZWFyc2VsZWN0LmVtcHR5KCkucmVtb3ZlQ2xhc3MoJ2xvYWRpbmcnKTtcbiAgICAgIHJldHVybiAkLmVhY2godGhpcy55ZWFycywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgeWVhcikge1xuICAgICAgICAgIHJldHVybiB5ZWFyc2VsZWN0LmFwcGVuZChBcHBWaWV3LnRlbXBsYXRlcy55ZWFyU2VsZWN0b3Ioe1xuICAgICAgICAgICAgeWVhcjogeWVhclxuICAgICAgICAgIH0pKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIHVwZGF0ZVllYXJTZWxlY3Rpb246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy51cGRhdGVZZWFyU2VsZWN0aW9uJyk7XG4gICAgICB0aGlzLnNlbGVjdGVkWWVhciA9IHRoaXMuJCgnW25hbWU9eWVhcnNlbGVjdG9yXTpjaGVja2VkJykudmFsKCk7XG4gICAgICAkLmVhY2godGhpcy55ZWFycywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgeWVhcikge1xuICAgICAgICAgIHZhciBzZWxlY3RvcjtcbiAgICAgICAgICBzZWxlY3RvciA9IF90aGlzLiQoXCIjeWVhci1cIiArIHllYXIpO1xuICAgICAgICAgIGlmIChfdGhpcy5zZWxlY3RlZFllYXIgPT09IHllYXIpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5hZGRDbGFzcygneWVhcnNlbGVjdGVkJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5yZW1vdmVDbGFzcygneWVhcnNlbGVjdGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlU3VtbWFyeSgpO1xuICAgIH0sXG4gICAgc2VjdGlvbklkOiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zZWN0aW9uSWQnKTtcbiAgICAgIHJldHVybiAkKHNlY3Rpb25Eb20pLmZpbmQoJ2lucHV0JykuYXR0cigndmFsdWUnKTtcbiAgICB9LFxuICAgIHNlY3Rpb25OYW1lOiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zZWN0aW9uTmFtZScpO1xuICAgICAgcmV0dXJuIHRoaXMuc2VjdGlvbkluZm8oc2VjdGlvbkRvbSkubmFtZTtcbiAgICB9LFxuICAgIHNlY3Rpb25JbmZvOiBmdW5jdGlvbihzZWN0aW9uRG9tKSB7XG4gICAgICB2YXIgaW5mbywgcGFyZW50SWRzLCBwYXJlbnRhZ2U7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zZWN0aW9uSW5mbycpO1xuICAgICAgcGFyZW50YWdlID0gJChzZWN0aW9uRG9tKS5wYXJlbnRzKCcuc2VjdGlvbnNlbGVjdG9yJyk7XG4gICAgICBwYXJlbnRJZHMgPSBwYXJlbnRhZ2UubWFwKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaSwgZWxlbSkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5zZWN0aW9uSWQoZWxlbSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSkuZ2V0KCkucmV2ZXJzZSgpO1xuICAgICAgcGFyZW50SWRzLnB1c2godGhpcy5zZWN0aW9uSWQoc2VjdGlvbkRvbSkpO1xuICAgICAgaW5mbyA9IHtcbiAgICAgICAgc2VjdGlvbnM6IHRoaXMucG9zc2libGVTZWN0aW9uc1xuICAgICAgfTtcbiAgICAgIHBhcmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHJldHVybiBpbmZvID0gXy5maWx0ZXIoaW5mby5zZWN0aW9ucywgZnVuY3Rpb24oc2VjdGlvbikge1xuICAgICAgICAgIHJldHVybiBzZWN0aW9uLmlkID09PSBpZDtcbiAgICAgICAgfSlbMF07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH0sXG4gICAgc3ViU2VjdGlvbkxpc3Q6IGZ1bmN0aW9uKHNlY3Rpb25Eb20pIHtcbiAgICAgIHZhciBsaXN0LCBzdWJzZWN0aW9ucztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNlY3Rpb25MaXN0Jyk7XG4gICAgICBsaXN0ID0gW107XG4gICAgICBzdWJzZWN0aW9ucyA9ICQoc2VjdGlvbkRvbSkuY2hpbGRyZW4oJy5zdWJzZWN0aW9ucycpO1xuICAgICAgc3Vic2VjdGlvbnMuY2hpbGRyZW4oJy5zZWN0aW9uc2VsZWN0b3InKS5ub3QoJy51bnNlbGVjdGVkJykuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGksIGVsZW0pIHtcbiAgICAgICAgICB2YXIgbmFtZSwgc3VicztcbiAgICAgICAgICBuYW1lID0gX3RoaXMuc2VjdGlvbk5hbWUoZWxlbSk7XG4gICAgICAgICAgc3VicyA9IF90aGlzLnN1YlNlY3Rpb25MaXN0KGVsZW0pO1xuICAgICAgICAgIGlmIChzdWJzICE9PSAnJykge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUgKyAnICgnICsgc3VicyArICcpJztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGxpc3QucHVzaChuYW1lKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHJldHVybiBsaXN0LmpvaW4oJywgJyk7XG4gICAgfSxcbiAgICB1cGRhdGVTdW1tYXJ5OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjb250ZW50LCBjb250ZW50TGlzdCwgc2VsZWN0ZWRTZWN0aW9ucywgc3VtbWFyeSwgX3JlZjtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnVwZGF0ZVN1bW1hcnknKTtcbiAgICAgIHNlbGVjdGVkU2VjdGlvbnMgPSB0aGlzLiQoJy5zZWN0aW9uc2VsZWN0ID4gLnNlY3Rpb25zZWxlY3RvcicpLm5vdCgnLnVuc2VsZWN0ZWQnKTtcbiAgICAgIGNvbnRlbnRMaXN0ID0gW107XG4gICAgICBzZWxlY3RlZFNlY3Rpb25zLmVhY2goKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgc2VjdGlvbikge1xuICAgICAgICAgIHZhciBpbmZvLCBzdWJMaXN0O1xuICAgICAgICAgIGluZm8gPSBfdGhpcy5zZWN0aW9uTmFtZShzZWN0aW9uKTtcbiAgICAgICAgICBzdWJMaXN0ID0gX3RoaXMuc3ViU2VjdGlvbkxpc3Qoc2VjdGlvbik7XG4gICAgICAgICAgaWYgKHN1Ykxpc3QgIT09ICcnKSB7XG4gICAgICAgICAgICBpbmZvID0gaW5mbyArICc6ICcgKyBzdWJMaXN0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjb250ZW50TGlzdC5wdXNoKGluZm8gKyAnLicpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgY29udGVudCA9ICcnO1xuICAgICAgaWYgKGNvbnRlbnRMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29udGVudCA9ICc8bGk+JyArIGNvbnRlbnRMaXN0LmpvaW4oJzwvbGk+PGxpPicpICsgJzwvbGk+JztcbiAgICAgIH1cbiAgICAgIHN1bW1hcnkgPSB7XG4gICAgICAgIHJlZ2lvbk5hbWU6IChfcmVmID0gdGhpcy5zZWxlY3RlZFJlZ2lvbkluZm8pICE9IG51bGwgPyBfcmVmLm5hbWUgOiB2b2lkIDAsXG4gICAgICAgIHllYXI6IHRoaXMuc2VsZWN0ZWRZZWFyLFxuICAgICAgICBjb250ZW50OiBjb250ZW50XG4gICAgICB9O1xuICAgICAgcmV0dXJuIHRoaXMuJCgnLnJldmlld2Jsb2NrJykuaHRtbChBcHBWaWV3LnRlbXBsYXRlcy5yZXZpZXdCbG9jayhzdW1tYXJ5KSk7XG4gICAgfVxuICB9LCB7XG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICBsYXlvdXQ6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJyZXZpZXdibG9ja1xcXCI+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwiZm9ybWJsb2NrXFxcIj5cXG4gICAgPGgxPlJlcG9ydCBvbjwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHJlZ2lvbnNlbGVjdFxcXCI+bG9hZGluZyBhdmFpbGFibGUgcmVnaW9ucy4uPC9kaXY+XFxuXFxuICAgIDxoMT5JbiB0aGUgeWVhcjwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHllYXJzZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHllYXJzLi48L2Rpdj5cXG5cXG4gICAgPGgxPkluY2x1ZGluZzwvaDE+XFxuICAgIDxkaXYgY2xhc3M9XFxcImxvYWRpbmcgc2VsZWN0IHNlY3Rpb25zZWxlY3RcXFwiPmxvYWRpbmcgYXZhaWxhYmxlIHNlY3Rpb25zLi48L2Rpdj5cXG48L2Rpdj5cIiksXG4gICAgICByZXZpZXdCbG9jazogXy50ZW1wbGF0ZShcIjxoMT5TZWxlY3RlZCBSZXBvcnQ8L2gxPlxcbjxwIGNsYXNzPVxcXCJjb3ZlcmFnZVxcXCI+Q292ZXJzXFxuICAgIDwlIGlmIChyZWdpb25OYW1lKSB7ICU+PCU9IHJlZ2lvbk5hbWUgJT48JSB9IGVsc2UgeyAlPjxlbT4odW5zcGVjaWZpZWQgcmVnaW9uKTwvZW0+PCUgfSAlPlxcbiAgICBpblxcbiAgICA8JSBpZiAoeWVhcikgeyAlPjwlPSB5ZWFyICU+LjwlIH0gZWxzZSB7ICU+PGVtPih1bnNwZWNpZmllZCB5ZWFyKTwvZW0+LjwlIH0gJT5cXG48L3A+XFxuPHVsIGNsYXNzPVxcXCJjb250ZW50c1xcXCI+PCU9IGNvbnRlbnQgJT48L3VsPlxcbjxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiZ2V0cmVwb3J0XFxcIj5kb3dubG9hZCByZXBvcnQ8L2J1dHRvbj5cIiksXG4gICAgICByZXZpZXdDb250ZW50SXRlbTogXy50ZW1wbGF0ZShcIjxsaT5pdGVtPC9saT5cIiksXG4gICAgICByZWdpb25UeXBlU2VsZWN0b3I6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJyZWdpb250eXBlc2VsZWN0b3JcXFwiIGlkPVxcXCJyZWdpb250eXBlLTwlPSBpZCAlPlxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwibmFtZVxcXCI+PGlucHV0XFxuICAgICAgICBjbGFzcz1cXFwicmVnaW9udHlwZVxcXCJcXG4gICAgICAgIG5hbWU9XFxcInJlZ2lvbnR5cGVcXFwiXFxuICAgICAgICB0eXBlPVxcXCJyYWRpb1xcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0gaWQgJT5cXFwiXFxuICAgIC8+IDwlPSBuYW1lICU+XFxuICAgIDwvbGFiZWw+XFxuICAgIDxkaXYgY2xhc3M9XFxcInJlZ2lvbnNlbGVjdG9yd3JhcHBlclxcXCI+PHNlbGVjdCBjbGFzcz1cXFwicmVnaW9uc2VsZWN0b3JcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiXFxcIiBkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiIHNlbGVjdGVkPVxcXCJzZWxlY3RlZFxcXCI+c2VsZWN0IGEgcmVnaW9uJmhlbGxpcDs8L29wdGlvbj5cXG4gICAgICAgIDwlPSBvcHRpb25MaXN0ICU+XFxuICAgIDwvc2VsZWN0PjwvZGl2PlxcbjwvZGl2PlwiKSxcbiAgICAgIHJlZ2lvblNlbGVjdG9yOiBfLnRlbXBsYXRlKFwiPG9wdGlvbiB2YWx1ZT1cXFwiPCU9IGlkICU+XFxcIj48JT0gbmFtZSAlPjwvb3B0aW9uPlwiKSxcbiAgICAgIHllYXJTZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInllYXJyb3dcXFwiIGlkPVxcXCJ5ZWFyLTwlPSB5ZWFyICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIj48aW5wdXRcXG4gICAgICAgIGNsYXNzPVxcXCJ5ZWFyc2VsZWN0b3JcXFwiXFxuICAgICAgICBuYW1lPVxcXCJ5ZWFyc2VsZWN0b3JcXFwiXFxuICAgICAgICB0eXBlPVxcXCJyYWRpb1xcXCJcXG4gICAgICAgIHZhbHVlPVxcXCI8JT0geWVhciAlPlxcXCJcXG4gICAgLz4gPCU9IHllYXIgJT48L2xhYmVsPlxcbjwvZGl2PlwiKSxcbiAgICAgIHNlY3Rpb25TZWxlY3RvcjogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNlY3Rpb25zZWxlY3RvclxcXCIgaWQ9XFxcInNlY3Rpb24tPCU9IGlkICU+XFxcIj5cXG4gICAgPGxhYmVsIGNsYXNzPVxcXCJuYW1lXFxcIlxcbiAgICAgICAgPCUgaWYgKHByZXNlbmNlID09ICdyZXF1aXJlZCcpIHsgcHJpbnQoJ3RpdGxlPVxcXCJUaGlzIHNlY3Rpb24gaXMgcmVxdWlyZWRcXFwiJyk7IH0gJT5cXG4gICAgPjxpbnB1dFxcbiAgICAgICAgdHlwZT1cXFwiY2hlY2tib3hcXFwiXFxuICAgICAgICB2YWx1ZT1cXFwiPCU9IGlkICU+XFxcIlxcbiAgICAgICAgY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCJcXG4gICAgICAgIDwlIGlmIChwcmVzZW5jZSA9PSAncmVxdWlyZWQnKSB7IHByaW50KCdkaXNhYmxlZD1cXFwiZGlzYWJsZWRcXFwiJyk7IH0gJT5cXG4gICAgLz4gPCU9IG5hbWUgJT48L2xhYmVsPlxcbiAgICA8cCBjbGFzcz1cXFwiZGVzY3JpcHRpb25cXFwiPjwlPSBkZXNjcmlwdGlvbiAlPjwvcD5cXG5cXG48L2Rpdj5cIiksXG4gICAgICBzdWJzZWN0aW9uczogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInN1YnNlY3Rpb25zIGNsZWFyZml4XFxcIj5cXG48L2Rpdj5cIilcbiAgICB9XG4gIH0pO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gQXBwVmlldztcblxufSkuY2FsbCh0aGlzKTtcbiJdfQ==
