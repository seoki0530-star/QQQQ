#!/usr/bin/env bash
# 새 글을 올린 뒤 빙·네이버 등 IndexNow 참여 엔진에 "이 주소 바뀌었어요"를 알립니다. 구글은 IndexNow 미참여(서치콘솔에서 직접 요청).
# 준비: 1) 영문·숫자 32자 키를 하나 만든다  2) 저장소 루트에 <키>.txt 파일(내용=키)로 올린다  3) 아래 두 값을 채운다.
# 사용: bash indexnow.sh https://내도메인/posts/new-post.html [추가 URL ...]
HOST="YOUR-DOMAIN.vercel.app"
KEY="여기에_32자_키"
if [ $# -eq 0 ]; then echo "사용법: bash indexnow.sh <URL> [URL ...]"; exit 1; fi
URLS=$(printf '"%s",' "$@"); URLS="[${URLS%,}]"
curl -s -o /dev/null -w "IndexNow HTTP %{http_code} (200 또는 202 = 접수)\n" \
  -X POST "https://api.indexnow.org/indexnow" -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\":\"$HOST\",\"key\":\"$KEY\",\"keyLocation\":\"https://$HOST/$KEY.txt\",\"urlList\":$URLS}"
