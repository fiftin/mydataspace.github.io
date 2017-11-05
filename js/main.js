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
  var ret = '';
  var state = '';
  var statement;
  for (var i = 0; i < template.length; i++) {
    var c = template[i];
    switch (c) {
      case '{':
        switch (state) {
          case 'left_brace':
            state = 'statement';
            statement = '';
            break;
          case '':
            state = 'left_brace';
            break;
          default:
            throw new Error('Unexpected character');
        }
        break;
      case '}':
        switch (state) {
          case 'statement':
            state = 'right_brace';
            break;
          case 'right_brace':
            ret += data[statement];
            statement = null;
            state = '';
            break;
          case '':
            ret += c;
            break;
          default:
            throw new Error('Unexpected character');
        }
        break;
      default:
        switch (state) {
          case 'statement':
            var code = c.charCodeAt(0);
            if (c === '_' || c === '-' || c === '.' ||
                code >= 'a'.charCodeAt(0) && code <= 'z'.charCodeAt(0) ||
                code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0) ||
                code >= '0'.charCodeAt(0) && code <= '9'.charCodeAt(0)) {
              statement += c;
            } else if (c !== ' ') {
              throw new Error('Unexpected character');
            }
            break;
          case 'left_brace':
            state = '';
            ret += '{' + c;
            break;
          default:
            ret += c;
        }
        break;
    }
  }
  return ret;
}

function parseSnippetTemplate(template) {
  if (template == null) {
    throw new Error('Parameter template can not be null');
  }
  var parts = template.split('\n---\n');
  return {
    template: Handlebars.compile(parts[0]),
    scripts: Handlescripts.compile(parts[1] || '')
  };
}

function parseSingleScript(s, fields) {
  var state = 'helper_name';
  var helperName = '';
  var options = [];
  s += ' ';
  for (var i in s) {
    var c = s[i];
    switch (c) {
      case ' ':
        switch (state) {
          case 'space':
            break;
          case 'helper_name':
            state = 'space';
            break;
          case 'string':
            options[options.length-1] += c;
            break;
          case 'option':
            options[options.length-1] = fields[options[options.length-1]];
            state = 'space';
            break;
          default:
            throw new Error('Unexpected char' + c + ' in state ' + state);
            break;
        }
        break;
      case '"':
        switch (state) {
          case 'space':
            options.push('');
            state = 'string';
            break;
          case 'string':
            state = 'space';
            break;
          case 'helper_name':
          case 'option':
          default:
            throw new Error('Unexpected char' + c + ' in state ' + state);
            break;
        }
        break;
      default:
        switch (state) {
          case 'space':
            state = 'option';
            options.push(c);
            break;
          case 'string':
            options[options.length-1] += c;
            break;
          case 'helper_name':
            helperName += c;
            break;
          case 'option':
            options[options.length-1] += c;
            break;
          default:
            throw new Error('Unexpected char ' + c + ' in state ' + state);
            break;
        }
        break;
    }
  }
  return Handlescripts.helpers[helperName] ? Handlescripts.helpers[helperName](options) : '';
}

function parseScripts(scripts, fields) {
  return scripts.split('\n').filter(function(l) { return l.trim() !== ''; }).map(function(l) {
    return parseSingleScript(l, fields);
  });
}

Handlescripts = {
  helpers: {},
  registerHelper: function(name, fn) {
    Handlescripts.helpers[name] = fn;
  },
  compile: function(scripts) {
    return parseScripts.bind(Handlescripts, scripts);
  }
};

Handlescripts.registerHelper('vkGroupWidget', function(options) {
  var vk_id = options[0];
  if (MDSCommon.isBlank(vk_id)) {
    return '';
  }
  return '<script type="text/javascript" src="//vk.com/js/api/openapi.js?150"></script>\n' +
  '<div id="vk_groups_' + vk_id + '"></div>\n' +
  '<script type="text/javascript">\n' +
  'VK.Widgets.Group("vk_groups_' + vk_id + '", {mode: 3}, ' + vk_id + ');\n' +
  '</script>';
});

Handlescripts.registerHelper('vkGroupWidget', function(options) {
  return '<script src="//vk.com/js/api/openapi.js?150"></script>';
});

Handlescripts.registerHelper('vkGroupWidget', function(options) {
  var vk_id = options[0];
  if (MDSCommon.isBlank(vk_id)) {
    return '';
  }
  return '<script>\n' +
    'VK.Widgets.Group("vk_groups_' + vk_id + '", {mode: 3}, ' + vk_id + ');\n' +
  '</script>';
});