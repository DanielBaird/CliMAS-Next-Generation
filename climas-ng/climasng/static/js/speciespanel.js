
(function(){


    // -------------------------------------------------------------------------------------------
    // convenience functions
    var enableGoButton = function() {
        if ($.inArray($('#speciesname').val(), speciesSciNameList) > -1) {
            $('#showmap').removeClass('disabled').prop('disabled', false); // enable the button
        } else {
            $('#showmap').addClass('disabled').prop('disabled', true); // DISable the button
        }
    }

    // work out when to disable things
    var enableFutureFields = function() {

        // fetch the current form elements
        var $timePointCtl = $('input[name=timepoint]:checked');

        console.log('enabling fields.', $timePointCtl.html());

        if ($timePointCtl.val() === 'baseline') {
            $('input[name=scenario], input[name=gcm]').prop('disabled', true); // DISable the future fields
            $('fieldset.scenario, fieldset.gcm').addClass('disabled');
        } else {
            $('input[name=scenario], input[name=gcm]').prop('disabled', false); // enable the future fields
            $('fieldset.scenario, fieldset.gcm').removeClass('disabled');
        }
    }

    // -------------------------------------------------------------------------------------------
    // fetch the species list
    speciesFetch = $.ajax({
        url: '/data/species'
    });
    // get a variable read for our list
    var speciesLookupList = [];
    var speciesSciNameList = [];

    // -------------------------------------------------------------------------------------------
    // set up the autocomplete field

    // do this after we've fetched the species list
    speciesFetch.done( function(data) {
        speciesLookupList = []; // no initial var here, we want to refer to the outside scope
        speciesSciNameList = []; // no initial var here, we want to refer to the outside scope
        $.each(data, function(sciName, commonNames) {
            speciesSciNameList.push(sciName);
            if (commonNames) {
                $.each(commonNames, function(cnIndex, cn) {
                    speciesLookupList.push({
                        label: cn + ' (' + sciName + ')',
                        value: sciName
                    });
                });
            } else {
                speciesLookupList.push({ label: sciName, value: sciName });
            }
        });
        $('#speciesname').autocomplete({ source: speciesLookupList });
    });
    // -------------------------------------------------------------------------------------------
    // hook up the auto-enable and disable stuff
    $('#speciesname').on('autocompleteclose',  function(event, ui) { enableGoButton(); });
    $('#speciesname').on('keyup',              function(event, ui) { enableGoButton(); });
    $('#speciesname').on('change',             function(event, ui) { enableGoButton(); });

    $('input[name=timepoint]').change( function() {
        enableFutureFields();
    });

    // also do the enabling now..
    enableGoButton();
    enableFutureFields();

    // need to attach the fade-in event hander to the iframe's "ready" event just once, and it
    // will trigger each time we set the iframe's src and the page loads.
    $('#mapframe').load(function() {
        console.log('ready to fade back in');
        $('#map').animate({ opacity: 1 }, 2500);
    });


    // -------------------------------------------------------------------------------------------
    // handle when they actually click on the species panel button
    $('#showmap').click( function() {

        // fetch the current species name etc from the form elements.
        var sppName = $('#speciesname').val();
        var timePoint = $('input[name=timepoint]:checked').val();
        var scenario = $('input[name=scenario]:checked').val();
        var climateModel = $('input[name=gcm]:checked').val();

        console.log(sppName, timePoint, scenario, climateModel);

        var futureModelPoint = scenario + '_' + climateModel + '_' + timePoint;
        if (timePoint === 'baseline') {
            futureModelPoint = '1990';
        }

        var mapUrl = 'http://130.102.155.33:8080/' + sppName.replace(' ', '_') + '/output/' + futureModelPoint + '.tif';
        mapUrl = window.climasSettings.vizUrlPrefix + encodeURIComponent(mapUrl);

        $('#speciesshowingpage .speciesname').html(sppName);
        $('#map').animate({ opacity: 0 }, 'fast', function() {
            // find the map and apply it
            $('#mapframe').attr('src', mapUrl);
            // the iframe's ready event will eventually fire, and that's when we fade the map back in.
        });

    });

})();