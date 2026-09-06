#!/usr/bin/env bash
# 사용: bash setup.sh nomusa-hong.vercel.app   (또는 내도메인.com)
# 모든 파일의 YOUR-DOMAIN.vercel.app 을 내 주소로 바꿉니다. 실행 후 git commit & push 하면 Vercel이 자동 재배포합니다.
set -e
if [ -z "$1" ]; then echo "사용법: bash setup.sh <내주소 (예: nomusa-hong.vercel.app)>"; exit 1; fi
NEW="$1"
FILES=$(grep -rl "YOUR-DOMAIN.vercel.app" --include='*.html' --include='*.txt' --include='*.xml' --include='*.sh' . | grep -v setup.sh || true)
if [ -z "$FILES" ]; then echo "바꿀 곳이 없습니다(이미 적용됨)."; exit 0; fi
for f in $FILES; do
  sed -i.bak "s#YOUR-DOMAIN\.vercel\.app#${NEW}#g" "$f" && rm -f "$f.bak"
  echo "수정: $f"
done
echo "완료. 이제:  git add -A && git commit -m \"주소 반영: ${NEW}\" && git push"
