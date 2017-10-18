UIHelper = {
  SCREEN_XS: 700,
  /**
   * Number of entities received by single request.
   */
  NUMBER_OF_ENTITIES_LOADED_AT_TIME: 20,
  /**
   * Width of label of field in form.
   */
  LABEL_WIDTH: 120,
  APP_LABEL_WIDTH: 160,
  NUMBER_OF_FIXED_INPUTS_IN_FIELDS_FORM: 7,

  ENTITY_TREE_SHOW_MORE_ID: 'show_more_23478_3832ee',
  ENTITY_TREE_DUMMY_ID: 'dummy_483__4734_47e4',
  ENTITY_LIST_SHOW_MORE_ID: 'show_more_47384_3338222',

  COUNTRIES: {
    en: { name: 'united-kingdom', same: ['gb', 'us'] },
    af: { name: 'afghanistan' },
    al: { name: 'albania' },
    dz: { name: 'algeria' },
    as: { name: 'american-samoa' },
    ad: { name: 'andorra' },
    ao: { name: 'angola' },
    ai: { name: 'anguilla' },
    aq: { name: 'antarctica' },
    ag: { name: 'antigua-and-barbuda' },
    ar: { name: 'argentina' },
    am: { name: 'armenia' },
    aw: { name: 'aruba' },
    au: { name: 'australia' },
    at: { name: 'austria' },
    az: { name: 'azerbaijan' },
    bs: { name: 'bahamas' },
    bh: { name: 'bahrain' },
    bd: { name: 'bangladesh' },
    bb: { name: 'barbados' },
    by: { name: 'belarus' },
    be: { name: 'belgium' },
    bz: { name: 'belize' },
    bj: { name: 'benin' },
    bm: { name: 'bermuda' },
    bt: { name: 'bhutan' },
    bo: { name: 'bolivia' },
    ba: { name: 'bosnia-and-herzegovina' },
    bw: { name: 'botswana' },
    br: { name: 'brazil' },
    io: { name: 'british-indian-ocean-territory' },
    vg: { name: 'british-virgin-islands' },
    bn: { name: 'brunei' },
    bg: { name: 'bulgaria' },
    bf: { name: 'burkina-faso' },
    bi: { name: 'burundi' },
    kh: { name: 'cambodia' },
    cm: { name: 'cameroon' },
    ca: { name: 'canada' },
    cv: { name: 'cape-verde' },
    ky: { name: 'cayman-islands' },
    cf: { name: 'central-african-republic' },
    td: { name: 'chad' },
    cl: { name: 'chile' },
    cn: { name: 'china' },
    cx: { name: 'christmas-island' },
    cc: { name: 'cocos-islands' },
    co: { name: 'colombia' },
    km: { name: 'comoros' },
    ck: { name: 'cook-islands' },
    cr: { name: 'costa-rica' },
    hr: { name: 'croatia' },
    cu: { name: 'cuba' },
    cw: { name: 'curacao' },
    cy: { name: 'cyprus' },
    cz: { name: 'czech-republic' },
    cd: { name: 'democratic-republic-of-congo' },
    dk: { name: 'denmark' },
    dj: { name: 'djibouti' },
    dm: { name: 'dominica' },
    do: { name: 'dominican-republic' },
    tl: { name: 'east-timor' },
    ec: { name: 'ecuador' },
    eg: { name: 'egypt' },
    sv: { name: 'el-salvador' },
    gq: { name: 'equatorial-guinea' },
    er: { name: 'eritrea' },
    ee: { name: 'estonia' },
    et: { name: 'ethiopia' },
    fk: { name: 'falkland-islands' },
    fo: { name: 'faroe-islands' },
    fj: { name: 'fiji' },
    fi: { name: 'finland' },
    fr: { name: 'france' },
    pf: { name: 'french-polynesia' },
    ga: { name: 'gabon' },
    gm: { name: 'gambia' },
    ge: { name: 'georgia' },
    de: { name: 'germany' },
    gh: { name: 'ghana' },
    gi: { name: 'gibraltar' },
    gr: { name: 'greece' },
    gl: { name: 'greenland' },
    gd: { name: 'grenada' },
    gu: { name: 'guam' },
    gt: { name: 'guatemala' },
    gg: { name: 'guernsey' },
    gn: { name: 'guinea' },
    gw: { name: 'guinea-bissau' },
    gy: { name: 'guyana' },
    ht: { name: 'haiti' },
    hn: { name: 'honduras' },
    hk: { name: 'hong-kong' },
    hu: { name: 'hungary' },
    is: { name: 'iceland' },
    in: { name: 'india' },
    id: { name: 'indonesia' },
    ir: { name: 'iran' },
    iq: { name: 'iraq' },
    ie: { name: 'ireland' },
    im: { name: 'isle-of-man' },
    il: { name: 'israel' },
    it: { name: 'italy' },
    ci: { name: 'ivory-coast' },
    jm: { name: 'jamaica' },
    jp: { name: 'japan' },
    je: { name: 'jersey' },
    jo: { name: 'jordan' },
    kz: { name: 'kazakhstan' },
    ke: { name: 'kenya' },
    ki: { name: 'kiribati' },
    xk: { name: 'kosovo' },
    kw: { name: 'kuwait' },
    kg: { name: 'kyrgyzstan' },
    la: { name: 'laos' },
    lv: { name: 'latvia' },
    lb: { name: 'lebanon' },
    ls: { name: 'lesotho' },
    lr: { name: 'liberia' },
    ly: { name: 'libya' },
    li: { name: 'liechtenstein' },
    lt: { name: 'lithuania' },
    lu: { name: 'luxembourg' },
    mo: { name: 'macau' },
    mk: { name: 'macedonia' },
    mg: { name: 'madagascar' },
    mw: { name: 'malawi' },
    my: { name: 'malaysia' },
    mv: { name: 'maldives' },
    ml: { name: 'mali' },
    mt: { name: 'malta' },
    mh: { name: 'marshall-island' },
    mr: { name: 'mauritania' },
    mu: { name: 'mauritius' },
    yt: { name: 'mayotte' },
    mx: { name: 'mexico' },
    fm: { name: 'micronesia' },
    md: { name: 'moldova' },
    mc: { name: 'monaco' },
    mn: { name: 'mongolia' },
    me: { name: 'montenegro' },
    ms: { name: 'montserrat' },
    ma: { name: 'morocco' },
    mz: { name: 'mozambique' },
    mm: { name: 'myanmar' },
    na: { name: 'namibia' },
    nr: { name: 'nauru' },
    np: { name: 'nepal' },
    nl: { name: 'netherlands' },
    an: { name: 'netherlands-antilles' },
    nc: { name: 'new-caledonia' },
    nz: { name: 'new-zealand' },
    ni: { name: 'nicaragua' },
    ne: { name: 'niger' },
    ng: { name: 'nigeria' },
    nu: { name: 'niue' },
    kp: { name: 'north-korea' },
    mp: { name: 'northern-mariana-islands' },
    no: { name: 'norway' },
    om: { name: 'oman' },
    pk: { name: 'pakistan' },
    pw: { name: 'palau' },
    ps: { name: 'palestine' },
    pa: { name: 'panama' },
    pg: { name: 'papua-new-guinea' },
    py: { name: 'paraguay' },
    pe: { name: 'peru' },
    ph: { name: 'philippines' },
    pn: { name: 'pitcairn' },
    pl: { name: 'poland' },
    pt: { name: 'portugal' },
    pr: { name: 'puerto-rico' },
    qa: { name: 'qatar' },
    cg: { name: 'republic-of-the-congo' },
    re: { name: 'reunion' },
    ro: { name: 'romania' },
    ru: { name: 'russia' },
    rw: { name: 'rwanda' },
    bl: { name: 'saint-barthelemy' },
    sh: { name: 'saint-helena' },
    kn: { name: 'saint-kitts-and-nevis' },
    lc: { name: 'saint-lucia' },
    mf: { name: 'saint-martin' },
    pm: { name: 'saint-pierre-and-miquelon' },
    vc: { name: 'saint-vincent-and-the-grenadines' },
    ws: { name: 'samoa' },
    sm: { name: 'san-marino' },
    st: { name: 'sao-tome-and-principe' },
    sa: { name: 'saudi-arabia' },
    sn: { name: 'senegal' },
    rs: { name: 'serbia' },
    sc: { name: 'seychelles' },
    sl: { name: 'sierra-leone' },
    sg: { name: 'singapore' },
    sx: { name: 'sint-maarten' },
    sk: { name: 'slovakia' },
    si: { name: 'slovenia' },
    sb: { name: 'solomon-islands' },
    so: { name: 'somalia' },
    za: { name: 'south-africa' },
    kr: { name: 'south-korea' },
    ss: { name: 'south-sudan' },
    es: { name: 'spain' },
    lk: { name: 'sri-lanka' },
    sd: { name: 'sudan' },
    sr: { name: 'suriname' },
    sj: { name: 'svalbard-and-jan-mayen' },
    sz: { name: 'swaziland' },
    se: { name: 'sweden' },
    ch: { name: 'switzerland' },
    sy: { name: 'syria' },
    tw: { name: 'taiwan' },
    tj: { name: 'tajikistan' },
    tz: { name: 'tanzania' },
    th: { name: 'thailand' },
    tg: { name: 'togo' },
    tk: { name: 'tokelau' },
    to: { name: 'tonga' },
    tt: { name: 'trinidad-and-tobago' },
    tn: { name: 'tunisia' },
    tr: { name: 'turkey' },
    tm: { name: 'turkmenistan' },
    tc: { name: 'turks-and-caicos' },
    tv: { name: 'tuvalu' },
    vi: { name: 'virgin-islands' },
    ug: { name: 'uganda' },
    ua: { name: 'ukraine' },
    ae: { name: 'united-arab-emirates' },
    gb: { name: 'united-kingdom' },
    us: { name: 'united-states' },
    uy: { name: 'uruguay' },
    uz: { name: 'uzbekistan' },
    vu: { name: 'vanuatu' },
    va: { name: 'vatican' },
    ve: { name: 'venezuela' },
    vn: { name: 'vietnam' },
    wf: { name: 'wallis-and-futuna' },
    eh: { name: 'western-sahara' },
    ye: { name: 'yemen' },
    zm: { name: 'zambia' },
    zw: { name: 'zimbabwe' }
  },

  ENTITY_ICONS: {
    'root': 'database',
    'protos': 'cubes',
    'proto': 'cube',
    'tasks': 'code',
    'task': 'file-code-o',
    'logs': 'history',
    'log': 'file-movie-o',
    'resources': 'diamond',
    'resource': 'file-image-o',
    'processes': 'cogs',
    'process': 'cog',
    'likes': 'heart',
    'like': 'heart-o',
    'comments': 'comments',
    'comment': 'comment',
    'views': 'photo',
    'view': 'file-image-o'
  },

  IGNORED_PATHS: [
    'comments',
    // 'views',
    'likes'
    // 'processes'
  ],

  SYSTEM_PATHS: [
    'resources',
    'tasks',
    'protos',
    'comments',
    'views',
    'likes',
    'processes'
  ],

  setVisible: function(components, isVisible) {
    if (!Array.isArray(components)) {
      components = [components];
    }
    for (var i in components) {
      var component = components[i];
      if (typeof component === 'string') {
        component = $$(component);
      }
      if (isVisible) {
        component.show();
      } else {
        component.hide();
      }
    }
  },

  /**
   * User can only view entities. All buttons for manipulations is hidden in
   * this mode.
   */
  isViewOnly: function() {
    return window.location.hash != null &&
           window.location.hash !== '' &&
           window.location.hash !== '#';
  },

  getEntityTypeByPath: function(path) {
    var depth = UIHelper.getEntityDepthByPath(path);
    switch (path) {
      case '':
        return 'root';
      case 'protos':
      case 'resources':
      case 'tasks':
      case 'likes':
      case 'comments':
      case 'processes':
      case 'views':
        return path;
      default:
          if (/^tasks\/[^\/]+$/.test(path)) {
              return 'task';
          }
          if (/^tasks\/[^\/]+\/logs$/.test(path)) {
              return 'logs';
          }
          if (/^tasks\/[^\/]+\/logs\/[^\/]+$/.test(path)) {
              return 'log';
          }
          if (path.startsWith('protos/') && depth === 2) {
            return 'proto';
          }
          if (path.startsWith('likes/') && depth === 2) {
            return 'like';
          }
          if (path.startsWith('comments/') && depth === 2) {
            return 'comment';
          }
          if (path.startsWith('views/') && depth === 2) {
            return 'view';
          }
          if (path.startsWith('resources/')) {
            return 'resource';
          }
    }
    return 'none';
  },

  getIconByPath: function(path, isEmpty, isOpened) {
    var icon = UIHelper.ENTITY_ICONS[UIHelper.getEntityTypeByPath(path)];
    if (icon) {
        return icon;
    }
    if (isEmpty) {
      return 'file-o';
    } else {
      return isOpened ? 'folder-open' : 'folder';
    }
  },

  getEntityDepthByPath: function(path) {
   var depth = 1;
   for (var i = 0; i < path.length; i++) {
     if (path[i] === '/') {
       depth++;
     }
   }
   return depth;
  },

  isProtoPath: function(path) {
    if (path == null) {
      return false;
    }
    return path.startsWith('protos/') &&
           UIHelper.getEntityDepthByPath(path) === 2;
  },

  isProto: function(id) {
    if (id == null) {
      return false;
    }
    var identity = Identity.dataFromId(id);
    return UIHelper.isProtoPath(identity.path);
  },

  popupCenter: function(url, title, w, h) {
    // Fixes dual-screen position                         Most browsers      Firefox
    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
    var top = ((height / 2) - (h / 2)) + dualScreenTop;
    var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

    // Puts focus on the newWindow
    if (window.focus) {
        newWindow.focus();
    }
    return newWindow;
  },

  isValidJWT: function(token) {
    return isValidJWT(token);
  }

};
