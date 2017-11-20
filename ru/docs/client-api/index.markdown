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
        <h2 class="margin-top-0">Получить элемент/корень</h2>
        <p></p>
    </div>
    <div class="col-md-8">
    </div>
  </div>
</section>
<section class="page__section">
  <div class="row">
    <div class="col-md-4">
        <h2 class="margin-top-0">Создать элемент/корень</h2>
        <p></p>
    </div>
    <div class="col-md-8">
    </div>
  </div>
</section>
<section class="page__section">
  <div class="row">
    <div class="col-md-4">
        <h2 class="margin-top-0">Изменить элемент/корень</h2>
        <p></p>
    </div>
    <div class="col-md-8">
    </div>
  </div>
</section>
<section class="page__section">
  <div class="row">
    <div class="col-md-4">
        <h2 class="margin-top-0">Удалить элемент/корень</h2>
        <p></p>
    </div>
    <div class="col-md-8">
    </div>
  </div>
</section>
<section class="page__section">
  <div class="row">
    <div class="col-md-4">
        <h2 class="margin-top-0">Получит список элементов</h2>
        <p></p>
    </div>
    <div class="col-md-8">
    </div>
  </div>
</section>
<section class="page__section">
  <div class="row">
    <div class="col-md-4">
        <h2 class="margin-top-0">Получит список корней</h2>
        <p></p>
    </div>
    <div class="col-md-8">
    </div>
  </div>
</section>
