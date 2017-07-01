UILayout.popups.fieldIndexed = {
	view: 'popup',
	id: 'entity_form__field_indexed_popup',
    css: 'entity_form__field_indexed_popup',
	width: 180,
	body:{
		view: 'list',
        id: 'entity_form__field_indexed_list',
        class: 'entity_form__field_indexed_list',
        borderless: true,
		data:[
          // { id: 'on', value: 'Search &amp; Order', icon: Fields.FIELD_INDEXED_ICONS['on'] },
          { id: 'fulltext', value: 'Fulltext Search', icon: Fields.FIELD_INDEXED_ICONS['fulltext'] },
          { id: 'off', value: 'None', icon: Fields.FIELD_INDEXED_ICONS['off'] },
		],
		datatype: 'json',
		template: '<i class="fa fa-#icon#" style="width: 28px;"></i> #value#',
		autoheight: true,
		select: true,
    on: {
      onItemClick: function(newv) {
        var fieldName = UI.entityForm.currentFieldName;
        var fieldId = 'entity_form__' + fieldName;
        $$(fieldId + '_indexed').setValue(newv);
        $$('entity_form__field_indexed_popup').hide();
				var oldValues = webix.copy($$('entity_form')._values);
				delete oldValues['fields.' + fieldName + '.value'];
        $$('entity_form__' + fieldName + '_indexed_button').define('icon', Fields.FIELD_INDEXED_ICONS[newv]);
        $$('entity_form__' + fieldName + '_indexed_button').refresh();
				$$('entity_form')._values = oldValues;
      }
    }
	}
};
