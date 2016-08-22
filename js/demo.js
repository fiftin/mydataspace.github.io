var myda = new Myda({ root: 'blog.myda.space' });

myda.connect();

myda.authorize({ app: 'sfdasdfasdfasd', permission: 'admin' });

myda.entities.create('posts/my_first_post', { title: 'First post', text: 'Hello World!' });

myda.entities.get('posts', { children: true, fields: true, search: 'post', offset: 10, limit: 10 }).then(function(data) {
  // data.children.my_first_post
});
