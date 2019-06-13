---
layout: page
title: Client API
language: en
---

<div class="page-tab-list">
    <a href="/ru/docs/api" class="page-tab page-tab--active">REST API</a>
    <a href="/ru/docs/api/websocket" class="page-tab">JavaScript SDK</a>
</div>

<br>

Current version of REST API: 
```
https://api.web20site.com/v1
```

<br>

### Getting data

Data cat by retrieved from server by ```GET``` requests.

```GET``` request in general looks like this:

```
https://api.web20site.com/v1/entities/метод?client_id=ид-приложения&root=имя-сайта&path=путь/до/элементу&параметр1=значение1&параметр2=значение2
```

<br>

Example of ```GET``` request:

```
https://api.web20site.com/v1/entities/get?client_id=adaa7639-7f7d-6060-9831-4432d004045f&root=hello-world&path=
```

This request returns info by website ```hello-world```.

<br>

### Updating data

To change data on the server, 3 types of requests are used:

- `PUT` - change item
- `POST` - new item
- `DELETE` - delete item.

```POST```, ```PUT``` or ```DELETE``` request looks like:

```
https://api.web20site.com/v1/entities/метод?client_id=application-id
```

Parameters are passed in request body as JSON:

```
{
    "root": "site-name",
    "path": "path/to/item",
    "field1": "value1",
    "field2": "value2"
}
```

Запрос должен иметь заголовок ```Authorization``` с токеном полученным через [OAuth](#авторизация):
```
Authorization: Barear токен-авторизации
```

<br>

Пример ```POST``` запроса в cURL:

```
curl -XPOST https://api.web20site.com/v1/entities/get?client_id=adaa7639-7f7d-6060-9831-4432d004045f -H 'Authorization: Barear ***' -d '{
  "root": "hello-world",
  "path": "translations",
  "fields": [
    "name": "english",
    "value": "Hello, World!",
    "type": "s"
  ]
}'
```

Этот запрос обновляет поле ```english``` элемента данных ```translations``` сайта ```hello-world```.

<br>

### Авторизация

Загружать и изменять данные могут только авторизированные пользователи. Поддерживается OAuth-авторизация через следующие 
соцсети:

* VK
* GitHub
* Google
* Facebook

Чтобы подключить авторизацию на вашем сайте нужно создать приложение через админпанель и указать с 
кагого IP или хоста разршена авторизация.

После этого вы можете использовать SDK для авторизации:

{% highlight html %}
<script src="https://fastlix.com/js/dist/sdk-2.1.js"></script>
{% endhighlight %}

{% highlight javascript %}
var demo = new MDSClient({
  clientId: 'ключ_api_вашего_приложения',
  useLocalStorage: false // не хранить authToken в кеше браузреза
});

demo.login('google').then(function(args) {
  $.ajax({
    url: 'https://api.web20site.com/getMyRoots',
    beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + args.authToken) }
  }).then(function(data) {
    // Ваш код
  });
});
{% endhighlight %}

По-умолчанию, каждый сайт имеет объект ```MDSWebsite``` который уже инициализирован нужным ключём API. Подробнее от
этом вы можете узнать в разделе [SDK](/ru/docs/api/websocket).


<br>

### Методы API
<br>

{% assign endpoint_name_col_width = 4 %}
{% assign endpoint_description_col_width = 8 %}

{% assign arg_name_col_width = 4 %}
{% assign arg_description_col_width = 8 %}


<section>
  <div class="row endpoint_header">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--get">GET</span>  /get</code></pre>
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
     <div class="feature__subtitle endpoint_header__description">Получить элемент</div>
    </div>
  </div>
  
  
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> root
      </div>
    </div>
    <div class="col-sm-4 col-md-3">
      Имя корня
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> path
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
      Путь к элементу
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--bool">bool</span> children
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
      Загрузить дочерние элементы
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> search
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
      Полнотектовый поиск дочерних элементов
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--int">int</span> offset
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
      Полнотектовый поиск дочерних элементов
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--int">int</span> limit
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
      Максимальное количество загружаемых дочерних элементов
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> <span style="font-size: 15px; font-weight: bold;">orderChildrenBy</span>
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
      Сортировка дочерних элементов по значению поля
    </div>
  </div>
</section>




<section class="page__section">
  <div class="row endpoint_header">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--put">PUT</span> /change</code></pre>
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
      <p class="feature__subtitle endpoint_header__description">Создать элемент</p>
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> root
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
      Имя корня
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> path
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
        Путь к новому элементу
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">arr</span> fields
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
        <p>Поля нового элемента. Пример:</p>
        <div class="highlighter-rouge">
          <pre class="highlight highlight--example"><code>[
  {
    "name": "field1",
    "type": "s",
    "value": "Hello, World!"
  },
  {
    "name": "field2",
    "type": "i",
    "value": "123"
  },
  ...
]
</code></pre></div>
        <p>
            Допустимые типы:
        </p>
        <p>
            <div><code>s</code> &mdash; строка</div>
            <div><code>i</code> &mdash; целое число</div>
            <div><code>r</code> &mdash; дробное число</div>
            <div><code>b</code> &mdash; булево значение</div>
        </p>
    </div>
  </div>
  
  
  <div>
    <p>Пример:</p>
    <div class="highlighter-rouge">
      <pre class="highlight highlight--example"><code>curl -XPOST https://api.web20site.com/v1/entities -d '{
  "root": "example",
  "path": "data/entity1",
  "fields": []
}'
</code></pre></div>

  </div>
</section>



<section class="page__section">
  <div class="row endpoint_header">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--post">PUT</span> /create</code></pre>
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
      <p class="feature__subtitle endpoint_header__description">Изменить элемент</p>
    </div>
  </div>
  
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> root
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
      Имя корня
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> path
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
        Путь к элементу
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">arr</span> fields
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
        Поля элемента
    </div>
  </div>
</section>



<section class="page__section">
  <div class="row endpoint_header">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--delete">DELETE</span> /create</code></pre>
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
      <p class="feature__subtitle endpoint_header__description">Удалить элемент</p>
    </div>
  </div>
  
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> root
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
      Имя корня
    </div>
  </div>
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> path
      </div>
    </div>
    <div class="col-sm-8 col-md-9">
        Путь к элементу
    </div>
  </div>
</section>




{% comment %}

<section class="page__section">
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--get">GET</span> /getRoots</code></pre>
      </div>
      <p class="feature__subtitle">Получит список корней</p>
      <p></p>
    </div>
    <div class="col-sm-8 col-md-9">
      <div class="row">
        <div class="col-sm-4 col-md-3">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> search
          </div>
        </div>
        <div class="col-sm-8 col-md-9">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
      <div class="row">
        <div class="col-sm-4 col-md-3">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--int">int</span> offset
          </div>
        </div>
        <div class="col-sm-8 col-md-9">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
      <div class="row">
        <div class="col-sm-4 col-md-3">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--int">int</span> limit
          </div>
        </div>
        <div class="col-sm-8 col-md-9">
          Максимальное количество загружаемых дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>

<section class="page__section">
  <div class="row">
    <div class="col-sm-4 col-md-3">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--get">GET</span> /getMyRoots</code></pre>
      </div>
      <p class="feature__subtitle">Получит список своих корней</p>
      <p></p>
    </div>
    <div class="col-sm-8 col-md-9">
      <div class="row">
        <div class="col-sm-4 col-md-3">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> search
          </div>
        </div>
        <div class="col-sm-8 col-md-9">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
      <div class="row">
        <div class="col-sm-4 col-md-3">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--int">int</span> offset
          </div>
        </div>
        <div class="col-sm-8 col-md-9">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
      <div class="row">
        <div class="col-sm-4 col-md-3">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--int">int</span> limit
          </div>
        </div>
        <div class="col-sm-8 col-md-9">
          Максимальное количество загружаемых дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>

{% endcomment %}