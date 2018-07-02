---
layout: page
title: Выполнение кода на сервере
language: ru
page_content_class: page__content--800
---

<div style="width: 800px; height: 570px; margin: auto;">
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
    <div style="overflow: hidden; margin-bottom: -10px;">
      <iframe style="margin-top: -2px;" width="100%" height="481" src="https://www.youtube.com/embed/pLwQw3Un010?rel=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </div>
  </div>
</div>

Web 2.0 Site позволяет выполнять скрипты JavaScript (задачи) на сервере по расписанию — раз в час, сутки, 
неделю или месяц. Продолжительность выполнения 1 задачи ограничена двумя минутами.

Задача может состоять из нескольких JavaScript файлов, но ```main.js``` всегда выполняется последним.

Код задачи выполняется в песочнице на сервере точно также как в браузере. Благодаря этому задачи можно 
отлаживать непосредственно в браузере из административной панели.