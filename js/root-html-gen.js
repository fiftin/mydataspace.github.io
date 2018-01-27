var RootHTMLGen = {
  getCommentHTML: function (commentData) {
    var commentText =  (MDSCommon.findValueByName(commentData.fields, 'text') || '').replace(/(?:\r\n|\r|\n)/g, '<br />');
    return '<div class="view__comment" id="' + commentData.path + '" data-comment-path="' + commentData.path + '">' +
      (commentData.mine ? '<span class="view__comment__author">you</span>' : '') +
      '<span class="view__comment__text">' + commentText + '</span>' +
      '<div class="view__comment__footer">' +
      '<span class="view__comment__date">' + MDSCommon.humanizeDate(commentData.createdAt) + ' ago</span>' +
      '</div>' +
      (commentData.mine ? '<div class="view__comment__delete"><i class="fa fa-remove fa-2x"></i></div>' : '') +
      '</div>';
  },

  getUnwrappedLookPreviewHTML: function (data, isActive) {
    switch (MDSCommon.findValueByName(data.fields, 'type')) {
      case 'codepen':
        var codepenParts = MDSCommon.findValueByName(data.fields, 'id').split('/');
        return '<div data-look-path="'+ data.path + '" class="block snippet look_preview' + (isActive ? ' look_preview--active' : '') + '">' +
          '<div class="look_preview__codepen_wrap"><p data-height="402" data-theme-id="0" data-slug-hash="' + codepenParts[1] + '" data-default-tab="result" data-user="'+ codepenParts[0] +'" data-embed-version="2" class="codepen">See the Pen <a href="http://codepen.io/' +  codepenParts[0] + '/pen/' + codepenParts[1] + '/">' + codepenParts[1] + '</a> by MyDataSpace (<a href="http://codepen.io/mydataspace">@mydataspace</a>) on <a href="http://codepen.io">CodePen</a>.</p></div>' +
          '<div class="look_preview__overview look_preview__overview--codepen">' +
          '<div class="look_preview__header"><i class="fa fa-codepen"></i><span class="look_preview__title">' + MDSCommon.findValueByName(data.fields, 'title') + '</span></div>' +
          '</div>' +
          '<div class="look_preview__codepen_locker">' +
          '<div class="look_preview__header"><i class="fa fa-codepen"></i><span class="look_preview__title">' + MDSCommon.findValueByName(data.fields, 'title') + '</span></div>' +
          '<div class="look_preview__description">' + (MDSCommon.findValueByName(data.fields, 'description') || '') + '</div>' +
          '<div class="look_preview__footer">' +
          '<span class="view__comment__date view__comment__date--small">' + tr$('created') + ' ' + MDSCommon.humanizeDate(data.createdAt) + ' ' + tr$('ago') + '</span>' +
          '</div>' +
          '</div>' +
          '</div>';
      case 'table':
      case 'list':
        return '<div data-look-path="'+ data.path + '" class="block snippet look_preview look_preview--table' + (isActive ? ' look_preview--active' : '') + '">' +
          '<div class="look_preview__overview">' +
          '<div class="look_preview__header"><i class="fa fa-list"></i><span class="look_preview__title">' + MDSCommon.findValueByName(data.fields, 'title') + '</span></div>' +
          '<div class="look_preview__description">' + (MDSCommon.findValueByName(data.fields, 'description') || '') + '</div>' +
          '</div>' +
          '<div class="look_preview__footer">' +
          '<span class="view__comment__date view__comment__date--small">' + tr$('created') + ' ' + MDSCommon.humanizeDate(data.createdAt) + ' ' + tr$('ago') + '</span>' +
          '</div>' +
          '<div class="look_preview__codepen_locker">' +
          '<div class="look_preview__header"><i class="fa fa-list"></i><span class="look_preview__title">' + MDSCommon.findValueByName(data.fields, 'title') + '</span></div>' +
          '<div class="look_preview__description">' + (MDSCommon.findValueByName(data.fields, 'description') || '') + '</div>' +
          '</div>' +
          '<div class="look_preview__footer">' +
          '<span class="view__comment__date view__comment__date--small view__comment__date--preview-table">' + tr$('created') + ' ' + MDSCommon.humanizeDate(data.createdAt) + ' ' + tr$('ago') + '</span>' +
          '</div>' +
          '</div>';
        break;
    }
  },

  getLookPreviewHTML: function (data, isActive) {
    return '<div class="col-md-4">' + RootHTMLGen.getUnwrappedLookPreviewHTML(data, isActive) + '</div>';
  },

  getListLookSingleFilter: function (facets, facetsMetaData, filterName) {
    var currentFilters = $('#root__looks__content').data('list-look-filters') || [];
    var selectedFacetName = MDSCommon.findValueByName(currentFilters, filterName);
    return Object.keys(facets).map(function(facetName) {
      var classes = facetName === selectedFacetName ? 'search_filter__item--active' : '';
      var meta = MDSCommon.find(facetsMetaData, function(x) { return MDSCommon.endsWith(x.path, '/' + facetName); });
      return  '<a href="javascript:void(0)" class="search_filter__item ' + classes + ' " data-filter-name="' + filterName + '" data-filter-value="' + facetName + '">' +
        '<span class="search_filter__item_title">' + (meta && MDSCommon.findValueByName(meta.fields, 'title') || facetName) + '</span>' +
        '<span class="search_filter__item_count">' + facets[facetName].count + '</span>' +
        '<i class="search_filter__item_remove fa fa-remove"></i>' +
        '</a>';
    }).join('\n');
  },

  getListLookFilters: function (filters, filtersMetaData) {
    return Object.keys(filters).map(function(filterName) {
      var meta = MDSCommon.find(filtersMetaData, function(x) { return MDSCommon.endsWith(x.path, '/' + filterName) });
      return '<div class="search_filter">' +
        '<div class="search_filter__title">' + (meta && MDSCommon.findValueByName(meta.fields, 'title') || filterName) + '</div>' +
        '<div class="search_filter__items">' + RootHTMLGen.getListLookSingleFilter(filters[filterName], meta ? meta.children : [], filterName) + '</div>' +
        '</div>';
    }).join('\n');
  }
};
