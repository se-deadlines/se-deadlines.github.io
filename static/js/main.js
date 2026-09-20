---
---
$(function() {
  deadlineByConf = {};

  {% for conf in site.data.conferences %}
  // {{ conf.name }} {{ conf.year }}
  {% if conf.deadline[0] == "TBA" %}
  {% assign conf_id = conf.name | append: conf.year | append: '-0' | slugify %}
  $('#{{ conf_id }} .timer').html("TBA");
  $('#{{ conf_id }} .deadline-time').html("TBA");
  deadlineByConf["{{ conf_id }}"] = moment.tz("3000-01-01", "Etc/GMT+12");

  {% else %}
  var rawDeadlines = {{ conf.deadline | jsonify }} || [];
  if (rawDeadlines.constructor !== Array) {
    rawDeadlines = [rawDeadlines];
  }
  var parsedDeadlines = [];
  while (rawDeadlines.length > 0) {
    var rawDeadline = rawDeadlines.pop();
    // deal with year template in deadline
    year = {{ conf.year }};
    rawDeadline = rawDeadline.replace('%y', year).replace('%Y', year - 1);
    // adjust date according to deadline timezone
    {% if conf.timezone %}
    var deadline = moment.tz(rawDeadline, "{{ conf.timezone }}");
    {% else %}
    var deadline = moment.tz(rawDeadline, "Etc/GMT+12"); // Anywhere on Earth
    {% endif %}

    if (deadline.isValid()) {
      // post-process date
      if (deadline.minutes() === 0) {
        deadline.subtract(1, 'seconds');
      }
      if (deadline.minutes() === 59) {
        deadline.seconds(59);
      }
    }
    parsedDeadlines.push(deadline);
  }
  // due to pop before; we need to reverse such that the i index later matches
  // the right parsed deadline
  parsedDeadlines.reverse();

  {% assign range_end = conf.deadline.size | minus: 1 %}
  {% for i in (0..range_end) %}
  {% assign conf_id = conf.name | append: conf.year | append: '-' | append: i | slugify %}
  var deadlineId = {{ i }};
  if (deadlineId < parsedDeadlines.length) {
    var confDeadline = parsedDeadlines[deadlineId];

    // render countdown timer
    if (confDeadline) {
      function make_update_countdown_fn(confDeadline) {
        return function(event) {
          diff = moment() - confDeadline
          if (diff <= 0) {
            $(this).html(event.strftime('%D days %Hh %Mm %Ss'));
          } else {
            $(this).html(confDeadline.fromNow());
          }
        }
      }
      $('#{{ conf_id }} .timer').countdown(confDeadline.toDate(), make_update_countdown_fn(confDeadline));
      // check if date has passed, add 'past' class to it
      if (moment() - confDeadline > 0) {
        $('#{{ conf_id }}').addClass('past');
      }
      $('#{{ conf_id }} .deadline-time').html(confDeadline.local().format('D MMM YYYY, h:mm:ss a'));
      deadlineByConf["{{ conf_id }}"] = confDeadline;
    }
  } else {
    // TODO: hide the conf_id ?
  }
  {% endfor %}
  {% endif %}
  {% endfor %}

  // Reorder list
  var today = moment();
  var confs = $('.conf').detach();
  confs.sort(function(a, b) {
    var aDeadline = deadlineByConf[a.id];
    if (!aDeadline.isValid()) {
      return 1;
    }
    var bDeadline = deadlineByConf[b.id];
    if (!bDeadline.isValid()) {
      return -1;
    }
    var aDiff = today.diff(aDeadline);
    var bDiff = today.diff(bDeadline);
    if (aDiff < 0 && bDiff > 0) {
      return -1;
    }
    if (aDiff > 0 && bDiff < 0) {
      return 1;
    }
    return bDiff - aDiff;
  });
  $('.conf-container').append(confs);

  // Build filter groups (venue type, track, others, CORE rank, ...) from types.yml,
  // keyed by their `type` field, each holding the {name, tag} pairs in that group.
  var conf_type_data = {{ site.data.types | jsonify }};
  var filterGroups = {};
  conf_type_data.forEach(function(item) {
    if (!filterGroups[item.type]) {
      filterGroups[item.type] = [];
    }
    filterGroups[item.type].push({ name: item.name, tag: item.tag });
  });

  var all_tags = Object.keys(filterGroups)
    .reduce(function(acc, key) { return acc.concat(filterGroups[key]); }, [])
    .map(function(item) { return item.tag; });

  var nameToTag = {};
  var tagToName = {};
  Object.keys(filterGroups).forEach(function(group) {
    filterGroups[group].forEach(function(item) {
      nameToTag[item.name] = item.tag;
      tagToName[item.tag] = item.name;
    });
  });

  function addUnique(array, value) {
    if (array.indexOf(value) === -1) array.push(value);
  }

  function getQueryParamParts(name) {
    function decodeQueryComponent(value) {
      value = value.replace(/\+/g, ' ');
      try { return decodeURIComponent(value); }
      catch (e) { return value; }
    }

    var pairs = window.location.search.slice(1).split('&');

    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      var key = pair.shift();

      if (decodeQueryComponent(key) === name) {
        return pair.join('=').split(',').map(decodeQueryComponent);
      }
    }

    return null;
  }

  function readSelectionFromUrl() {
    var found = false;
    var selected = {};
    Object.keys(filterGroups).forEach(function(group) {
      selected[group] = [];
      var names = getQueryParamParts(group);
      if (names === null) return;

      found = true;

      names.forEach(function(name) {
        var tag = nameToTag[name];
        if (tag) addUnique(selected[group], tag);
      });
    });
    return found ? selected : null;
  }

  // Only the URL's query params preselect filters; with none, every checkbox
  // starts unchecked (selecting nothing shows every entry).
  var initialSelection = readSelectionFromUrl();
  var initialTags = [];
  if (initialSelection) {
    Object.keys(initialSelection).forEach(function(group) {
      initialSelection[group].forEach(function(tag) {
        initialTags.push(tag);
      });
    });
  }

  for (var i = 0; i < all_tags.length; i++) {
    var tag = all_tags[i];
    $('#' + tag + '-checkbox').prop('checked', initialTags.indexOf(tag) !== -1);
  }

  function getSelectedFiltersFromDOM() {
    var selected = {};
    Object.keys(filterGroups).forEach(function(group) { selected[group] = []; });

    $('.filter-checkbox:checked').each(function() {
      var tag = $(this).attr('id').replace('-checkbox', '');
      var filterGroup = $(this).data('filter-group');

      if (filterGroup && selected[filterGroup]) {
        addUnique(selected[filterGroup], tag);
      }
    });

    return selected;
  }

  function updateUrlFromSelection() {
    var selected = getSelectedFiltersFromDOM();
    var queryParts = [];

    Object.keys(filterGroups).forEach(function(group) {
      var encodedNames = [];

      selected[group].forEach(function(tag) {
        var name = tagToName[tag];
        if (name) encodedNames.push(encodeURIComponent(name));
      });

      if (encodedNames.length > 0) {
        queryParts.push(encodeURIComponent(group) + '=' + encodedNames.join(','));
      }
    });

    var query = queryParts.join('&');
    var newUrl = window.location.pathname + (query ? '?' + query : '') + window.location.hash;

    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', newUrl);
    }
  }

  function update_conf_list() {
    var selectedFilters = getSelectedFiltersFromDOM();

    confs.each(function(i, conf) {
      var conf = $(conf);
      var show = true;

      Object.keys(selectedFilters).forEach(function(group) {
        if (!show) return;
        if (selectedFilters[group].length === 0) return;

        var hasTag = false;
        selectedFilters[group].forEach(function(tag) {
          if (conf.hasClass(tag)) hasTag = true;
        });

        // Require at least one selected tag per group (OR within a group),
        // but every group with a selection must be satisfied (AND across groups).
        if (!hasTag) show = false;
      });

      conf.toggle(show);
    });
  }

  // Event handler on checkbox change
  $('.filter-checkbox').on('change', function() {
    update_conf_list();
    updateUrlFromSelection();
  });

  update_conf_list();
  updateUrlFromSelection();
});
