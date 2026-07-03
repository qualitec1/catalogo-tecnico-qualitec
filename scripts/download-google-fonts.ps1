$fonts = @{
  "Roboto" = "https://fonts.google.com/download?family=Roboto"
  "Inter" = "https://fonts.google.com/download?family=Inter"
  "Outfit" = "https://fonts.google.com/download?family=Outfit"
  "HankenGrotesk" = "https://fonts.google.com/download?family=Hanken+Grotesk"
}

$destDir = "d:\qualitec 2.0\public\fonts"
if (!(Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force }

foreach ($name in $fonts.Keys) {
  $zipPath = "$destDir\$name.zip"
  $extractPath = "$destDir\tmp_$name"
  
  Write-Host "Downloading $name..."
  # Use curl.exe with -L to follow redirects
  curl.exe -L -o $zipPath $fonts[$name]
  
  Write-Host "Extracting $name..."
  Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
  
  Get-ChildItem -Path $extractPath -Filter "*.ttf" -Recurve | ForEach-Object {
    $targetName = $_.Name.ToLower()
    
    # Roboto
    if ($targetName -eq "roboto-regular.ttf") { Copy-Item $_.FullName -Destination "$destDir\roboto.ttf" -Force }
    elseif ($targetName -eq "roboto-bold.ttf") { Copy-Item $_.FullName -Destination "$destDir\robotob.ttf" -Force }
    elseif ($targetName -eq "roboto-italic.ttf") { Copy-Item $_.FullName -Destination "$destDir\robotoi.ttf" -Force }
    elseif ($targetName -eq "roboto-bolditalic.ttf") { Copy-Item $_.FullName -Destination "$destDir\robotoz.ttf" -Force }
    
    # Inter
    elseif ($targetName -eq "inter-regular.ttf") { Copy-Item $_.FullName -Destination "$destDir\inter.ttf" -Force }
    elseif ($targetName -eq "inter-bold.ttf") { Copy-Item $_.FullName -Destination "$destDir\interb.ttf" -Force }
    elseif ($targetName -eq "inter-italic.ttf") { Copy-Item $_.FullName -Destination "$destDir\interi.ttf" -Force }
    elseif ($targetName -eq "inter-bolditalic.ttf") { Copy-Item $_.FullName -Destination "$destDir\interz.ttf" -Force }
    
    # Outfit
    elseif ($targetName -eq "outfit-regular.ttf") { Copy-Item $_.FullName -Destination "$destDir\outfit.ttf" -Force }
    elseif ($targetName -eq "outfit-bold.ttf") { Copy-Item $_.FullName -Destination "$destDir\outfitb.ttf" -Force }
    elseif ($targetName -contains "outfit-italic" -or $targetName -contains "outfit-lightitalic") { Copy-Item $_.FullName -Destination "$destDir\outfiti.ttf" -Force }
    elseif ($targetName -contains "outfit-bolditalic" -or $targetName -contains "outfit-semibolditalic") { Copy-Item $_.FullName -Destination "$destDir\outfitz.ttf" -Force }
    
    # Hanken Grotesk
    elseif ($targetName -eq "hankengrotesk-regular.ttf") { Copy-Item $_.FullName -Destination "$destDir\hankengrotesk.ttf" -Force }
    elseif ($targetName -eq "hankengrotesk-bold.ttf") { Copy-Item $_.FullName -Destination "$destDir\hankengroteskb.ttf" -Force }
    elseif ($targetName -eq "hankengrotesk-italic.ttf") { Copy-Item $_.FullName -Destination "$destDir\hankengroteski.ttf" -Force }
    elseif ($targetName -eq "hankengrotesk-bolditalic.ttf") { Copy-Item $_.FullName -Destination "$destDir\hankengroteskz.ttf" -Force }
  }
  
  # Fallbacks for Outfit if it has only variable font or lacks italics
  if (!(Test-Path "$destDir\outfiti.ttf") -and (Test-Path "$destDir\outfit.ttf")) {
    Copy-Item "$destDir\outfit.ttf" -Destination "$destDir\outfiti.ttf" -Force
  }
  if (!(Test-Path "$destDir\outfitz.ttf") -and (Test-Path "$destDir\outfitb.ttf")) {
    Copy-Item "$destDir\outfitb.ttf" -Destination "$destDir\outfitz.ttf" -Force
  }
  if (!(Test-Path "$destDir\outfitb.ttf") -and (Test-Path "$destDir\outfit.ttf")) {
    Copy-Item "$destDir\outfit.ttf" -Destination "$destDir\outfitb.ttf" -Force
  }
  
  # Fallbacks for Hanken Grotesk if it lacks italic/bolditalic in some versions
  if (!(Test-Path "$destDir\hankengroteski.ttf") -and (Test-Path "$destDir\hankengrotesk.ttf")) {
    Copy-Item "$destDir\hankengrotesk.ttf" -Destination "$destDir\hankengroteski.ttf" -Force
  }
  if (!(Test-Path "$destDir\hankengroteskz.ttf") -and (Test-Path "$destDir\hankengroteskb.ttf")) {
    Copy-Item "$destDir\hankengroteskb.ttf" -Destination "$destDir\hankengroteskz.ttf" -Force
  }

  Remove-Item -Path $zipPath -Force
  Remove-Item -Path $extractPath -Recurse -Force
}
# Delete test.zip if it exists
if (Test-Path "$destDir\test.zip") { Remove-Item -Path "$destDir\test.zip" -Force }

Write-Host "Fonts downloaded successfully!"
