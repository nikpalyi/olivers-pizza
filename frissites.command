#!/bin/zsh
# Oliver's Pizza - tartalom frissitese es feltoltese az eles oldalra.
# Dupla kattintassal indithato.

cd "$(dirname "$0")"

echo "Oliver's Pizza - tartalom frissitese"
echo "------------------------------------"
echo ""

varj_es_kilep() {
  echo ""
  echo "Az ablak bezarasahoz nyomj meg egy billentyut."
  read -k 1
  exit $1
}

# 1. Adatfajlok ujragenaralasa a content mappa alapjan
npm run frissit
if [ $? -ne 0 ]; then
  echo ""
  echo "HIBA: a frissites nem futott le."
  echo "Ha 'command not found' hibat latsz, telepitsd a Node.js-t: https://nodejs.org/"
  varj_es_kilep 1
fi

echo ""

# 2. Van-e egyaltalan valtozas?
if [ -z "$(git status --porcelain)" ]; then
  echo "Nincs valtozas, minden naprakesz."
  varj_es_kilep 0
fi

echo "Ezek a fajlok valtoztak:"
echo ""
git status --short
echo ""

# 3. Feltoltes megerositese
read -k 1 "valasz?Feltoltsem ezeket az eles oldalra? (i = igen, barmi mas = nem) "
echo ""
echo ""

if [[ "$valasz" != "i" && "$valasz" != "I" ]]; then
  echo "Rendben, nem toltottem fel semmit."
  echo "A valtozasok a gepeden maradtak, kesobb ujra futtathatod ezt a fajlt."
  varj_es_kilep 0
fi

# 4. Ki vagy? Ez csak a mentesek alairasa, elso alkalommal kerdezi meg.
if [ -z "$(git config user.name)" ]; then
  read "ghnev?GitHub felhasznaloneved: "
  if [ -z "$ghnev" ]; then
    echo "Felhasznalonev nelkul nem tudok feltolteni."
    varj_es_kilep 1
  fi
  git config --global user.name "$ghnev"
fi

if [ -z "$(git config user.email)" ]; then
  read "ghemail?GitHub fiokod e-mail cime: "
  if [ -z "$ghemail" ]; then
    echo "E-mail cim nelkul nem tudok feltolteni."
    varj_es_kilep 1
  fi
  git config --global user.email "$ghemail"
fi
echo ""

# 5. Bejelentkezes a GitHubra, ha meg nincs.
#    FONTOS: a GitHub 2021 ota nem fogadja el a fiok jelszavat a feltolteshez.
#    Helyette bongeszos bejelentkezes kell (GitHub CLI), vagy egy token.
# (GIT_TERMINAL_PROMPT=0: ne kerdezzen ra jelszora, csak jelezze ha nincs bejelentkezve)
if ! GIT_TERMINAL_PROMPT=0 git ls-remote --exit-code origin > /dev/null 2>&1; then
  echo "Meg nem vagy bejelentkezve a GitHubra ezen a gepen."
  echo ""
  if command -v gh > /dev/null 2>&1; then
    echo "Most megnyilik a bongeszo. Lepj be a GitHub felhasznaloneveddel"
    echo "es jelszavaddal, majd erosits meg a kepernyon megjeleno kodot."
    echo ""
    gh auth login --hostname github.com --git-protocol https --web
    if [ $? -ne 0 ]; then
      echo "A bejelentkezes nem sikerult."
      varj_es_kilep 1
    fi
    gh auth setup-git > /dev/null 2>&1
  else
    echo "A bejelentkezeshez a GitHub CLI szukseges. Telepitsd innen:"
    echo "  https://cli.github.com/"
    echo "Telepites utan futtasd ujra ezt a fajlt."
    echo ""
    echo "(A GitHub sajnos nem fogadja el a sima fiok-jelszot a feltolteshez,"
    echo " ezert kell a bongeszos bejelentkezes.)"
    varj_es_kilep 1
  fi
  echo ""
fi

# 6. Commit
git add -A
git commit -q -m "Tartalom frissitese ($(date '+%Y-%m-%d %H:%M'))"
if [ $? -ne 0 ]; then
  echo "HIBA: nem sikerult menteni a valtozasokat."
  varj_es_kilep 1
fi

# 7. Idokozben a GitHubon tortent valtozasok behuzasa.
#    A generalt .js fajlokat a GitHub is frissitheti, ezert ha azokon van
#    utkozes, egyszeruen ujrageneraljuk oket.
echo "Idokozbeni valtozasok ellenorzese..."
git pull --rebase --quiet
if [ $? -ne 0 ]; then
  node scripts/update-content.js > /dev/null 2>&1
  git add content/gallery-data.js content/logos-data.js content/site-data.js 2>/dev/null
  GIT_EDITOR=true git rebase --continue > /dev/null 2>&1
  if [ $? -ne 0 ]; then
    git rebase --abort > /dev/null 2>&1
    echo ""
    echo "HIBA: a GitHubon es a gepeden is valtozott ugyanaz a fajl,"
    echo "ezt automatikusan nem tudom osszefesulni."
    echo "Ilyenkor kerj segitseget, a munkad nem veszett el."
    varj_es_kilep 1
  fi
fi

# 8. Feltoltes
echo "Feltoltes a GitHubra..."
git push -q
if [ $? -ne 0 ]; then
  echo ""
  echo "HIBA: a feltoltes nem sikerult."
  echo "Lehet, hogy lejart a bejelentkezesed, vagy nincs jogosultsagod"
  echo "a repohoz. Jogosultsagot a repo tulajdonosa tud adni."
  echo "A valtozasok a gepeden elmentve maradtak."
  varj_es_kilep 1
fi

echo ""
echo "KESZ. Az eles oldal 1-2 percen belul frissul:"
echo "https://oliverspizza.hu"
varj_es_kilep 0
