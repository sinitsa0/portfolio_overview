Инструкция по запуску:
1. скачать папку dist и открыть ее в vs code
2. через терминал vs code установить live server (если еще не установлен): npm install -g live-server
3. находясь в папке dist запустить live server командой: live-server


Архитектура
1. Папка components - здесь хранятся компоненты, которые можно переиспользовать много раз:
    - Button
    - Input
    - PortfolioItem
2. Папка store - хранилище с одним слайсом: список активов и url для websocket (сохраняется в localStorage)
3. Файлы верхнего уровня:
    - main - точка входа и подключение хранилища с основным приложением
    - App - приложение: прописана логика с использованием компонент


Библиотеки:
1. react
2. react-redux
3. @reduxjs/toolkit
4. axios
5. classnames


Демо видео файл лежит в корне, называется video.mp4.
