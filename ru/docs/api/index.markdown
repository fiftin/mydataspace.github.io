---
layout: page
title: Описание API
language: ru
---

<div class="page-tab-list">
    <a href="/ru/docs/api" class="page-tab page-tab--active">REST API</a>
    <a href="/ru/docs/api/websocket" class="page-tab">JavaScript SDK</a>
</div>

<br>

Текущая версия API: ```https://api.web20site.com/v1```

<br>

### Получение данных

<br>

```GET``` запрос в общем виде выглядит так:

```
https://api.web20site.com/v1/entities/метод?clientId=ид-приложения&параметр1=значение1&параметр2=значение2
```

<br>

Пример ```GET``` запроса:

```
https://api.web20site.com/v1/entities/get?clientId=234712341723841723&root=hello-world&path=
```

Этот запрос возвращает информацию с сайта ```hello-world```.

<br>

### Обновление данных

<br>

```POST```, ```PUT``` или ```DELETE``` запросы имеет вид:

```
https://api.web20site.com/v1/entities/метод?clientId=ид-приложения
```

параметры передаются в теле запроса в виде JSON:

```
{
    "параметр1": "значение1",
    "параметр2": "значение2"
}
```

Запрос должен иметь заголовок ```Authorization``` с токеном полученным через OAuth:
```
Authorization: Barear токен-авторизации
```

<br>
<br>

### Авторизация

<br>

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
<script src="https://web20.site/js/dist/web2.0.js"></script>
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

<br>
<br>

### API Endpoints

<section>
  <div class="highlighter-rouge">
  <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--get">GET</span>  /get</code></pre>
  </div>
  <p class="feature__subtitle">Получить элемент/корень</p>
  <p></p>

  <div class="row">
    <div class="col-md-4">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> root
      </div>
    </div>
    <div class="col-md-8">
      Имя корня
    </div>
  </div>
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> path
      </div>
    </div>
    <div class="col-md-8">
      Путь к элементу
    </div>
  </div>
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--bool">bool</span> children
      </div>
    </div>
    <div class="col-md-8">
      Загрузить дочерние элементы
    </div>
  </div>
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> search
      </div>
    </div>
    <div class="col-md-8">
      Полнотектовый поиск дочерних элементов
    </div>
  </div>
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--int">int</span> offset
      </div>
    </div>
    <div class="col-md-8">
      Полнотектовый поиск дочерних элементов
    </div>
  </div>
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--int">int</span> limit
      </div>
    </div>
    <div class="col-md-8">
      Максимальное количество загружаемых дочерних элементов
    </div>
  </div>
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter__var">
        <span class="highlight__var_type highlight__var_type--str">str</span> <span style="font-size: 15px; font-weight: bold;">orderChildrenBy</span>
      </div>
    </div>
    <div class="col-md-8">
      Сортировка дочерних элементов по значению поля
    </div>
  </div>
</section>
<section class="page__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--post">POST</span> /change</code></pre>
      </div>
      <p class="feature__subtitle">Создать элемент/корень</p>
      <p>Пример:</p>
      <div class="highlighter-rouge">
        <pre class="highlight highlight--example"><code>curl -XPOST https://api.web20site.com/v1/entities -d '{
  "root": "example",
  "path": "data/entity1",
  "fields": []
}'
</code></pre></div>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> root
          </div>
        </div>
        <div class="col-md-8">
          Имя корня
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> path
          </div>
        </div>
        <div class="col-md-8">
            Путь к новому элементу
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">arr</span> fields
          </div>
        </div>
        <div class="col-md-8">
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
    </div>
  </div>
</section>
<section class="page__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--put">PUT</span> /create</code></pre>
      </div>
      <p class="feature__subtitle">Изменить элемент/корень</p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> root
          </div>
        </div>
        <div class="col-md-8">
          Имя корня
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> path
          </div>
        </div>
        <div class="col-md-8">
            Путь к элементу
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">arr</span> fields
          </div>
        </div>
        <div class="col-md-8">
            Поля элемента
        </div>
      </div>
    </div>
  </div>
</section>

<section class="page__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--delete">DELETE</span> /</code></pre>
      </div>
      <p class="feature__subtitle">Удалить элемент/корень</p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> root
          </div>
        </div>
        <div class="col-md-8">
          Имя корня
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> path
          </div>
        </div>
        <div class="col-md-8">
            Путь к элементу
        </div>
      </div>
    </div>
  </div>
</section>

<section class="page__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--get">GET</span> /getRoots</code></pre>
      </div>
      <p class="feature__subtitle">Получит список корней</p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> search
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--int">int</span> offset
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--int">int</span> limit
          </div>
        </div>
        <div class="col-md-8">
          Максимальное количество загружаемых дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>

<section class="page__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--get">GET</span> /getMyRoots</code></pre>
      </div>
      <p class="feature__subtitle">Получит список своих корней</p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> search
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--int">int</span> offset
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--int">int</span> limit
          </div>
        </div>
        <div class="col-md-8">
          Максимальное количество загружаемых дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>
