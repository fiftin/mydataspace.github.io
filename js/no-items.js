
function no_items__selectTemplate(root, suffix) {
  if (!suffix) {
    suffix = '';
  }

  Mydataspace.entities.get({
    root: root,
    path: ''
  }).then(function (data) {
    var avatar = MDSCommon.findValueByName(data.fields, 'avatar');
    var name = MDSCommon.findValueByName(data.fields, 'name');
    var description = MDSCommon.findValueByName(data.fields, 'description');

    var tags = (MDSCommon.findValueByName(data.fields, 'tags') || '').split(' ').filter(function (tag) {
      return tag != null && tag !== '';
    }).map(function (tag) {
      return '<span class="view__tag view__tag--no-interactive">' + tag + '</span>';
    }).join(' ');

    $('#no_items__template_img' + suffix).attr('src', 'https://cdn.web20site.com/avatars/sm/' + avatar + '.png');
    $('#no_items__template_title' + suffix).text(name);
    $('#no_items__template_tags' + suffix).html(tags);
    if (!description) {
      $('#no_items__template_description' + suffix).hide();
    } else {
      $('#no_items__template_description' + suffix).show();
    }
    $('#no_items__template_description' + suffix).text(description);
    $('#no_items__template_wrap' + suffix).data('root', data.root);
    $('#no_items_select_template_modal').modal('hide');
  });
}


function no_items__initTemplates(suffix) {
  if (!suffix) {
    suffix = '';
  }

  Mydataspace.request('entities.getRoots', {
    type: 't'
  }).then(function (data) {
    var rootsHtml = data.roots.map(function (root) {

      var tags = (MDSCommon.findValueByName(root.fields, 'tags') || '').split(' ').filter(function (tag) {
        return tag != null && tag !== '';
      }).map(function (tag) {
        return '<span class="view__tag view__tag--no-interactive">' + tag + '</span>';
      }).join(' ');

      var description = MDSCommon.findValueByName(root.fields, 'description');

      return '<div onclick="no_items__selectTemplate(\'' + root.root + '\', \'' + suffix + '\')" class="block snippet snippet--line snippet--line--no-padding-bottom clearfix">' +
        '<div class="snippet__overview snippet__overview--no-margin">' +
        '  <img class="snippet__image" src="https://cdn.web20site.com/avatars/sm/' + MDSCommon.findValueByName(root.fields, 'avatar') + '.png" />' +
        '  <div class="snippet__info">' +
        '    <div class="snippet__title">' + MDSCommon.findValueByName(root.fields, 'name') + '</div>' +
        '    <div class="snippet__tags">' + tags + '</div>' +
        '  </div>' +
        '</div>' +
        (description ? '<div class="snippet__description">' + description + '</div>' : '') +
        '</div>';
    });
    $('#no_items_select_template_modal_templates').html(rootsHtml.join('\n'));
    $('#no_items_select_template_modal').modal('show');
  }, function (err) {

  });
}


function no_items__createNewWebsite() {

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

  var sourceRoot = $('#no_items__template_wrap').data('root');

  var $createButton = $('#no_items__create__button');
  $createButton.attr('disabled', true);
  $createButton.find('.fa-cog').removeClass('hidden').addClass('fa-spin');

  Mydataspace.request('entities.create', {
    root: root,
    path: '',
    sourceRoot: sourceRoot,
    sourcePath: sourceRoot ? '' : undefined,
    fields: []
  }).then(function () {
    return Mydataspace.request('apps.create', {
      name: root,
      url: 'https://' + root + SITE_SUPER_DOMAIN,
      description: 'Automatically created application for website ' + root + SITE_SUPER_DOMAIN + '. Please do not change it'
    });
  }).then(function (app) {
    return Mydataspace.request('entities.change', {
      root: root,
      path: 'website/js',
      fields: [{
        name: 'client.js',
        value: '//\n' +
        '// This file generated automatically. Please do not edit it.\n' +
        '//\n' +
        '\n' +
        'var MDSWebsite = new MDSClient({\n' +
        '  clientId: \'' + app.clientId + '\',\n' +
        '  // You can add your own options here.\n' +
        '}).getRoot(\'' + root + '\');',
        type: 'j'
      }]
    })
  //}).then(function () {
  //  document.getElementById('no_items__new_root_input').value = '';
  //  var url = 'https://wizard.myda.space/' + root + '/root.html';
  //  return $.ajax({ url: url, type: 'HEAD' });
  }).then(function () {
    // $('#wizard_modal__frame').attr('src', url);
    // $('#wizard_modal').modal('show');
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
    var url = 'https://wizard.myda.space/' + root + '/root.html';
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
