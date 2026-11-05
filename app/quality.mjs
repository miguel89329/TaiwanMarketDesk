const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function rankingExclusions(s,rules,baseWeight=100-rules.weights[4]){
  return [...(s.completeness!==baseWeight?['基礎分項缺漏']:[]),...(s.valid<rules.minMembers?[`有效成分 ${s.valid} < ${rules.minMembers}`]:[]),...(s.coverage<(rules.minCoverage??.6)?[`覆蓋率 ${(s.coverage*100).toFixed(1)}% < ${((rules.minCoverage??.6)*100).toFixed(1)}%`]:[])];
}
export function qualification(s,rules,expected,verified){
  const checks=[['交易日已核對',verified===true],['資料日期',s.date===expected],...(Object.hasOwn(s,'dataConsistency')?[['計算價格與指數日期一致',s.dataConsistency===true]]:[]),...(Object.hasOwn(s.inputs,'return5')?[['5日絕對報酬為正',finite(s.inputs.return5)&&s.inputs.return5>0]]:[]),['完整100分',finite(s.total)],['總分門檻',finite(s.total)&&s.total>=rules.threshold],['5日超額報酬為正',finite(s.inputs.rs5)&&s.inputs.rs5>0],['至少半數站上20日均線',finite(s.inputs.above)&&s.inputs.above>=.5],['共同轉強檔數',s.strong>=rules.minMembers],['有效成分覆蓋率',s.coverage>=(rules.minCoverage??.6)]];
  const details={交易日已核對:verified,資料日期:`${s.date} / 預期 ${expected}`,完整100分:`完整度 ${s.completeness}/100`,總分門檻:`${s.total??'缺漏'} / 至少 ${rules.threshold}`,共同轉強檔數:`${s.strong} / 至少 ${rules.minMembers}`,有效成分覆蓋率:`${(s.coverage*100).toFixed(1)}% / 至少 ${((rules.minCoverage??.6)*100).toFixed(1)}%`};
  return {qualified:checks.every(([,ok])=>ok),checks:checks.map(([name,passed])=>({name,passed,detail:details[name]??null})),failed:checks.filter(([,ok])=>!ok).map(([name])=>name+(details[name]!=null?'：'+details[name]:''))};
}
export function breadthAt(ctx,date,limit=.25){
  const dates=ctx.dates.filter(d=>d<=date), result={date,universe:ctx.stocks.length,basis:'普通股等權；不含ETF；各均線使用可對齊且無超門檻價格跳動的股票，分母分別列示；未還原價格'};
  for(const n of [5,20,60]){
    const expected=dates.slice(-n);let eligible=0,above=0;
    for(const s of ctx.stocks){const h=s.h.filter(b=>b.date<=date).slice(-n);if(h.length!==n||expected.length!==n||h.some((b,i)=>b.date!==expected[i]||!(b.close>0)||i>0&&Math.abs(b.close/h[i-1].close-1)>limit))continue;eligible++;if(h.at(-1).close>mean(h.map(b=>b.close)))above++;}
    result['ma'+n]={above,eligible,ratio:eligible?above/eligible:null,coverage:ctx.stocks.length?eligible/ctx.stocks.length:0};
  }return result;
}
export function marketDiagnostics(ctx,limit=.25){
  const current=breadthAt(ctx,ctx.date,limit),previousDate=ctx.dates.filter(d=>d<ctx.date).at(-1),previous=previousDate?breadthAt(ctx,previousDate,limit):null;
  const priorDates=ctx.dates.filter(d=>d<ctx.date).slice(-20),previousHigh=priorDates.length===20&&priorDates.every(d=>ctx.benchmarks.get(d)>0)?Math.max(...priorDates.map(d=>ctx.benchmarks.get(d))):null,index=ctx.benchmarks.get(ctx.date)??null;
  const amountAt=d=>{const rows=ctx.stocks.map(s=>s.h.find(b=>b.date===d)).filter(Boolean);return rows.length?rows.reduce((sum,b)=>sum+(b.amount??0),0):null;};
  const prior5=ctx.dates.filter(d=>d<ctx.date).slice(-5).map(amountAt),amount=amountAt(ctx.date),amountRatio=prior5.length===5&&prior5.every(x=>x>0)&&amount!=null?amount/mean(prior5):null;
  const breadthImproved=previous&&current.ma20.ratio!=null&&previous.ma20.ratio!=null?current.ma20.ratio>previous.ma20.ratio:null,reclaimedPreviousHigh=index!=null&&previousHigh!=null?index>previousHigh:null,amountExpanded=amountRatio!=null?amountRatio>1:null;
  return {breadth:current,rebound:{date:ctx.date,previousDate,index,previous20SessionHigh:previousHigh,reclaimedPreviousHigh,stockAmountRatioVsPrior5:amountRatio,amountExpanded,breadthImproved,previousMA20Breadth:previous?.ma20??null,status:[reclaimedPreviousHigh,amountExpanded,breadthImproved].some(x=>x==null)?'資料不足，無法完整確認':[reclaimedPreviousHigh,amountExpanded,breadthImproved].every(Boolean)?'三項同時通過，仍非趨勢保證':'尚未同時通過三項',basis:'收盤指數突破前20交易日最高收盤＋普通股成交額高於前5日均額＋站上20日均線比例較前日增加；非成交股數、非回測訊號'}};
}
export const pctText=x=>finite(x)?(x*100).toFixed(2)+'%':'缺漏';
export const ppText=x=>finite(x)?(x*100).toFixed(2)+' 個百分點':'缺漏';
export function financialGaps(x){return [...(!x.financial||x.financialBasis!=='可推導單季'?['缺最新可推導單季財報']:[]),...(!x.previousFinancial?['缺相鄰前季可比較單季財報']:[]),...(x.inputs?.grossChange==null?['缺毛利率季變化']:[]),...(x.inputs?.operatingChange==null?['缺營益率季變化']:[])];}

// Defaults are research policy, not publication deadlines or backtested parameters.
export const freshnessDefaults={maxRevenueLagMonths:2,maxQuarterAgeDays:200,maxPreviousQuarterAgeDays:300};
export function previousQuarter(period){const m=/^(\d{4})-Q([1-4])$/.exec(period??'');return !m?null:Number(m[2])===1?(Number(m[1])-1)+'-Q4':m[1]+'-Q'+(Number(m[2])-1);}
export function fundamentalFreshness(revs,fins,quarters,cutoff,policy={}){
 const p={...freshnessDefaults,...policy},now=new Date(cutoff),today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(now),month=today.slice(0,7),latestRevenue=revs[0]?.period??null,latestFinancial=fins[0]?.period??null;
 const monthNumber=s=>/^\d{4}-\d{2}$/.test(s??'')?Number(s.slice(0,4))*12+Number(s.slice(5))-1:null,lag=monthNumber(latestRevenue)!=null?monthNumber(month)-monthNumber(latestRevenue):null;
 const age=q=>{const m=/^(\d{4})-Q([1-4])$/.exec(q??'');if(!m)return null;const end=Date.UTC(Number(m[1]),Number(m[2])*3,0);return Math.floor((Date.parse(today+'T00:00:00Z')-end)/86400000);};
 const quarter=quarters.find(q=>q.period===latestFinancial),priorPeriod=previousQuarter(latestFinancial),prior=quarters.find(q=>q.period===priorPeriod),quarterAge=age(latestFinancial),priorAge=age(priorPeriod),quarterFields=['revenue','netIncome','grossMargin','operatingMargin'];
 const revenueFresh=lag!=null&&lag>=0&&lag<=p.maxRevenueLagMonths,quarterFresh=quarterAge!=null&&quarterAge>=0&&quarterAge<=p.maxQuarterAgeDays;
 const hasComparableQuarters=!!quarter&&!!prior&&quarterFields.every(k=>finite(quarter[k])&&finite(prior[k])),financialComparable=quarterFresh&&priorAge!=null&&priorAge>=0&&priorAge<=p.maxPreviousQuarterAgeDays&&hasComparableQuarters;
 const warnings=[...(!revenueFresh?['月營收期間缺漏、超前或超過新鮮度門檻']:[]),...(!quarterFresh?['財報期間缺漏、超前或超過新鮮度門檻']:[]),...(!hasComparableQuarters?['缺最新及相鄰前季可比較的單季財報']:[]),...(hasComparableQuarters&&!financialComparable?['單季比較超過新鮮度門檻']:[])];
 return {asOf:today,latestRevenuePeriod:latestRevenue,revenueWindow:revs.slice(0,3).map(r=>r.period),revenueLagMonths:lag,revenueFresh,latestFinancialPeriod:latestFinancial,quarterAgeDays:quarterAge,quarterFresh,previousQuarterPeriod:priorPeriod,previousQuarterAgeDays:priorAge,hasComparableQuarters,financialComparable,eligibleForGrowthLabel:revenueFresh&&financialComparable,policy:p,warnings,basis:'依營收月份與財報季末計算年齡；取得時間不等於期間新鮮度。近3月為列出的三個月份合計，不是3月份營收，也不代表本月動能'};
}
export function calculationInputs(db,ctx,expected){
 const selected=[...ctx.histories.values()].map(h=>h.at(-1)).filter(b=>b?.date===ctx.date),groups=new Map();
 for(const b of selected){const key=b.date+'|'+b.source;let g=groups.get(key);if(!g){g={date:b.date,source:b.source??null,rows:0,fetchedFrom:b.fetched??null,fetchedTo:b.fetched??null};groups.set(key,g);}g.rows++;if(b.fetched&&(!g.fetchedFrom||b.fetched<g.fetchedFrom))g.fetchedFrom=b.fetched;if(b.fetched&&(!g.fetchedTo||b.fetched>g.fetchedTo))g.fetchedTo=b.fetched;}
 const benchmark=db.prepare('SELECT date,close,source,fetched FROM benchmarks WHERE market=? AND date=?').get(ctx.market,ctx.date)??null;
 const chips=db.prepare('SELECT date,source,MAX(fetched) fetched,COUNT(*) rows FROM institutions WHERE market=? AND date<=? GROUP BY date,source ORDER BY date DESC LIMIT 5').all(ctx.market,ctx.date);
 const consistent=ctx.date===expected&&selected.length>0&&selected.every(b=>b.date===ctx.date&&!!b.source)&&benchmark?.date===ctx.date&&benchmark.close>0&&!!benchmark.source;
 return {expectedDate:expected,calculationDate:ctx.date,priceSources:[...groups.values()],benchmark,chips,consistent,verification:'本機實際計算輸入的日期與來源核對；未作另一獨立來源價格交叉驗證',status:consistent?'價格與指數日期一致':'日期或來源缺漏；禁止正式候選',basis:'快照來源清單不是最終計算來源；以本欄列出的逐筆行情來源及同日指數為準。籌碼缺日另外保持缺分'};
}
