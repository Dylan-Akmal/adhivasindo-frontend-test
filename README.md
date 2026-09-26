# Adhivasindo Task Board — Take Home Test Frontend

Aplikasi CRUD Task Management Board (Kanban) dibuat dengan **Ionic + Vue 3 + Vite**, tanpa backend (data disimpan di `localStorage`).

## Fitur

- Board dengan 5 column default: To Do, Doing, Review, Done, Rework — bisa tambah/hapus list.
- Task card berisi judul, deskripsi, assignee (avatar), due date, label (Feature/Bug/Issue/Undefined), priority, checklist, dan attachment (dummy, hanya nama file).
- CRUD penuh lewat modal detail: create, read, update, delete.
- Drag and drop task antar column (native HTML5 drag & drop, simulasi frontend).
- Checklist/subtask dengan progress bar otomatis.
- Filtering & searching berdasarkan judul/deskripsi, assignee, label, dan due date.
- Bonus: cover image per task (upload gambar disimpan sebagai data URL), toast notifikasi saat create/update/delete/pindah task.
- Data tersimpan otomatis di localStorage browser, jadi tetap ada walau halaman di-refresh.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka URL yang muncul di terminal (biasanya `http://localhost:5173`).

## Build untuk production

```bash
npm run build
```

Hasil build ada di folder `dist/` (satu file `index.html` yang sudah menggabungkan semua JS & CSS, karena memakai `vite-plugin-singlefile`), tinggal di-hosting di mana saja.

## Deploy supaya dapat URL (untuk screen record)

Paling cepat pakai Netlify Drop atau Vercel:

1. Jalankan `npm run build` (atau pakai hasil `dist/index.html` yang sudah ada di folder ini).
2. Buka https://app.netlify.com/drop lalu drag & drop folder `dist` ke halaman tersebut — langsung dapat URL publik.
3. Atau upload project ke GitHub lalu hubungkan ke Vercel/Netlify untuk auto-deploy.

## Upload ke repository

```bash
git init
git add .
git commit -m "Take home test frontend - Adhivasindo kanban board"
git branch -M main
git remote add origin <url-repo-github-kamu>
git push -u origin main
```

Struktur project:

```
src/
  components/
    BoardColumn.vue   # satu column beserta drop target
    TaskCard.vue       # tampilan card task
    TaskModal.vue       # modal create/edit/detail task
    FilterBar.vue        # search & filter
  store.js               # state global + localStorage
  App.vue                 # halaman utama (board)
  main.js                  # bootstrap Ionic + Vue
  theme.css                 # styling board & card
```
