
(function(){

    // find panels
    var $panelList = $('.panel');
    $panelList.each( function(panelIndex, panel) {
        var $panel = $(panel);
        var $pageList = $panel.children('.page');

        // function that shows a particular page
        var showPage = function(page) {

            console.log('switching to ' + page);
            var $targetPage = $(page);

            $pageList.not($targetPage).fadeOut().removeClass('active');
            $targetPage.addClass('active').fadeIn();

            // var newHeight = $targetPage.height();
            // $panel.animate({ height: newHeight }, 'fast', function() {
            //     $targetPage.addClass('active').fadeIn();
            // });
        }

        // if there's a currently active page, call showPage on it
        var $currentPage = $panel.find('.page.active');
        if ($currentPage.length > 0) {
            showPage($currentPage);
        }

        var $switcherList = $panel.find('.switchpage');
        $switcherList.each( function(switcherIndex, switcher) {
            $(switcher).click( function(event) {
                console.log('switcher clicked: ', $(switcher).data('targetpage'));
                showPage('#' + $(switcher).data('targetpage'));
            });
        });


        // console.log('there are ' + $pageList.length + ' pages in panel ' + $panel.attr('class'));
    });


})();