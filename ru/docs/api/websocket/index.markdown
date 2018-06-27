---
layout: page
title: Описание API
language: ru
---

<div class="page-tab-list">
    <a href="/ru/docs/api" class="page-tab">REST API</a>
    <a href="/ru/docs/api/websocket" class="page-tab page-tab--active">JavaScript SDK</a>
</div>

[https://web20.site/js/dist/web2.0.js](https://web20.site/js/dist/web2.0.js)

### MDSWebsite


<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">connect()</code></pre>
      </div>
      <p class="feature__subtitle">Подключиться к серверу</p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="feature__code_example">Пример</div>
{% highlight javascript %}
const root = await MDSWebsite.connect();
{% endhighlight %}
    </div>
  </div>
</section>





<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">login()</code></pre>
      </div>
      <p class="feature__subtitle">Подключиться к серверу и залогиниться</p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="feature__code_example">Пример</div>
{% highlight javascript %}
const root = await MDSWebsite.login();
{% endhighlight %}
    </div>
  </div>
</section>




<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">request(eventName, data)</code></pre>
      </div>
      <p class="feature__subtitle">Отправить запрос на сервер</p>
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
  await MDSWebsite.request(
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
      <p class="feature__subtitle">Отправить событие на сервер</p>
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
MDSWebsite.emit(
  'entities.delete', {
    root: 'hello-world',
    path: 'data'
  });
{% endhighlight %}
    </div>
  </div>
</section>

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">on(eventName, callback)</code></pre>
      </div>
      <p class="feature__subtitle">Обрабатывать событие с сервера</p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--str">str</span> eventName
          </div>
        </div>
        <div class="col-md-8">
          Название события
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--function">fun</span> callback
          </div>
        </div>
        <div class="col-md-8">
          Фукция которая выполнится при выполнении события
        </div>
      </div>
      <p>
        Подписаться на получение события с сервера можно только
        после того как соединение будет установлено. Подписываться на
        получение события необходимо при каждом подключении к серверу.
      </p>
      <p>
        Исключениями являются следующие события:
        <ul>
          <li><code>connected</code></li>
          <li><code>login</code></li>
          <li><code>logout</code></li>
        </ul>
        Начать обрабатывать эти события вы можете до подлючения к серверу и
        подписаться на них достаточно один раз.
      </p>
      <div class="feature__code_example">Пример</div>
{% highlight javascript %}
MDSWebsite.on(
  'entities.delete.res', function (data) {
    
  });
{% endhighlight %}
    </div>
  </div>
</section>


<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">once(eventName, callback)</code></pre>
      </div>
      <p class="feature__subtitle">Слушать событие с сервера 1 раз</p>
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
          Название события
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--function">fun</span> callback
          </div>
        </div>
        <div class="col-md-8">
          Фукция которая выполнится при выполнении события
        </div>
      </div>
      <div class="feature__code_example">Пример</div>
{% highlight javascript %}
MDSWebsite.once(
  'entities.delete.res', function (data) {
    
  });
{% endhighlight %}
    </div>
  </div>
</section>