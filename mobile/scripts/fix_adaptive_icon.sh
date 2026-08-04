#!/usr/bin/env bash
# Run after `dart run flutter_launcher_icons` — removes 16% inset that shifts the car off-center.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cat > "$ROOT/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml" <<'XML'
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/ic_launcher_background"/>
  <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
XML
echo "Fixed adaptive icon (no inset)."
