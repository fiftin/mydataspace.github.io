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

	ROOT_FIELDS: [
		'avatar',
		'name',
		'tags',
		'websiteURL',
		'description',
		'country',
		'language',
		'category',
		'readme',
    'datasource'
	],

	HIDDEN_ROOT_FIELDS: [
		'vk',
		'isVKAuth',
		'facebook',
		'isFacebookAuth',
		'twitter',
		'isTwitterAuth',
		'odnoklassniki',
		'isOdnoklassnikiAuth'
	],

	IGNORED_PATHS: [
		// 'comments',
		// 'views',
		// 'likes'
		// 'processes'
	],

  IGNORED_WHEN_EMPTY_PATHS: [
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

