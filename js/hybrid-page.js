/**
 *
 * @param webix_with_header
 */
function initHybridPage(webix_with_header, refine_url) {

  $(function() {
    // Get Started large button
    $('#sub_footer__button').popover({
      placement: 'top',
      html : true,
      trigger: 'focus',
      content: function() {
        return $('#signin_popover').html();
      }
    });
    $('#import_data_modal').on('show.bs.modal', function () {
      document.getElementById('import_data_modal__refine__waiting_cloak').style.display = 'block';

      document.getElementById('import_data_modal__refine').src = refine_url;
      setTimeout(function() {
        document.getElementById('import_data_modal__refine__waiting_cloak').style.display = 'none';
      }, 3000);
    });

  });

  window.addEventListener('message', function(e) {
    if (e.data.message === 'openRefineImport') {
      switch (e.data.stage) {
        case 'getTargetEntity':
          e.source.postMessage({
            message: 'targetEntity',
            openRefineImportEntity: typeof openRefineImportEntity === 'undefined' ? {} : openRefineImportEntity

          }, '*');
          if (typeof openRefineImportEntity !== 'undefined') {
            delete openRefineImportEntity;
          }
          break;
        case 'finished':
          $('#import_data_modal').modal('hide');
          UI.entityTree.refresh();
          if (typeof openRefineImportEntity !== 'undefined') {
            delete openRefineImportEntity;
          }
          //if (Identity.dataFromId(UI.entityTree.getCurrentId).root !== e.data.root) {
          //  UI.entityTree.setCurrentId(Identity.idFromData({ root: e.data.root, path: '' }));
          //} else {
          //  UI.entityList.refreshData();
          //}
          break;
        case 'created': // Open Refine finished his work
          document.getElementById('import_data_modal__refine').src =
            '/finish-import.html?id=' + e.data.id +
            '&projectID=' + e.data.projectID +
            '&header=' + encodeURIComponent(JSON.stringify(e.data.header));
          break;
      }
    }
  });

  $(window).on('hashchange', function() {
    var isEmptyHash = window.location.hash == null ||
      window.location.hash === '' ||
      window.location.hash === '#';

    if (isEmptyPathnameIgnoreLanguage(window.location.pathname) && !isEmptyHash && document.getElementById('webix').style.display === 'none') {
      document.getElementById('bootstrap').style.display = 'none';
      document.getElementById('webix').style.display = 'block';
    }
  });

  //
  // Init MyDataSpace
  //

  webix.codebase = "/vendor/";

  Mydataspace.authProviders.facebook.title = STRINGS.CONNECT_TO_FACEBOOK;
  Mydataspace.authProviders.google.title = STRINGS.CONNECT_TO_GOOGLE;
  UI.render(webix_with_header);
  Mydataspace.connect().then(function() {
    Mydataspace.on('login', function() {
      UI.initConnection(webix_with_header);
      if (!isValidJWT(localStorage.getItem('authToken'))) {
        UI.pages.refreshPage('data', true);
      }
    });
  });
}
