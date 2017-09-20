(function() {
    'use strict';

    var mainContent = document.querySelector('main');
    var strings = document.getElementById('strings');
    var topicHeaders = document.querySelectorAll('main > section');
    var topics = [];

    /**
     * Collects all of the individual topics(sections) into an Array
     * for use in various other functions.
     */
    function collectAllTopics() {
        for (var i = 0, l = topicHeaders.length; i < l; i++) {
            setTopicsArray(topicHeaders[i]);
        }
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
     * For each main section, this innjects a button to either,
     * show all topics under the section, or collapse all.
     */
    function injectMasterToggles() {
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
     * For each main section, push each section into the globally available
     * `topics` array.
     */
    function setTopicsArray(container) {
        var sections = container.querySelectorAll('section');

        for (var i = 0, l = sections.length; i < l; i++) {
            topics.push(sections[i]);
        }
    }

    /**
     * On load, expands the first topic of the first main section.
     */
    function showInitialTopic() {
        var initialTopic = topicHeaders[0].querySelector('section > div');
        var initialTopicHeading = topicHeaders[0].querySelector('h3');

        initialTopic.classList.remove('hidden');
        initialTopic.setAttribute('aria-hidden', false);

        initialTopicHeading.classList.add('expanded');
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
    });

    /* add a class to indicate that js is enabled. This will trigger
    the appropriate styling to be applied */
    mainContent.classList.add('interactive-widget');

    collectAllTopics();
    hideAllTopicContent();
    injectMasterToggles();

    showInitialTopic();
})();
