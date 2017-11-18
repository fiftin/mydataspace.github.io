---
layout: page
title: Клиентский API
language: ru
---


## RESTful

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



## Websocket

Для доступа к API по Websocket существует библиотека JavaScript:
* Для браузера: [https://myda.space/js/dist/api-v2.1.js](https://myda.space/js/dist/api-v2.1.js)
* Для nodejs: [https://github.com/mydataspace/mydataspace](https://github.com/mydataspace/mydataspace)

