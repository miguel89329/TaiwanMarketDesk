# 資料來源、使用條件與限制（v0.2）

2026-11-05台灣時間已直接驗證下列公開介面。資料只用於個人本機研究，保留來源與取得時間；公開可讀不等於可商業再散布。服務可能改版、限流、延遲或停止，不繞過登入／付費／403／429限制。

## 台股行情、法人與指數

- 上市近期行情：https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL
- 上櫃近期行情：https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes
- 上市全市場歷史行情：https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?date=YYYYMMDD&type=ALLBUT0999&response=json
- 上市法人：https://www.twse.com.tw/rwd/zh/fund/T86?date=YYYYMMDD&selectType=ALLBUT0999&response=json
- 上櫃全市場歷史行情：https://www.tpex.org.tw/www/zh-tw/afterTrading/dailyQuotes?date=YYYY/MM/DD&id=&response=json
- 上櫃法人：https://www.tpex.org.tw/www/zh-tw/insti/dailyTrade?date=YYYY/MM/DD&type=Daily&cate=EW&response=json
- 上市加權指數直接取同日MI_INDEX表；櫃買月歷史指數：https://www.tpex.org.tw/www/zh-tw/indexInfo/inx?date=YYYY/MM/01&response=json

歷史端點為官方公開網站使用之結構化資料，不使用資訊商店付費介面。通常盤後每日更新，不保證精確發布時刻；先檢查回傳日期，錯日或空表為缺漏，不能用查詢日期硬標。有效價格股票／ETF代號經篩選，權證、牛熊證、興櫃、優先股及非主要普通股商品不納入主要股票評分。

TWSE OpenAPI說明：https://openapi.twse.com.tw/ ，其列出政府資料開放授權 https://data.gov.tw/license 與使用條款 https://www.twse.com.tw/zh/page/terms/use.html 。後者本次透過網頁工具讀取出現安全性頁面，沒有繞過；非商業本機資料使用仍保留顯名，商業發佈須再確認各網站資料授權。TPEx條款：https://www.tpex.org.tw/zh-tw/gtsm_disclaimer.html 。本版沒有承諾免費再散布或付費歷史資料授權。

## 公司分類、營收、財報

- TWSE公司分類：https://openapi.twse.com.tw/v1/opendata/t187ap03_L
- TPEx公司分類：https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O
- TWSE月營收：https://openapi.twse.com.tw/v1/opendata/t187ap05_L
- TPEx月營收：https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap05_O
- TWSE一般業損益：https://openapi.twse.com.tw/v1/opendata/t187ap06_L_ci
- TPEx一般業損益：https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap06_O_ci
- 前兩個月營收：公開資訊觀測站歷史表 https://mopsov.twse.com.tw/nas/t21/sii/t21sc03_民國年_月_0.html ，上櫃以otc取代sii。Big5解碼，依公司代號與固定欄位解析，只有不足月份才補抓。

營收每月、財報每季／公告後更新；本程式每6小時至多核對一次最新彙總表，新內容以hash去重。出表日期不等於每家公司真正公布時間，因此台股基本面採首次實際取得作保守可用時間。未取得前季累計時不能自最新累計推導單季，不以虛構差額補齊。

## 美國財報與日期

SEC Company Facts：https://data.sec.gov/api/xbrl/companyfacts/CIK十位數.json

文件：https://www.sec.gov/search-filings/edgar-application-programming-interfaces 。官方表示不需API金鑰、申報與XBRL資料持續更新。遵守Fair Access，每秒最多10請求；本程式全來源序列最少1秒間隔、SEC快取24小時。User-Agent明示程式研究用途；可在secUserAgent填入使用者自願提供的聯絡資訊，不編造聯絡信箱。遇拒絕即標缺漏，沒有代理或偽裝繞過。

預設CIK已設定NVDA、MSFT、GOOGL、AMZN、META、AMD、AVGO、TSM，新增代號可在usCiks維護。標準標籤缺漏時不等於公司未公布；TSM本次能辨識的SEC年度資料較舊，明確顯示期間偏舊，不能說已更新至最新季。

美股日曆依NYSE公告 https://www.nyse.com/markets/hours-calendars ，內建已核對2025至2027年及短日收盤；其他年度未知，不推算為已驗證。採America/New_York處理夏令時間。台股年度表：https://openapi.twse.com.tw/v1/holidaySchedule/holidaySchedule 。另有可編輯臨時休市校正；2026-10-23已依證券商公會 https://www.twsa.org.tw/F01/F011.html 颱風休市公告核對，作為日曆依據，不列為當日新聞。

## 新聞與使用範圍

中央社RSS產經證券 https://feeds.feedburner.com/rsscna/finance 、科技 https://feeds.feedburner.com/rsscna/technology 。規範 https://www.cna.com.tw/about/rss.aspx 允許個人／非營利組織的非商業用途，須保留「中央通訊社」出處。本程式只用標題、時間與連結，不抓全文、圖片或標章。

NVIDIA官方RSS https://nvidianews.nvidia.com/releases.xml ，規範 https://www.nvidia.com/en-us/about-nvidia/rss/ 為個人資訊用途、限非商業。來源可隨時停止。RSS快取15分鐘，標題日期不符即排除；無當日項目只代表來源範圍沒有，不代表全網無新聞。

## 美股價格與ETF持股的替代方案

未自動接Yahoo非官方端點、未繞過資料授權。Alpha Vantage公開免費層有25次／日限制，歷史指數另有資料授權要求，因此未把免費股票API當作免費全指數授權。美股價格提供自有授權CSV匯入，必須附來源，不以ETF代理冒充指數。

ETF追蹤標的可編輯etfMetadata；自動持股下載尚未接入。持股未知就不計算重複曝險。資料缺漏的來源替代是發行人正式持股表或使用者有權使用的資料，不是虛構持股。

## 請求與保存

主要來源最少1秒間隔、18秒逾時、最多重試1次；403／429不重試。JSON／RSS快取壓縮保存在SQLite；歷史舊月份長快取，近期資料定期核對。原始資料與正規化行情、法人、基本面保留來源與時間。當前API無正式SLA，不保證每日何時一定更新。

## ETF追蹤指數補充

已接入證交所公開商品JSON https://www.twse.com.tw/rwd/zh/ETF/list?response=json （由ETF商品頁 https://www.twse.com.tw/zh/products/securities/etf/products/list.html 使用），24小時快取，依證券代號對照標的指數。這不是持股資料，也未提供版本日期，因此另外標示取得時間。產業關聯僅依指數名稱關鍵詞，不能當作持股穿透；上櫃商品不一定包含在此表。006208指數依據已核對 https://websys.fsit.com.tw/FubonETF/Fund/IndexIntro.aspx?stkId=006208 。
