---
layout: page
title: Импорт данных
language: ru
---
<div class="page-tab-list">
  <a href="/ru/docs/import-of-data" class="page-tab page-tab--active">Через веб-интерфейс</a>
  <a href="/ru/docs/import-of-data/programmatically" class="page-tab">Программно</a>
</div>

Веб-интервейс для импорта данных реализован на базе <a href="https://github.com/OpenRefine/OpenRefine" target="_black">OpenRefine</a> &mdash;
инструмента с открытым кодом от Google для обработки данных.

OpenRefine позволяет открывать файлы XLS, XLSX, CSV, XML, JSON и файлы многих других форматов.

Истоичники иформации по OpenRefine:
- Документация по OpenRefine доступна в на <a href="https://github.com/OpenRefine/OpenRefine/wiki" target="_blank">GitHub Wiki</a> (анг).
- Ответы на многие вопросы по работе с OpenRefine можно найти на <a href="https://stackoverflow.com/questions/tagged/openrefine" target="_blank">Stackoverflow</a> (анг).
- <a href="https://medium.com/data-journalism/open-refine-86e7076cb488" target="_blank">Геокодирование в Open Refine</a>.
- Уроки по работе с OpenRefine будут публиковаться в нашем <a href="https://medium.com/@mydataspace_ru" target="_blank">блоге</a>.

<section class="page__section">
  <div class="row">
    <div class="col-md-4">
        <h2 class="margin-top-0">Пример импорта</h2>
        <p>На демо показан импорт данных в новый корня из XLSX-файла через административную панель</p>
    </div>
    <div class="col-md-8">
      <div class="safari">
        <div class="safari__header clearfix">
          <div class="safari__buttons_wrap">
            <div class="safari__buttons clearfix">
              <div class="safari__button safari__button--red"></div>
              <div class="safari__button safari__button--orange"></div>
              <div class="safari__button safari__button--green"></div>
            </div>
          </div>
          <div class="safari__address_bar">
            <div class="safari__url"><span class='safari__url__https'>https://</span>myda.space</div>
          </div>
        </div>
        <div style="margin-right: -2px; margin-bottom: -2px">
          <img class="safari__img" src="/images/docs/import-of-data/openrefine.gif" />
        </div>
      </div>
    </div>
  </div>
</section>