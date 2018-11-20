/**
 *
 * @param options
 */
function initRootPage(options) {

  var API_URL = options.api_url;
  var CDN_URL = options.cdn_url;
  var SEARCH_FOUND_PREFIX = options.search_found_prefix;
  var SEARCH_FOUND_ITEMS_SUFFIX = options.search_found_items_suffix;
  var SEARCH_NO_RESULTS = options.search_no_results;
  var language = options.language;
  var lang = getURLLanguagePrefix(language);
  var DATA = getRequestFromLocation(window.location);
  var URL_TABS = {
    views: 'VIEW_TAB_VIEW_LABEL',
    comments: 'VIEW_TAB_COMMENTS_LABEL',
    data: 'VIEW_TAB_EXPLORE_LABEL',
    '': 'VIEW_TAB_README_LABEL'
  };
  var TABS = {
    VIEW_TAB_README_LABEL: 'root__about',
    VIEW_TAB_VIEW_LABEL: 'root__looks',
    VIEW_TAB_COMMENTS_LABEL: 'root__comments',
    VIEW_TAB_EXPLORE_LABEL: ''
  };


  if (['search', 'datasources'].indexOf(DATA.root) >= 0) {
    openSearch_header__search(null, true);
    return;
  }

  var md = new Remarkable({
    html: true,
    xhtmlOut: false,
    breaks: false,
    langPrefix: 'language-',
    linkify: false,
    typographer: false,
    quotes: '“”‘’',
    highlight: function (/*str, lang*/) {
      return '';
    }
  });

  loadEntityData('get', MDSCommon.extend(DATA, {children: ['views', 'comments', 'likes']}), function (result) {
    setRootView(result);
  }, function () {
    $.ajax({url: '/fragments/404.html', method: 'get'}).then(function (data) {
      $('#root').html(data);
    });
  });

  Mydataspace.on('entities.change.res', function (data) {
    if (/^views\/[^\/]*$/.test(data.path)) {
      var preview = getLookPreviewNode(data.path);
      if (!preview) {
        throw new Error('Changed look is not exists');
      }

      $(preview).replaceWith(RootHTMLGen.getUnwrappedLookPreviewHTML(data, true));
      preview = getLookPreviewNode(data.path);
      $(preview).data('look-data', data);

      switch (MDSCommon.findValueByName(data.fields, 'type')) {
        case 'codepen':
          var codepenScript = document.createElement('script');
          codepenScript.setAttribute('src', 'https://assets.codepen.io/assets/embed/ei.js');
          preview.appendChild(codepenScript);
          break;
        case 'table':
          ;
          break;
        case 'list':
          ;
          break;
      }
      if (currentLook && currentLook.path === data.path) {
        setLook(data);
      }
    }
  });

  function loadEntityData(method, requestData, success, fail) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === XMLHttpRequest.DONE) {
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
        var v = '';
        if (Array.isArray(requestData[k])) {
          for (var i = 0; i < requestData[k].length; i++) {
            if (v !== '') {
              v += '&';
            }
            v += k + '[' + i + ']=' + requestData[k][i];
          }
        } else {
          v = k + '=' + requestData[k];
        }
        query += v;
      }
    }
    xmlhttp.open('GET', API_URL + '/v1/entities/' + method + '?' + query, true);
    xmlhttp.send();
  }

  function loadComments() {
    var $list = $('#root__comments__list');
    Mydataspace.request('entities.get', MDSCommon.extend(DATA, {
      children: true,
      path: 'comments',
      limit: 30,
      offset: $list.find('>.view__comment').length,
      orderChildrenBy: '$createdAt DESC'
    })).then(function (data) {
      var html = '';
      for (var i in data.children) {
        html = RootHTMLGen.getCommentHTML(data.children[i]) + html;
      }
      $list.prepend(html);

      $('#root__comments_show_older').css('display', data.children.length < 30 ? 'none' : 'inline');

      if ($list.html() === '') {
        document.getElementById('root__comments__empty').style.display = 'block';
        $list.hide();
      } else {
        $list.show();
      }
    });
  }

  function postComment() {
    if (!Mydataspace.isLoggedIn()) {
      $('#signin_modal').modal('show');
      return;
    }

    var $newComment = $('#root__new_comment');
    var $textarea = $newComment.find('.new_comment__textarea');
    var $button = $newComment.find('.new_comment__button');

    if ($textarea.val().trim() === '') {
      $textarea.addClass('new_comment__textarea--error');
      $textarea.focus();
      return;
    }

    $button.prop('disabled', true);
    $textarea.prop('disabled', true);

    Mydataspace.request('entities.create', {
      root: DATA.root,
      path: 'comments/' + MDSCommon.guid(),
      fields: [
        {
          name: 'text',
          value: $textarea.val().trim(),
          type: 's'
        }
      ]
    }, function () {
      $textarea.val('');
      $button.prop('disabled', false);
      $textarea.prop('disabled', false);
      $textarea.focus();
      updateCommentFormTextareaHeight();
    }, function (err) {
      $button.prop('disabled', false);
      $textarea.prop('disabled', false);
      console.log(err);
    });
  }

  function updateCommentFormTextareaHeight() {
    var textarea = document.getElementById('root__comments__new_comment_textarea');
    setTimeout(function () {
      textarea.style.cssText = 'height: auto; padding: 0';
      textarea.style.cssText = 'height: ' + textarea.scrollHeight + 'px';
    }, 0);
  }

  function initNewCommentForm() {
    var $newComment = $('#root__new_comment');
    var $textarea = $newComment.find('.new_comment__textarea');
    $textarea.on('focus', function () {
      $(this).parent().parent().find('.new_comment__button').show();
      $(this).addClass('new_comment__textarea--extended');
      if ($textarea.hasClass('new_comment__textarea--error')) {
        setTimeout(function () {
          $textarea.removeClass('new_comment__textarea--error')
        }, 200);
      }
    });
    $textarea.on('keydown', function (event) {
      if (event.ctrlKey && event.keyCode === 13) {
        postComment();
      }
      updateCommentFormTextareaHeight();
    });
    $newComment.find('.new_comment__button').on('click', function () {
      postComment();
    });
  }

  function initCounters() {
    $('#root__counters_comments').click(function () {
      selectTab('VIEW_TAB_COMMENTS_LABEL');
    });

    var likesElem = document.getElementById('root__counters_likes');
    likesElem.addEventListener('click', function () {
      if (!Mydataspace.isLoggedIn()) {
        $('#signin_modal').modal('show');
        return;
      }

      if (document.getElementById('root__counters_likes_icon').className === 'fa like_icon_animation fa-heart') {
        return;
      }

      document.getElementById('root__counters_likes_icon').className = 'fa like_icon_animation fa-heart';

      if (MDSCommon.isPresent(likesElem.getAttribute('data-like-path'))) {
        Mydataspace.entities.request('entities.delete', MDSCommon.extend(DATA, {
          path: likesElem.getAttribute('data-like-path')
        })).then(function () {
          document.getElementById('root__counters_likes_icon').className = 'fa fa-heart';
        }, function (err) {
          document.getElementById('root__counters_likes_icon').className = 'fa fa-heart';
          console.log(err);
        });
      } else {
        Mydataspace.entities.request('entities.create', MDSCommon.extend(DATA, {
          path: 'likes/' + MDSCommon.guid()
        })).then(function () {
          document.getElementById('root__counters_likes_icon').className = 'fa fa-heart';
        }, function (err) {
          document.getElementById('root__counters_likes_icon').className = 'fa fa-heart';
          console.log(err);
        });
      }
    });
  }

  function selectTab(tabID, itemID) {
    if (itemID) {
      showWaitingCloak();
    }
    var tab = document.getElementById(tabID);
    var el;
    for (var tid in TABS) {
      document.getElementById(tid).classList.remove('view__tab--active');
      el = document.getElementById(TABS[tid]);
      if (el) {
        el.style.display = 'none';
      }
    }
    tab.classList.add('view__tab--active');

    el = document.getElementById(TABS[tabID]);
    if (el) {
      el.style.display = 'block';
    }

    document.getElementById('webix').style.display = 'none';
    switch (tabID) {
      case 'VIEW_TAB_COMMENTS_LABEL':
        document.getElementById('root__new_look').classList.add('hidden');
        loadComments();
        break;
      case 'VIEW_TAB_README_LABEL':
        //document.getElementById('root__data_link').classList.remove('hidden');
        document.getElementById('root__new_look').classList.add('hidden');
        break;
      case 'VIEW_TAB_EXPLORE_LABEL':
        document.getElementById('bootstrap').style.display = 'block';
        document.getElementById('webix').style.display = 'block';
        if (!UI.entityTree.getCurrentId()) {
          UI.entityTree.refresh();
        }
        break;
    }

    if (!itemID) {
      for (var u in URL_TABS) {
        if (URL_TABS[u] === tabID) {
          var url = lang + 'skeletons/' + DATA.root + '/' + u + window.location.search;
          history.pushState({}, '', url);
          break;
        }
      }
    }
  }

  function initTabs() {
    for (var tabID in TABS) {
      (function (tabID) {
        var tab = document.getElementById(tabID);
        tab.addEventListener('click', function (event) {
          event.preventDefault();
          selectTab(tabID);
        });
      })(tabID);
    }
  }


  /**
   * Render root page for received data.
   * @param data root's data.
   */
  function setRootView(data) {
    var view = document.getElementById('root');
    if (view.innerHTML === '%%root-page.html%%') {
      view.innerHTML = '';
    }
    (view.innerHTML === '' ? $.ajax({
      url: '/fragments/root-page.html',
      method: 'get'
    }) : Promise.resolve(view.innerHTML)).then(function (html) {
      var websiteURL = MDSCommon.findValueByName(data.fields, 'websiteURL');
      var description = MDSCommon.findValueByName(data.fields, 'description');
      var readme = MDSCommon.findValueByName(data.fields, 'readme');
      var ava = MDSCommon.findValueByName(data.fields, 'avatar');

      if (view.innerHTML === '') {
        view.innerHTML = html;
      }

      if (MDSCommon.isPresent(ava)) {
        ava = Mydataspace.options.cdnURL + '/avatars/sm/' + ava + '.png';
      }
      document.getElementById('root__overview_image').src = ava || '/images/icons/root.svg';
      var title = MDSCommon.findValueByName(data.fields, 'name') || MDSCommon.getPathName(data.root);
      document.getElementById('root__title').innerText = title;
      document.title = title;

      document.getElementById('root__version').innerText = '#' +
        (MDSCommon.findValueByName(data.fields, '$version') || 0);

      $('#root__version').tooltip({placement: 'bottom', container: 'body'});


      var tags = (MDSCommon.findValueByName(data.fields, 'tags') || '').split(' ').filter(function (tag) {
        return tag != null && tag !== '';
      }).map(function (tag) {
        return '<a class="view__tag" href="/search?q=%23' + tag + '" onclick="openSearch_header__search(\'' + tag + '\'); return false;">' + tag + '</a>';
      }).join(' ');


      var languageAbbr = MDSCommon.findValueByName(data.fields, 'language');
      var countryAbbr = MDSCommon.findValueByName(data.fields, 'country');
      var category = MDSCommon.findValueByName(data.fields, 'category');
      var country = COUNTRIES[countryAbbr];
      var language = COUNTRIES[languageAbbr];

      if (category) {
        tags = '<span class="view__tag" onclick="openSearch_header__search(\'#cat:' + category + '\'); return false;"><i class="view__tag_icon fa fa-' + CATEGORY_ICONS[category] + '"></i><span>' + tr$('categories.' + category) + '</span></span> ' + tags;
      }

      if (country && (languageAbbr === countryAbbr || (language.same || []).indexOf(countryAbbr) != -1)) {
        tags = '<span class="view__tag view__tag--flag view__tag--multi_link">' +
          '<img class="view__tag_icon view__tag_icon--flag view__tag_icon--flag--lg" src="/images/square_flags/' + country.name + '.svg" />' +
          '<span class="view__tag_link" onclick="openSearch_header__search(\'#lang:' + languageAbbr + '\'); return false;">' +
          tr$('languagesShort.' + languageAbbr) + '</span> / ' +
          '<span class="view__tag_link" onclick="openSearch_header__search(\'#ctry:' + countryAbbr + '\'); return false;">' +
          tr$('countries.' + countryAbbr) + '</span></span> ' + tags;
      } else {
        if (country) {
          tags = '<span class="view__tag view__tag--flag" onclick="openSearch_header__search(\'#ctry:' + countryAbbr + '\'); return false;">' +
            '<img class="view__tag_icon view__tag_icon--flag view__tag_icon--flag--lg" src="/images/square_flags/' + country.name + '.svg" />' +
            tr$('countries.' + countryAbbr) + '</span> ' + tags;
        }

        if (language) {
          tags = '<span class="view__tag view__tag--flag" onclick="openSearch_header__search(\'#lang:' + languageAbbr + '\'); return false;">' +
            '<img class="view__tag_icon view__tag_icon--flag view__tag_icon--flag--lg" src="/images/square_flags/' + language.name + '.svg" />' +
            tr$('languagesShort.' + languageAbbr) + '</span> ' + tags;
        }
      }

      if (MDSCommon.findValueByName(data.fields, '$type') === 't') {
        tags = '<span class="view__tag" onclick="openSearch_header__search(\'#type:template\'); return false;"><i class="view__tag_icon fa fa-copy"></i><span>' + tr$('types.template') + '</span></span> ' + tags;
      }

      var license = MDSCommon.findValueByName(data.fields, 'license');
      if (MDSCommon.isPresent(license)) {
        var licenseOrig = license;
        license = getLicenseWithoutVersion(license);
        if (license === 'none') {
          tags = '<a href="/search?q=%23license:' + license + '" class="view__tag view__tag--license-none" onclick="openSearch_header__search(\'#license:' + license + '\'); return false;">' + tr$('licenses.none') + '</a> ' + tags;
        } else {
          tags = '<a href="/search?q=%23license:' + license + '" class="view__tag view__tag--license' +
            ' view__tag--license--' + license +
            ' view__tag--license--' + license + '--' + (getCurrentLanguage() || 'en').toLowerCase() +
            '" onclick="openSearch_header__search(\'#license:' + license + '\'); return false;"' +
            ' data-license="' + licenseOrig + '"' +
            ' data-root="' + data.root + '"' +
            '>&nbsp;</a> ' + tags;
        }
      }

      if (MDSCommon.isPresent(tags)) {
        document.getElementById('root__tags').innerHTML = tags;
        createLicenseDrop({
          selector: '#root__tags .view__tag--license'
        });
      } else {
        document.getElementById('root__tags').style.display = 'none';
      }


      if (tags && websiteURL) {
        document.getElementsByClassName('view__overview_image_wrap')[0].classList.add('view__overview_image_wrap--large');
        document.getElementById('root__overview_image').classList.add('view__overview_image--large');
      } else if (tags || websiteURL) {
        document.getElementsByClassName('view__overview_image_wrap')[0].classList.add('view__overview_image_wrap--medium');
        document.getElementById('root__overview_image').classList.add('view__overview_image--medium');
      }

      if (MDSCommon.isBlank(websiteURL)) {
        document.getElementById('root__websiteURL').style.display = 'none';
      } else {
        document.getElementById('root__websiteURL').style.display = 'inline';
        document.getElementById('root__websiteURL').innerText = websiteURL;
        document.getElementById('root__websiteURL').href = websiteURL;
      }

      if (MDSCommon.isBlank(description)) {
        if (MDSCommon.isBlank(websiteURL)) {
          document.getElementById('root__description').innerHTML = '<i>' +
            STRINGS.no_description_provided +
            '</i>';
        }
      } else {
        document.getElementById('root__description').innerText = description;
      }

      if (MDSCommon.isBlank(readme)) {
        document.getElementById('root__readme').style.display = 'none';
      } else {
        document.getElementById('root__readme').style.display = 'block';
      }
      document.getElementById('root__readme').innerHTML = md.render(readme);

      //document.getElementById('root__tabs').classList.remove('hidden');


      for (var i in data.children) {
        var child = data.children[i];
        switch (child.path) {
          case 'views':
            document.getElementById('root__tabs_views_count').innerText = child.numberOfChildren;
            break;
        }
      }

      document.getElementById('root__counters_likes_count').innerText = MDSCommon.findValueByName(data.fields, '$likes');
      document.getElementById('root__counters_comments_count').innerText = MDSCommon.findValueByName(data.fields, '$comments');
      document.getElementById('root__tabs_comments_count').innerText = MDSCommon.findValueByName(data.fields, '$comments');

      //data.profile = {
      //  name: 'Denis',
      //  username: 'denis',
      //  about: 'Hello, World!',
      //};

      if (MDSCommon.isBlank(data.profile)) {
        document.getElementById('root__side_panel').style.display = 'none';
        document.getElementById('root__about_content').style.width = '100%';
      } else if (document.getElementById('root__user')) {
        document.getElementById('root__user_name').innerText = data.profile.name;
        if (data.profile.verified) {
          document.getElementById('root__user_verified').style.display = 'block';
          document.getElementById('root__user_name').classList.add('view__user_name--verified');
        }
        document.getElementById('root__user_username').innerText = '@' + data.profile.username;
        if (data.profile.about) {
          document.getElementById('root__user_about').innerText = data.profile.about;
        } else {
          document.getElementById('root__user_about').style.display = 'none';
        }
        var userAvatar = MDSCommon.isPresent(data.profile.avatar) ? 'https://cdn.web20site.com/avatars/lg/' + data.profile.avatar + '.png' : '/images/no_avatar.svg';
        var userCover = MDSCommon.isPresent(data.profile.cover) ? 'https://cdn.web20site.com/images/md/' + data.profile.avatar + '.png' : '/images/default_cover_sm.jpg';
        document.getElementById('root__user_avatar').src = userAvatar;
        document.getElementById('root__user_cover').style.backgroundImage = 'url("' + userCover + '")';
      }

//        document.getElementById('root__date').innerText = MDSCommon.humanizeDate(data.createdAt);

      initCounters();

      initTabs();

      initNewCommentForm();

      $('#root__comments_show_older').on('click', loadComments);

      $('#root__comments__list').on('click', '.view__comment__delete', function () {
        var commentPath = this.parentNode.getAttribute('data-comment-path');
        $(this).find('i').addClass('fa-spin');

        Mydataspace.request('entities.delete', MDSCommon.extend(DATA, {
          path: commentPath
        }, function () {
          $(this).find('i').removeClass('fa-spin');
        }, function (err) {
          $(this).find('i').removeClass('fa-spin');
          console.log(err);
        }));
      });

      document.getElementById('root__version').addEventListener('click', function () {
        loadEntityData('getRootVersions', DATA, function (result) {
          var table = document.getElementById('change_root_version_modal__table').tBodies[0];

          for (var i = table.rows.length - 1; i >= 0; i--) {
            table.deleteRow(i);
          }

          for (var i = 0; i < result.versions.length; i++) {
            var row = table.insertRow();
            var version = result.versions[i];
            var number = row.insertCell(0);
            var createdAt = row.insertCell(1);
            var description = row.insertCell(2);
            var numberLink = document.createElement('a');
            var createdAtLink = document.createElement('a');
            var descriptionLink = document.createElement('a');

            numberLink.href = 'https://mydataspace.org/' + DATA.root + '?v=' + version.version;
            createdAtLink.href = 'https://mydataspace.org/' + DATA.root + '?v=' + version.version;
            descriptionLink.href = 'https://mydataspace.org/' + DATA.root + '?v=' + version.version;

            numberLink.appendChild(document.createTextNode(version.version));
            createdAtLink.appendChild(document.createTextNode(version.createdAt));
            descriptionLink.appendChild(document.createTextNode(version.versionDescription || ''));

            number.appendChild(numberLink);
            createdAt.appendChild(createdAtLink);
            description.appendChild(descriptionLink);
          }
        }, function (err) {
        });
      });

      var pathnameParts = getPathnameParts(location.pathname);
      if (pathnameParts[1]) {
        selectTab(URL_TABS[pathnameParts[1]], pathnameParts[2]);
      }
    });

    var datasource = MDSCommon.findValueByName(data.fields, 'datasource');
    if (datasource) {
      Mydataspace.request('entities.get', {
        root: 'datasources',
        path: 'data/' + datasource
      }).then(function (datasourceData) {
        $('#root__datasource')
          .removeClass('hidden')
          .attr('onclick', 'openSearch_header__search(\'#src:' + datasource + ' \');');
//            .click(function() { openSearch_header__search('#src:' + datasource) });

        $('#root__datasource_icon').attr('src', CDN_URL + '/avatars/md/' + MDSCommon.findValueByName(datasourceData.fields, 'avatar') + '.png');
        $('#root__datasource_title').text(MDSCommon.findValueByName(datasourceData.fields, 'name'));
        $('#root__datasource_name')
          .attr('href', 'http://' + MDSCommon.getPathName(datasourceData.path))
          .text(MDSCommon.getPathName(datasourceData.path))
      });
    }

  }

  //
  // Likes & comments
  //

  Mydataspace.emit('entities.subscribe', MDSCommon.extend(DATA, {
    path: 'comments/*'
  }));

  Mydataspace.emit('entities.subscribe', MDSCommon.extend(DATA, {
    path: 'likes/*'
  }));

  Mydataspace.emit('entities.subscribe', MDSCommon.extend(DATA, {
    path: 'views/*'
  }));

  Mydataspace.on('entities.create.res', function (data) {
    if (/^likes\//.test(data.path)) {
      document.getElementById('root__counters_likes_count').innerText =
        parseInt(document.getElementById('root__counters_likes_count').innerText) + 1;
      if (data.mine) {
        setMyLike(data);
      }
    } else if (/^comments\//.test(data.path)) {
      document.getElementById('root__tabs_comments_count').innerText =
        parseInt(document.getElementById('root__tabs_comments_count').innerText) + 1;
      document.getElementById('root__counters_comments_count').innerText =
        parseInt(document.getElementById('root__counters_comments_count').innerText) + 1;

      // if comment is not exists already
      if (document.getElementById(data.path) == null) {
        if (document.getElementById('root__comments').style.display === 'block') {
          var commentHTML = RootHTMLGen.getCommentHTML(data);
          $('#root__comments__list').append(commentHTML);
          document.getElementById('root__comments__empty').style.display = 'none';
        }
      }
    } else if (/^views\/[^\/]*$/.test(data.path)) {
      $('#root__looks__previews').append(RootHTMLGen.getLookPreviewHTML(data));
      var preview = getLookPreviewNode(data.path);
      switch (MDSCommon.findValueByName(data.fields, 'type')) {
        case 'codepen':
          var codepenScript = document.createElement('script');
          codepenScript.setAttribute('src', 'https://assets.codepen.io/assets/embed/ei.js');
          preview.appendChild(codepenScript);
          break;
        case 'table':
          break;
      }
      $(preview).data('look-data', data);
      var viewsCount = parseInt(document.getElementById('root__tabs_views_count').innerText);
      document.getElementById('root__tabs_views_count').innerText = viewsCount + 1;
      if (viewsCount === 0) {
        document.getElementById('root__looks__empty').style.display = 'none';
      }
    }
  });

  Mydataspace.on('entities.delete.res', function (data) {
    if (/^likes\//.test(data.path)) {
      document.getElementById('root__counters_likes_count').innerText =
        parseInt(document.getElementById('root__counters_likes_count').innerText) - 1;
      resetMyLike(data);
    } else if (/^comments\//.test(data.path)) {
      document.getElementById('root__tabs_comments_count').innerText =
        parseInt(document.getElementById('root__tabs_comments_count').innerText) - 1;
      document.getElementById('root__counters_comments_count').innerText =
        parseInt(document.getElementById('root__counters_comments_count').innerText) - 1;

      var comment = document.getElementById(data.path);
      if (comment != null) {
        comment.parentNode.removeChild(comment);
        if (document.getElementById('root__comments__list').children.length === 0) {
          document.getElementById('root__comments__empty').style.display = 'block';
        }
      }
    } else if (/^views\/[^\/]*$/.test(data.path)) {
      $(getLookPreviewNode(data.path)).parent().remove();

      var viewsCount = parseInt(document.getElementById('root__tabs_views_count').innerText);
      document.getElementById('root__tabs_views_count').innerText = viewsCount - 1;
      if (viewsCount <= 1) {
        document.getElementById('root__looks__empty').style.display = 'block';
        document.getElementById('root__looks__content_wrap').style.display = 'none';
        $('body').css('overflow', '');
      } else {
        if (currentLook && currentLook.path === data.path) {
          selectLook();
        }
      }
    }
  });

  function setMyLike(data) {
    document.getElementById('root__counters_likes').setAttribute('data-like-path', data.path);
    document.getElementById('root__counters_likes').classList.add('root_counter--active');
  }

  function resetMyLike(data) {
    var path = document.getElementById('root__counters_likes').getAttribute('data-like-path');
    if (MDSCommon.isPresent(path) && (MDSCommon.isBlank(data) || data.path === path)) {
      document.getElementById('root__counters_likes').removeAttribute('data-like-path');
      document.getElementById('root__counters_likes').classList.remove('root_counter--active');
    }
  }

  function requestMyLike() {
    Mydataspace.request('entities.getMyChildren', MDSCommon.extend(DATA, {path: 'likes'})).then(function (result) {
      var children = result.children;
      if (children.length > 0) {
        setMyLike(children[0]);
      } else {
        resetMyLike();
      }
    });
  }

  $('#look_modal__table_reset').click(function () {
    refreshLookTableColumns();
  });
  $('#look_modal__table_remove').click(function () {
    $$('look_modal__table').remove($$('look_modal__table').getSelectedId(true));
  });
  $('#look_modal__table_add').click(function () {
    var id = $$('look_modal__table').add({value: '', title: '', width: 200});
    $$('look_modal__table').editCell(id, 'value');
  });
}

function initRootViewEditor(options) {
  var $look_modal = $('#look_modal');

  var TYPES = ['codepen', 'table', 'list'];

  TYPES.forEach(function(type) {
    $('#look_modal__' + type + '_tab_link').click(function() {
      TYPES.forEach(function(otherType) {
        $('#look_modal__' + otherType + '_tab').removeClass('active');
        $('#look_modal__' + otherType + '_wrap').addClass('hidden');
      });
      $look_modal.data('look-type', type);
      $('#look_modal__' + type + '_tab').addClass('active');
      $('#look_modal__' + type + '_wrap').removeClass('hidden');
      $('#look_modal__' + type).focus();
    });
  });

  $look_modal.on('show.bs.modal', function () {
    $('#look_modal__title_err').text('');
    $('#look_modal__codepen_err').text('');

    $('#look_modal__title').val('');
    $('#look_modal__description').val('');
    $('#look_modal__codepen').val('');
    $('#look_modal__table_path').val('');

    $$('look_modal__table').clearAll();

    $('#look_modal__tabs').children().removeClass('active');
    $('#look_modal__type_forms').children().addClass('hidden');

    $look_modal.data('look-type', null);
    $('#look_modal__locker').addClass('hidden');
  });

  $look_modal.on('shown.bs.modal', function () {
    $('#look_modal__title').focus();
  });

  webix.ui({
    view: 'datatable',
    id: 'look_modal__table',
    container: 'look_modal__table_webix',
    columns:[
      { id: 'value', header: options.table.column_value, width: 200, editor: 'text' },
      { id: 'title', header: options.table.column_title, width: 345 - 17, editor: 'text' },
      { id: 'width', header: options.table.column_width, hidden: true, editor: 'int' }
    ],
    height: 200,
    select: 'multiselect',
    headerRowHeight: 30,
    autowidth: true,
    drag: true,
    scrollX: false,
    editable: true,
    editaction: 'dblclick'
  });
}