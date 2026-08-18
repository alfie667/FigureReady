$dest = "C:\Users\zegga\OneDrive\Documents\developper\Claude\FigureReady\public\home-v2"
New-Item -ItemType Directory -Force -Path $dest

Copy-Item "C:\Users\zegga\Downloads\ChatGPT Image Aug 16, 2026, 03_13_59 PM.png" "$dest\hero.png" -Force
Copy-Item "C:\Users\zegga\Downloads\ChatGPT Image Aug 18, 2026, 02_27_32 PM.png" "$dest\upload.png" -Force
Copy-Item "C:\Users\zegga\Downloads\ChatGPT Image Aug 18, 2026, 02_34_19 PM.png" "$dest\templates.png" -Force
Copy-Item "C:\Users\zegga\Downloads\ChatGPT Image Aug 18, 2026, 02_31_59 PM.png" "$dest\edit-annotate.png" -Force
Copy-Item "C:\Users\zegga\Downloads\ChatGPT Image Aug 18, 2026, 02_35_24 PM.png" "$dest\export.png" -Force

Write-Output "Done:"
Get-ChildItem $dest | Select-Object Name
