var TAGS_TO_FILTERS = {
  lang: 'language',
  ctry: 'country',
  cat: 'category',
  src: 'datasource'
};

var CATEGORY_ICONS = {
  biz: 'briefcase',
  economy: 'area-chart',
  health: 'heart',
  edu: 'graduation-cap',
  ecology: 'leaf',
  culture: 'paint-brush',
  security: 'shield',
  transport: 'car',
  geo: 'map',
  state: 'university',
  tourism: 'plane'
};

function isEmptyPathnameIgnoreLanguage(pathname) {
  var pathnameParts = pathname.split('/').filter(function(part) { return part !== ''; });
  return pathnameParts.length === 0 || pathnameParts.length === 1 && pathnameParts[0].length <= 2;
}

function search_parseQuery() {
  var ret = '';
  var params = MDSCommon.parseQuery(window.location.search);
  if (MDSCommon.isPresent(params.tags)) {
    var tags = params.tags.split(',');
    tags.forEach(function(tag) {
      if (tag[0] !== '@') {
        ret += '#';
      }
      ret += tag + ' ';
    });
  }
  if (MDSCommon.isPresent(params.q)) {
    ret += params.q;
  }
  return ret;
}

function search_parseSearchString(search, useFilterTags) {
  var tags = [];
  var newSearch = '';
  var filters = {};
  var parts = search.split(/\s+/);
  for (var i in parts) {
    var part = parts[i];
    if (part[0] === '#') {
      var filter2val = part.split(':');
      if (filter2val.length === 1) {
        tags.push(part.substring(1));
      } else {
        filter = useFilterTags ?filter2val[0].substring(1) : TAGS_TO_FILTERS[filter2val[0].substring(1)];
        if (filter) {
          filters[filter] = filter2val[1];
        }
      }
    } else {
      if (newSearch !== '') {
        newSearch += ' ';
      }
      newSearch += part;
    }
  }

  return {
    search: newSearch,
    filters: filters,
    tags: tags
  }
}

function search_getQueryFromSearchString(search) {
  var options = search_parseSearchString(search, true);
  var ret = '';
  for (var filter in options.filters) {
    if (ret === '') {
      ret += 'tags='
    } else {
      ret += ','
    }
    ret += filter + ':' + options.filters[filter];
  }

  options.tags.forEach(function(tag) {
    if (ret === '') {
      ret += 'tags='
    } else {
      ret += ','
    }
    ret += tag;
  });

  if (MDSCommon.isPresent(options.search)) {
    if (ret !== '') {
      ret += '&'
    }
    ret += 'q=' + options.search;
  }

  if (ret === '') {
    return '';
  }
  return '?' + ret;
}


function getHtmlFromTemplate(template, data) {
  return template;
}