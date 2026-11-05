# Git source checkout

此儲存庫保存台股研究桌v0.3程式、規則與測試。

- 本機config.json、data資料庫與報告、backup備份、執行中的瀏覽器資料均忽略，不上傳。
- config.example.json是無帳密的預設設定；新clone先複製為config.json。範例排程為台灣時間08:00與15:00，主程式必須持續運行。
- 不追蹤runtime/node.exe；新電腦需安裝Node.js 24以上，或自行放入runtime/node.exe。runtime/LICENSE.txt保留授權文字。
- 啟動：Start.cmd。測試：npm test，或node --test app/test.mjs app/test-v2.mjs app/test-quality.mjs。
- MANIFEST-SHA256.txt屬可攜版打包產物，不隨原始碼追蹤。

GitHub預定遠端為https://github.com/miguel89329/TaiwanMarketDesk.git。設定遠端網址不等於已建立儲存庫或完成推送，請以實際push結果為準。
