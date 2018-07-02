---
layout: page
title: Хранение файлов
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
            <iframe style="margin-top: -2px;" width="100%" height="481" src="https://www.youtube.com/embed/Wm6qXsgEZnQ?rel=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
    </div>
</div>

Вы можете хранить на сервере файлы размером до **100Мб**.

Файлы у нас называются **ресурсами**.

### Доступны 3 вида ресурсов:

- <i class="fa fa-file"></i> **Файлы** &mdash; любые файлы. После загрузки доступны по URL сделующего формата:

  ```https://cdn.web20site.com/files/имя-ресурса.расширение-файла```

  Пример: [https://cdn.web20site.com/files/r14aBjDMX.json](https://cdn.web20site.com/files/r14aBjDMX.json)

- <i class="fa fa-image"></i> **Картинки** &mdash; файлы форматов ```jpg```, ```png``` и ```bmp```. Для них автоматичеси создаются уменьшенные копии 3 размеров:
  
  - ```ms``` &mdash; ширина и высота не более 100px
  - ```md``` &mdash; ширина и высота не более 500px
  - ```lg``` &mdash; ширина и высота не более 1000px
  
  Все миниатюры имеют расширение ```jpg``` и доступны по адресу следующего формата:
  
  ```https://cdn.web20site.com/images/размер/имя-ресурса.jpg```
  
  Пример: [https://cdn.web20site.com/images/md/HyrQl64fQ.jpg](https://cdn.web20site.com/images/md/HyrQl64fQ.jpg)
  
  
  
- <i class="fa fa-user"></i> **Аватарки** &mdash; картинки, которые будут использоваться в качестве фотографии пользователя, продукта и т.п.
    Для них автоматически создаются квадратные миниатюры 3 размеров:
    
  - ```ms``` &mdash; 100x100 пикселей
  - ```md``` &mdash; 200x100 пикселей
  - ```lg``` &mdash; 300x100 пикселей
  
  Все миниатюры имеют расширение ```png``` и доступны по адресу следующего формата:
  
  ```https://cdn.web20site.com/avatars/размер/имя-ресурса.png```
   
  Пример: [https://cdn.web20site.com/avatars/md/HJ3pEM4z7.png](https://cdn.web20site.com/avatars/md/HJ3pEM4z7.png)

<br>

На скриншоте ниже показано как вы можете определить конечный URL ресурса:

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
    <img class="safari__img" src="/images/docs/file-storage/resource-name-ru.png" />
</div>

<br>

Для достижения высокой скорости загрузки используется [CDN](https://ru.wikipedia.org/wiki/Content_Delivery_Network).