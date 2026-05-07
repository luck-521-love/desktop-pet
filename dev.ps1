# Desktop Pet - Dev Launcher
# Removes ELECTRON_RUN_AS_NODE from environment before launching Electron
# This is needed because the Windows registry has this env var set globally

Remove-Item Env:\ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
Write-Host "Starting Desktop Pet..." -ForegroundColor Cyan
npx electron-vite dev $args
