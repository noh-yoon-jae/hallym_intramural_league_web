cd ..
Get-ChildItem -Recurse -Directory | Where-Object { $_.FullName -notmatch 'node_modules|\.next|\.git|log' }