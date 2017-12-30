---
layout: page
title: Клиентский API
language: ru
---

<div class="page-tab-list">
    <a href="/ru/docs/client-api" class="page-tab page-tab--active">REST</a>
    <a href="/ru/docs/client-api/websocket" class="page-tab">WebSocket</a>
</div>

Структура URL запроса в общем виде выглядит так:

````
https://api.mydataspace.net/v1/entities/[метод]?параметр1=[значение1]&параметр2=[значение2]
````

В зависимости от действия, запрос может быть ```GET```, ```POST```, ```PUT``` или ```DELETE```.

Например:

```
https://api.mydataspace.net/v1/entities/get?root=hello-world&path=
```

Этот ```GET``` запрос возвращает информацию по корню ```hello-world```.

<section class="page__section">
  <div class="row">
    <div class="col-md-4">
      <p class="feature__subtitle">Получить элемент/корень</p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--get">GET</span> /get</code></pre>
      </div>
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
    </div>
  </div>
</section>
<section class="page__section">
  <div class="row">
    <div class="col-md-4">
      <p class="feature__subtitle">Создать элемент/корень</p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--post">POST</span> /</code></pre>
      </div>
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
        <p class="feature__subtitle">Изменить элемент/корень</p>
        <p></p>
    </div>
    <div class="col-md-8">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--put">PUT</span> /</code></pre>
      </div>
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
        <p class="feature__subtitle">Удалить элемент/корень</p>
        <p></p>
    </div>
    <div class="col-md-8">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--delete">DELETE</span> /</code></pre>
      </div>
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
        <p class="feature__subtitle">Получит список корней</p>
        <p></p>
    </div>
    <div class="col-md-8">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--get">GET</span> /getRoots</code></pre>
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
    </div>
  </div>
</section>

<section class="page__section">
  <div class="row">
    <div class="col-md-4">
        <p class="feature__subtitle">Получит список своих корней</p>
        <p></p>
    </div>
    <div class="col-md-8">
      <div class="highlighter-rouge">
        <pre class="highlight"><code><span class="highlight__request_type highlight__request_type--get">GET</span> /getMyRoots</code></pre>
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
    </div>
  </div>
</section>
