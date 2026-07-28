# コンセント・チェイス

逃げ回るコンセントを60秒で追いかける、Java + React の小さなインディーアーケードゲームです。矢印キーまたはWASDで青いプレイヤーを動かし、3秒以内に続けて捕まえるとコンボ得点が伸びます。

![Java engine](https://img.shields.io/badge/game%20engine-Java%2021-74d7ff)
![UI](https://img.shields.io/badge/UI-React%20%2B%20shadcn%2Fui-f4a261)

## 起動方法

必要なものは JDK 21以上と Node.js 20以上です。ローカルでは次の2つを別のターミナルで実行します。

```bash
# Terminal 1: Javaのゲームエンジン
cd backend
./mvnw spring-boot:run

# Terminal 2: Reactの画面
cd frontend
npm ci
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。`SPACE` または「ゲーム開始」で始まり、矢印キー / WASD で操作します。

## 構成と学べること

```text
React + Vite + TypeScript + shadcn/ui
        │ held keys / start / restart (WebSocket)
        ▼
Spring Boot + Java 21
        │ 33ms tick: movement, collision, timer, score
        ▼
GameSnapshot (WebSocket)
        │
        └── Canvas描画、HUD、紙吹雪、Web Audio APIの効果音
```

- **Javaをゲームの正とする**: ブラウザは押されているキーだけを送り、位置、衝突、得点、残り時間はJavaが判定します。UIを書き換えて高得点を作りにくい構造です。
- **WebSocketを使う理由**: 33msごとの状態をサーバーから受け取るため、HTTPの繰り返し取得より自然にゲーム画面を更新できます。
- **shadcn/uiの役割**: `Card`、`Badge`、`Progress`、`Button` は画面の土台に使い、Canvasはゲームの絵を担当します。UI部品とゲーム描画を分けると保守しやすくなります。
- **インディーらしい演出**: 素材画像に依存せず、太い輪郭、紙吹雪、軽い合成音、暖色とネオンの配色で手作り感を出しています。報酬は捕獲回数とコンボだけで決まり、課金・換金・確率報酬はありません。

## 検証

```bash
npm --prefix frontend run lint
npm --prefix frontend run build
cd backend && ./mvnw test
```

GitHub Actionsでもフロントエンドのlint/buildと、Javaの単体テストを実行します。
