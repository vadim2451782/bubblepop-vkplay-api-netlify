# Платёжный бэкенд «Лопни пузыри» для VK Play (Netlify)

Функции:

- `POST /create-payment` — `{ productId, uid }` → `{ url, merchantParam }`
- `GET /callback` — уведомление VK Play, отвечает `{"status":"ok"}`
- `GET /health` — проверка

## Переменные окружения (Site settings → Environment variables)

- `VKPLAY_SECRET` — секрет из «Системных свойств» проекта VK Play
- `VKPLAY_GMRID` — `52062`
- `ALLOWED_ORIGIN` — `https://vadim2451782.github.io`

## Деплой

Netlify → Add new site → Import an existing project → GitHub →
`bubblepop-vkplay-api-netlify` → Deploy (настройки из `netlify.toml` подхватятся сами).

После деплоя адрес вида `https://<name>.netlify.app`:

- проверка: `https://<name>.netlify.app/health`
- callback для VK Play: `https://<name>.netlify.app/callback`
