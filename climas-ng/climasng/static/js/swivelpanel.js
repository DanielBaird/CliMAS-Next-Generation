
(function(){
    $('.sub.menu').each( function(menuIndex, menu) {
        // process each menu

        var $menu = $(menu);
        var $menuItemList = $menu.find('.menuitem');
        var $triggerList = $menu.find('.paneltrigger');

        $triggerList.each( function(triggerIndex, trigger) {
            // process each trigger in this menu
            var $trigger = $(trigger);

            // the trigger has a data-panelid attribute
            var panelSelector = '#' + $trigger.data('panelid');
            var $panel = $(panelSelector);

            if ($panel.length > 0) {
                // if there's a panel called that, hook it up
                $trigger.click( function(event) {
                    if ($panel.hasClass('hidden')) {
                        // show the panel, and mark this menu item as current
                        $triggerList.each( function(trigIndex, trig) {
                            // hide all panels
                            $('#' + $(trig).data('panelid')).addClass('hidden');
                        });
                        // show this panel
                        $panel.removeClass('hidden');
                        // then show the menuitem as current
                        // TODO: what if there's no menu item?
                        $menuItemList.removeClass('current');
                        $trigger.closest('.menuitem').addClass('current');
                    } else {
                        // hide the panel, but leave this menu item current
                        $panel.addClass('hidden');
                    }
                });

            }

            if ($trigger.parent().hasClass('current')) {
                $trigger.click();
            }

        });

    });
})();