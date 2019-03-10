webix.protoUI({
  name:"multiline-tabbar",
  $init:function(){
    //this.attachEvent("onKeyPress", this._onKeyPress);
  },
  defaults:{
    template:function(obj,common) {
      var contentWidth, html, i, leafWidth, resultHTML, style, sum, tabs, verticalOffset, width;

      common._tabs = tabs = common._filterOptions(obj.options);

      html = '<div class="webix_all_tabs">';
      for(i = 0; i<tabs.length; i++) {
        // tab innerHTML
        html += common._getTabHTML(tabs[i]);
      }

      html += '</div>';

      return html;
    }
  },
  _getInputNode:function(){
    return this.$view.getElementsByClassName("multiline-tabbar__tab");
  },
  _getTabHTML: function(tab){
    var	html,
      className = 'multiline-tabbar__tab',
      config = this.config;

    if(tab.id== config.value)
      className+=" webix_selected";

    html = '<div class="' + className + '" button_id="'+tab.id+'" role="tab" aria-selected="'+(tab.id== config.value?"true":"false")+'" tabindex="'+(tab.id== config.value?"0":"-1")+'">';

    var icon = tab.icon?("<span class='webix_icon fa-"+tab.icon+"'></span> "):"";
    html+=icon + tab.value;

    if (tab.close || config.close)
      html+="<span role='button' tabindex='0' aria-label='"+webix.i18n.aria.closeTab+"' class='multiline-tabbar__tab-close webix_tab_close webix_icon fa-times'></span>";

    html += '</div>';
    return html;
  }
}, webix.ui.segmented);

webix.protoUI({
  name:"multiline-tabview",
  defaults:{
    type:"clean"
  },
  setValue:function(val){
    this._cells[0].setValue(val);
  },
  getValue:function(){
    return this._cells[0].getValue();
  },
  getTabbar:function(){
    return this._cells[0];
  },
  getMultiview:function(){
    return this._cells[1];
  },
  addView:function(obj){

    var id = obj.body.id = obj.body.id || webix.uid();

    this.getMultiview().addView(obj.body);

    obj.id = obj.body.id;
    obj.value = obj.header;
    delete obj.body;
    delete obj.header;

    var t = this.getTabbar();
    t.addOption(obj);
    t.refresh();

    this.tabIds.push(id);

    return id;
  },
  _removeTab: function (id) {
    for (var i in this.tabIds) {
      if (this.tabIds[i] === id) {
        this.tabIds.splice(i, 1);
        break;
      }
    }
  },
  removeView:function(id){
    var t = this.getTabbar();
    t.removeOption(id);
    t.refresh();
    this._removeTab(id);
  },
  getTabIds: function () {
    return this.tabIds;
  },
  $init:function(config){
    this.$ready.push(this._init_tabview_handlers);
    this.tabIds = [];

    var cells = config.cells;
    var tabs = [];

    webix.assert(cells && cells.length, "tabview must have cells collection");

    for (var i = cells.length - 1; i >= 0; i--){
      var view = cells[i].body||cells[i];
      if (!view.id) view.id = "view"+webix.uid();
      tabs[i] = { value:cells[i].header, id:view.id, close:cells[i].close, width:cells[i].width, hidden:  !!cells[i].hidden};
      cells[i] = view;
    }

    var tabbar = { view:"multiline-tabbar", multiview:true };
    var mview = { view:"multiview", cells:cells, animate:(!!config.animate) };

    if (config.value)
      tabbar.value = config.value;

    if (config.tabbar)
      webix.extend(tabbar, config.tabbar, true);
    if (config.multiview)
      webix.extend(mview, config.multiview, true);

    tabbar.options = tabbar.options || tabs;

    config.rows = [
      tabbar, mview
    ];

    delete config.cells;
    delete config.tabs;
  },
  _init_tabview_handlers:function(){
    var self = this;
    this.getTabbar().attachEvent("onOptionRemove", function(id){
      self._removeTab(id);
      var view = webix.$$(id);
      if (view)
        view.destructor();
    });
  }
}, webix.ui.layout);