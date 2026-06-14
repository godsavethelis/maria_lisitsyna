# Maria Lisitsyna — Portfolio Landing

Одностраничный сайт-портфолио (лендинг). Чистый HTML/CSS/JS, без сборки и зависимостей.

## Как открыть локально

```bash
cd site
python3 -m http.server 4321
# затем открыть http://localhost:4321
```

(Или просто открыть `site/index.html` двойным кликом — но локальный сервер показывает шрифты/картинки корректнее.)

## Структура

```
site/
├── index.html      ← вся разметка и тексты
├── styles.css      ← оформление (палитра, шрифты, сетки)
├── script.js       ← слайдшоу hero, lightbox галерей, анимации появления, мобильное меню
└── assets/img/     ← оптимизированные фото (ужаты из оригиналов)
```

## Разделы

1. **Hero** — крупный сменяющийся слайдшоу из кадров леса (Федоровское), имя «Maria Lisitsyna» и слоган *Planting. Landscape. Atmosphere.*
2. **01 Approach** — философия подхода.
3. **02 Selected Work** — три проекта:
   - **Forest Landscape Restoration** (Федоровское) — реализация, наполнение.
   - **Novogorsk Estate** — концепция и арт-дирекшн.
   - **Visualization & Presentation Design** — визуализации для Marina Malikova.
4. **03 About** — короткое CV: профиль, навыки, софт.
5. **04 Contact** — почта, Instagram, локация.

## Структура медиа (v2)

Всё интерактивное наполнение задаётся в `data.js` (подписи, порядок, фото/видео).
Оптимизированные файлы лежат в `assets/media/<раздел>/<номер>.jpg|.mp4`:

- `before-after/` — авто-слайдшоу Before/After (18 кадров) в проекте Forest
- `forest/ ferns/ berry/ wooden/ epimediums/ riverside/` — 6 зон «Zones of Interest»
  (клик по зоне → слайдшоу с фото и видео, стрелки влево-вправо)
- `estate-header/` — авто-слайдшоу шапки The Estate Garden (3 кадра)
- `estate-watch/` — листы презентации (кнопка “Explore more” → лайтбокс)
- `malikova/` — слайдшоу Visualization (переключатель PROJECT 01 | 02)

Видео .MOV перекодированы в web-mp4 (H.264, без звука, грузятся только при попадании
во вьюпорт). Заменить/добавить кадр: положить новый `<номер>.jpg|.mp4` и при необходимости
поправить подпись в `data.js`.

## Что нужно вписать (ссылки-заглушки)

В `script.js` сверху есть объект `LINKS` — пока пустой, ссылки неактивны:

```js
var LINKS = { marina: '', school: '', dom: '' };
```

- `marina` — профиль Marina Malikova (подпись «In collaboration with Marina Malikova»)
- `school` — «Moscow School Details» в разделе About
- `dom` — «Dom na Brestskoy» в разделе About

Дай ссылки — впишу, и они станут кликабельными.

## Прочее

- **Почта** в футере сейчас `bumashkin@gmail.com` (как в твоём Figma). Проверь — не опечатка ли.
- **Instagram** — «Blog with pictures @lisavsadu» → instagram.com/lisavsadu.
- **4 концепт-колонки** в The Estate Garden (Forest Integration / Spatial Layering /
  Material Continuity / Ecological Planting) — тексты я написал по смыслу проекта,
  в Figma там были заглушки. Поправь, если нужно.
- **Тексты** — все на английском, правятся прямо в `index.html`.

## Видео в hero

Оригинальные ролики (.MOV, HEVC, 10–40 МБ) не пересжаты — на машине нет `ffmpeg`,
а .MOV ненадёжно играет в браузерах. Сейчас в hero — слайдшоу из фото (быстро и работает везде).
Чтобы добавить видео: установить ffmpeg (`brew install ffmpeg`), перекодировать выбранный ролик в
web-mp4 (H.264) + poster, и заменить `.hero__slides` на `<video autoplay muted loop playsinline>`.
Скажи — сделаю.

## Деплой

Папку `site/` можно выложить как есть на любой статический хостинг:
Netlify (перетащить папку), GitHub Pages, Cloudflare Pages, Vercel.
