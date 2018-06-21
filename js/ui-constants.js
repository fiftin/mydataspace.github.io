UIConstants = {
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
		'view': 'file-image-o',
    'website': 'globe',
    'wizards': 'magic',
    'wizard': 'magic'
	},

  //LICENSES: {
  //  'cc-by-3': {
  //    icon: 'https://licensebuttons.net/l/by/4.0/88x31.png',
  //    url: 'https://creativecommons.org/licenses/by/3.0'
  //  },
	//  'cc-by-4': {
  //    icon: 'https://licensebuttons.net/l/by/4.0/88x31.png',
  //    url: 'https://creativecommons.org/licenses/by/4.0'
  //  },
  //  'ogl-1': {
  //    icon: 'http://www.nationalarchives.gov.uk/images/infoman/ogl-symbol-41px-retina-black.png',
  //    url: 'http://www.nationalarchives.gov.uk/doc/open-government-licence/version/1/'
  //  },
  //  'ogl-2': {
  //    icon: 'http://www.nationalarchives.gov.uk/images/infoman/ogl-symbol-41px-retina-black.png',
  //    url: 'http://www.nationalarchives.gov.uk/doc/open-government-licence/version/2/'
  //  },
  //  'ogl-3': {
  //    icon: 'http://www.nationalarchives.gov.uk/images/infoman/ogl-symbol-41px-retina-black.png',
  //    url: 'http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
  //  },
  //  'standard-terms-of-use': {
  //    url: 'http://data.gov.ru/information-usage'
  //  }
  //},

	ROOT_FIELDS: PROJECT_NAME === 'web20' ? [
    'avatar',
    'name',
    'description',
    'websiteURL',
    //
    'tags',
    'country',
    'language',
    'category',
    'readme'
  ] : [
		'avatar',
		'name',
    'description',
    'websiteURL',
    //
    'tags',
    'country',
    'language',
    'category',
    'readme',
    //
    'datasource',
    'datasourceURL',
    //
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
    licenseURL:     'u'
  },

	HIDDEN_ROOT_FIELDS: PROJECT_NAME === 'web20' ? [
    'vk',
    'isVKAuth',
    'facebook',
    'isFacebookAuth',
    'twitter',
    'isTwitterAuth',
    'odnoklassniki',
    'isOdnoklassnikiAuth',
    'websiteURL',
    'license'
  ] : [
		'vk',
		'isVKAuth',
		'facebook',
		'isFacebookAuth',
		'twitter',
		'isTwitterAuth',
		'odnoklassniki',
		'isOdnoklassnikiAuth'
	],

	IGNORED_PATHS: PROJECT_NAME === 'web20' ? [
		'comments',
		'views',
		'likes',
		'processes'
	] : [],

  IGNORED_WHEN_EMPTY_PATHS: PROJECT_NAME === 'web20' ? [] : [
    'resources',
    'tasks',
    'protos',
    'comments',
    'views',
    'likes',
    'processes'
  ],

	SYSTEM_PATHS: [
		'resources',
		'tasks',
		'protos',
		'comments',
		'views',
		'likes',
		'processes',
    'website',
    'wizards'
	],

	CATEGORY_ICONS: {
		biz: 'briefcase',
		economy: 'area-chart',
		health: 'heart',
		edu: 'graduation-cap',
		ecology: 'leaf',
		culture: 'paint-brush',
		security: 'shield',
		transport: 'car',
		geo: 'map',
		state: 'university',
		tourism: 'plane'
	}
};

