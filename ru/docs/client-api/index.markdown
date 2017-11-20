---
layout: page
title: Клиентский API
language: ru
---

<div class="page-tab-list">
    <a href="/ru/docs/client-api" class="page-tab">WebSocket</a>
    <a href="/ru/docs/client-api/websocket" class="page-tab page-tab--active">REST</a>
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

Получить элемент/корень

Создать элемент/корень

Изменить элемент/корень

Удалить элемент/корень

Получит список элементов

Получит список корней
