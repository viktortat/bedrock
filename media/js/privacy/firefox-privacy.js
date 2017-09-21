(function() {
    'use strict';

    var mainContent = document.querySelector('main');
    var strings = document.getElementById('strings');
    var topicHeaders = document.querySelectorAll('main > section');
    var topics = [];

    /**
     * Adds the data choices widget to the first sub-section under
     * "Firefox by default shares data to".
     * @param {Object} section - The section to which the widget
     * will be added
     */
    function addDataChoicesWidget(section) {
        var container = document.createElement('div');
        var copyContainer = document.createElement('p');
        var button = document.createElement('button');

        container.setAttribute('class', 'data-choices');

        copyContainer.textContent = strings.dataset.choicesCopy;

        button.textContent = strings.dataset.choicesButton;
        button.setAttribute('id', 'choose');
        button.setAttribute('type', 'button');

        container.appendChild(copyContainer);
        container.appendChild(button);

        section.appendChild(container);
    }

    /**
     * For each main section, this innjects a button to either,
     * show all topics under the section, or collapse all.
     */
    function addMasterToggles() {
        var text = strings.dataset.tabpanelOpenText;
        var toggle = document.createElement('button');

        toggle.classList.add('toggle');
        toggle.setAttribute('type', 'button');
        toggle.textContent = text;
        toggle.dataset.isExpanded = false;

        for (var i = 0, l = topicHeaders.length; i < l; i++) {
            var currentHeading = topicHeaders[i].querySelector('header h2');

            toggle.dataset.parentContainer = topicHeaders[i].id;
            currentHeading.insertAdjacentHTML('beforeend', toggle.outerHTML);
        }
    }

    /**
     * Collects all of the individual topics(sections) into an Array
     * for use in various other functions.
     */
    function collectAllTopics() {
        for (var i = 0, l = topicHeaders.length; i < l; i++) {
            var nestedTopics = topicHeaders[i].querySelectorAll('section');
            /* nestedTopics is a NodeList which is Array like but,
            not a real array. We therefore need to coherce it into one. */
            topics.push([].slice.call(nestedTopics));
        }

        /* At this point `topics` is a two dimensional array.
        The final step then is to flatten it. */
        topics = topics.reduce(function(a, b) {
            return a.concat(b);
        });
    }

    /**
     * Hides *all* topics across sections
     */
    function hideAllTopicContent() {
        for (var i = 0, l = topics.length; i < l; i++) {
            var divElem = topics[i].querySelector('div');
            divElem.classList.add('hidden');
            divElem.setAttribute('aria-hidden', true);
        }
    }

    /**
     * Runs a set of functions on page load.
     */
    function initPage() {
        collectAllTopics();
        hideAllTopicContent();
        addMasterToggles();
        showInitialTopic();
    }

    /**
     * On load, expands the first topic of the first main section. This
     * also calls `addDataChoicesWidget` if on Fx desktop.
     */
    function showInitialTopic() {
        var initialTopic = topicHeaders[0].querySelector('section');
        var initialTopicContent = initialTopic.querySelector('div');
        var initialTopicHeading = initialTopic.querySelector('h3');

        initialTopicContent.classList.remove('hidden');
        initialTopicContent.setAttribute('aria-hidden', false);

        initialTopicHeading.classList.add('expanded');

        if (Mozilla.Client.isFirefoxDesktop) {
            addDataChoicesWidget(initialTopicContent);
        }
    }

    /**
     * Hide or show all topics for the main section.
     * @param {Object} targetElem - The element that triggered the event
     */
    function toggleMainSectionTopics(targetElem) {
        var targetSectionId = targetElem.dataset.parentContainer;
        var isExpanded = targetElem.dataset.isExpanded;
        var targetAction = isExpanded === 'true' ? 'add' : 'remove';
        var targetSection = document.getElementById(targetSectionId);
        var subSections = targetSection.querySelectorAll('section');

        for (var i = 0, l = subSections.length; i < l; i++) {
            var divElem = subSections[i].querySelector('div');
            var heading = subSections[i].querySelector('h3');

            divElem.classList[targetAction]('hidden');
            divElem.setAttribute('aria-hidden', isExpanded || 'false');
            heading.classList[targetAction]('expanded');
        }

        if (isExpanded === 'true') {
            targetElem.dataset.isExpanded = false;
            targetElem.textContent = strings.dataset.tabpanelOpenText;
        } else {
            targetElem.dataset.isExpanded = true;
            targetElem.textContent = strings.dataset.tabpanelCloseText;
        }
    }

    /**
     * Listens for click events on items inside the main content area.
     * It then calls the appropriate function based on the event target.
     * This avoids adding multiple event handlers on individual elements.
     */
    mainContent.addEventListener('click', function(event) {
        // hanle clicks on an individual topic
        if (event.target.tagName === 'H3') {
            var tabContent = event.target.parentElement.nextElementSibling;
            if (tabContent.classList.contains('hidden')) {
                tabContent.classList.remove('hidden');
                tabContent.setAttribute('aria-hidden', false);
                event.target.classList.add('expanded');
            } else {
                tabContent.classList.add('hidden');
                tabContent.setAttribute('aria-hidden', true);
                event.target.classList.remove('expanded');
            }
        }

        // handle clicks on the master toggle buttons
        if (event.target.classList.contains('toggle')) {
            toggleMainSectionTopics(event.target);
        }

        // handle clicks on the data choices "Choose" button
        if (event.target.id === 'choose') {
            // if the uitour did not load, just return
            if (Mozilla.UITour === undefined) {
                return;
            }

            Mozilla.UITour.openPreferences('privacy-reports');
        }
    });

    /* add a class to indicate that js is enabled. This will trigger
    the appropriate styling to be applied */
    mainContent.classList.add('interactive-widget');

    initPage();
})();
