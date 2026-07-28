#!/usr/bin/env bash
# Reads google-services.json and writes mobile/lib/config/firebase_options.dart
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
JSON="${1:-$HOME/Downloads/google-services.json}"
OUT="$ROOT/mobile/lib/config/firebase_options.dart"

if [[ ! -f "$JSON" ]]; then
  echo "Missing: $JSON"
  echo "Download it from Firebase → Project settings → Your Android app → google-services.json"
  exit 1
fi

python3 - <<PY
import json
from pathlib import Path

data = json.loads(Path("$JSON").read_text())
project_info = data["project_info"]
client = data["client"][0]
api_key = client["api_key"][0]["current_key"]
app_id = client["client_info"]["mobilesdk_app_id"]
project_id = project_info["project_id"]
sender = project_info["project_number"]
storage = project_info.get("storage_bucket", f"{project_id}.appspot.com")
auth_domain = f"{project_id}.firebaseapp.com"

out = f'''import 'package:firebase_core/firebase_core.dart';

/// Auto-generated from google-services.json — do not paste secrets from service accounts here.
class DefaultFirebaseOptions {{
  static const String apiKey = '{api_key}';
  static const String appId = '{app_id}';
  static const String messagingSenderId = '{sender}';
  static const String projectId = '{project_id}';
  static const String authDomain = '{auth_domain}';
  static const String storageBucket = '{storage}';

  static bool get isConfigured =>
      apiKey.isNotEmpty && appId.isNotEmpty && projectId.isNotEmpty;

  static FirebaseOptions get android {{
    return FirebaseOptions(
      apiKey: apiKey,
      appId: appId,
      messagingSenderId: messagingSenderId,
      projectId: projectId,
      authDomain: authDomain,
      storageBucket: storageBucket,
    );
  }}
}}
'''
Path("$OUT").write_text(out)
print("Wrote", "$OUT")
print("projectId:", project_id)
print("appId:", app_id)
PY

# Also copy json into android app for native Firebase (optional but recommended)
cp "$JSON" "$ROOT/mobile/android/app/google-services.json"
echo "Copied google-services.json → mobile/android/app/"
