# Script PowerShell para restaurar Cesar Da Gold
# Ejecuta: .\restore-cesar.ps1

Write-Host "🔄 Iniciando restauración de Cesar Da Gold..." -ForegroundColor Cyan
Write-Host ""

$filePath = Join-Path $PSScriptRoot "Estados_de_Cuenta.xlsx"

# Verificar que el archivo existe
if (-not (Test-Path $filePath)) {
    Write-Host "❌ Error: No se encontró el archivo Estados_de_Cuenta.xlsx" -ForegroundColor Red
    Write-Host "📍 Ubicación esperada: $filePath" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Archivo encontrado: $filePath" -ForegroundColor Green
$fileSize = (Get-Item $filePath).Length / 1KB
Write-Host "📊 Tamaño: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Gray
Write-Host ""

try {
    Write-Host "📤 Enviando archivo a la API..." -ForegroundColor Cyan
    Write-Host ""

    # Crear la petición multipart/form-data
    $boundary = [System.Guid]::NewGuid().ToString()
    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
    $fileName = [System.IO.Path]::GetFileName($filePath)

    # Construir el body
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
        "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "",
        [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes),
        "--$boundary--"
    )
    $body = $bodyLines -join "`r`n"

    # Hacer la petición
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/statements/import" `
        -Method Post `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $body

    Write-Host "✅ ¡Restauración exitosa!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Resumen:" -ForegroundColor Cyan
    Write-Host "   - Artistas procesados: $($response.artistsProcessed)" -ForegroundColor White
    Write-Host "   - Transacciones importadas: $($response.transactionsImported)" -ForegroundColor White
    Write-Host "   - Estados de cuenta creados: $($response.statementsCreated)" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Cesar Da Gold ha sido restaurado con todos sus datos!" -ForegroundColor Green
    Write-Host "📍 Verifica en: http://localhost:3000/dashboard/analytics" -ForegroundColor Yellow
    Write-Host ""

} catch {
    Write-Host "❌ Error al procesar el archivo:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Sugerencia: Asegúrate de que el servidor esté corriendo (npm run dev)" -ForegroundColor Yellow
    Write-Host ""
}
