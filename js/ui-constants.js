UIConstants = {
	ENTITY_ICONS: {
		'root': 'database',
		'protos': 'cubes',
		'proto': 'cube',
		'tasks': 'tasks',
		'task': 'file-code-o',
		'logs': 'history',
		'log': 'file-movie-o',
		'resources': 'files-o',
		'resource': 'file-image-o',
		'processes': 'cogs',
		'process': 'cog',
		'likes': 'heart',
		'like': 'heart-o',
		'comments': 'comments',
		'comment': 'comment',
		// 'views': 'photo',
		// 'view': 'file-image-o',
    'website': 'globe',
    'wizards': 'magic',
    'wizard': 'magic',
    'dev': 'keyboard-o',
    'production': 'industry',
    'generators': 'asterisk',
    'generator': 'asterisk',
    'cache': 'clock-o',
    'migration': 'sign-out',
    'includes': 'puzzle-piece',
    'scss': 'paint-brush',
    'public_html': 'code',
    'data': 'database'
	},

	ROOT_FIELDS: [
    'avatar',
    'name',
    'description',
    'websiteURL',
    'tags',
    'country',
    'language',
    'category',
    'readme',
    'domain',
    'license',
    'licenseURL',
    'licenseText'
  ],

  ROOT_FIELDS_TYPES: {
    avatar:         's',
    name:           's',
    tags:           's',
    websiteURL:     'u',
    description:    's',
    country:        's',
    language:       's',
    category:       's',
    readme:         'j',
    datasource:     's',
    datasourceURL:  'u',
    license:        's',
    licenseText:    'j',
    licenseURL:     'u',
    domain:         's'
  },

  // Unused obsolete root fields
	OBSOLETE_ROOT_FIELDS: [
    'country',
    'websiteURL'
  ],

  INVISIBLE_ROOT_FIELDS: ['name',
    'avatar',
    'description',
    'websiteURL',
    'readme',
    'tags',
    'category',
    'country',
    'language',
    'license',
    'licenseURL',
    'licenseText'
  ],

  // Root fields not used for websites, only for skeletons
  // HIDDEN_WEBSITE_FIELDS: [
  //   'tags',
  //   'country',
  //   'language',
  //   'category',
  //   'country',
  //   'license',
  //   'licenseURL',
  //   'licenseText',
  //   'websiteURL'
  // ],

  /**
   * This paths not displayed in tree.
   */
	IGNORED_PATHS: [
    'views',
    'likes',
    'comments',
    'processes',
    'statistics'
  ],

  IGNORED_WHEN_EMPTY_PATHS: [],

  /**
   *  This paths can't be deleted.
   */
	SYSTEM_PATHS: [
	  'data',
    'cache',
		'resources',
		'protos',
		'comments',
		'views',
		'likes',
		'processes',
    'website',
    'tasks',
    'wizards',
    'production',
    'production/data',
    'production/resources',
    'production/protos',
    'production/cache',
    'dev',
    'dev/data',
    'dev/resources',
    'dev/protos',
    'dev/cache',
    'website/includes',
    'website/public_html',
    'website/migration',
    'website/scss',
    'website/wizards',
    'website/generators',
    'website/tasks'
	],

  EDITOR_SUPPORTED_EXTENSIONS: {
	  'js': {
	    mode: 'javascript'
    },
    'css': {
      mode: 'css'
    },
    'scss': {
      mode: 'scss'
    },
    'html': {
      mode: 'html'
    },
    'pug': {
      mode: 'jade'
    },
    'json': {
      mode: 'json'
    },
    'yml': {
      mode: 'yml'
    },
    'md': {
      mode: 'markdown'
    },
    'txt': {
      mode: 'text'
    }
  }


};

