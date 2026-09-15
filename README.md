# Oliver's Pizza weboldal – tartalom kezelése

Ez az útmutató ahhoz készült, hogy **programozói tudás nélkül** lehessen képet, videót és logót cserélni az oldalon.

Az oldal a GitHubról megy élesbe (GitHub Pages → oliverspizza.hu). Amit a GitHubon a `main` ágon módosítasz, az 1–2 percen belül megjelenik az éles oldalon.

---

## 1. Előfeltétel: GitHub-fiók

**Ez mindenképpen kell**, bármelyik módszert használod. A fiók ingyenes, nem kell hozzá bankkártya.

### Regisztráció (kb. 2 perc)

1. Nyisd meg: https://github.com/signup
2. Add meg az e-mail címed → **Continue**
3. Adj meg egy jelszót → **Continue**
4. Válassz felhasználónevet (ez lesz a GitHub-neved) → **Continue**
5. Erősítsd meg az e-mail címed a kapott levélben.

### Meghívás a projektbe

A regisztráció után a repó tulajdonosának meg kell hívnia téged:

> Settings → Collaborators → **Add people** → a felhasználónév megadása → **Write** jogosultság

A meghívottnak e-mailben jön egy levél, abban az **Accept invitation** gombra kell kattintani. Enélkül nem lehet fájlt feltölteni.

> **Fontos:** a GitHub 2021 óta **nem fogadja el a fiók jelszavát** feltöltéshez a Terminálból. A böngészős módszernél (2. fejezet) ez nem számít, ott a sima bejelentkezés elég. A Terminálos módszernél egyszeri böngészős bejelentkezés kell (lásd 4. fejezet).

---

## 2. A mappaszerkezet

Minden kép és videó a `content` mappában van:

```text
content/
  uploads/          <- IDE MÁSOLD az új fájlokat
    images/           galéria fotók
    videos/           galéria videók
    logos/            partner cégek logói
    fovideo/          a nyitóképernyő nagy videója (ide EGY videó kerüljön)
  oldal/            <- az oldalba fixen beépített képek (főoldali fotók, logó, háttérvideó)
  archivum/         <- félretett fájlok (a tartalma nem kerül fel a GitHubra)
  gallery-data.js   <- generált fájl, ne szerkeszd
  logos-data.js     <- generált fájl, ne szerkeszd
  site-data.js      <- generált fájl, ne szerkeszd
```

A legfontosabb szabály: **amit a `content/uploads` alá feltöltesz, az magától megjelenik az oldalon. Amit onnan kitörölsz, az eltűnik.**

Támogatott képek: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif` · Támogatott videók: `.mp4`, `.webm`, `.mov`

---

## 3. Munka a böngészőből – EZ A LEGEGYSZERŰBB

Semmit nem kell telepíteni, csak a GitHub-fiók és az elfogadott meghívó.
A repó: https://github.com/nikpalyi/olivers-pizza

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

A fájl neve bármi lehet. Csak **egy** videó legyen a mappában.

> A GitHub böngészős feltöltésének 25 MB-os fájlméret korlátja van. Ennél nagyobb videót előbb tömöríteni kell.

### Új partnerlogó

1. Töltsd fel a `content/uploads/logos` mappába.
2. A fájlnév eleje a sorrendet adja, a vége a cég nevét, például: `12-kedvenc-ceg.png`.

Ha a cégnév ékezetes vagy speciális írásmódú (`KPMG`, `Pallér Csarnok`), írd be a pontos nevet a `scripts/update-content.js` fájl tetején lévő `logoNames` listába.

### Mi történik a háttérben?

A `.github/workflows/frissites.yml` minden feltöltés/törlés után magától lefuttatja a frissítő scriptet. A GitHubon az **Actions** fülön lehet követni: ha ott zöld pipa van, kész a frissítés.

---

## 4. Munka a saját gépről (frissites.command)

Akkor hasznos, ha sok fájlt mozgatsz egyszerre, vagy előre meg akarod nézni az eredményt a böngészőben.

### Egyszeri előkészítés

1. **Node.js** telepítése: https://nodejs.org/ (az LTS verzió)
2. **GitHub CLI** telepítése: https://cli.github.com/ – ezen keresztül tudsz bejelentkezni a GitHub-fiókodba.

### A használat

1. Másold a fájlokat a megfelelő `content/uploads/...` mappába (Finderben, húzd be őket).
2. Kattints duplán erre a fájlra:

```text
frissites.command
```

A script mindent elvégez, és közben kérdez:

- **Első alkalommal** megkérdezi a **GitHub felhasználónevedet** és az **e-mail címedet** – ez kerül a mentések mellé aláírásként.
- **Első alkalommal** megnyitja a böngészőt a GitHub bejelentkezéshez: ott a saját felhasználóneveddel és jelszavaddal lépsz be, és megerősíted a Terminálban megjelenő kódot.
- Utána minden alkalommal megmutatja, mely fájlok változtak, és megkérdezi: **„Feltoltsem ezeket az eles oldalra? (i = igen)”**

Ha `i`-t nyomsz, a script elmenti és feltölti a változásokat – **a git parancsokat nem neked kell begépelni, benne vannak a scriptben.** Ha bármi mást nyomsz, semmit nem tölt fel, a változások a gépeden maradnak.

Sikeres futás után ilyesmit látsz:

```text
Galéria frissítve: 71 elem (64 feltöltött, elöl).
Logók frissítve: 11 elem.
Fővideó: content/uploads/fovideo/animated-logo.mp4

KESZ. Az eles oldal 1-2 percen belul frissul:
https://oliverspizza.hu
```

### Ha csak megnézni akarod, feltöltés nélkül

Futtasd a scriptet, és a kérdésnél nyomj `n`-t. Utána nyisd meg az `index.html` fájlt böngészőben. Ha jónak találod, futtasd újra és nyomj `i`-t.

---

## 5. A főoldal fix képeinek cseréje

A főoldalon néhány kép fixen be van építve (`content/oldal` mappa):
`pizza-hero.jpg`, `pizza2.jpg`, `pizza3.jpg`, `chef-kitchen.jpg`, `pizza-oven2.jpg`, `proud-chef.jpg`, `pizza-chef2.jpg`, `oil.mp4`, `logo.png`.

Ezeket úgy lehet cserélni, hogy **ugyanolyan néven** töltesz fel egy új fájlt a `content/oldal` mappába – a feltöltés felülírja a régit. Így nem kell HTML-t szerkeszteni.

---

## 6. Szövegek átírása

A képekkel ellentétben a szövegek nem külön mappában vannak, hanem az **`index.html`** fájlban. Ezek is átírhatók a böngészőből, csak egy kicsit óvatosabban kell csinálni.

### Lépésről lépésre

1. Nyisd meg a repó főoldalán az **`index.html`** fájlt.
2. Jobbra fent kattints a **ceruza ikonra** (Edit this file).
3. Keresd meg a szöveget: nyomj **Cmd+F** (Mac) vagy **Ctrl+F** (Windows), és írd be a mondat pár szavát.
4. Írd át a szöveget.
5. Görgess le, és kattints a **Commit changes** gombra.

1–2 perc múlva élesben is látszik.

### Az egyetlen szabály, amit be kell tartani

Csak a **`>` és a `<` jel közötti részt** írd át. A csúcsos zárójelben lévő dolgokhoz ne nyúlj.

Így néz ki egy sor eredetiben:

```html
<p class="hero-desc">Nápolyi stílusú pizza a Te rendezvényedre.<br/>Friss tészta, minőségi alapanyagok, felejthetetlen élmény.</p>
```

Ebből ennyit szabad átírni:

```html
<p class="hero-desc">EZT ÍRD ÁT<br/>ÉS EZT IS</p>
```

Vagyis a `<p class="hero-desc">` és a `</p>` maradjon érintetlenül.

Két apróság:
- A `<br/>` sortörést jelent. Ha a szöveg közepén látod, ott új sorban folytatódik a felirat. Nyugodtan maradhat, vagy áthelyezhető.
- A `<strong>szöveg</strong>` félkövér kiemelést jelent.

### Hol vannak a fontosabb szövegek?

| Mit keresel | Írd be a keresőbe |
|---|---|
| Nyitóképernyő felirata | `Nápolyi stílusú pizza a Te` |
| „Miért Oliver's?" blokk | `FRISS TÉSZTA` |
| „Mit kapsz?" rész | `MIT KAPSZ` |
| Pizzák felsorolása | `Pár közkedvelt pizza` |
| Galéria feletti cím | `AHOGY LENNIE KELL` |
| Rólam / bemutatkozás | `Sipőcz Olivér vagyok` |
| Kapcsolat, telefonszám | `page-kontakt` |
| Gyakori kérdések | `page-gyik` |

### Ha valami elromlik

Nem tudsz kárt tenni benne véglegesen: a GitHub minden mentést megőriz. Ha a módosítás után furcsán néz ki az oldal, szólj, és egy kattintással visszaállítható az előző állapot.

Ezért érdemes **egyszerre egy szöveget** átírni és megnézni az eredményt, nem tízet egyszerre.

---

## 7. Hasznos tudnivalók

- A galéria sorrendjét a fájlnév adja, ezért érdemes a sorszámozott nevet megtartani.
- Álló képből a script magasabb csempét, nagyon széles képből szélesebb csempét csinál.
- Logóknál átlátszó hátterű `.png` vagy `.webp` mutat a legjobban. A Google képkeresőből mentett, „kockás hátterű” fájl **nem** átlátszó – azon a kockás minta valódi képpont.
- A képeket érdemes feltöltés előtt kisebbre menteni (1600–2000 px széles, 300–500 KB). A túl nagy fájlok lassítják az oldalt.
- A `content/archivum` mappát a script nem nézi, és a `.gitignore` miatt a tartalma nem is kerül fel a GitHubra. Ide lehet félretenni fájlokat a saját gépeden törlés helyett.

Ha valami nem jelenik meg: nézd meg a GitHub **Actions** fülén, hogy lefutott-e a frissítés, és hogy jó mappába került-e a fájl.
