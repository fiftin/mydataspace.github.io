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
  registerSource: function(name, src) {
    if (typeof src !== 'string') {
      throw new Error('src must be string');
    }
    Handlescripts.helpers[name] = function() {
      return '<script>' +
      ' $.ajax({\n' +
      '    async: false,\n' +
      '    url: "' + src + '",\n' +
      '    dataType: "script"\n' +
      ' });' +
      '</script>';
    };

    // Handlescripts.helpers[name] = function() {
    //   return '<script>(function() {\n' +
    //     '    var req = new XMLHttpRequest();\n' +
    //     '    req.open("GET", "' + src + '", false);\n' +
    //     '    req.send();\n' +
    //     '    eval(req.responseText);\n' +
    //     '})();</script>';
    // };
  },

  compile: function(scripts) {
    return parseScripts.bind(Handlescripts, scripts);
  }
};


Handlescripts.registerSource('vk', '//vk.com/js/api/openapi.js?150');
Handlescripts.registerSource('ok', 'https://connect.ok.ru/connect.js');

Handlescripts.registerHelper('vkGroupWidget', function(options) {
  var vk_id = options[0];
  if (MDSCommon.isBlank(vk_id)) {
    return '';
  }
  return  '<script>VK.Widgets.Group("vk_groups_' + vk_id + '", {mode: 3}, ' + vk_id + ');</script>';
});

Handlescripts.registerHelper('okGroupWidget', function(options) {
  var ok_id = options[0];
  if (MDSCommon.isBlank(ok_id)) {
    return '';
  }
  return  '<script>OK.CONNECT.insertGroupWidget("ok_group_widget_' + ok_id + '", ' + ok_id + ', \'{"width":200,"height":230}\');</script>';
});

if (typeof Handlebars !== 'undefined') {
  Handlebars.registerHelper('host', function(url) {
    var m = url.match(/^\w+:\/\/([^/]+)/);
    if (!m) {
      return url;
    }
    return m[1];
  });
}

/**
 * Add JSON-LD for Google Search Engine
 * @param {Object} data - Data received for root from MyDataSpace backend.
 */
function addJsonLD(data) {
  var script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify({
    "@context": "http://schema.org",
    "@id": "https://myda.space/" + data.root,
    "@type": "Dataset",
    "name":  MDSCommon.findValueByName(data.fields, 'name'),
    "description": MDSCommon.findValueByName(data.fields, 'description'),
    "keywords": MDSCommon.findValueByName(data.fields, 'tags')
  });
  document.querySelector('head').appendChild(script);
}

function loadEntityData(method, requestData, success, fail) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState === XMLHttpRequest.DONE ) {
      if (xmlhttp.status === 200) {
        var data = JSON.parse(xmlhttp.responseText);
        success(data);
      } else {
        fail();
      }
    }
  };
  var query = '';
  for (var k in requestData) {
    if (query !== '') {
      query += '&';
    }
    if (requestData[k] != null) {
      query += k + '=' + requestData[k];
    }
  }
  xmlhttp.open('GET', '{{ api_url }}/v1/entities/' + method + '?' + query, true);
  xmlhttp.send();
}

function getCodepenIDByURL(url) {
  var regex = /^https?:\/\/codepen.io\/(\w+)\/pen\/(\w+)/;
  var m = regex.exec(url);
  if (!m) {
    return null;
  }
  return m[1] + '/' + m[2];
}

function getCodepenURL(id) {
  var parts = id.split('/');
  return 'https://codepen.io/' + parts[0] + '/pen/' + parts[1];
}

function getRequestFromLocation(loc) {
  var pathnameParts = loc.pathname.split('/').filter(function(part) { return part !== ''; });
  if (pathnameParts[0].length <= 2) {
    pathnameParts.shift();
  }
  var searchParams = MDSCommon.parseQuery(loc.search);
  return {
    root: pathnameParts[0] === 'root' ? '11111' : pathnameParts[0],
    path: '',
    version: searchParams.v
  };
}

function getURLLanguagePrefix(language) {
  return MDSCommon.isBlank(language) || language === 'en' ? '' : '/' + language;
}

function showWaitingCloak() {
  document.getElementById('waiting_cloak').style.display = 'block';
}

function hideWaitingCloak() {
  document.getElementById('waiting_cloak').style.display = 'none';
}


RootHelper = {
  validateLookForm: function() {
    document.getElementById('look_modal__title_err').innerText = '';
    document.getElementById('look_modal__codepen_err').innerText = '';

    var title = document.getElementById('look_modal__title').value;
    var codepen = document.getElementById('look_modal__codepen').value;

    if (MDSCommon.isBlank(title)) {
      document.getElementById('look_modal__title_err').innerText = tr$('title_cant_be_blank');
      return false;
    }

    if (title.length > 250) {
      document.getElementById('look_modal__title_err').innerText = tr$('too_long_title');
      return false;
    }

    switch (document.getElementById('look_modal').data('look-type')) {
      case 'codepen':
        if (MDSCommon.isBlank(codepen)) {
          document.getElementById('look_modal__codepen_err').innerText = tr$('codepen_url_cant_be_blank');
          return false;
        }
        var codepenID = getCodepenIDByURL(codepen);
        if (!codepenID) {
          document.getElementById('look_modal__codepen_err').innerText = tr$('invalid_codepen_pen_url');
          return false;
        }
        break;
      case 'table':
        break;
      case 'list':
        break;
    }
    return true;
  }
};