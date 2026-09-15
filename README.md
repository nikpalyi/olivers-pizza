# Oliver's Pizza weboldal – tartalom kezelése

Ez az útmutató ahhoz készült, hogy **programozói tudás nélkül**, akár csak a böngészőből lehessen képet, videót és logót cserélni az oldalon.

Az oldal a GitHubról megy élesbe (GitHub Pages → oliverspizza.hu). Amit a GitHubon módosítasz a `main` ágon, az 1–2 percen belül megjelenik az éles oldalon.

---

## 1. A mappaszerkezet

Minden kép és videó a `content` mappában van:

```text
content/
  uploads/          <- IDE MÁSOLD az új fájlokat
    images/           galéria fotók
    videos/           galéria videók
    logos/            partner cégek logói
    fovideo/          a nyitóképernyő nagy videója (ide EGY videó kerüljön)
  oldal/            <- az oldalba fixen beépített képek (főoldali fotók, logó, háttérvideó)
  archivum/         <- sehol nem használt, félretett fájlok
  gallery-data.js   <- generált fájl, ne szerkeszd
  logos-data.js     <- generált fájl, ne szerkeszd
  site-data.js      <- generált fájl, ne szerkeszd
```

A legfontosabb szabály: **amit a `content/uploads` alá feltöltesz, az magától megjelenik az oldalon. Amit onnan kitörölsz, az eltűnik.**

Támogatott képek: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif` · Támogatott videók: `.mp4`, `.webm`, `.mov`

---

## 2. Munka a böngészőből (telepítés nélkül) – EZ A LEGEGYSZERŰBB

Semmit nem kell telepíteni, elég egy GitHub-fiók és szerkesztői jogosultság a repóhoz:
https://github.com/nikpalyi/olivers-pizza

### Új kép feltöltése a galériába

1. Nyisd meg a `content/uploads/images` mappát a GitHubon.
2. Jobbra fent: **Add file → Upload files**.
3. Húzd be a képeket, majd lent **Commit changes**.
4. Várj 1–2 percet, és frissítsd az oldalt.

A galéria a fájlnév sorrendjében jelenik meg, a képek `pizza-01`, `pizza-02`, … nevűek.
- Ha a kép a galéria **elejére** kell: adj neki kisebb számot, pl. `pizza-00.jpeg`.
- Ha a **végére**: nagyobbat, pl. `pizza-70.jpeg`.

### Kép törlése

1. Kattints a képre a `content/uploads/images` mappában.
2. Jobbra fent a **kuka ikon** → lent **Commit changes**.

### A nyitóképernyő nagy videójának cseréje

1. Nyisd meg a `content/uploads/fovideo` mappát.
2. Töröld a benne lévő videót (kuka ikon → Commit changes).
3. **Add file → Upload files** → húzd be az új videót → Commit changes.

A fájl neve bármi lehet, a mappában lévő videót használja az oldal. Csak **egy** videó legyen benne.

> A GitHub böngészős feltöltésének 25 MB-os fájlméret korlátja van. Ennél nagyobb videót előbb tömöríteni kell.

### Új partnerlogó

1. Töltsd fel a `content/uploads/logos` mappába.
2. A fájlnév eleje a sorrendet adja, a vége a cég nevét, például: `11-kedvenc-ceg.png`.

Ha a cégnév ékezetes vagy speciális írásmódú (`KPMG`, `Pallér Csarnok`), írd be a pontos nevet a `scripts/update-content.js` fájl tetején lévő `logoNames` listába.

### Mi történik a háttérben?

A `.github/workflows/frissites.yml` minden feltöltés/törlés után magától lefuttatja a frissítő scriptet, és frissíti a generált adatfájlokat. Ezt a GitHubon az **Actions** fülön lehet követni: ha ott zöld pipa van, kész a frissítés.

---

## 3. Munka a saját gépről (Terminállal)

Csak akkor kell, ha sok fájlt mozgatsz egyszerre, vagy előre meg akarod nézni az eredményt.

1. Telepítsd a Node.js LTS verziót: https://nodejs.org/
2. Másold a fájlokat a megfelelő `content/uploads/...` mappába.
3. Futtasd a frissítést – kattints duplán erre a fájlra:

```text
frissites.command
```

Vagy Terminálból:

```bash
cd /Users/npalyi/Documents/DEV/olivers-pizza
npm run frissit
```

4. Nyisd meg az `index.html` fájlt böngészőben, és ellenőrizd.
5. Ha jó, töltsd fel a GitHubra (`git add . && git commit -m "új képek" && git push`).

Frissítés után ilyesmit kell látnod:

```text
Galéria frissítve: 71 elem (64 feltöltött, elöl).
Logók frissítve: 11 elem.
Fővideó: content/uploads/fovideo/animated-logo.mp4
```

---

## 4. A főoldal fix képeinek cseréje

A főoldalon néhány kép fixen be van építve (`content/oldal` mappa):
`pizza-hero.jpg`, `pizza2.jpg`, `pizza3.jpg`, `chef-kitchen.jpg`, `pizza-oven2.jpg`, `proud-chef.jpg`, `pizza-chef2.jpg`, `oil.mp4`, `logo.png`.

Ezeket úgy lehet cserélni, hogy **ugyanolyan néven** töltesz fel egy új fájlt a `content/oldal` mappába – a feltöltés felülírja a régit. Így nem kell HTML-t szerkeszteni.

---

## 5. Hasznos tudnivalók

- A galéria sorrendjét a fájlnév adja, ezért érdemes a sorszámozott nevet megtartani.
- Álló képből a script magasabb csempét, nagyon széles képből szélesebb csempét csinál.
- Logóknál átlátszó hátterű `.png` vagy `.webp` mutat a legjobban.
- A képeket érdemes feltöltés előtt kisebbre menteni (1600–2000 px széles, 300–500 KB). A túl nagy fájlok lassítják az oldalt.
- A `content/archivum` mappát a script nem nézi – ide lehet félretenni fájlokat törlés helyett.

Ha valami nem jelenik meg: nézd meg a GitHub **Actions** fülén, hogy lefutott-e a frissítés, és hogy jó mappába került-e a fájl.
