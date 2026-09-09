# test-all.ps1
$ErrorActionPreference = "Stop"

Write-Host ''
Write-Host '=======================================================' -ForegroundColor Cyan
Write-Host '   VORTEXYOLTI ERP - VALIDACION INTEGRAL DEL SISTEMA   ' -ForegroundColor Cyan
Write-Host '=======================================================' -ForegroundColor Cyan
Write-Host ''

# 1. PRISMA SCHEMA CHECK
Write-Host '[1/3] Validando esquema de base de datos [Prisma]...' -ForegroundColor Yellow
Set-Location backend
pnpm exec prisma validate
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[FALLO] El schema de Prisma contiene errores." -ForegroundColor Red
    Set-Location ..
    exit 1
}

# 2. TESTS UNITARIOS BACKEND (Vitest)
Write-Host "`n[2/3] Ejecutando suite de pruebas unitarias [Vitest]..." -ForegroundColor Yellow
pnpm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[FALLO] Fallaron las pruebas unitarias del backend." -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# 3. VERIFICACION Y COMPILACION FRONTEND (Angular Build)
Write-Host "`n[3/3] Validando tipado y compilacion del Frontend..." -ForegroundColor Yellow
Set-Location frontend
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[FALLO] Existen errores de TypeScript o templates en el frontend." -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host ''
Write-Host '=======================================================' -ForegroundColor Green
Write-Host '   ESTADO OPERATIVO: TODO EL SISTEMA PASO EN VERDE     ' -ForegroundColor Green
Write-Host '=======================================================' -ForegroundColor Green
Write-Host ''