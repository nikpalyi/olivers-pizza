#!/bin/zsh
cd "$(dirname "$0")"

echo "Oliver's Pizza tartalom frissitese"
echo "----------------------------------"
echo ""

npm run frissit
status=$?

echo ""
if [ $status -eq 0 ]; then
  echo "Kesz. Megnezheted az index.html fajlt a bongeszoben."
else
  echo "Hiba tortent. Nezd meg a fenti uzenetet."
fi

echo ""
echo "Az ablak bezarasahoz nyomj meg egy billentyut."
read -k 1
