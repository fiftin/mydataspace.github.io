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
  }
};
