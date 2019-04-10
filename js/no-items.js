function no_items__getRootData() {
  return {
    root: 'root',
    path: '',
    fields: [
      { name: 'name', value: 'Empty Website' },
      { name: 'description', value: 'Creating website from scratch' }
    ]
  }
}

function no_items__selectTemplate(root, suffix) {
  if (!suffix) {
    suffix = '';
  }
  (root === 'root' ? Promise.resolve(no_items__getRootData()) : Mydataspace.entities.get({
    root: root,
    path: ''
  })).then(function (data) {
    var avatar = MDSCommon.findValueByName(data.fields, 'avatar');
    var description = MDSCommon.findValueByName(data.fields, 'description');

    var imgElem = document.getElementById('no_items__template_img' + suffix);
    var titleElem = document.getElementById('no_items__template_title' + suffix);
    var descriptionElem = document.getElementById('no_items__template_description' + suffix);

    imgElem.src = avatar ? 'https://cdn.web20site.com/avatars/sm/' + avatar + '.png' : '/images/icons/root.svg';
    titleElem.innerText = MDSCommon.findValueByName(data.fields, 'name') || data.root;

    if (description) {
      descriptionElem.innerHTML = description;
      descriptionElem.style.display = 'block';
    } else {
      descriptionElem.style.display = 'none';
    }

    $('#no_items__template_wrap' + suffix).data('root', data.root);
    $('#no_items_select_template_modal').modal('hide');

    document.getElementById('no_items__new_root_input').focus();
  });
}

/**
 * Fill New website template list.
 * @param {string} [suffix] Suffix for all element IDs used inside this method.
 */
function no_items__initTemplates(suffix) {
  if (!suffix) {
    suffix = '';
  }

  Mydataspace.request('entities.getRoots', {
    type: 't',
    filter: {
      language: '',
      datasource: 'official'
    }
  }).then(function (nonLangRoots) {
    return {
      roots: [no_items__getRootData()].concat(nonLangRoots.roots)
    };
  }).then(function (data) {
    var rootsHtml = data.roots.map(function (root) {

      var tags = (MDSCommon.findValueByName(root.fields, 'tags') || '').split(' ').filter(function (tag) {
        return tag != null && tag !== '';
      }).map(function (tag) {
        return '<span class="view__tag view__tag--no-interactive">' + tag + '</span>';
      }).join(' ');

      var description = MDSCommon.findValueByName(root.fields, 'description');

      var avatar = MDSCommon.findValueByName(root.fields, 'avatar');
      if (avatar) {
        avatar = 'https://cdn.web20site.com/avatars/sm/' + MDSCommon.findValueByName(root.fields, 'avatar') + '.png';
      } else {
        avatar = '/images/icons/root.svg';
      }

      return '<div onclick="no_items__selectTemplate(\'' + root.root + '\', \'' + suffix + '\')" class="block snippet snippet--line snippet--line--no-padding-bottom clearfix">' +
        '<div class="snippet__overview snippet__overview--no-margin">' +
          '<img class="snippet__image" src="' + avatar + '" />' +
            '<div class="snippet__info" style="padding-bottom: 0">' +
            '<div class="snippet__title">' + (MDSCommon.findValueByName(root.fields, 'name') || root.root) + '</div>' +
            (description ? '<div class="snippet__description">' + description + '</div>' : '') +
            // (tags ? '<div class="snippet__tags">' + tags + '</div>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    });
    $('#no_items_select_template_modal_templates').html(rootsHtml.join('\n'));
    $('#no_items_select_template_modal').modal('show');
  }, function (err) {

  });
}

function no_items__validateNewWebsiteDomain(ignoreLength, igoreUnique) {
  var notices = document.getElementById('no_items__notice').childNodes[0].childNodes;
  for (var i = 0; i < notices.length; i++) {
    notices[i].classList.remove('no_items__notice--alert');
  }

  var root = document.getElementById('no_items__new_root_input').value;
  if (ignoreLength && MDSCommon.isBlank(root)) {
    return true;
  }

  var ret = true;

  if (root.length < 4 || root.length > 50) {
    if (!ignoreLength) {
      notices[0].classList.add('no_items__notice--alert');
      document.getElementById('no_items__new_root_input').focus();
    }
    ret = false;
  }

  if (!/^[a-zA-Z0-9_-]*$/.test(root)) {
    notices[1].classList.add('no_items__notice--alert');
    ret = false;
  }

  if (!ret) {
    return false;
  }

  if (igoreUnique) {
    return true;
  }

  Mydataspace.request('entities.get', {
    root: root,
    path: ''
  }).then(function () {
    notices[2].classList.add('no_items__notice--alert');
  }, function (err) {});

  return true;
}

function no_items__createNewWebsite() {

  var notices = document.getElementById('no_items__notice').childNodes[0].childNodes;
  var root = document.getElementById('no_items__new_root_input').value;

  if (!no_items__validateNewWebsiteDomain(false, true)) {
    document.getElementById('no_items__new_root_input').focus();
    return;
  }

  var sourceRoot = $('#no_items__template_wrap').data('root');
  if (sourceRoot === 'root') {
    sourceRoot = undefined;
  }

  var $createButton = $('#no_items__create__button');
  $createButton.attr('disabled', true);
  $createButton.find('.fa-cog').removeClass('hidden').addClass('fa-spin');

  Mydataspace.request('entities.create', {
    root: root,
    path: '',
    sourceRoot: sourceRoot,
    sourcePath: sourceRoot ? '' : undefined,
    fields: []
  }).then(function (data) {
    setTimeout(function () {
      if (UI.getMode() === 'cms') {
        return;
      }
      var entityId = Identity.idFromData(MDSCommon.extend(data, {
        path: 'website'
      }));
      UI.entityTree.resolveChildren(entityId);
      $$('entity_tree').open(entityId);

      // UI.showMedia({
      //   type: 'youtube',
      //   value: STRINGS.youtube_intro_video
      // });

    }, 500);
  }).then(function () {
    return Mydataspace.request('apps.create', {
      name: root,
      url: 'https://' + root + SITE_SUPER_DOMAIN,
      description: 'Automatically created application for website ' + root + SITE_SUPER_DOMAIN + '. Please do not change it'
    });
  }).then(function (app) {
    if (!sourceRoot) {
      return;
    }
    return Promise.all([Mydataspace.request('entities.change', {
      root: root,
      path: '',
      fields: [{name: 'name', value: '', type: 's'}]
    }), Mydataspace.request('entities.change', {
      root: root,
      path: 'website/public_html/js',
      fields: [{
        name: 'client.js',
        value: '//\n' +
          '// This file generated automatically. Please do not edit it.\n' +
          '//\n' +
          '\n' +
          'var MDSWebsite = new MDSClient({\n' +
          '  clientId: \'' + app.clientId + '\',\n' +
          '  permission: \'' + root + '\'\n' +
          '}).getRoot(\'' + root + '\');\n' +
          'MDSWebsite.connect();',
        type: 'j'
      }]
    }), Mydataspace.request('entities.create', {
      root: root,
      path: 'processes/' + MDSCommon.guid(),
      fields: [{
        name: 'type',
        value: 'refreshCache',
        type: 's'
      }, {
        name: 'cachePath',
        value: 'cache',
        type: 's'
      }]
    })]);
  }).then(function (res) {
    $createButton.attr('disabled', false);
    $createButton.find('.fa-cog').removeClass('fa-spin').addClass('hidden');
  }, function (err) {
    $createButton.attr('disabled', false);
    $createButton.find('.fa-cog').removeClass('fa-spin').addClass('hidden');
    switch (err.name) {
      case 'SequelizeValidationError':
        notices[1].classList.add('no_items__notice--alert');
        break;
      case 'SequelizeUniqueConstraintError':
        notices[2].classList.add('no_items__notice--alert');
        break;
      default:
    }
    document.getElementById('no_items__new_root_input').focus();
  });
}


function no_items__createNewRoot() {
  var notices = document.getElementById('no_items__notice').childNodes[0].childNodes;
  for (var i = 0; i < notices.length; i++) {
    notices[i].classList.remove('no_items__notice--alert');
  }
  var root = document.getElementById('no_items__new_root_input').value;
  if (MDSCommon.isBlank(root) || root.length < 3 || root.length > 50) {
    notices[0].classList.add('no_items__notice--alert');
    document.getElementById('no_items__new_root_input').focus();
    return;
  }
  Mydataspace.request('entities.create', {
    root: root,
    path: '',
    fields: []
  }, function() {
    document.getElementById('no_items__new_root_input').value = '';
    var url = 'https://wizard.fastlix.com/' + root + '/root.html';
    $.ajax({
      url: url,
      type: 'HEAD'
    }).then(function() {
      $('#wizard_modal__frame').attr('src', url);
      $('#wizard_modal').modal('show');
    });
  }, function(err) {
    switch (err.name) {
      case 'SequelizeValidationError':
        notices[1].classList.add('no_items__notice--alert');
        break;
      case 'SequelizeUniqueConstraintError':
        notices[2].classList.add('no_items__notice--alert');
        break;
      default:
    }
    document.getElementById('no_items__new_root_input').focus();
  });
}


function no_items__new_root_input__onKeyPress(e) {
  if (e.keyCode === 13) {
    no_items__createNewRoot();
    return false;
  }
}
