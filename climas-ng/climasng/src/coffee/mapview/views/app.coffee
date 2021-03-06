
# $ = require 'jquery'
# _ = require 'lodash'
# Backbone = require 'backbone'
# L = require 'leaflet'
MapLayer = require '../models/maplayer'
require '../util/shims'

# disable the jshint warning about "did you mean to return a
# conditional" which crops up all the time in coffeescript compiled
# code.
### jshint -W093 ###

# -------------------------------------------------------------------
debug = (itemToLog, itemLevel)->
    levels = ['verydebug', 'debug', 'message', 'warning']

    # threshold = 'verydebug'
    # threshold = 'debug'
    threshold = 'message'
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
    tagName: 'div'
    className: 'splitmap showforms'
    id: 'splitmap'
    # ---------------------------------------------------------------
    # some settings
    speciesDataUrl: "#{location.protocol}//#{location.host}/speciesdata"
    rasterApiUrl: "#{location.protocol}//#{location.hostname}:10600/api/raster/1/wms_data_url"
    # ---------------------------------------------------------------
    # tracking the splitter bar
    trackSplitter: false
    trackPeriod: 100
    # ---------------------------------------------------------------
    events:
        'click .btn-change': 'toggleForms'
        'click .btn-compare': 'toggleSplitter'
        'click .btn-copy-ltr': 'copyMapLeftToRight'
        'click .btn-copy-rtl': 'copyMapRightToLeft'
        'leftmapupdate': 'leftSideUpdate'
        'rightmapupdate': 'rightSideUpdate'
        'change select.left': 'leftSideUpdate'
        'change select.right': 'rightSideUpdate'
    # ---------------------------------------------------------------
    tick: ()->
        # if @map
        if false
            debug @map.getPixelOrigin()
        setTimeout(@tick, 2000)
    # ---------------------------------------------------------------
    initialize: ()->
        debug 'AppView.initialize'

        # more annoying version of bindAll requires this concat stuff
        _.bindAll.apply _, [this].concat _.functions(this)

        # kick off the fetching of the species list
        @speciesInfoFetchProcess = @fetchSpeciesInfo()

        # @tick()
    # ---------------------------------------------------------------
    render: ()->
        debug 'AppView.render'

        @$el.append AppView.templates.layout {
            leftTag: AppView.templates.leftTag()
            rightTag: AppView.templates.rightTag()

            leftForm: AppView.templates.leftForm()
            rightForm: AppView.templates.rightForm()
        }
        $('#contentwrap').append @$el

        @map = L.map 'map', {
            center: [-20, 136]
            zoom: 5
        }
        @map.on 'move', @resizeThings
        L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
            subdomains: '1234'
            maxZoom: 18
            attribution: '''
            Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>,
            tiles &copy; <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>
            '''
        }).addTo @map

        @leftForm = @$ '.left.form'
        @buildLeftForm()

        @rightForm = @$ '.right.form'
        @buildRightForm()

        @leftTag = @$ '.left.tag'
        @rightTag = @$ '.right.tag'

        @splitLine = @$ '.splitline'
        @splitThumb = @$ '.splitthumb'

    # ---------------------------------------------------------------
    # ---------------------------------------------------------------
    # map interaction
    # ---------------------------------------------------------------
    copyMapLeftToRight: ()->
        debug 'AppView.copyMapLeftToRight'

        return unless @leftInfo

        @$('#rightmapspp').val @leftInfo.speciesName
        @$('#rightmapyear').val @leftInfo.year
        @$('#rightmapscenario').val @leftInfo.scenario
        @$('#rightmapgcm').val @leftInfo.gcm

        @rightSideUpdate()
    # ---------------------------------------------------------------
    copyMapRightToLeft: ()->
        debug 'AppView.copyMapRightToLeft'

        return unless @rightInfo

        @$('#leftmapspp').val @rightInfo.speciesName
        @$('#leftmapyear').val @rightInfo.year
        @$('#leftmapscenario').val @rightInfo.scenario
        @$('#leftmapgcm').val @rightInfo.gcm

        @leftSideUpdate()
    # ---------------------------------------------------------------
    leftSideUpdate: ()->
        debug 'AppView.leftSideUpdate'

        sppName = @$('#leftmapspp').val()

        # bail if that's not a real species
        if sppName in @speciesSciNameList
            @$('.btn-copy-rtl').prop 'disabled', false
        else
            @$('.btn-copy-rtl').prop 'disabled', true
            return false

        newLeftInfo = {
            speciesName: sppName
            year: @$('#leftmapyear').val()
            scenario: @$('#leftmapscenario').val()
            gcm: @$('#leftmapgcm').val()
        }

        # bail if nothing changed
        return false if @leftInfo and _.isEqual newLeftInfo, @leftInfo

        # also bail if they're both same species at baseline
        if (
            @leftInfo and
            newLeftInfo.speciesName == @leftInfo.speciesName and
            newLeftInfo.year == @leftInfo.year and
            newLeftInfo.year == 'baseline'
        )
            return false

        # save the new setup
        @leftInfo = newLeftInfo

        # apply the changes to the map
        @addMapLayer 'left'

        # apply the changes to the tag
        @addMapTag 'left'
    # ---------------------------------------------------------------
    rightSideUpdate: ()->
        debug 'AppView.rightSideUpdate'

        sppName = @$('#rightmapspp').val()

        # bail if that's not a real species
        if sppName in @speciesSciNameList
            @$('.btn-copy-ltr').prop 'disabled', false
        else
            @$('.btn-copy-ltr').prop 'disabled', true
            return false

        newRightInfo = {
            speciesName: sppName
            year: @$('#rightmapyear').val()
            scenario: @$('#rightmapscenario').val()
            gcm: @$('#rightmapgcm').val()
        }

        # bail if nothing changed
        return false if @rightInfo and _.isEqual newRightInfo, @rightInfo

        # also bail if they're both same species at baseline
        if (
            @rightInfo and
            newRightInfo.speciesName == @rightInfo.speciesName and
            newRightInfo.year == @rightInfo.year and
            newRightInfo.year == 'baseline'
        )
            return false

        # save the new setup
        @rightInfo = newRightInfo

        # apply the changes to the map
        @addMapLayer 'right'

        # apply the changes to the tag
        @addMapTag 'right'
    # ---------------------------------------------------------------
    addMapTag: (side)->
        debug 'AppView.addMapTag'

        info = @leftInfo if side == 'left'
        info = @rightInfo if side == 'right'

        tag = "<b><i>#{info.speciesName}</i></b>"

        if info.year is 'baseline'
            tag = "current #{tag} distribution"
        else if info.gcm is 'all'
            tag = "<b>median</b> projections for #{tag} in <b>#{info.year}</b> if <b>#{info.scenario}</b>"
        else
            tag = "<b>#{info.gcm}</b> projections for #{tag} in <b>#{info.year}</b> if <b>#{info.scenario}</b>"


        if side == 'left'
            @leftTag.find('.leftlayername').html tag

        if side == 'right'
            @rightTag.find('.rightlayername').html tag
    # ---------------------------------------------------------------
    addMapLayer: (side)->
        debug 'AppView.addMapLayer'

        sideInfo = @leftInfo if side == 'left'
        sideInfo = @rightInfo if side == 'right'

        futureModelPoint = [
            sideInfo.scenario
            sideInfo.gcm
            sideInfo.year
        ].join '_'
        futureModelPoint = '1990' if sideInfo.year == 'baseline'
        mapData = [
            @speciesDataUrl
            sideInfo.speciesName.replace(' ', '_')
            'output'
            futureModelPoint + '.asc.gz'
        ].join '/'

        layer = L.tileLayer.wms @rasterApiUrl, {
            DATA_URL: mapData
            # layers: 'Demo WMS'
            layers: 'DEFAULT'
            format: 'image/png'
            transparent: true
            }

        # add a class to our element when there's tiles loading
        loadClass = '' + side + 'loading'
        layer.on 'loading', ()=> @$el.addClass loadClass
        layer.on 'load', ()=> @$el.removeClass loadClass

        layer.addTo @map

        if side == 'left'
            @map.removeLayer @leftLayer if @leftLayer
            @leftLayer = layer

        if side == 'right'
            @map.removeLayer @rightLayer if @rightLayer
            @rightLayer = layer

        @resizeThings() # re-establish the splitter

    # ---------------------------------------------------------------
    # ---------------------------------------------------------------
    # UI actions
    # ---------------------------------------------------------------
    centreMap: (repeatedlyFor)->
        debug 'AppView.centreMap'

        repeatedlyFor = 500 unless repeatedlyFor
        recentre = ()=>
            @map.invalidateSize(false)
            @resizeThings()
        setTimeout(
            recentre, later
        ) for later in [0..repeatedlyFor] by 25

    # ---------------------------------------------------------------
    toggleForms: ()->
        debug 'AppView.toggleForms'

        @$el.toggleClass 'showforms'
        @centreMap()
    # ---------------------------------------------------------------
    toggleSplitter: ()->
        debug 'AppView.toggleSplitter'

        @$el.toggleClass 'split'
        if @$el.hasClass 'split'
            @activateSplitter()
        else
            @deactivateSplitter()
        @centreMap()
    # ---------------------------------------------------------------
    # ---------------------------------------------------------------
    # ajaxy stuff
    # ---------------------------------------------------------------
    fetchSpeciesInfo: ()->
        debug 'AppView.fetchSpeciesInfo'

        return $.ajax({
            url: '/speciesdata/species.json'
        }).done (data)=>
            speciesLookupList = []
            speciesSciNameList = []

            # in order to avoid making a function in the inner loop,
            # here's a function returns a function that writes a
            # common name into the given sciName.  This is partial
            # function application, which is a bit like currying.
            commonNameWriter = (sciName)=>
                sciNamePostfix = " (#{sciName})"
                return (cnIndex, cn)=>
                    speciesLookupList.push {
                        label: cn + sciNamePostfix
                        value: sciName
                    }

            $.each data, (sciName, commonNames)=>
                speciesSciNameList.push sciName
                if commonNames
                    $.each commonNames, commonNameWriter sciName
                else
                    speciesLookupList.push {
                        label: sciName
                        value: sciName
                    }

            @speciesLookupList = speciesLookupList
            @speciesSciNameList = speciesSciNameList
    # ---------------------------------------------------------------
    # ---------------------------------------------------------------
    # form creation
    # ---------------------------------------------------------------
    buildLeftForm: ()->
        debug 'AppView.buildLeftForm'

        @speciesInfoFetchProcess.done =>
            $leftmapspp = @$ '#leftmapspp'
            $leftmapspp.autocomplete {
                source: @speciesLookupList
                appendTo: @$el
                close: => @$el.trigger 'leftmapupdate'
            }
    # ---------------------------------------------------------------
    buildRightForm: ()->
        debug 'AppView.buildRightForm'

        @speciesInfoFetchProcess.done =>
            $rightmapspp = @$ '#rightmapspp'
            $rightmapspp.autocomplete {
                source: @speciesLookupList
                appendTo: @$el
                close: => @$el.trigger 'rightmapupdate'
            }
    # ---------------------------------------------------------------
    # ---------------------------------------------------------------
    # splitter handling
    # ---------------------------------------------------------------
    startSplitterTracking: ()->
        debug 'AppView.startSplitterTracking'

        @trackSplitter = true
        @splitLine.addClass 'dragging'

        @locateSplitter()
    # ---------------------------------------------------------------
    locateSplitter: ()->
        debug 'AppView.locateSplitter'

        if @trackSplitter
            @resizeThings()
            # decrement remaining track count, unless it's true
            if @trackSplitter == 0
                @trackSplitter = false
            else if @trackSplitter != true
                @trackSplitter -= 1
            setTimeout @locateSplitter, @trackPeriod
    # ---------------------------------------------------------------
    resizeThings: ()->
        debug 'AppView.resizeThings'

        if @leftLayer
            leftMap = $ @leftLayer.getContainer()

        if @rightLayer
            rightMap = $ @rightLayer.getContainer()

        if @$el.hasClass 'split'

            # we're still in split mode
            newLeftWidth = @splitThumb.position().left + (@splitThumb.width() / 2.0)

            mapBox = @map.getContainer()
            $mapBox = $ mapBox
            mapBounds = mapBox.getBoundingClientRect()

            topLeft = @map.containerPointToLayerPoint [0,0]
            splitPoint = @map.containerPointToLayerPoint [newLeftWidth, 0]
            bottomRight = @map.containerPointToLayerPoint [$mapBox.width(), $mapBox.height()]

            layerTop = topLeft.y
            layerBottom = bottomRight.y

            splitX = splitPoint.x - mapBounds.left

            leftLeft = topLeft.x - mapBounds.left
            rightRight = bottomRight.x

            @splitLine.css 'left', newLeftWidth

            ##### have to use attr to set style, for this to work in frickin IE8.
            # @leftTag.css 'clip', "rect(0, #{newLeftWidth}px, auto, 0)"
            @leftTag.attr 'style', "clip: rect(0, #{newLeftWidth}px, auto, 0)"

            ##### have to use attr to set style, for this to work in IE8.
            # leftMap.css 'clip', "rect(#{layerTop}px, #{splitX}px, #{layerBottom}px, #{leftLeft}px)" if @leftLayer
            # rightMap.css 'clip', "rect(#{layerTop}px, #{rightRight}px, #{layerBottom}px, #{splitX}px)" if @rightLayer
            leftMap.attr 'style', "clip: rect(#{layerTop}px, #{splitX}px, #{layerBottom}px, #{leftLeft}px)" if @leftLayer
            rightMap.attr 'style', "clip: rect(#{layerTop}px, #{rightRight}px, #{layerBottom}px, #{splitX}px)" if @rightLayer

        else
            # we're not in split mode (this is probably the last
            # resizeThings call before exiting split mode), so go
            # full left side only.
            ##### have to set style attr for IE8 to work.
            # @leftTag.css 'clip', 'inherit'
            # leftMap.css 'clip', 'inherit' if @leftLayer
            # rightMap.css 'clip', 'rect(0,0,0,0)' if @rightLayer

            @leftTag.attr 'style', 'clip: inherit'
            leftMap.attr 'style', 'clip: inherit' if @leftLayer
            rightMap.attr 'style', 'clip: rect(0,0,0,0)' if @rightLayer

    # ---------------------------------------------------------------
    stopSplitterTracking: ()->
        debug 'AppView.stopSplitterTracking'

        @splitLine.removeClass 'dragging'
        @trackSplitter = 5 # five more resizings, then stop
    # ---------------------------------------------------------------
    activateSplitter: ()->
        debug 'AppView.activateSplitter'

        @splitThumb.draggable {
            containment: $ '#mapwrapper'
            scroll: false
            start: @startSplitterTracking
            drag: @resizeThings
            stop: @stopSplitterTracking
        }
        @resizeThings()
    # ---------------------------------------------------------------
    deactivateSplitter: ()->
        debug 'AppView.deactivateSplitter'

        @splitThumb.draggable 'destroy'
        @resizeThings()

    # ---------------------------------------------------------------
},{ templates: { # ==================================================
    # templates here
    # ---------------------------------------------------------------
    layout: _.template """
        <div class="splitline">&nbsp;</div>
        <div class="splitthumb"><span>&#x276e; &#x276f;</span></div>
        <div class="left tag"><%= leftTag %></div>
        <div class="right tag"><%= rightTag %></div>
        <div class="left form"><%= leftForm %></div>
        <div class="right form"><%= rightForm %></div>
        <div class="left loader"><img src="/static/images/spinner.loadinfo.net.gif" /></div>
        <div class="right loader"><img src="/static/images/spinner.loadinfo.net.gif" /></div>
        <div id="mapwrapper"><div id="map"></div></div>
    """
    # ---------------------------------------------------------------
    leftTag: _.template """
        <div class="show">
            <span class="leftlayername">plain map</span>
            <br>
            <button class="btn-change">settings</button>
            <button class="btn-compare">show/hide comparison map</button>
        </div>
        <div class="edit">
            <input id="leftmapspp" name="leftmapspp" placeholder="&hellip; species or group &hellip;" />
            <!--
            <button class="btn-change">hide settings</button>
            <button class="btn-compare">compare +/-</button>
            -->
        </div>
    """
    # ---------------------------------------------------------------
    rightTag: _.template """
        <div class="show">
            <span class="rightlayername">(no distribution)</span>
            <br>
            <button class="btn-change">settings</button>
            <button class="btn-compare">show/hide comparison map</button>
        </div>
        <div class="edit">
            <input id="rightmapspp" name="rightmapspp" placeholder="&hellip; species or group &hellip;" />
        </div>
    """
    # ---------------------------------------------------------------
    leftForm: _.template """
        <p>
        <button class="btn-copy-rtl">copy right map &laquo;</button>
        </p><p>
        <select class="left" id="leftmapyear">
            <option value="baseline">baseline</option>
            <option>2015</option>
            <option>2025</option>
            <option>2035</option>
            <option>2045</option>
            <option>2055</option>
            <option>2065</option>
            <option>2075</option>
            <option>2085</option>
        </select>
        </p><p>
        <select class="left" id="leftmapscenario">
            <option value="RCP3PD">RCP 3PD</option>
            <option value="RCP45">RCP 4.5</option>
            <option value="RCP6">RCP 6</option>
            <option value="RCP85" selected="selected">RCP 8.5</option>
        </select>
        </p><p>
        <select class="left" id="leftmapgcm">
            <option value="all">median</option>
            <option value="csiro-mk30">CSIRO Mark 3.0</option>
            <option value="giss-modeleh">GISS E20/HYCOM</option>
            <option value="ncar-ccsm30">NCAR CCSM 3.0</option>
            <option value="ukmo-hadgem1">UK Met Office HadGEM1</option>
        </select>
        </p><p>
        <button class="btn-change">hide settings</button>
        </p><p>
        <button class="btn-compare">compare +/-</button>
        </p>
    """
    # ---------------------------------------------------------------
    rightForm: _.template """
        <p>
        <button class="btn-copy-ltr">&raquo; copy left map</button>
        </p><p>
        <select class="right" id="rightmapyear">
            <option value="baseline">baseline</option>
            <option>2015</option>
            <option>2025</option>
            <option>2035</option>
            <option>2045</option>
            <option>2055</option>
            <option>2065</option>
            <option>2075</option>
            <option>2085</option>
        </select>
        </p><p>
        <select class="right" id="rightmapscenario">
            <option value="RCP3PD">RCP 3PD</option>
            <option value="RCP45">RCP 4.5</option>
            <option value="RCP6">RCP 6</option>
            <option value="RCP85" selected="selected">RCP 8.5</option>
        </select>
        </p><p>
        <select class="right" id="rightmapgcm">
            <option value="all">median</option>
            <option value="csiro-mk30">CSIRO Mark 3.0</option>
            <option value="giss-modeleh">GISS E20/HYCOM</option>
            <option value="ncar-ccsm30">NCAR CCSM 3.0</option>
            <option value="ukmo-hadgem1">UK Met Office HadGEM1</option>
        </select>
        </p><p>
        <button class="btn-change">hide settings</button>
        </p><p>
        <button class="btn-compare">compare +/-</button>
        </p>
    """
    # ---------------------------------------------------------------
}}

module.exports = AppView
