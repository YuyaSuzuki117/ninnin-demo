# ポケカ専門店ニンニン - デモサイト

## プロジェクト概要
- **サイト名**: ポケカ専門店「ニンニン」（nin-nin-pokeka.jp のデモ再現）
- **種別**: 静的HTML/CSS/JSランディングページ（1ページ構成）
- **目的**: ポートフォリオ用デモサイト。実際の送信・決済機能なし

## コンテキスト管理（最重要）

### ルール
1. **大きなファイル変更は必ずサブエージェント（Task tool）に委任する**
   - HTML全体書き換え → サブエージェント
   - CSS全体書き換え → サブエージェント
   - JS全体書き換え → サブエージェント
2. **サブエージェントには具体的な指示を渡す**（ファイルパス、変更内容、制約を明記）
3. **1回のレスポンスで大量のコードを出力しない** — Edit/Writeで直接変更する
4. **並列実行を活用** — 独立したCSS/JS/HTML改修は同時にサブエージェントを起動
5. **途中経過を都度ユーザーに報告** — 進捗が見えるようにする
6. **ファイルを読む前にEditしない** — 必ずReadしてから変更

### コンテキスト節約テクニック
- ファイル読み込みは `limit` パラメータで必要な行だけ読む
- `site-research.md` は詳細データソース。必要時のみ参照（毎回読まない）
- 探索はExploreエージェント、調査はgeneral-purposeエージェントに委任

## ファイル構造

```
C:\Users\LENOVO\.gemini\ninnin\
├── index.html              # メインHTML（全セクション含む1ページ）
├── assets/
│   ├── css/style.css       # メインCSS（CSS Grid/Flexbox、CSS変数）
│   └── js/main.js          # メインJS（Vanilla ES6+、jQuery不使用）
├── site-research.md        # 元サイト調査データ（参照用）
└── CLAUDE.md               # この設定ファイル
```

## 技術スタック・規約

### HTML
- セマンティックHTML5
- BEM風クラス命名（`.shop-card__info`, `.cta-primary`）
- アクセシビリティ: `aria-*` 属性、`alt` テキスト必須
- 画像は元サイトURLを直接参照（デモ用）

### CSS
- **CSS変数**: `:root` でカラー・スペーシング・フォントを定義
- **レイアウト**: CSS Grid + Flexbox（float使用禁止）
- **フォント**: Noto Sans JP（本文）、Noto Serif JP（見出し）
- **ブレークポイント**: 1024px / 768px / 480px の3段階
- **カラー**: `--color-primary: #d8613c`（朱色）、`--color-secondary: #c2a990`

### JavaScript
- Vanilla ES6+（jQuery禁止）
- `"use strict"` + DOMContentLoaded内で実行
- IntersectionObserver でスクロール系処理
- throttle/debounce でパフォーマンス最適化
- passive: true を全scroll/touchリスナーに設定

## セクション構成（index.html 上から順）
1. ヘッダー（PC/SP統合、スティッキー対応）
2. ヒーロー（フルスクリーン背景 + 統計カウントアップ）
3. 信頼バッジバー
4. サービス紹介（3列Grid）
5. 宅配買取ステップ
6. カテゴリ一覧
7. お客様の声（レビュースライダー）
8. 店舗案内（7店舗Grid）
9. ニュース
10. FAQ（アコーディオン）
11. お問い合わせフォーム
12. フッター
13. SP固定バー

## 作業時の注意
- デモサイトのため、フォーム送信は `preventDefault()` + アラート表示
- 電話番号・住所は実在情報（元サイトから）だがデモ用途
- 画像URLは `nin-nin-pokeka.jp` ドメインを直接参照
- コミットは指示があるまで行わない
