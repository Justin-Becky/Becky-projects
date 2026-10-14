# Becky's Mailbox ♡

A little red postbox that receives one letter a day during the week before Becky's birthday.
Each letter flies out of the mailbox, opens, and shows a memory with photos. Letters she has already read stay available in "My letters".

Plain HTML, CSS and JavaScript: no build step, works on GitHub Pages, iPhone and desktop.

## Files

| File | What it is |
| --- | --- |
| `letters.js` | **The only file you need to edit**: birthday date, letters, photos |
| `images/` | Your photos (the `placeholder-*.svg` files can be deleted once replaced) |
| `index.html` | Page structure and the mailbox drawing |
| `style.css` | Pastel styles and animations |
| `app.js` | Logic: dates, delivery animation, reader, archive |

## 1. Personalise

Open `letters.js`:

1. Set `birthday` to her real birthday, e.g. `"2026-10-28"`. The first letter arrives `daysBefore` (7) days earlier.
2. Write each letter. `day: 0` is the first day, `day: 7` is the birthday itself. Leave an empty line between paragraphs.
3. Replace everything in `[brackets]` with your own memories.
4. Put your photos in `images/` and reference them, for example:
   ```js
   photos: [
     { src: "images/first-date.jpg", caption: "Our first date" }
   ]
   ```
   A letter can have 0, 1 or several photos. Tip: resize photos to about 1200px wide so they load fast on her phone.
   GitHub Pages is case-sensitive: `Photo.JPG` and `photo.jpg` are different files.

## 2. Test locally

Open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. To try any day without waiting:

- `http://localhost:8000/?date=2026-10-24` pretends today is that date
- add `&reset=1` to forget which letters were opened

## 3. Deploy on GitHub Pages

1. Create a new repository on GitHub (for example `becky-mailbox`).
2. Upload all the files of this folder to it (keep the `images/` folder).
3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
4. After a minute the site is live at `https://<your-username>.github.io/becky-mailbox/`.

On her iPhone, she can open the link in Safari and use **Share → Add to Home Screen** to get it as a little app icon.

## Good to know

- Letters unlock at midnight, using the phone's own clock and time zone.
- What she has read is remembered per device (browser storage). On a new device, all arrived letters simply show up as new again.
- The content is in `letters.js`, so someone curious enough could read it in the page source or with `?date=`. It's a sweet surprise, not a vault: don't put anything secret in it.
