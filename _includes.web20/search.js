{% if jekyll.environment == "local" %}
{% assign client_id = "my-data.space" %}
{% assign api_url = site.local_api_url %}
{% assign cdn_url = site.local_cdn_url %}
{% else %}
{% assign client_id = site.client_id %}
{% assign api_url = site.api_url %}
{% assign cdn_url = site.cdn_url %}
{% endif %}

{% if page.language == 'en' %}
{% assign lang_prefix = '' %}
{% else %}
{% assign lang_prefix = page.language|prepend:'/' %}
{% endif %}

var search_header__search_url = '';
var search_header__search_pathname = /\/datasources\/?$/.test(window.location.pathname) ? '{{ lang_prefix }}/datasources' : '{{ lang_prefix }}/search';
var isAdmin_header__search = {{include.admin}};
var search_header__search_license_drops = [];

if (typeof search_header__search_isFixed !== 'undefined' && search_header__search_isFixed || MDSCommon.endsWith(window.location.pathname, search_header__search_pathname)) {
  document.getElementById('header__search_input').classList.add('header__search_input--focus');
  document.getElementsByClassName('smoke')[0].classList.add('smoke--fullscreen--opaque');
  document.getElementById('header__search_input').value = search_parseQuery();
  document.getElementById('header__search_input').setAttribute('placeholder', '{{ site.data[page.language].header.input_search_fixed }}');
}

function closeSearch_header__search() {
  document.getElementById('{{include.resultContainer}}').style.display = 'none';
  if (isAdmin_header__search) {
    document.getElementById('webix_preloaded_header').classList.remove('webix_preloaded_header--top');
  } else {
    document.getElementsByTagName('body')[0].classList.remove('body_fixed');
    var header = document.getElementById('header');
    if (header) {
      header.style.display = 'block';
    }

    document.getElementsByClassName('smoke')[0].classList.remove('smoke--fullscreen');
    document.getElementsByClassName('navbar')[0].classList.remove('navbar--fixed');
    var default_main = document.getElementsByClassName('default_main')[0];
    if (default_main) {
      default_main.classList.remove('default_main--fullscreen');
    }
    document.getElementById('search').classList.remove('search--fullscreen');
    if (document.getElementById('page_footer')) {
      document.getElementById('page_footer').classList.remove('footer--fullscreen');
    }
  }
  if (document.getElementById('admin_panel')) {
    document.getElementById('admin_panel').classList.remove('admin_panel--fullscreen');
    document.getElementById('no_items').classList.remove('no_items--fullscreen');
  }
}

function openSearch_header__search(search, mode) {
  if (search == null) {
    search = search_parseQuery();
    document.getElementById('header__search_input').value = search_parseQuery();
  } else if (search[search.length - 1] !== ' ' && search !== '') {
    search += ' ';
  }
  document.getElementById('header__search_input').value = search;
  document.getElementById('header__search_input').focus();
  startSearch_header__search(search);
}

function removeSearchPart_header__search(part) {
  var search = document.getElementById('header__search_input').value;
  var newSearch = search.replace(part, '').replace(/^\s+/, '').replace(/\s+/, ' ').trim();
  if (newSearch !== '') {
    newSearch += ' ';
  }
  openSearch_header__search(newSearch);
}

function setSearchPart_header__search(part) {
  var search = document.getElementById('header__search_input').value;
  if (part[0] !== '#') { // search string
    search += part;
  } else {
    var partParts = part.split(':');
    var prefix = partParts[0];
    if (prefix === part) { // tag
      if (search.indexOf(part) < 0) {
        if (MDSCommon.isPresent(search) && search[search.length - 1] !== ' ') {
          search += ' ';
        }
        search += part;
      }
    } else { // filter
      var newSearch;
      if (partParts[1] === '') {
        newSearch = search.replace(new RegExp('\\s*' + prefix + ':[^\\s#]*\\b'),  '');
      } else {
        newSearch = search.replace(new RegExp(prefix + ':[^\\s#]*\\b'),  part);
      }
      if (search === newSearch) {
        if (MDSCommon.isPresent(search) && search[search.length - 1] !== ' ') {
          search += ' ';
        }
        search += part;
      } else {
        search = newSearch;
      }
    }
  }
  openSearch_header__search(search);
}



function getFilterHTML(items, itemTitlesCollection, prefix, filters, opts) {
  if (MDSCommon.isBlank(items) || MDSCommon.isEmptyObject(items)) {
    return '';
  }
  var options = MDSCommon.extend({
    translate: true,
    facetIconClass: null,
    facetIconMap: null
  }, opts);
  var filter = TAGS_TO_FILTERS[prefix];
  var title = tr$(filter);
  if (MDSCommon.isBlank(items)) {
    return '';
  }

  var filtersHTML = Object.keys(items).map(function(facet) {

    if (filters[filter] && filters[filter] !== facet) {
      return '';
    }
    var active = filters[filter] === facet;
    var classes = active ? 'search_filter__item--active' : '';
    var action = active ? 'remove' : 'set';
    var title = options.translate ? tr$(itemTitlesCollection + '.' + facet) : facet;
    if (!title) {
      return '';
    }
    var iconHTML;
    if (options.facetIconClass) {
      var iconClassSuffix = options.facetIconMap ? options.facetIconMap[facet] : facet;
      iconHTML = '<i class="' + options.facetIconClass + iconClassSuffix + '"></i>';
    } else {
      iconHTML = '';
    }

    return '<a href="javascript:void(0)" onclick="' + action + 'SearchPart_header__search(\'#' + prefix + ':' + facet + '\')" class="search_filter__item ' + classes + '">' +
      iconHTML +
      '<span class="search_filter__item_title">' + title + '</span>' +
      '<span class="search_filter__item_count">' + items[facet].count + '</span>' +
      '<i class="search_filter__item_remove fa fa-remove"></i>' +
      '</a>';
  }).join('');

  return '<div class="search_filter">' +
    '<div class="search_filter__title">' + title + '</div>' +
    '<div class="search_filter__items">' + filtersHTML + '</div>' +
    '</div>';
}


/**
 * Generates HTML for received data and puts it to search result tag.
 * @param data Data received from the server
 * @param searchOptions Options received from search input.
 * @param isPreload
 */
function fillResults_header__search(data, searchOptions, isPreload) {

  var items = data.root === 'datasources' ?  data.children : data.roots;

  var rootsHtml = items.map(function(root) {
    var itemId = root.root === 'datasources' ? root.path : root.root;
    var itemUrlQuery = root.root === 'datasources' ? 'search?tags=src:' + MDSCommon.getPathName(root.path) : root.root;

    var avatar = MDSCommon.findValueByName(root.fields, 'avatar');

    if (isPreload) {
      avatar = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    } else if (MDSCommon.isBlank(avatar)) {
      avatar = '/images/icons/root.svg';
    } else {
      avatar = 'https://cdn.web20site.com/avatars/md/' + avatar + '.png';
    }

    var tags = (MDSCommon.findValueByName(root.fields, 'tags') || '').split(' ').filter(function(tag) {
      return tag != null && tag != '';
    }).map(function(tag) {
      return '<span class="view__tag" onclick="openSearch_header__search(\'' + tag + '\'); return false;">' + tag + '</span>';
    }).join(' ');

    var languageAbbr = MDSCommon.findValueByName(root.fields, 'language');
    var countryAbbr = MDSCommon.findValueByName(root.fields, 'country');
    var category = MDSCommon.findValueByName(root.fields, 'category');
    var country = COUNTRIES[countryAbbr];
    var language = COUNTRIES[languageAbbr];

    if (category) {
      tags = '<span class="view__tag" onclick="openSearch_header__search(\'#cat:' + category + '\'); return false;"><i class="view__tag_icon fa fa-' + CATEGORY_ICONS[category] + '"></i><span>' + tr$('categories.' + category) + '</span></span> ' + tags;
    }


    if (country && (languageAbbr === countryAbbr || (language.same || []).indexOf(countryAbbr) != -1)) {
      tags = '<span class="view__tag view__tag--flag view__tag--multi_link">' +
        '<img class="view__tag_icon view__tag_icon--flag" src="/images/square_flags/' + country.name + '.svg" />' +
        '<span class="view__tag_link" onclick="openSearch_header__search(\'#lang:' + languageAbbr + '\'); return false;">' +
        tr$('languagesShort.' + languageAbbr) + '</span> / ' +
        '<span class="view__tag_link" onclick="openSearch_header__search(\'#ctry:' + countryAbbr + '\'); return false;">' +
        tr$('countries.' + countryAbbr) + '</span></span> ' + tags;
    } else {
      if (country) {
        tags = '<span class="view__tag view__tag--flag" onclick="openSearch_header__search(\'#ctry:' + countryAbbr + '\'); return false;">' +
          '<img class="view__tag_icon view__tag_icon--flag" src="/images/square_flags/' + country.name + '.svg" />' +
          tr$('countries.' + countryAbbr) + '</span> ' + tags;
      }
      if (language) {
        tags = '<span class="view__tag view__tag--flag" onclick="openSearch_header__search(\'#lang:' + languageAbbr + '\'); return false;">' +
          '<img class="view__tag_icon view__tag_icon--flag" src="/images/square_flags/' + language.name + '.svg" />' +
          tr$('languagesShort.' + languageAbbr) + '</span> ' + tags;
      }
    }

    var license = MDSCommon.findValueByName(root.fields, 'license');
    if (MDSCommon.isPresent(license)) {
      var licenseOrig = license;
      license = getLicenseWithoutVersion(license);

      if (license === 'none') {
        tags = '<span class="view__tag view__tag--license-none" onclick="openSearch_header__search(\'#license:none\'); return false;">' + tr$('licenses.none') + '</span> ' + tags;
      } else {
        tags = '<span class="view__tag view__tag--license' +
          ' view__tag--license--' + license +
          ' view__tag--license--' + license + '--' + (getCurrentLanguage() || 'en').toLowerCase() +
          '" onclick="openSearch_header__search(\'#license:' + license + '\'); return false;"' +
          ' data-license="' + licenseOrig + '"' +
          ' data-root="' + root.root + '"' +
          '>&nbsp;</span> ' + tags;
      }
    }

    var nLikes = MDSCommon.findValueByName(root.fields, '$likes') || MDSCommon.findValueByName(root.fields, 'totalLikes') || 0;
    var nComments = MDSCommon.findValueByName(root.fields, '$comments') || MDSCommon.findValueByName(root.fields, 'totalComments') || 0;
    var languageMatch = location.pathname.match(/^\/(\w\w)(\/.*)?$/);
    var lang = languageMatch ? languageMatch[1] + '/' : '';

    var footer;
    var rootDatasource = MDSCommon.findValueByName(root.fields, '$datasource');

    footer = rootDatasource === 'official' ? '' :
      '<div class="snippet__date view__comment__date view__date_wrap">' +
      '  ' + tr$('created') + ' <span class="view__date" id="view__date">' + MDSCommon.humanizeDate(root.createdAt) + '</span> ' + tr$('ago') +
      '</div>';

    if (root.profile && data.profiles[root.profile] || rootDatasource === 'official') {
      footer +=
        '<div class="snippet__author">' +
        (rootDatasource === 'official' ?
        '<div class="snippet__author_name snippet__author_name--official"><i class="fa fa-check"></i>Official</div>' :
          (data.profiles[root.profile].verified ? '<i class="fa fa-check-circle snippet__author_verified" aria-hidden="true"></i>' : '') +
          '<div class="snippet__author_name">' + data.profiles[root.profile].name + '</div>'
        ) +
        '</div>';
    }

    return '<a class="block snippet snippet--large-icon snippet--line clearfix" href="/skeletons/' + root.root + '/">\n' +
      '<img class="snippet__image snippet__image--large-icon" src="' + avatar + '" />\n' +
      '<div class="snippet__info snippet__info--large-icon ' + (MDSCommon.isBlank(tags) ? ' snippet__info--small' : '') + '">\n' +
        '<div class="snippet__title">' + (MDSCommon.findValueByName(root.fields, 'name') || itemId) + '</div>\n' +
        '<div class="snippet__description">' + (MDSCommon.findValueByName(root.fields, 'description') || '') + '</div>\n' +
        '<div class="snippet__tags">' + (tags || '') + '</div>\n' +
        '<div class="snippet__footer">' +
          footer +
          '<div class="snippet__counters">' +
          '<span class="root_counter"><i class="fa fa-heart" aria-hidden="true"></i><span class="root_counter__count root_counter__count--likes">' + nLikes + '</span></span>' +
          '<span class="root_counter"><i class="fa fa-comments" aria-hidden="true"></i><span class="root_counter__count">' + nComments + '</span></span>' +
          '</div>' +
        '</div>' + // footer
      '</div>\n' + // info
    '</a>';
  });

  document.getElementById('{{include.resultContainer}}').innerHTML =
    rootsHtml.length > 0 ?
      '<div class="container search__content ' + (isPreload ? 'search__content--preload' : '') + '">' +
      '<div class="search__results">' +
      '<div class="search__header clearfix">' +
      '<div class="search__found_count">{{ site.data[page.language].search.found_prefix }} ' + items.length + ' {{ site.data[page.language].search.found_suffix }} </div>' +
      '</div>' +
      rootsHtml.join('\n') +
      '</div>' +
      '<div class="search__filter_panel_wrap">' +
      '<div class="search__filter_panel">' +
      getFilterHTML(data.facets && data.facets.datasource, 'datasources', 'src', searchOptions.filters, {
        facetIconClass: 'search_filter__icon fa fa-',
        facetIconMap: DATASOURCE_ICONS
      }) +
      getFilterHTML(data.facets && data.facets.language, 'languages', 'lang', searchOptions.filters, { facetIconClass: 'search_filter__icon flag-icon flag-icon-' }) +
      getFilterHTML(data.facets && data.facets.country, 'countries', 'ctry', searchOptions.filters, { facetIconClass: 'search_filter__icon flag-icon flag-icon-' }) +
      getFilterHTML(data.facets && data.facets.category, 'categories', 'cat', searchOptions.filters, {
        facetIconClass: 'search_filter__icon fa fa-',
        facetIconMap: CATEGORY_ICONS
      }) +
      '</div>' +
      '</div>' +
      '</div>' : '<div class="container search__content"><div class="search__no_results">{{ site.data[page.language].search.no_results }}</div></div>';

  search_header__search_license_drops.forEach(function(drop) {
    drop.destroy();
  });

  search_header__search_license_drops = createLicenseDrop({
    selector: '#{{include.resultContainer}} .view__tag--license',
    language: '{{ page.language }}',
    openDelay: 400
  });
}


function startSearch_header__search(search) {
  var searchOptions = search_parseSearchString(search);
  if (!searchOptions.filters) {
    searchOptions.filters = {};
  }

  var q;
  var m;
  switch (MDSCommon.getPathName(search_header__search_pathname)) {
  case 'search':
    q = {
      search: searchOptions.search,
      profiles: true,
      filter: searchOptions.filters,
      type: searchOptions.type
    };
    m = 'entities.getRoots';
    break;
  case 'datasources':
    q = {
      root: 'datasources',
      path: 'data',
      children: true,
      search: searchOptions.search,
      filter: searchOptions.filters,
      group: [
        'country',
        'language'
      ]
    };
    m = 'entities.get';
    break;
  }

  // fill by fake data
  if (document.getElementById('{{include.resultContainer}}').innerHTML === '') {
    fillResults_header__search({
      profiles: {},
      facets: {},
      roots: [1, 2, 3, 4].map(function () {
        return {
          root: '',
          path: '',
          numberOfChildren: 0,
          fields: [
            { name: 'name', value: 'Hello World' },
            { name: 'description', value: 'Hello World is the first program one usually writes when learning a new ' +
                'programming language. Having first been mentioned in Brian Kernighan' },
            { name: 'tags', value: 'hello, world, first, program, programming' }
          ],
          createdAt: '2018-11-11T10:27:38.000Z'
        };
      })
    }, searchOptions, true);
  }

  Mydataspace.connect().then(function () {
    return Mydataspace.request(m, q);
  }).then(function(data) {
    fillResults_header__search(data, searchOptions);
  }, function(err) {
    console.log(err);
  });
}

function showSearch_header__search() {
  if (['{{ lang_prefix }}/search', '{{ lang_prefix }}/datasources'].indexOf(window.location.pathname) === -1) {
    search_header__search_url = window.location.href;
  }

  history.replaceState({ search: document.getElementById('header__search_input').value },
    'Search', search_header__search_pathname + search_getQueryFromSearchString(document.getElementById('header__search_input').value));

  document.getElementById('{{include.resultContainer}}').style.display = 'block';

  if (isAdmin_header__search) {
    document.getElementById('webix_preloaded_header').classList.add('webix_preloaded_header--top');
  } else {
    document.getElementsByTagName('body')[0].classList.add('body_fixed');
    var header = document.getElementById('header');
    if (header) {
      header.style.display = 'none';
    }
    document.getElementsByClassName('smoke')[0].classList.add('smoke--fullscreen');
    document.getElementsByClassName('navbar')[0].classList.add('navbar--fixed');
    var default_main = document.getElementsByClassName('default_main')[0];
    if (default_main) {
      default_main.classList.add('default_main--fullscreen');
    }
    document.getElementById('search').classList.add('search--fullscreen');
    if (document.getElementById('page_footer')) {
      document.getElementById('page_footer').classList.add('footer--fullscreen');
    }
  }

  if (document.getElementById('admin_panel')) {
    document.getElementById('admin_panel').classList.add('admin_panel--fullscreen');
    document.getElementById('no_items').classList.add('no_items--fullscreen');

  }

  startSearch_header__search(document.getElementById('header__search_input').value);
}


//
// Filter suggestions when search input text changed
document.getElementById('header__search_input').addEventListener('keyup', function(event) {

  var url1 = search_header__search_url.split('?')[0];
  var url2 = window.location.href.split('?')[0];

  if (event.keyCode === 27 && url1 !== '' && url1 != url2 && (typeof search_header__search_isFixed === 'undefined' || !search_header__search_isFixed)) {
    closeSearch_header__search();
    document.getElementById('header__search_input').blur();
    history.replaceState({}, '', search_header__search_url);
    document.getElementById('header__search_input').value = '';
    return;
  }
  history.replaceState({}, '', search_header__search_pathname + search_getQueryFromSearchString(document.getElementById('header__search_input').value));
  startSearch_header__search(document.getElementById('header__search_input').value);
}, false);

if (isAdmin_header__search) {
  window.addEventListener('hashchange', function() {
    closeSearch_header__search();
  }, false);
}