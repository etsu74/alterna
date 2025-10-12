## **backup\_requirement.md**

### **プロジェクト概要**

* **対象リポジトリ**: `https://github.com/etsu74/alterna`  
* **対象Codespace**:psychic space goldfish  
* **対象ブランチ**: `main`

* **目的**: Codespaceが自動削除される前に、ローカルへバックアップを取得し、再利用・復元できることを確認する。

* **想定実施者**: 開発者本人および共同開発者

* **実施形態**: 練習・検証（破壊的操作なし）

---

### **1\. コミット & プッシュ（コード状態の固定化）**

#### **目的**

現在の Codespace 作業内容を GitHub に安全に退避し、再現可能な状態にする。

#### **手順**

`cd /workspaces/alterna`  
`git status`  
`git add -A`  
`git commit -m "backup: before Codespace cleanup (2025-10-12)"`  
`git push origin HEAD:backup-20251012`

#### **検証項目**

* `backup-20251012` ブランチが GitHub に作成されていること

* 変更ファイルがすべて含まれていること（`.env`は除外）

* GitHub 上で差分が確認できること

---

### **2\. 開発環境（devcontainer）再現性の確保**

#### **目的**

Codespaceと同一の環境を、ローカルまたは新しいCodespaceで再構築可能にする。

#### **必須ファイル**

* `.devcontainer/devcontainer.json`

* `.devcontainer/Dockerfile`（ある場合）

* `package.json` / `requirements.txt` / `pnpm-lock.yaml` / `package-lock.json`

* `.env.example`（機密値なし）

#### **手順**

1. `.devcontainer`フォルダの存在を確認。ない場合は追加。

`.env`内の環境変数を確認し、`.env.example`を作成：

 `cp .env .env.example`  
`# 実際の値をダミーに変更`

2.   
3. READMEまたは本書に「環境構築手順」を追記。

#### **確認項目**

* `devcontainer.json` が最新依存関係を記載

* `.env.example` が存在

* 再ビルド (`Reopen in Container`) が成功すること

---

### **3\. ローカル環境へのエクスポート（オフラインバックアップ）**

#### **目的**

リポジトリ全体とローカルDB・生成ファイルを物理的に保管する。

#### **手順**

`cd /workspaces`  
`tar czf alterna-backup-20251012.tgz alterna`

VS Code 上からファイルを右クリック → **Download**  
 `alterna-backup-20251012.tgz` をローカルに保存。

#### **確認項目**

* tar ファイルが正常に解凍できる

* `.env` など機密情報が含まれていないこと

* ローカルに再展開し、フォルダ構造が維持されていること

---

### **4\. ローカルでの復元テスト**

#### **目的**

バックアップを用いてローカルで Codespace 環境を再現できることを確認。

#### **手順**

`git clone https://github.com/etsu74/alterna.git`  
`cd alterna`  
`git checkout backup-20251012`  
`# Docker Desktop を起動した状態で`  
`code .`  
`# VSCode コマンドパレット → "Dev Containers: Open Folder in Container"`

#### **検証項目**

* devcontainer がビルドされ、アプリが起動する

* `.env` 設定でエラーが出ない

* アプリが Codespace と同等に動作

---

### **5\. 新しい Codespace での復活手順**

#### **目的**

バックアップブランチを元に新規 Codespace を再作成できることを確認。

#### **手順**

1. GitHub → リポジトリ → Code → Codespaces → **Create Codespace on branch**

2. `backup-20251012` を選択して起動

3. 起動後、必要なデータベース・設定をリストア

#### **検証項目**

* 新しい Codespace が正常にビルドされる

* 元のアプリが動作再現できる

---

### **6\. チェックリスト（共同開発者用）**

| No | 項目 | 状態 |
| ----- | ----- | ----- |
| 1 | 変更を commit \+ push した | ☐ |
| 2 | `.devcontainer/` を確認した | ☐ |
| 3 | `.env.example` を作成した | ☐ |
| 4 | `.tgz` をダウンロードした | ☐ |
| 5 | ローカルで解凍・動作確認した | ☐ |
| 6 | 新しい Codespace を作成して確認した | ☐ |

---

### **7\. 補足・注意事項**

* Codespace 内で未コミットの作業がある場合、削除後は復元できません。  
   → **必ず commit または .tgz に含めること。**

* `.env` に含まれる機密値（APIキー、認証トークン等）はコミット禁止。  
   → `.env.example` でダミー化。

* ローカルでテスト後、削除しても再現できることを確認。

---

### **8\. 完了報告テンプレート**

`✅ backup-requirement 実施完了報告`  
`- 実施者: （GitHubアカウント）`  
`- 実施日: （YYYY/MM/DD）`  
`- Codespace:` psychic space goldfish  
`- バックアップブランチ: backup-20251012`  
`- バックアップファイル: alterna-backup-20251012.tgz`  
`- 検証結果: （正常 / 要修正）`

