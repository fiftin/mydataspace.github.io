---
---

var PROJECT_NAME = '{{ site.project_name }}';
var PROJECT_ROOT_NAME_EN = (PROJECT_NAME === 'web20' ? 'Website' : 'Root');
var PROJECT_ROOT_NAME_RU = (PROJECT_NAME === 'web20' ? 'сайт' : 'кор.');

var STRINGS_ON_DIFFERENT_LANGUAGES = {
  EN: {
    YES: 'Yes',
    NO: 'No',
    SKELETONS: 'Skeletons',
    CLOSE: 'Close',
    SHOW_MORE: 'Show more...',
    EDIT_SCRIPT: 'Edit Script:',
    // SAVE_ENTITY: 'Save Entity',
    RUN_SCRIPT: 'Debug',
    ONLY_READ: 'Only Read',
    ADD_ENTITY: 'New...',
    SEARCH: 'Filter...',
    DELETE_ENTITY: 'Delete Entity',
    DELETE_FILE: 'Delete File',
    DELETE_ENTITY_SHORT: 'Delete',
    CREATE_CHILDREN: 'Create Children',
    CREATE_ONE_CHILD: 'Create One Child',
    OTHERS_CAN: 'Others Can',
    RENAME: 'Upload',
    UPLOAD: 'Upload',
    CREATE: 'Create',
    CANCEL: 'Cancel',
    ALREADY_LOGGED_IN: 'Already logged in',
    TYPE: 'Type',
    STRING: 'String',
    REAL: 'Real',
    TEXT: 'Text',
    INT: 'Int',
    BOOL: 'Boolean',
    DATE: 'Date',
    EMAIL: 'Email',
    PHONE: 'Phone',
    SECRET: 'Secret',
    DESCRIPTION: 'Description',
    NO_ENTITY: 'No field exists',
    ADD_ROOT: PROJECT_NAME === 'web20' ? 'New Site' : 'New Root',
    ADD_FIELD: 'New Field',
    ADD_FILE: 'New File',
    RENAME_FILE: 'Rename File',
    REFRESH: 'Ref.',
    SAVE: 'Save',
    SAVE_APP: 'Save',
    REFRESH_APP: 'Refresh',
    DELETE: 'Delete',
    DELETE_APP: 'Delete App',
    NEW_APP: 'New App',
    NEW_APP_WINDOW: 'New App',
    NAME: 'Name',
    LOGO_URL: 'Logo URL',
    SITE_URL: 'client URLs & IPs',
    SITE_URL_DESCRIPTION: 'IP and URL addresses of sites or apps witch should can access to data for write.',
    CLIENT_ID: 'API Key',
    CLIENT_ID_DESCRIPTION: 'Unique ID used on client side.',
    VALUE: 'Value',
    CHILD_PROTO: 'Child Proto',
    FIELDS: 'Fields',
    NO_FIELDS: 'No fields exists',
    NO_README: 'No description provided.',
    MY_APPS: 'My Apps',
    MY_DATA: PROJECT_NAME === 'web20' ? 'My Websites' : 'My Data',
    SIGN_OUT: 'Sign out',
    CONNECT_TO_FACEBOOK: 'Connect through Facebook',
    CONNECT_TO_GOOGLE: 'Connect through Google',
    CONNECT_TO_VK: 'Connect through VK',
    REALLY_DELETE: 'You really want delete this entity?',
    NO_DATA: 'You have no data',
    NO_APPS: 'You have no apps',
    NO_APPS_DESCRIPTION: '',
    NO_APPS_CREATE: 'Create first app!',
    DOCS: 'Documentation',
    DEMOS: 'Demos',
    GET_STARTED: 'Get Started',
    FEATURES: 'Features',
    SIGN_IN: 'Sign In',
    NOTHING: 'Nothing',
    READ_AND_VIEW_CHILDREN: 'Read and view children',
    PROTO_IS_FIXED: 'Is Fixed',
    MAX_NUMBER_OF_CHILDREN: 'Children limit',
    EDIT_ENTITY: 'Edit',
    CLONE_ENTITY: 'Clone',

    CLONE_ROOT_NAME: 'Root',
    CLONE_ENTITY_PATH: 'Path',

    SAVE_ENTITY: 'Save',
    REFRESH_ENTITY: 'Ref.',
    CANCEL_ENTITY: 'Cancel',
    SEARCH_BY_ROOTS: 'Search roots',
    SEARCH_BY_ENTITIES: 'Search',
    ADD_RESOURCE_WINDOW: 'New Resource',
    ADD_RESOURCE_FILE: 'File',
    ADD_RESOURCE_TYPE: 'Type',
    AVATAR: 'Avatar',
    IMAGE: 'Image',
    FILE: 'File',
    ROOT_FIELDS: {
      avatar: 'Icon',
      name: 'Name',
      tags: 'Tags',
      description: 'Description',
      websiteURL: 'Website URL',
      readme: 'README',
      category: 'Category',
      country: 'Country',
			language: 'Language',
      interval: 'Interval',
      datasource: 'Source',
      datasourceURL: 'Source URL',
      license: 'License',
      licenseText: 'License Text',
      licenseURL: 'License URL',
      domain: 'Domain'
    },
    ROOT_FIELD_PLACEHOLDERS: {
      name: 'Human readable name of your root',
      tags: 'Keywords describing root',
      description: 'Main about root',
      websiteURL: 'Website where data of root are used',
      readme: 'Markdown-formatted text about the root',
      category: '',
      language: ''
    },
    ROOT_AVATAR_UPLOAD: 'Upload',
    ROOT_AVATAR_BROWSE: 'Browse',
    ROOT_AVATAR_REMOVE: 'Remove',
    HIDE_ACCESS_KEY: 'Hide',
    COPY_ACCESS_KEY: 'Copy',
    SHOW_ACCESS_KEY: 'Show access key',
    NEW_VERSION: 'Version <span class="version_btn__version">0</span>',
    ADD_VERSION: 'New Version',
    VERSION_DESCRIPTION: 'Description',
    VERSION_CREATED_AT: 'Created At',

    FEEDBACK: 'Give Feedback',

    PRICING: 'Pricing',

    ROOT_TYPE: 'Type',
    root_types: {
      d: 'Website',
      t: 'Skeleton'
    },

    switch_default_version: 'Switch Default Version',
    view_other_version: 'View Other Version',

    created: 'created',
    ago: 'ago',
    title_cant_be_blank: 'Title can\'t be blank',
    too_long_title: 'Too long title',
    codepen_url_cant_be_blank: 'Codepen URL can\'t be blank',
    invalid_codepen_pen_url: 'Invalid CodePen pen URL',
    edit_view: 'Edit View',
    save_view: 'Save View',
    new_view: 'New View',
    create_view: 'Create View',
    no_description_provided: 'No description provided',
    switch_default_version_window_title: 'Switch Default Version',
    view_other_version_window_title: 'View Other Version',
    new_empty_root: 'New Empty ' + PROJECT_ROOT_NAME_EN,
    import_root: 'Import Data',
    open_license_page: 'Open License Page',

    new_entity: 'New Folder',
    import_entity: 'Import Entity',
    new_resource: 'New Resource',
    new_task: 'New Task',
    add_website: 'Add Website',
    new_proto: 'New Prototype',

    no_fields_add_button: 'Add Field',
    no_fields_prompt: 'Element has no fields yet. Fields used to store data in the element. Field can be text, number, geo-point or date.',

    blank_root_prompt: 'The root information is not filled. Add picture, name and description so that your root is easier to find',

    blank_root_edit_button: 'Fill',

    dont_forgot_to_save: 'Do not forgot to save element after adding/changing field',

    blank_root: {
      text: '',
      create: 'Create Element',
      import: 'Import Data',
      upload: 'Upload File'
    },

    no_items: {
      no_items__title: PROJECT_NAME === 'web20' ? 'You have no any website yet' : 'You have ho any data yet',
      no_items__explore__desc: 'Find data you need among a huge amount of existing data',
      no_items__explore__button: 'Explore',
      no_items__import__desc: 'Import data from XLS, XML, CSV, JSON and many other formats',
      no_items__import__refine_desc: 'OpenRefine is a free, open source power tool for working with messy data and improving it',
      no_items__import__button: 'Import',
      no_items__create__desc: 'Start from scratch &mdash; create an empty root',
      no_items__notice: [
        PROJECT_ROOT_NAME_EN + ' name should be 3..50 characters',
        PROJECT_ROOT_NAME_EN + ' name contains illegal characters',
        PROJECT_ROOT_NAME_EN + ' name must be unique among all existing roots'
      ],
      no_items__create__button: PROJECT_NAME === 'web20' ? '<i class="fa fa-cog hidden"></i> Create Website' : 'Create'
    },

    language: 'Language',
    country: 'Country',
    category: 'Category',
    datasource: 'Source',

    languages: {
      ru: 'Russian',
      en: 'English'
    },

    languagesShort: {
      ru: 'rus',
      en: 'eng'
    },

    countries: {
      ru: 'Russia',
      gb: 'Great Britain',
      us: 'USA',
      kz: 'Kazakhstan',
      by: 'Belarus',
      in: 'India'
    },

    categories: {
      blog: 'Blog',
      ecommerce: 'E-commerce',
      catalog: 'Catalog',
      personal: 'Personal Website',
      corporate: 'Corporate Website',
      landing: 'Landing Page',
      framework: 'Framework',
      edu: 'Examples',
      social: 'Social Network'
    },

    intervals: {
      minutely: 'Minutely',
      hourly: 'Hourly',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly'
    },

    types: {
      template: 'Skeleton',
      dataset: 'Website'
    },

    //licenses: {
    //  'none': 'No license',
    //  'custom': 'Custom license',
    //  'cc-by-3': 'Creative Commons 3.0',
    //  'cc-by-4': 'Creative Commons 4.0',
    //  'ogl-1': 'Open Government Licence v1.0',
    //  'ogl-2': 'Open Government Licence v2.0',
    //  'ogl-3': 'Open Government Licence v3.0',
    //  'standard-terms-of-use': 'Standard Open Data terms of use'
    //},

    licenses: {
      'none': 'No license',
      'custom': 'Custom license',
      'cc-by-3': 'CC BY 3.0',
      'cc-by-4': 'CC BY 4.0',
      'mit': 'MIT',
      'gpl-2': 'GPL',
      'gpl-3': 'GPL',
      'apache': 'Apache'
    },
    site_dns_in_progress: 'Updating DNS records takes a minute',
    entities_and_files: 'Entities',

    context_menu: {
      new_file: 'New File',
      edit: 'Edit',
      rename_file: 'Rename',
      delete_file: 'Delete',
      delete_root: 'Delete',
      delete_entity: 'Delete'
    },

    select_template_label: 'Skeleton:',

    default_template: 'angularjs-bootstrap-3',
    youtube_intro_video: 'I0O2h_34jhY',

    path_descriptions: {
      'production/cache': 'There are dynamically generated pages here.',
    }
  },

  RU: {
    YES: 'Да',
    NO: 'Нет',
    SKELETONS: 'Каркасы',
    CLOSE: 'Закр.',
    SHOW_MORE: 'Показать ещё...',
    EDIT_SCRIPT: 'Ред. скрипта:',
    // SAVE_ENTITY: 'Сохранить элемент',
    RUN_SCRIPT: 'Отл.',
    ONLY_READ: 'Только читать',
    ADD_ENTITY: 'Нов...',
    SEARCH: 'Фильтр...',
    DELETE_ENTITY: 'Удалить элемент',
    DELETE_FILE: 'Удалить файл',
    DELETE_ENTITY_SHORT: 'Удал.',
    CREATE_CHILDREN: 'Создавать дочерние элементы',
    CREATE_ONE_CHILD: 'Создать один дочерний элемент',
    OTHERS_CAN: 'Другие могут',
    RENAME: 'Переименовать',
    UPLOAD: 'Загрузить',
    CREATE: 'Создать',
    CANCEL: 'Отмена',
    ALREADY_LOGGED_IN: 'Уже в системе',
    TYPE: 'Тип',
    STRING: 'Строка',
    REAL: 'Число',
    TEXT: 'Текст',
    INT: 'Целое число',
    BOOL: 'Да/нет',
    DATE: 'Дата',
    EMAIL: 'Email',
    PHONE: 'Телефон',
    SECRET: 'Секрет',
    DESCRIPTION: 'Описание',
    NO_ENTITY: 'Нет полей',
    ADD_ROOT: PROJECT_ROOT_NAME_RU,
    ADD_ROOT: PROJECT_NAME === 'web20' ? 'Нов. сайт' : 'Нов. корень',
    ADD_FIELD: 'Нов. поле',
    ADD_FILE: 'Нов. файл',
    RENAME_FILE: 'Переим. файл',
    REFRESH: 'Обн.',
    SAVE: 'Сохр.',
    SAVE_APP: 'Сохр.',
    REFRESH_APP: 'Обновить прил.',
    DELETE: 'Удал.',
    DELETE_APP: 'Удалить прил.',
    NEW_APP: 'Новое прил.',
    NEW_APP_WINDOW: 'Новое приложение',
    NAME: 'Имя',
    LOGO_URL: 'Лого',
    SITE_URL: 'IP и URL адреса',
    SITE_URL_DESCRIPTION: 'Разделенные знаком «;» IP и URL адреса с которых разрешен доступ',
    CLIENT_ID: 'Ключ API',
    CLIENT_ID_DESCRIPTION: '',
    VALUE: 'Значение',
    CHILD_PROTO: 'Прототип',
    FIELDS: 'Поля',
    NO_FIELDS: 'Нет ни одного поля',
    NO_README: 'Нет ни описания ни README.',
    MY_APPS: 'Мои приложения',
    MY_DATA: PROJECT_NAME === 'web20' ? 'Мои сайты' : 'Мои данные',
    SIGN_OUT: 'Выход',
    CONNECT_TO_FACEBOOK: 'Войти через Facebook',
    CONNECT_TO_GOOGLE: 'Войти через Google',
    CONNECT_TO_VK: 'Войти через ВК',
    REALLY_DELETE: 'Вы действительно хотите удалить этот элемент?',
    NO_DATA: 'У вас нет данных',
    NO_APPS: 'У вас нет приложений',
    NO_APPS_DESCRIPTION: 'Если вам нужно чтобы ваш сайт имел доступ на запись к данным, ' +
                         'вам необходимо создать приложение. В настройках приложения вы ' +
                         'можете настроить права доступа к данным.',
    NO_APPS_CREATE: 'Создать приложение!',
    REALLY_DELETE_APP: 'Вы действительно хотите удалить это приложение?',
    DOCS: 'Документация',
    DEMOS: 'Примеры',
    GET_STARTED: 'Для начала',
    FEATURES: 'Возможности',
    SIGN_IN: 'Войти',
    NOTHING: 'Ничего',
    READ_AND_VIEW_CHILDREN: 'Чтение и просм. доч. эл.',
    PROTO_IS_FIXED: 'Зафиксирован',
    MAX_NUMBER_OF_CHILDREN: 'Доч. эл-тов',
    EDIT_ENTITY: 'Ред.',
    CLONE_ENTITY: 'Копир.',


    CLONE_ROOT_NAME: 'Корень',
    CLONE_ENTITY_PATH: 'Путь',


    SAVE_ENTITY: 'Сохр.',
    REFRESH_ENTITY: 'Обн.',
    CANCEL_ENTITY: 'Отмена',
    SEARCH_BY_ROOTS: 'Поиск по корням',
    SEARCH_BY_ENTITIES: 'Поиск по элементам',
    ADD_RESOURCE_WINDOW: 'Добавить ресурс',
    ADD_RESOURCE_FILE: 'Файл',
    ADD_RESOURCE_TYPE: 'Тип',
    AVATAR: 'Аватар',
    IMAGE: 'Картинка',
    FILE: 'Файл',
    ROOT_FIELDS: {
      avatar: 'Иконка',
      name: 'Имя',
      tags: 'Теги',
      description: 'Описание',
      websiteURL: 'Вебсайт',
      readme: 'README',
      category: 'Категория',
			country: 'Страна',
      language: 'Язык',
      interval: 'Интервал',
      datasource: 'Источник',
      datasourceURL: 'URL источника',
      license: 'Лицензия',
      licenseText: 'Текст лицензии',
      licenseURL: 'URL лицензии',
      domain: 'Домен'
    },
    ROOT_FIELD_PLACEHOLDERS: {
      name: 'Наименование проекта',
      tags: 'Ключевые слова описывающие проект',
      description: 'Коротко о проекте',
      websiteURL: 'Сайт на котором используются данные',
      readme: 'Подробное описание в Markdown формате',
			category: 'К какой категории относятся данные?',
			country: 'К какой стране относятся данные?',
			language: 'На каком языке данные?',
      datasource: '',
      datasourceURL: 'Адрес сртаницы или файла источника',
      license: 'Тим лицензионного соглашения',
      licenseURL: 'Адрес страницы с лицензионными соглашением',
      licenseText: 'Текст лицензионного соглашения или дополнения к основному соглашению'
    },
    ROOT_AVATAR_UPLOAD: 'Загрузить',
    ROOT_AVATAR_BROWSE: 'Обзор',
    ROOT_AVATAR_REMOVE: 'Удалить',
    HIDE_ACCESS_KEY: 'Скрыть',
    COPY_ACCESS_KEY: 'Скопировать',
    SHOW_ACCESS_KEY: 'Показать ключ доступа',
    NEW_VERSION: 'Версия <span class="version_btn__version">0</span>',
    ADD_VERSION: 'Новая версия',
    VERSION_DESCRIPTION: 'Описание',
    VERSION_CREATED_AT: 'Создана',
    FEEDBACK: 'Оставить отзыв',

    PRICING: 'Тарифы',

    ROOT_TYPE: 'Тип',
    root_types: {
      d: 'Веб-сайт',
      t: 'Каркас'
    },

    created: 'создан',
    ago: 'назад',
    title_cant_be_blank: 'Заголовол не может быть пустым',
    too_long_title: 'Слишком длинный заголовок',
    codepen_url_cant_be_blank: 'Codepen URL не может быть пустым',
    invalid_codepen_pen_url: 'Некорректный URL CodePen приложения',
    edit_view: 'Изменить',
    save_view: 'Сохранить',
    new_view: 'Новое представление',
    create_view: 'Создать представление',

    no_description_provided: 'Нет описания',
    switch_default_version_window_title: 'Уст. версию по умолчанию',
    view_other_version_window_title: 'Смотреть другую версию',
    new_empty_root: 'Пусктой ' + PROJECT_ROOT_NAME_RU,
    import_root: 'Импорт данных',

    new_entity: 'Новый элемент',
    import_entity: 'Импорт элемента',
    new_resource: 'Новый ресурс',
    new_task: 'Новая задача',
    add_website: 'Добавить сайт',
    new_proto: 'Новый прототип',

    no_fields_prompt: 'Элемент еще не содержит ни одного поля. Поля используются для хранения данных &mdash; текста, чисел, геокоординат и др.',
    no_fields_add_button: 'Добавить поле',

    dont_forgot_to_save: 'Не забудьте <span class="entity_form__dont_forgot_to_save"><i class="fa fa-save"></i> сохранить</span> элемент после добавления поля',

    blank_root_prompt: PROJECT_NAME === 'web20' ?
      'Информация о сайте не заполнена. Добавьте картинку, название и короткое описание чтобы ваш сайт было проще найти' :
      'Информация о корне не заполнена. Добавьте картинку, название и короткое описание чтобы ваш корень было проще найти',

    open_license_page: 'Открыть страницу лицензии',

    blank_root_edit_button: 'Заполнить',

    blank_root: {
      text: 'Корень пока не содержит данных',
      //'Создайте новый элемент данных вручную или импортируется данные из файла',
      create: 'Создать элемент',
      import: 'Импортировать данные',
      upload: 'Загрузить файл'
    },

    no_items: {
      no_items__title: PROJECT_NAME === 'web20' ? 'Создайте свой первый сайт!' : 'У вас еще нет никаких данных',
      no_items__explore__desc: 'Найдите нужные данные среди огромного количества уже загруженных данных',
      no_items__explore__button: 'Смотреть',
      no_items__import__desc: 'Импортируйте данные из файлов XLS, XML, CSV, JSON и файлов множества других форматов',
      no_items__import__refine_desc: 'OpenRefine &mdash; свободный инструмент для работы с наборами данных',
      no_items__import__button: 'Импортировать',
      no_items__create__desc: 'Или начните с чистого листа',
      no_items__notice: PROJECT_NAME === 'web20' ? [
        'Поддомен должно быть длинной от 4 до 50 символов',
        'В поддомене допускаются только <b>латинские буквы</b>, цифры, знак тере и подчеркивания',
        'Поддомен должно быть уникальным среди всех существующих поддоменов'
      ] : [
        'Имя должно быть длинной от 4 до 50 символов',
        'В имени допускаются только латинские бувы, цифры, знак тере и подчеркивания',
        'Имя корня должно быть уникальным среди всех существующих корней'
      ],
      no_items__create__button: PROJECT_NAME === 'web20' ? '<i class="fa fa-cog hidden"></i> Создать сайт' : 'Создать'
    },

    language: 'Язык',
    country: 'Страна',
    category: 'Категория',
    datasource: 'Источник',

    languages: {
      ru: 'Русский',
      en: 'Английский'
    },

    languagesShort: {
      ru: 'рус',
      en: 'анг'
    },

    countries: {
      ru: 'Россия',
      gb: 'Великобритания',
      us: 'США',
      kz: 'Казахстан',
      by: 'Беларусь',
      in: 'Индия'
    },

    categories: {
      blog: 'Блог',
      ecommerce: 'Коммерция',
      catalog: 'Каталог',
      personal: 'Персональный сайт',
      corporate: 'Сайт компании',
      landing: 'Посадочная страница',
      framework: 'Фреймворк',
      edu: 'Примеры',
      social: 'Соцсеть'
    },

    intervals: {
      minutely: 'Минута',
      hourly: 'Час',
      daily: 'Сутки',
      weekly: 'Неделя',
      monthly: 'Месяц'
    },

    types: {
      template: 'Каркас',
      dataset: 'Датасет'
    },

    licenses: {
      'none': 'Нет лицензии',
      'custom': 'Своя лицензия',
      'cc-by-3': 'CC BY 3.0',
      'cc-by-4': 'CC BY 4.0',
      'mit': 'MIT',
      'gpl-2': 'GPL v2',
      'gpl-3': 'GPL v3',
      'apache': 'Apache'
    },

    site_dns_in_progress: 'Пожалуйта, подождите, обновление записи DNS занимает ровно 1 минуту',
    entities_and_files: 'Элементы',
    context_menu: {
      new_file: 'Новый файл',
      edit: 'Ред. элемент',
      rename_file: 'Переименовать',
      delete_file: 'Удалить',
      delete_root: 'Удалить',
      delete_entity: 'Удалить'
    },
    select_template_label: 'Каркас:',

    default_template: 'angularjs-bootstrap-3-ru',
    youtube_intro_video: 'fBve_lUsWuc',

    path_descriptions: {
      'production/cache': 'Здесь хранятся динамически сгенерированные страницы.',
    }
  }
};

var LANGUAGE;

(function() {
  var languageFromLocalStorage = window.localStorage && window.localStorage.getItem('language');
  if (window.location && window.location.pathname) {
    var languageMatch = location.pathname.match(/^\/(\w\w)(\/.*)?$/);
    var languageFromURL = languageMatch ? languageMatch[1].toUpperCase() : null;
    if (!languageFromURL && !languageFromLocalStorage) {
      LANGUAGE = 'EN';
    } else {
      LANGUAGE = languageFromURL || languageFromLocalStorage;
    }
  } else {
    LANGUAGE = languageFromLocalStorage || 'EN';
  }
})();

var STRINGS = STRINGS_ON_DIFFERENT_LANGUAGES[LANGUAGE];


function getCurrentLanguage() {
  var lang;
  var languageMatch = location.pathname.match(/^\/(\w\w)(\/.*)?$/);
  if (languageMatch) {
    lang = languageMatch[1].toUpperCase();
  } else {
    lang = 'EN';
  }
  return lang;
}

function tr$(key) {
  var lang = getCurrentLanguage();
  var parts = key.split('.');
  var ret = STRINGS_ON_DIFFERENT_LANGUAGES[lang];
  for (var i in parts) {
    ret = ret[parts[i]];
  }
  return ret;
}


var COUNTRIES = {
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
};
