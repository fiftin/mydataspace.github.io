---
layout: page
title: Бекенд
language: ru
---
**Бекенд** -- это серверная часть системы, предоставляющаю API для чтения, поиска, загрузки и изменения данных.

![Backend schema](/images/docs/backend/backend-schema-ru.svg){:style="width: 800px; display: block; margin: 20px 0"}

Первый доступ к бекенду осуществляется через *адмнинистративную панель* MyDataSpace.
С помощью неё администратор создает скрипты, загружает необходимые данные и настраивает доступ к ним.
После этого можно подключаться к бекенду с сайта или из приложения.

Адмнинистративную панель MyDataSpace:

<div class="safari" style="width: 900px; max-width: 100%">
  <div class="safari__header">
      <div class="safari__buttons">
        <div class="safari__button safari__button--red"></div>
        <div class="safari__button safari__button--orange"></div>
        <div class="safari__button safari__button--green"></div>
      </div>
    <div class="safari__address_bar">
      <div class="safari__url">{{ 'https://myda.space' | replace: "https://","<span class='safari__url__https'>https://</span>" }}</div>
    </div>
  </div>
  <img class="safari__img" src="/images/docs/backend/admin-panel-ru.png" />
</div>



### Приложения

Настройка доступа к данным осуществляется через механизм *приложений*.

**Приложение** -- это сайт или другое клиентское приложение которое осуществляет доступ на записть к данным
хранящимся в MyDataSpace.

<div class="safari" style="width: 900px; max-width: 100%">
  <div class="safari__header">
      <div class="safari__buttons">
        <div class="safari__button safari__button--red"></div>
        <div class="safari__button safari__button--orange"></div>
        <div class="safari__button safari__button--green"></div>
      </div>
    <div class="safari__address_bar">
      <div class="safari__url">{{ 'https://myda.space' | replace: "https://","<span class='safari__url__https'>https://</span>" }}</div>
    </div>
  </div>
  <img class="safari__img" src="/images/docs/backend/admin-panel-apps-ru.png" />
</div>

### Задачи

MyDataSpace позволяет выполнять JS-скрипты (**задачи** в терминологии MyDataSpace) на сервере по
расписанию -- раз в час/сутки/неделю/месяц.

<div class="safari" style="width: 900px; max-width: 100%; margin-bottom: 20px">
  <div class="safari__header">
      <div class="safari__buttons">
        <div class="safari__button safari__button--red"></div>
        <div class="safari__button safari__button--orange"></div>
        <div class="safari__button safari__button--green"></div>
      </div>
    <div class="safari__address_bar">
      <div class="safari__url">{{ 'https://myda.space' | replace: "https://","<span class='safari__url__https'>https://</span>" }}</div>
    </div>
  </div>
  <img class="safari__img" src="/images/docs/backend/tasks-ru.png" />
</div>

Задачи предназначены для выполнения рутинной работа с данными, например синхронизации.
Они не предназначены для сложных вычислений.

Код задачи выполняется в песочнице на сервере точно также как клиентской код в браузере. Благодаря этому
задачи можно отлаживать непосредственно в браузере из административной панели.

<div class="safari" style="width: 900px; max-width: 100%">
  <div class="safari__header">
      <div class="safari__buttons">
        <div class="safari__button safari__button--red"></div>
        <div class="safari__button safari__button--orange"></div>
        <div class="safari__button safari__button--green"></div>
      </div>
    <div class="safari__address_bar">
      <div class="safari__url">{{ 'https://myda.space' | replace: "https://","<span class='safari__url__https'>https://</span>" }}</div>
    </div>
  </div>
  <img class="safari__img" src="/images/docs/backend/tasks-debug-ru.png" />
</div>

### Ресурсы

На MyDataSpace можно хранить файлы.

<div class="safari" style="width: 900px; max-width: 100%; margin-bottom: 20px">
  <div class="safari__header">
      <div class="safari__buttons">
        <div class="safari__button safari__button--red"></div>
        <div class="safari__button safari__button--orange"></div>
        <div class="safari__button safari__button--green"></div>
      </div>
    <div class="safari__address_bar">
      <div class="safari__url">{{ 'https://myda.space' | replace: "https://","<span class='safari__url__https'>https://</span>" }}</div>
    </div>
  </div>
  <img class="safari__img" src="/images/docs/backend/resources-ru.png" />
</div>

Файлы можно загружать как через административную панель, так и с помощью API.
Для картинок автоматически создаюстя копии различных размеров.