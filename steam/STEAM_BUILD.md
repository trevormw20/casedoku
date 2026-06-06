# Casedoku — Demo : desktop build & Steam upload

An Electron wrapper that ships the **existing web demo** (`../demo/index.html`) as a desktop app
for **Windows** and **Steam Deck (via Proton)**. Web and desktop share one source — nothing is
copied into the repo; the build bundles the demo + shared art into the distributable's `resources/`.

```
steam/
  package.json          electron + electron-builder; scripts + electron-builder "build" config
  main.js               main process: BrowserWindow that loads ../demo/index.html, F11/Esc,
                        external-link interception (shell.openExternal), nav lockdown, single-instance
  preload.js            contextIsolation ON, nodeIntegration OFF; exposes only window.casedokuDesktop
  build/
    icon.ico            Windows app icon (generated from assets/ui/appicon.png)
    icon.png            512×512 icon (Linux AppImage)
  steampipe/
    app_build_3000000.vdf     SteamPipe app build script (EDIT ids/paths)
    depot_build_3000001.vdf   SteamPipe depot build script (EDIT ids/paths)
  STEAM_BUILD.md        this file
  dist/                 build output (gitignored)
  node_modules/         (gitignored)
```

## Run it locally

```bash
cd steam
npm install      # downloads Electron + electron-builder (first time only)
npm start        # opens the demo in a desktop window
```

`npm start` loads `../demo/index.html` directly; the demo's relative `../assets/` paths resolve
because `demo/` and `assets/` are siblings at the repo root.

## Build the Windows app

```bash
cd steam
npm run build:win
```

Artifacts land in **`steam/dist/`**:

| Artifact | What it is |
|---|---|
| `Casedoku Demo-1.0.0-Portable.exe` | single-file portable (no install) — ~79 MB |
| `Casedoku Demo-1.0.0-Setup.exe`    | NSIS installer (choose install dir) — ~79 MB |
| `win-unpacked/`                    | the unpacked app (`Casedoku Demo.exe` + `resources/`) — **this is what you upload to Steam** |

The bundled `win-unpacked/resources/demo/` and `win-unpacked/resources/assets/` are the demo + art;
`main.js` loads them from `process.resourcesPath` when packaged, so `../assets/` still resolves.

### Heads-up: the `winCodeSign` symlink error (CI / sandbox / non-admin Windows)

electron-builder downloads a `winCodeSign` toolchain that contains **macOS `.dylib` symlinks**.
On a Windows session **without symlink-creation privilege** (no Administrator, Developer Mode off,
some CI agents) extraction fails with:

```
ERROR: Cannot create symbolic link : A required privilege is not held by the client.
 ... winCodeSign\...\darwin\10.12\lib\libcrypto.dylib
```

Those files are macOS-signing-only and irrelevant to a Windows build. Fix one of:

- **Turn on Windows Developer Mode** (Settings → Privacy & security → For developers) — lets the
  user create symlinks without admin. Then `npm run build:win` just works. *(Recommended.)*
- …or run the build from an **Administrator** terminal.
- …or pre-extract the toolchain once, skipping the mac folder (what this repo's build was verified
  with):
  ```bash
  CACHE="$LOCALAPPDATA/electron-builder/Cache/winCodeSign"
  curl -sL -o "$CACHE/winCodeSign-2.6.0.7z" \
    https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z
  node_modules/7zip-bin/win/x64/7za.exe x "$CACHE/winCodeSign-2.6.0.7z" \
    -o"$CACHE/winCodeSign-2.6.0" '-xr!darwin' -y
  npm run build:win
  ```

The build is **unsigned** (no code-signing cert). That's fine for testing and for Steam, which
serves files through its own pipeline; sign later with a real cert if you want SmartScreen trust.

## Steam Deck (via Proton)

**Ship the Windows build.** Steam Deck runs Windows games through **Proton**; this Electron app is
a standard Windows app and runs under Proton with no Linux build required. In Steamworks, mark the
title **Proton-compatible** (or just leave Linux unset and let Proton handle it). Window defaults to
**1280×800** — the Deck's native resolution — and F11 toggles fullscreen.

> A native **Linux AppImage** target exists as a stretch goal (`npm run build:linux`), but building
> it from Windows needs extra toolchain (Docker or WSL with the electron-builder Linux image), so it
> was **not** built here. The Windows-via-Proton path is the recommended Deck route.

## Controls

- **Mouse / touch / trackpad driven** (the demo is a point-and-click sudoku-mystery).
- **F11** toggles fullscreen; **Esc** leaves fullscreen (it does **not** quit the app).
- External buttons (Wishlist / Kickstarter / socials) open in the **default browser** (or the Steam
  in-game overlay browser), not inside the app.
- **Gamepad / Steam Deck controller navigation is a future pass** — for now use the Deck's trackpad
  or touchscreen (both work out of the box under Proton).

---

# Uploading to Steam (you must do this part)

These steps need a Steamworks account and the $100 app fee, so they can't be automated here.

### 1. Create the Steamworks app
- Sign in at <https://partner.steamgames.com>, go to **Apps & Packages → Create a new app**, and pay
  the **$100 Steam Direct fee** (one-time, per app). You'll get an **AppID** (e.g. `3000000`).

### 2. Add a depot
- In your app's admin: **SteamPipe → Depots**. A default depot is usually created with the app;
  note its **DepotID** (e.g. `3000001`). One Windows depot is enough for this demo.
- Set the app's **Launch Option**: General Installation → Launch Options → Executable
  `Casedoku Demo.exe`, OS `Windows`.

### 3. Install steamcmd
- Download **steamcmd** for Windows: <https://developer.valvesoftware.com/wiki/SteamCMD> (unzip
  `steamcmd.exe` somewhere on PATH).

### 4. Point the SteamPipe scripts at your build
- Edit **`steampipe/app_build_3000000.vdf`** and **`steampipe/depot_build_3000001.vdf`**:
  - replace `3000000` with your **AppID** and `3000001` with your **DepotID** (in both files +
    the filenames if you like),
  - confirm `contentroot` points at **`..\dist\win-unpacked\`** (the output of `npm run build:win`).
- Both ready-to-edit examples are in `steampipe/`.

### 5. Build & upload the depot
```bash
steamcmd +login <your_steam_login> +run_app_build "<abs path>\steam\steampipe\app_build_3000000.vdf" +quit
```
- First run will prompt for Steam Guard. On success steamcmd uploads the chunks; the build then
  appears in Steamworks under **SteamPipe → Builds**.

### 6. Set the build live
- In Steamworks, go to **SteamPipe → Builds**, pick the new build, and **set it live** on the
  `default` branch (or a `beta` branch first to test). Publish the store page changes.

### 7. Test on real hardware
- Install via the Steam client on a **Windows PC** and on a **Steam Deck** (Proton). Verify the
  window opens, all four cases play, art loads, and the CTA buttons open the browser/overlay.

That's it — the desktop wrapper is just a thin shell around the same web demo, so any future demo
update is picked up by re-running `npm run build:win` and uploading a new build.
