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

Вы можете хранить на сервере файлы размером до 100Мб.

Файлы в терминологии Web 2.0 Site называются ресурсами.

Доступны 3 вида ресурсов:

- <i class="fa fa-file"></i> **Файлы**

  ```https://cdn.web20site.com/files/имя-ресурса.расширение-файла```

- <i class="fa fa-image"></i> **Картинки**

  файлы форматов jpg, png, bmp. Для них автоматичеси создаются уменьшенные копии 3 размеров:
  
  - ```ms```
  - ```md```
  - ```lg```
  
  ```https://cdn.web20site.com/images/размер/имя-ресурса.jpg```
  
  Пример: [https://cdn.web20site.com/images/md/U347344.jpg](https://cdn.web20site.com/images/md/U347344.jpg)
  
  
  
- <i class="fa fa-user"></i> **Аватарки**
    
  - ```ms```
  - ```md```
  - ```lg```
  
  ```https://cdn.web20site.com/avatars/размер/имя-ресурса.png```


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