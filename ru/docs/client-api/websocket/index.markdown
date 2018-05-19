---
layout: page
title: Описание API
language: ru
---

<div class="page-tab-list">
    <a href="/ru/docs/client-api" class="page-tab">REST</a>
    <a href="/ru/docs/client-api/websocket" class="page-tab page-tab--active">WebSocket</a>
    <a href="/ru/docs/client-api/sdk" class="page-tab">SDK</a>
    <a href="/ru/docs/client-api/formatters" class="page-tab">Форматтеры</a>
</div>

Для доступа к API по Websocket существует библиотека JavaScript:
* [https://myda.space/js/dist/api-v3.0.js](https://myda.space/js/dist/api-v3.0.js) &mdash; версия для браузера
* [https://github.com/mydataspace/mydataspace](https://github.com/mydataspace/mydataspace) &mdash; версия для nodejs


### Mydataspace

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">request(eventName, data)</code></pre>
      </div>
      <p class="feature__subtitle">Отправляет запрос на сервер</p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> eventName
          </div>
        </div>
        <div class="col-md-8">
          Название метода
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--array">obj</span> data
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
      <div class="feature__code_example">Пример</div>
{% highlight javascript %}
const data =
  await Mydataspace.request(
    'entities.get', {
      root: 'hello-world',
      path: 'data',
      children: true
    });
{% endhighlight %}

    </div>
  </div>
</section>

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">emit(eventName, data)</code></pre>
      </div>
      <p class="feature__subtitle">Отправляет запрос на сервер</p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> eventName
          </div>
        </div>
        <div class="col-md-8">
          Название метода
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--array">obj</span> data
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
      <div class="feature__code_example">Пример</div>
{% highlight javascript %}
Mydataspace.emit(
  'entities.delete', {
    root: 'hello-world',
    path: 'data'
  });
{% endhighlight %}
    </div>
  </div>
</section>