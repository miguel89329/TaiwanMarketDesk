# 台股研究桌 v0.3

本機台股研究工具，採Windows啟動器＋本機瀏覽器介面，資料存在SQLite，不自動交易、不呼叫AI、不上傳報告。這版已補上官方歷史行情、法人、完整短線分數、長線計分邏輯、三個月營收與SEC財報。部分財報與美股價格來源仍有限制，詳見LIMITATIONS.md。

## 啟動與停止

完整解壓可攜版，雙擊Start.cmd。已附Node.js 24.22.1 Windows x64及授權文件，不需安裝npm套件。啟動器會在背景開啟服務，再交由預設瀏覽器開啟127.0.0.1網址。視窗沒有自動開啟時，可自行貼上啟動視窗顯示的網址。停止服務用Stop.cmd；只關閉瀏覽器不會停止排程。

這仍是本機網頁介面，並非原生WinUI／MSIX，沒有安裝器、簽章或自動升級。

## 保留原資料升級

另解壓更新包，執行其中Upgrade.cmd，在選擇視窗選取舊版TaiwanMarketDesk資料夾。升級器會先驗證並停止該資料夾的Node服務、備份app與設定、替換程式、合併新增設定，保留原data資料夾與自訂流動性門檻／題材。不要選更新包自己的資料夾。

若直接使用本次工作區資料夾，先Stop.cmd再Start.cmd即可。備份在舊資料夾內backup-日期時間；升級器不複製新包的SQLite覆蓋你的資料。

## 每日操作

- 開啟先顯示保存的報告；立即更新才檢查來源，資料品質頁顯示來源日、取得時間與快取。
- 初次乾淨安裝補齊65個交易日；已取得的日期續跑略過，最近資料定期重新核對。可攜完整版附本次真實資料快照，後續為增量。
- 短線類股可按上市／上櫃、官方產業／AI題材篩選，點代表股看65日價格與成交量。
- 長線顯示中期族群、3月營收、20日籌碼、可用財報及完整度；不完整資料不產生完整100分。
- 美股與新聞顯示已完成美股交易日、SEC財報及限定日期RSS。美股價格目前支援自有授權CSV，欄位symbol,date,close,volume；美東交易日期，匯入後更新報告。
- AI按鈕先使用瀏覽器剪貼簿，失敗再嘗試Windows並讀回核對，仍失敗會選取文字供Ctrl+C；Markdown下載永遠是後備方式。程式不自動傳送給AI。
- AI文字採重點匯出：正式候選、官方分數前5觀察、題材前5觀察、ETF各類成交額前5、所有追蹤基本面與缺漏。資料品質頁可匯出完整JSON。

## 排程與容量

設定的pre／post時間採台灣時區，每分鐘檢查，只補當日漏跑，同日同類型覆寫、不重複新增。盤前固定用報告日前一已完成台股交易日；盤後在13:30收盤前使用前一完成日；收盤後資料未發布仍會標示缺漏／未更新。關機／休眠／服務關閉不執行，未替你建立Windows或Codex排程。

容量預設5GB警示、6GB軟上限（以1024換算）。自動清快取預設關閉，可將storage.autoCleanCache設true。只清14日以上可重下載HTTP快取與完全重複原始快照，保留行情、法人、財報與報告；無法僅靠快取降到上限時應另行封存，程式不擅自刪除重要歷史。

## 命令列與驗證

在本目錄：

    runtime/node.exe app/cli.mjs pre
    runtime/node.exe app/cli.mjs post
    runtime/node.exe --test app/test.mjs app/test-v2.mjs
    runtime/node.exe app/verify-v2.mjs

CLI輸出data/YYYY-MM-DD-pre.md或-post.md，UTF-8。日報、快取、行情均在data/market.sqlite。資料庫會自動建立新表，不刪舊表。背景更新在Worker執行，避免下載與計算阻塞介面。

## 打包與依賴

停止服務後壓縮app、runtime、啟動／停止／升級腳本、config.json與文件即可。乾淨包不含data，附歷史包可使用SQLite的VACUUM INTO一致性備份；不要在寫入時只複製主SQLite而漏掉WAL。不要打包data/edge-profile、server.json或暫存紀錄。

無第三方npm依賴。需Windows PowerShell與預設瀏覽器，Node授權在runtime/LICENSE.txt。新聞限個人非商業用途；商業散布前須再確認所有資料與新聞授權。詳見DATA_SOURCES.md、RULES-v0.2.md、VALIDATION.md。

## v0.3資料品質修正

實際計算日期與來源列於calculationInputs；短線強度拆成絕對與相對各半，總分扣除集中度懲罰，候選需5日絕對報酬正。基本面過期或缺相鄰單季時不加支持標籤、不補完整分數。精確公式與新鮮度門檻見RULES-v0.3.md。舊保存報告保留原規則。
