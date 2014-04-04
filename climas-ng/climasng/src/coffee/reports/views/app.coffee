
# $ = require 'jquery'
# _ = require 'lodash'
# Backbone = require 'backbone'
# L = require 'leaflet'

# MapLayer = require '../models/maplayer'
require '../util/shims'

# disable the jshint warning about "did you mean to return a
# conditional" which crops up all the time in coffeescript compiled
# code.
### jshint -W093 ###

# -------------------------------------------------------------------
debug = (itemToLog, itemLevel)->
    levels = ['verydebug', 'debug', 'message', 'warning']

    threshold = 'verydebug'
    # threshold = 'debug'
    # threshold = 'message'
    itemLevel = 'debug' unless itemLevel

    thresholdNum = levels.indexOf threshold
    messageNum = levels.indexOf itemLevel
    return if thresholdNum > messageNum

    if itemToLog + '' == itemToLog
        # it's a string..
        console.log "[#{itemLevel}] #{itemToLog}"
    else
        console.log itemToLog
# -------------------------------------------------------------------
# -------------------------------------------------------------------

AppView = Backbone.View.extend {
    # ---------------------------------------------------------------
    # this view's base element
    tagName: 'form'
    className: ''
    id: 'reportform'
    # ---------------------------------------------------------------
    # some settings
    speciesDataUrl: "#{location.protocol}//#{location.host}/speciesdata"
    rasterApiUrl: "#{location.protocol}//localhost:10600/api/raster/1/wms_data_url"
    # ---------------------------------------------------------------
    # tracking the splitter bar
    trackSplitter: false
    trackPeriod: 100
    # ---------------------------------------------------------------
    events:
        'change .sectionselector input': 'updateSectionSelection'
    # ---------------------------------------------------------------
    initialize: ()->
        debug 'AppView.initialize'

        # more annoying version of bindAll requires this concat stuff
        _.bindAll.apply _, [this].concat _.functions(this)

        # kick off the fetching of the report sections
        @availableSections = @fetchReportSections()

        # @tick()
    # ---------------------------------------------------------------
    ping: ()->
        console.log 'ping!'
    # ---------------------------------------------------------------
    render: ()->
        debug 'AppView.render'

        @$el.append AppView.templates.layout {
        }
        $('#contentwrap .maincontent').append @$el
    # ---------------------------------------------------------------
    buildReportSectionList: (data, wrapper)->
        debug 'AppView.buildReportSectionList'

        $.each data, (index, item)=>

            # make a row for this item
            selectorRow = $ AppView.templates.sectionSelector(item)
            $(wrapper).append selectorRow

            # if the item has subitems, insert those
            if item.sections.length > 0
                subsections = $ AppView.templates.subsections()
                @buildReportSectionList item.sections, subsections
                $(selectorRow).addClass('hassubsections').append(subsections)
    # ---------------------------------------------------------------
    updateSectionSelection: (event)->
        debug 'AppView.updateSectionSelection'

        @handleSectionSelection @possibleSections
    # ---------------------------------------------------------------
    handleSectionSelection: (sectionList, parent)->
        debug 'AppView.handleSectionSelection'

        $.each sectionList, (index, item)=>
            # find the selection checkbox..
            selector = @$ "#section-#{ item.id }"
            selectionControl = selector.find 'input'

            # set the right class on the selector
            if selectionControl.prop 'checked'
                selector.removeClass 'unselected'
            else
                selector.addClass 'unselected'

            debug "handling #{ parent }.#{ selectionControl.val() }"

            if item.sections?.length > 0
                @handleSectionSelection item.sections, item.id

    # ---------------------------------------------------------------
    fetchReportSections: ()->
        debug 'AppView.fetchReportSections'

        # later this will be an ajax call, for now make a deferred object
        fetch = $.Deferred()

        fetch.done (data)=>
            @possibleSections = data.sections
            @$('.sectionlist').empty()
            @buildReportSectionList @possibleSections, @$('.sectionlist')

        # pretend it took a second to get the data..
        setTimeout ()->
            fetch.resolve({
                sections: [
                    {
                        id: 'intro'
                        name: 'Introduction'
                        description: 'title, credits, and introductory paragraphs.'
                        presence: 'required'
                        sections: []
                    },{
                        id: 'climatereview'
                        name: 'Climate Review'
                        description: 'a description of the region\'s current and projected climate.'
                        presence: 'optional'
                        sections: [
                            {
                                id: 'temperature'
                                name: 'Temperature'
                                description: 'current and projected temperature.'
                                presence: 'optional'
                                sections: []
                            },{
                                id: 'rainfall'
                                name: 'Rainfall'
                                description: 'current and projected precipitation.'
                                presence: 'optional'
                                sections: []
                            }
                        ]
                    },{
                        id: 'biodiversity'
                        name: 'Biodiversity Review'
                        description: 'a description of the region\'s current and projected biodiversity. A description of the region\'s current and projected biodiversity. A description of the region\'s current and projected biodiversity. A description of the region\'s current and projected biodiversity.'
                        presence: 'optional'
                        sections: [
                            {
                                id: 'overall'
                                name: 'Overall'
                                description: 'current and projected biodiversity over all modelled species'
                                presence: 'optional'
                                sections: []
                            },{
                                id: 'mammals'
                                name: 'Mammals'
                                description: 'current and projected biodiversity over mammal species'
                                presence: 'optional'
                                sections: []
                            },{
                                id: 'amphibians'
                                name: 'Amphibians'
                                description: 'current and projected biodiversity over amphibian species'
                                presence: 'optional'
                                sections: []
                            },{
                                id: 'reptiles'
                                name: 'Reptiles'
                                description: 'current and projected biodiversity over reptile species'
                                presence: 'optional'
                                sections: []
                            },{
                                id: 'birds'
                                name: 'Birds'
                                description: 'current and projected biodiversity over bird species'
                                presence: 'optional'
                                sections: []
                            }
                        ]
                    },{
                        id: 'appendixes'
                        name: 'Appendices'
                        description: 'tables and other appendices.'
                        presence: 'required'
                        sections: [
                            {
                                id: 'observedmammallist'
                                name: 'Mammals Present'
                                description: 'list of mammals currently or projected to be present in region.'
                                presence: 'optional'
                                sections: []
                            },{
                                id: 'observedamphibianslist'
                                name: 'Amphibians Present'
                                description: 'list of amphibians currently or projected to be present in region.'
                                presence: 'optional'
                                sections: []
                            },{
                                id: 'observedreptileslist'
                                name: 'Reptiles Present'
                                description: 'list of reptiles currently or projected to be present in region.'
                                presence: 'optional'
                                sections: []
                            },{
                                id: 'observedbirdslist'
                                name: 'Birds Present'
                                description: 'list of birds currently or projected to be present in region.'
                                presence: 'optional'
                                sections: []
                            },{
                                id: 'science'
                                name: 'Science'
                                description: 'description of the climate and species distribution modelling used to generate the data in the report.'
                                presence: 'required'
                                sections: []
                            }
                        ]
                    }
                ]
            })
        , 1000

        # now return a promise in case we need to wait for this
        return fetch.promise()
    # ---------------------------------------------------------------
},{ templates: { # ==================================================
    # templates here
    # ---------------------------------------------------------------
    layout: _.template """
        <div class="sectionlist">
            loading available sections..
        </div>
    """
    # ---------------------------------------------------------------
    sectionSelector: _.template """
        <div class="sectionselector" id="section-<%= id %>">
            <label class="name"
                <% if (presence == 'required') { print('title="This section is required"'); } %>
            ><input
                type="checkbox"
                value="<%= id %>-selected"
                checked="checked"
                <% if (presence == 'required') { print('disabled="disabled"'); } %>
            /> <%= name %></label>
            <p class="description"><%= description %></p>

        </div>
    """
    # ---------------------------------------------------------------
    subsections: _.template """
        <div class="subsections clearfix">
            <p class="subsectionintro">Contains these subsections:</p>
        </div>
    """
    # ---------------------------------------------------------------
}}

module.exports = AppView