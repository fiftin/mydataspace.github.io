---
layout: page
title: Описание API
language: ru
---

<div class="page-tab-list">
    <a href="/ru/docs/client-api" class="page-tab">REST</a>
    <a href="/ru/docs/client-api/websocket" class="page-tab">WebSocket</a>
    <a href="/ru/docs/client-api/sdk" class="page-tab page-tab--active">SDK</a>
    <a href="/ru/docs/client-api/formatters" class="page-tab">Форматтеры</a>
</div>

По-мимо глобального объекта ```Mydataspace``` SDK также включает следующие глобальные объекты:
* ```MDSConsole``` &mdash; используется только внутри задачи.
* ```MDSCommon``` &mdash; набор утилитанрых методов.

### MDSConsole

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">root</code></pre>
      </div>
      <p class="feature__subtitle"></p>
      <p></p>
    </div>
    <div class="col-md-8">
      Полнотектовый поиск дочерних элементов
    </div>
  </div>
</section>

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">fields</code></pre>
      </div>
      <p class="feature__subtitle"></p>
      <p></p>
    </div>
    <div class="col-md-8">
      <p>Полнотектовый поиск дочерних элементов</p>
    </div>
  </div>
</section>

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">success(str)</code></pre>
      </div>
      <p class="feature__subtitle"></p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--void">str</span> str
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">fail(str)</code></pre>
      </div>
      <p class="feature__subtitle"></p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--array">str</span> str
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">log(str)</code></pre>
      </div>
      <p class="feature__subtitle"></p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--array">str</span> str
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">ok(str)</code></pre>
      </div>
      <p class="feature__subtitle"></p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--array">str</span> str
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">info(str)</code></pre>
      </div>
      <p class="feature__subtitle"></p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--array">str</span> str
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">warn(str)</code></pre>
      </div>
      <p class="feature__subtitle"></p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--array">str</span> str
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
      <div class="highlighter-rouge">
        <pre class="highlight"><code class="feature__method_name">error(str)</code></pre>
      </div>
      <p class="feature__subtitle"></p>
      <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--array">str</span> str
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>

### MDSCommon

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
        <p class="feature__subtitle">permit</p>
        <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--array">obj</span> src
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--array">arr|obj</span> format
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>

<section class="feature__section">
  <div class="row">
    <div class="col-md-4">
        <p class="feature__subtitle">req</p>
        <p></p>
    </div>
    <div class="col-md-8">
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--array">obj</span> src
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          <div class="highlighter__var">
            <span class="highlight__var_type highlight__var_type--array">arr|obj</span> format
          </div>
        </div>
        <div class="col-md-8">
          Полнотектовый поиск дочерних элементов
        </div>
      </div>
    </div>
  </div>
</section>