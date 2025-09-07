(()=>{var a={};a.id=213,a.ids=[213],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},12790:(a,b,c)=>{"use strict";function d(){return process.env.VERCEL,"demo"}c.d(b,{m:()=>h});let e={mode:d(),api:{useRealAPI:"development"===d(),openaiKey:process.env.OPENAI_API_KEY,googleKey:process.env.GOOGLE_API_KEY},rateLimit:{enabled:"development"!==d(),maxRequestsPerHour:100,maxRequestsPerDay:500},database:{enabled:"development"===d(),url:process.env.DATABASE_URL},features:{realTimeAI:"development"===d(),dataExport:"development"===d(),advancedAnalytics:"development"===d(),wandb:"development"===d()&&"73288f9566f3a99386ad2037ccef5f5732dc1f82"},ui:{showDemoNotice:"demo"===d(),showDevTools:"development"===d()}},f={projectName:"mindflow-ai-diary",entity:"mikami-052999-musha",apiKey:"73288f9566f3a99386ad2037ccef5f5732dc1f82",enabled:e.features.wandb&&"73288f9566f3a99386ad2037ccef5f5732dc1f82"};class g{log(a){let b={...a,timestamp:Date.now(),sessionDuration:Date.now()-this.sessionStartTime};this.logs.push(b),"development"===e.mode&&console.log("\uD83D\uDCCA W&B Metrics:",b),f.enabled&&this.sendToWandb(b)}logResponseTime(a,b="gpt-3.5-turbo"){let c=Date.now()-a;this.log({responseTime:c,modelName:b})}logEmotionAnalysis(a,b,c=.85){this.log({emotionScore:a,dominantEmotion:b[0],emotionConfidence:c,emotionAccuracy:100*c})}logConversation(a,b){this.log({conversationLength:a,userSatisfaction:b||a>3?4:3,responseRelevance:.9})}logError(a){let b=this.logs.filter(a=>a.apiCalls).length+1,c=this.logs.filter(a=>a.errorRate).length+1;this.log({errorRate:c/b*100,apiCalls:b})}logCacheHit(a){let b=this.logs.filter(a=>void 0!==a.cacheHitRate),c=b.filter(a=>a.cacheHitRate>0).length+ +!!a,d=b.length+1;this.log({cacheHitRate:c/d*100})}async sendToWandb(a){try{let b=await fetch("https://api.wandb.ai/graphql",{method:"POST",headers:{Authorization:`Bearer ${f.apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({query:`
            mutation LogMetrics($projectName: String!, $metrics: JSON!) {
              logMetrics(project: $projectName, metrics: $metrics) {
                success
              }
            }
          `,variables:{projectName:f.projectName,metrics:a}})});b.ok||console.error("W&B送信失敗:",b.statusText)}catch(a){console.error("W&B送信エラー:",a)}}generateReport(){let a=this.logs.filter(a=>a.responseTime).reduce((a,b)=>a+b.responseTime,0)/this.logs.length||0,b=this.logs.filter(a=>a.emotionScore).reduce((a,b)=>a+b.emotionScore,0)/this.logs.length||0,c=this.logs.filter(a=>a.errorRate).reduce((a,b)=>a+b.errorRate,0)/this.logs.length||0;return{totalLogs:this.logs.length,avgResponseTime:Math.round(a),avgEmotionScore:b.toFixed(1),errorRate:c.toFixed(2),sessionDuration:Math.round((Date.now()-this.sessionStartTime)/1e3),timestamp:new Date().toISOString()}}clear(){this.logs=[],this.sessionStartTime=Date.now()}constructor(){this.logs=[],this.sessionStartTime=Date.now()}}let h=new g},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31762:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>I,patchFetch:()=>H,routeModule:()=>D,serverHooks:()=>G,workAsyncStorage:()=>E,workUnitAsyncStorage:()=>F});var d={};c.r(d),c.d(d,{POST:()=>C});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(48676),w=c(12790);class x{generateEmbedding(a){let b=a.toLowerCase().split(/\s+/),c=Array(128).fill(0);b.forEach((a,b)=>{let d=this.hashCode(a);c[d%128]+=1/(b+1)});let d=Math.sqrt(c.reduce((a,b)=>a+b*b,0));return c.map(a=>a/(d||1))}cosineSimilarity(a,b){if(a.length!==b.length)return 0;let c=0;for(let d=0;d<a.length;d++)c+=a[d]*b[d];return c}hashCode(a){let b=0;for(let c=0;c<a.length;c++)b=(b<<5)-b+a.charCodeAt(c),b&=b;return Math.abs(b)}async searchRelevantContext(a,b,c=5){let d=this.contextCache.get(b);d||(d=this.generateDemoContexts(),this.contextCache.set(b,d));let e=this.generateEmbedding(a);return d.map(b=>{let c=b.embedding||this.generateEmbedding(b.content),d=this.cosineSimilarity(e,c),f=new Set(a.toLowerCase().split(/\s+/)),g=b.keywords.reduce((a,b)=>f.has(b.toLowerCase())?a+.1:a,0),h=this.calculateEmotionSimilarity(a,b.emotions);return{context:b,relevanceScore:d+g+h}}).sort((a,b)=>b.relevanceScore-a.relevanceScore).slice(0,c)}calculateEmotionSimilarity(a,b){let c=a.toLowerCase(),d=0;return["嬉しい","楽しい","happy","良い","素晴らしい"].forEach(a=>{c.includes(a)&&(d+=1)}),["悲しい","辛い","sad","大変","疲れ"].forEach(a=>{c.includes(a)&&(d-=1)}),.2*Math.max(0,1-Math.abs(b.overallScore/5-(d+2)/4))}async enhancePromptWithContext(a,b){let c=await this.searchRelevantContext(a,b,3);if(0===c.length)return a;let d=c.map((a,b)=>{let c=new Date(a.context.date).toLocaleDateString("ja-JP"),d=a.context.emotions.dominantEmotions.join("、");return`[過去の記録${b+1}] ${c}
感情: ${d}
内容: ${a.context.content.substring(0,100)}...`}).join("\n\n");return`
ユーザーの質問: ${a}

以下は関連する過去の日記記録です：
${d}

これらの過去の記録を参考にしながら、ユーザーの現在の状況に寄り添った返答をしてください。
過去の経験や感情のパターンを踏まえて、より深い洞察を提供してください。
`}addAnswerContext(a,b,c,d){let e="demo-user",f=this.contextCache.get(e)||[],g={id:`answer-${Date.now()}`,content:a,date:new Date,emotions:b,keywords:c,type:"answer",parentId:d,embedding:this.generateEmbedding(a)};f.push(g),this.contextCache.set(e,f)}generateDemoContexts(){return[{id:"1",content:"今日は新しいプロジェクトが始まって緊張したけど、チームメンバーが優しくて安心した。初日は色々覚えることが多くて大変だったが、やりがいを感じる。",date:new Date("2024-08-01"),emotions:{overallScore:3.5,dominantEmotions:["緊張","期待","安心"],emotionScores:{緊張:.4,期待:.3,安心:.3}},keywords:["プロジェクト","チーム","仕事","新しい"]},{id:"2",content:"週末に家族と過ごした時間が本当に幸せだった。子供の成長を感じて、時間の大切さを改めて実感した。",date:new Date("2024-08-10"),emotions:{overallScore:4.8,dominantEmotions:["幸せ","感動","充実"],emotionScores:{幸せ:.6,感動:.3,充実:.1}},keywords:["家族","週末","子供","幸せ"]},{id:"3",content:"プレゼンテーションがうまくいかなくて落ち込んだ。準備不足を痛感した。次はもっとしっかり準備しよう。",date:new Date("2024-08-15"),emotions:{overallScore:2,dominantEmotions:["落胆","反省","決意"],emotionScores:{落胆:.5,反省:.3,決意:.2}},keywords:["プレゼン","仕事","失敗","学び"]},{id:"4",content:"友人と久しぶりに会って、昔話に花が咲いた。学生時代を思い出して懐かしかった。",date:new Date("2024-08-20"),emotions:{overallScore:4.2,dominantEmotions:["懐かしさ","楽しさ","友情"],emotionScores:{懐かしさ:.4,楽しさ:.4,友情:.2}},keywords:["友人","思い出","懐かしい","楽しい"]},{id:"5",content:"運動を始めて1ヶ月。体調が良くなってきた気がする。習慣化することの大切さを実感。",date:new Date("2024-08-25"),emotions:{overallScore:4,dominantEmotions:["達成感","健康","前向き"],emotionScores:{達成感:.5,健康:.3,前向き:.2}},keywords:["運動","健康","習慣","成長"]}].map(a=>({...a,embedding:this.generateEmbedding(a.content)}))}analyzeUserTrends(a){let b=this.contextCache.get(a)||this.generateDemoContexts(),c=new Map;b.forEach(a=>{a.keywords.forEach(a=>{c.set(a,(c.get(a)||0)+1)})});let d=Array.from(c.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([a])=>a),e=b.reduce((a,b)=>a+b.emotions.overallScore,0)/b.length,f="安定";e>4?f="ポジティブ":e<2.5&&(f="要サポート");let g=[];return d.includes("仕事")&&e<3&&g.push("仕事のストレス管理について考えてみましょう"),d.includes("家族")&&e>4&&g.push("家族との時間が幸せの源になっているようです"),d.includes("運動")||d.includes("健康")||g.push("健康的な習慣を取り入れることを検討してみては？"),{commonThemes:d,emotionalPattern:f,suggestions:g}}constructor(){this.contextCache=new Map}}let y=new x;class z{constructor(){this.templates=new Map,this.performanceHistory=[],this.initializeTemplates()}initializeTemplates(){this.templates.set("diary_conversation",{id:"diary_conversation",name:"対話型日記作成",template:`あなたは共感的で洞察力のある日記作成アシスタントです。

役割:
- ユーザーの感情に深く共感する
- 具体的で思慮深い質問をする
- ポジティブな視点を提供する
- 成長と自己理解を促進する

コミュニケーションスタイル:
- 温かく親しみやすい口調
- 判断せず受け入れる姿勢
- 適度な距離感を保つ
- 2-3文の簡潔な応答

現在の文脈:
{context}

ユーザーの発言: {userMessage}

応答ガイドライン:
1. まず共感を示す
2. 深掘りする質問を1つ含める
3. 必要に応じて励ましや洞察を提供`,parameters:{temperature:.7,maxTokens:150,topP:.9},effectiveness:.85}),this.templates.set("emotion_analysis",{id:"emotion_analysis",name:"感情分析",template:`以下の日記テキストから感情を分析してください。

分析する要素:
1. 全体的な感情トーン（1-5のスコア）
2. 主要な感情（最大3つ）
3. 各感情の強度（0-1）
4. 潜在的な感情（明示されていないが示唆される感情）

テキスト: {text}

出力形式:
- overallScore: 数値
- dominantEmotions: 配列
- emotionScores: オブジェクト
- subtleEmotions: 配列

分析は客観的かつ共感的に行ってください。`,parameters:{temperature:.3,maxTokens:200,topP:.95},effectiveness:.88}),this.templates.set("self_pr_generation",{id:"self_pr_generation",name:"自己PR生成",template:`過去の日記データを基に、魅力的な自己PRを作成します。

分析データ:
- 頻出テーマ: {themes}
- 強み: {strengths}
- 成長エピソード: {growthStories}
- 価値観: {values}

目的: {purpose}（転職/自己紹介/プロフィール等）

作成ガイドライン:
1. 具体的なエピソードを含める
2. 数値や成果を可能な限り含める
3. {purpose}に適した内容にする
4. 300-500文字程度
5. 前向きで誠実なトーン

自己PR:`,parameters:{temperature:.6,maxTokens:500,topP:.9},effectiveness:.82}),this.templates.set("question_generation",{id:"question_generation",name:"深掘り質問生成",template:`日記の内容から、自己理解を深める質問を生成します。

日記内容: {content}
感情状態: {emotions}
キーワード: {keywords}

質問生成の観点:
1. 感情の原因を探る
2. 価値観を明確にする
3. 行動パターンを認識する
4. 成長機会を見出す
5. 関係性を深める

生成する質問（5つ）:
- 各質問は具体的で答えやすいものにする
- オープンエンドで深い思考を促す
- ポジティブな視点を含める`,parameters:{temperature:.8,maxTokens:250,topP:.85},effectiveness:.87})}optimizePrompt(a,b){let c=this.templates.get(a);if(!c)throw Error(`Template ${a} not found`);let d=c.template,e=[];if(Object.entries(b).forEach(([a,b])=>{let c=`{${a}}`;d.includes(c)&&(d=d.replace(RegExp(c,"g"),String(b)))}),b.context&&String(b.context).length>500){let a=this.truncateContext(String(b.context),500);d=d.replace(b.context,a),e.push("コンテキストを最適な長さに調整")}let f=this.detectEmotionalKeywords(d);f.length>0&&e.push(`感情キーワード検出: ${f.join(", ")}`),b.userMood&&(d=this.adjustToneForMood(d,b.userMood),e.push(`ユーザーの気分に合わせてトーン調整: ${b.userMood}`));let g=this.calculatePromptScore(d,c),h={originalPrompt:c.template,optimizedPrompt:d,improvements:e,score:g};return this.performanceHistory.push(h),h}truncateContext(a,b){if(a.length<=b)return a;let c=a.split("。"),d="",e=0;for(let a of c){if(e+a.length>b)break;d+=a+"。",e+=a.length+1}return d||a.substring(0,b)+"..."}detectEmotionalKeywords(a){return["嬉しい","悲しい","楽しい","辛い","幸せ","不安","怒り","喜び","恐れ","期待","失望","感動","緊張","安心","満足","後悔","感謝","愛"].filter(b=>a.includes(b))}adjustToneForMood(a,b){return a+(({positive:"\n\n追加指示: 明るく前向きなトーンを維持してください。",negative:"\n\n追加指示: 特に共感的で優しいトーンで応答してください。",neutral:"\n\n追加指示: バランスの取れた落ち着いたトーンで応答してください。",anxious:"\n\n追加指示: 安心感を与える穏やかなトーンで応答してください。",excited:"\n\n追加指示: エネルギッシュで励ましのあるトーンで応答してください。"})[b]||"")}calculatePromptScore(a,b){let c=b.effectiveness;return(a.includes("役割:")||a.includes("ガイドライン"))&&(c+=.05),a.includes("{")||(c+=.05),Math.max(0,Math.min(1,c-=.1*(Math.abs(a.length-500)/500)))}generateChainOfThought(a,b){return`タスク: ${a}

ステップバイステップで考えてみましょう：

1. 状況の理解
   - 現在の文脈: ${b}
   - 解決すべき課題は何か？

2. 可能なアプローチの検討
   - どのような方法が考えられるか？
   - それぞれの長所と短所は？

3. 最適な解決策の選択
   - なぜこのアプローチが最適か？
   - 期待される結果は？

4. 実行計画
   - 具体的にどのように進めるか？
   - 注意すべき点は？

5. 結論と提案
   - 最終的な回答
   - 追加の考慮事項

では、順番に考えていきましょう：`}generateFewShotPrompt(a,b){let c=b.map((a,b)=>`例${b+1}:
入力: ${a.input}
出力: ${a.output}`).join("\n\n");return`以下の例を参考に、同様のタスクを実行してください。

${c}

では、以下の入力に対して同様に処理してください：
入力: ${a}
出力:`}getPerformanceStats(){if(0===this.performanceHistory.length)return{averageScore:0,totalOptimizations:0,topImprovements:[]};let a=this.performanceHistory.reduce((a,b)=>a+b.score,0)/this.performanceHistory.length,b=this.performanceHistory.flatMap(a=>a.improvements),c=new Map;b.forEach(a=>{c.set(a,(c.get(a)||0)+1)});let d=Array.from(c.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([a])=>a);return{averageScore:a,totalOptimizations:this.performanceHistory.length,topImprovements:d}}}let A=new z,B=new v.Ay({apiKey:process.env.OPENAI_API_KEY||"demo-key-for-testing"});async function C(a){try{let{messages:b}=await a.json();if(!b||0===b.length)return u.NextResponse.json({error:"メッセージが必要です"},{status:400});if(!process.env.OPENAI_API_KEY||"your-openai-api-key-here"===process.env.OPENAI_API_KEY){let a=b[b.length-1].content,c="demo-user",d=await y.enhancePromptWithContext(a,c),e=A.optimizePrompt("diary_conversation",{context:d,userMessage:a,userMood:"neutral"}),f=y.analyzeUserTrends(c),g=[`${f.commonThemes.includes("仕事")?"仕事のことですね。":""}それは素敵な一日でしたね。その時の気持ちをもう少し詳しく教えていただけますか？`,`なるほど、${"ポジティブ"===f.emotionalPattern?"前向きな":""}経験をされたのですね。何か学びや気づきはありましたか？`,`興味深い出来事ですね。${f.suggestions[0]||"その時、周りの人はどんな反応でしたか？"}`,"そのことについて、今振り返ってみてどう感じますか？過去の似た経験と比べてどうでしょうか？",`大変でしたね。${"要サポート"===f.emotionalPattern?"無理をせず、自分のペースで大丈夫ですよ。":""}その経験から得たものはありますか？`],h=g[Math.floor(Math.random()*g.length)];return w.m.logResponseTime(Date.now()-100,"demo-mode-with-rag"),w.m.logConversation(b.length),u.NextResponse.json({response:h,metadata:{ragEnabled:!0,promptOptimized:!0,optimizationScore:e.score,userTrends:f.commonThemes.slice(0,3)}})}try{let a=Date.now(),c=(await B.chat.completions.create({model:"gpt-3.5-turbo",messages:[{role:"system",content:`あなたは優しく共感的な日記アプリのアシスタントです。
ユーザーの一日の出来事や感情について、温かく傾聴し、適切な質問で深掘りしてください。

以下の点に注意してください：
1. 共感的で温かいトーンを保つ
2. ユーザーの感情を認識し、受け止める
3. 適切な質問で話を深掘りする（詳細、感情、学び、気づきなど）
4. 長すぎない自然な応答（2-3文程度）
5. 日記に記録する価値のある内容を引き出す`},...b.map(a=>({role:"assistant"===a.role?"assistant":"user",content:a.content}))],max_tokens:150,temperature:.7})).choices[0].message.content;return w.m.logResponseTime(a,"gpt-3.5-turbo"),w.m.logConversation(b.length),u.NextResponse.json({response:c})}catch(a){return console.error("OpenAI API エラー:",a),u.NextResponse.json({response:"そうだったのですね。もう少し詳しく聞かせていただけますか？"})}}catch(a){return console.error("対話API エラー:",a),u.NextResponse.json({error:"AI応答の生成に失敗しました"},{status:500})}}let D=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/ai/dialogue/route",pathname:"/api/ai/dialogue",filename:"route",bundlePath:"app/api/ai/dialogue/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"C:\\Users\\mikam\\Downloads\\AI_diary_app\\src\\app\\api\\ai\\dialogue\\route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:E,workUnitAsyncStorage:F,serverHooks:G}=D;function H(){return(0,g.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:F})}async function I(a,b,c){var d;let e="/api/ai/dialogue/route";"/index"===e&&(e="/");let g=await D.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,resolvedPathname:C}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[C]);if(F&&!x){let a=!!y.routes[C],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||D.isDev||x||(G="/index"===(G=C)?"/":G);let H=!0===D.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>D.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>D.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&A&&B&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await D.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})},z),b}},l=await D.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(L||b instanceof s.NoFallbackError||await D.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[586,692,676],()=>b(b.s=31762));module.exports=c})();