# 사용(윈도우 PowerShell): .\setup.ps1 nomusa-hong.vercel.app
# 모든 파일의 YOUR-DOMAIN.vercel.app 을 내 주소로 바꿉니다. 실행 후 git add/commit/push 하면 Vercel이 자동 재배포합니다.
# "실행 정책" 오류가 나면:  powershell -ExecutionPolicy Bypass -File .\setup.ps1 nomusa-hong.vercel.app
param([Parameter(Mandatory=$true)][string]$NewHost)
$files = Get-ChildItem -Recurse -File -Include *.html,*.txt,*.xml,*.sh | Where-Object { $_.Name -ne 'setup.sh' }
$count = 0
foreach ($f in $files) {
  $c = Get-Content -Raw -Encoding UTF8 $f.FullName
  if ($c -match 'YOUR-DOMAIN\.vercel\.app') {
    $c -replace 'YOUR-DOMAIN\.vercel\.app', $NewHost | Set-Content -Encoding UTF8 -NoNewline $f.FullName
    Write-Host "수정: $($f.FullName.Substring($PWD.Path.Length+1))"; $count++
  }
}
if ($count -eq 0) { Write-Host "바꿀 곳이 없습니다(이미 적용됨)." }
else { Write-Host "완료($count개 파일). 이제:  git add -A; git commit -m `"주소 반영: $NewHost`"; git push" }
