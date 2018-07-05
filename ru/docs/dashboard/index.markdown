---
layout: page
title: Панель управления
language: ru
page_content_class: page__content--800
---


<div class="safari">
    <div class="safari__header">
        <div class="safari__buttons">
            <div class="safari__button safari__button--red"></div>
            <div class="safari__button safari__button--orange"></div>
            <div class="safari__button safari__button--green"></div>
        </div>
        <div class="safari__address_bar">
            <div class="safari__url">{{ 'https://web20.site/ru' | replace: "https://","<span class='safari__url__https'>https://</span>" }}</div>
        </div>
    </div>
    <img class="safari__img" src="/images/docs/dashboard/intro-ru.png" />
</div>

<br>

Панель управления позволяет:
- Создать, удалять сайты
- Управлять данными ваших сайтов
- Изменять исходный код ваших сайтов
- Создавать и отлаживать задачи, которые будут выполняться на сервере
- Загружать картинки и другие файлы которые будут доступны на ваших сайтах

<br>

## Данные



<br>

<div class="safari">
    <div class="safari__header">
        <div class="safari__buttons">
            <div class="safari__button safari__button--red"></div>
            <div class="safari__button safari__button--orange"></div>
            <div class="safari__button safari__button--green"></div>
        </div>
        <div class="safari__address_bar">
            <div class="safari__url">{{ 'https://web20.site/ru' | replace: "https://","<span class='safari__url__https'>https://</span>" }}</div>
        </div>
    </div>
    <img class="safari__img" src="/images/docs/dashboard/data-ru.png" />
</div>

<br>

Данные которые будут загружаться на страницы сайта динамически, через API. 

Например:

- Информация от товарах
- Комментарии пользователей

<br>

Данные хранятся в древовидном виде, как файлы в файловой системе.

Например, если на вашем сайте пользователь должен выбрать модаль телефона,
то данные могут иметь следующий вид:

```
 data
  |
  |--> apple
  |     |
  |     |--> iphone-8
  |     |     |--> photos
  |     |     |     \--> 1
  |     |     |     \--> 2
  |     |     |
  |     |     \--> reviews
  |     |           \--> 1
  |     |
  |     \--> iphone-10
  |           |--> photos
  |           \--> reviews
  |
  \--> samsung
        |
        \--> galaxy-s-8
              |--> photos
              \--> reviews
```

Подробнее об использовании API для доступа к данным читайте в разделе [Описание API](/ru/docs/api).

<br>

## Исходный код сайта

<br>

<div class="safari">
    <div class="safari__header">
        <div class="safari__buttons">
            <div class="safari__button safari__button--red"></div>
            <div class="safari__button safari__button--orange"></div>
            <div class="safari__button safari__button--green"></div>
        </div>
        <div class="safari__address_bar">
            <div class="safari__url">{{ 'https://web20.site/ru' | replace: "https://","<span class='safari__url__https'>https://</span>" }}</div>
        </div>
    </div>
    <img class="safari__img" src="/images/docs/dashboard/website-ru.png" />
</div>

<br>

Страницы, стили и скрипты вашего сайте. Поддерживаются следующие типы файлов:

- [HTML](https://ru.wikipedia.org/wiki/HTML)
- [pug](https://pugjs.org)
- [JS (JavaScript)](https://ru.wikipedia.org/wiki/JavaScript)
- [CSS](https://ru.wikipedia.org/wiki/CSS)
- [SCSS](https://sass-lang.com/)


## Код выполняющийся на сервере

 

Подробнее читайте в разделе [Выполнение кода на сервере](/ru/docs/how-to-run-code).


## Ресурсы

 
Подробнее читайте в разделе [Хранение файлов](/ru/docs/file-storage).
