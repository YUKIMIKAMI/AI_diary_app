exports.id=377,exports.ids=[377],exports.modules={73645:(a,b,c)=>{"use strict";c.d(b,{u:()=>g});var d=c(48676),e=c(94364);class f{constructor(){this.openai=null,this.gemini=null,this.geminiModel=null,this.provider="mock",this.isConfigured=!1,this.initializeService()}initializeService(){let a=process.env.GOOGLE_API_KEY;if(a&&"your-google-api-key-here"!==a)try{this.gemini=new e.ij(a),this.geminiModel=this.gemini.getGenerativeModel({model:"gemini-1.5-flash"}),this.provider="google",this.isConfigured=!0,console.log("Google AI (Gemini) サービスが初期化されました");return}catch(a){console.error("Google AI 初期化エラー:",a)}let b=process.env.OPENAI_API_KEY;if(b&&"your-openai-api-key-here"!==b)try{this.openai=new d.Ay({apiKey:b}),this.provider="openai",this.isConfigured=!0,console.log("OpenAI APIサービスが初期化されました");return}catch(a){console.error("OpenAI API初期化エラー:",a)}console.log("AI APIキーが設定されていません。モック機能を使用します。"),this.provider="mock",this.isConfigured=!1}async generateQuestions(a){if("mock"===this.provider)return this.generateMockQuestions(a);let b=`
日記から、書き手の心に寄り添う優しい質問を2つ作ってください。

日記の内容:
${a}

【質問の条件】
- 30-50文字程度の適度な長さ（長すぎず短すぎず）
- 「はい/いいえ」で答えられない開かれた質問
- 今日の具体的な出来事や感情に焦点を当てる
- 批判的でなく、共感と好奇心を持った優しい質問
- 書き手が答えやすく、新しい気づきを得られる質問

【カテゴリ】
reflection: その瞬間の気持ちや感覚を振り返る
detail: 具体的な場面・状況・様子を思い出す
emotion: 感情の変化や理由を優しく探る  
action: 明日からできる小さな一歩を考える

JSON形式で返してください:
[
  {"question": "質問文（30-50文字）", "category": "カテゴリ名"},
  {"question": "質問文（30-50文字）", "category": "カテゴリ名"}
]
`;try{if("google"===this.provider&&this.geminiModel){let a=(await this.geminiModel.generateContent(b)).response.text().match(/\[[\s\S]*\]/);if(a){let b=JSON.parse(a[0]);return Array.isArray(b)?b:[]}}else if("openai"===this.provider&&this.openai){let a=await this.openai.chat.completions.create({model:process.env.AI_MODEL||"gpt-3.5-turbo",messages:[{role:"system",content:"あなたは優れた心理カウンセラーです。"},{role:"user",content:b}],temperature:.7,max_tokens:500,response_format:{type:"json_object"}}),c=JSON.parse(a.choices[0].message.content||"[]");return Array.isArray(c)?c:c.questions||[]}}catch(a){console.error("質問生成エラー:",a)}return this.generateMockQuestions(a)}async analyzeEmotions(a){if("mock"===this.provider)return this.analyzeMockEmotions(a);let b=`
日記の内容を分析し、感情スコアを評価してください。

日記の内容:
${a}

必ず以下のJSON形式で感情分析結果を返してください。他の説明は一切不要です:
{
  "overallScore": 1-5の整数（1:とてもネガティブ、5:とてもポジティブ）,
  "emotions": {
    "joy": 0-100の数値,
    "sadness": 0-100の数値,
    "anger": 0-100の数値,
    "fear": 0-100の数値,
    "surprise": 0-100の数値,
    "disgust": 0-100の数値,
    "trust": 0-100の数値,
    "anticipation": 0-100の数値
  },
  "dominantEmotions": ["主要な感情を日本語で最大3つの配列（例: 喜び, 不安, 期待）"]
}
`;try{if("google"===this.provider&&this.geminiModel){let a=(await this.geminiModel.generateContent(b)).response.text().match(/\{[\s\S]*\}/);if(a)return JSON.parse(a[0])}else if("openai"===this.provider&&this.openai){let a=await this.openai.chat.completions.create({model:process.env.AI_MODEL||"gpt-3.5-turbo",messages:[{role:"system",content:"あなたは感情分析の専門家です。"},{role:"user",content:b}],temperature:.3,max_tokens:500,response_format:{type:"json_object"}});return JSON.parse(a.choices[0].message.content||"{}")}}catch(a){console.error("感情分析エラー:",a)}return this.analyzeMockEmotions(a)}async generateConsultationResponse(a,b,c){if("mock"===this.provider)return this.generateMockConsultationResponse(a,b);let d=`あなたはユーザーの過去の日記をすべて読み、深く理解している相談相手です。

【重要なルール】
- 過去の日記から具体的な日付と出来事を引用する（例：2024年1月15日の日記では〜）
- 似た経験があれば「○年前の○月○日にも同じような〜」と具体的に言及
- 過去の成功体験や乗り越え方を思い出させる
- 適度な共感と励ましを含める
- 4-6文程度でまとめる

【過去の日記】
${b||"（まだ日記がありません）"}

過去の具体的な日付と出来事を引用しながら、寄り添いつつ励ます返答をしてください。`;try{if("google"===this.provider&&this.geminiModel){let b=`${d}

ユーザーからの質問: ${a}`;return(await this.geminiModel.generateContent(b)).response.text()}if("openai"===this.provider&&this.openai)return(await this.openai.chat.completions.create({model:process.env.AI_MODEL||"gpt-3.5-turbo",messages:[{role:"system",content:d},{role:"user",content:a}],temperature:.7,max_tokens:400})).choices[0].message.content||""}catch(a){console.error("相談応答生成エラー:",a)}return this.generateMockConsultationResponse(a,b)}generateMockConsultationResponse(a,b){let c=new Date,d=new Date(c.getFullYear(),c.getMonth()-1,c.getDate()),e=new Date(c.getFullYear(),c.getMonth()-3,c.getDate());for(let[b,f]of Object.entries({悩み:`悩んでいるんだね。その気持ち、よくわかるよ。
実は${e.toLocaleDateString("ja-JP")}の日記でも、似たようなことで悩んでいたよね。
でもその時は「一歩ずつ進む」って決めて、実際に乗り越えてきた。
今回もきっと大丈夫。あの時の強さが今もあなたの中にあるから。`,最近:`最近のことを話したいんだね。
${d.toLocaleDateString("ja-JP")}の日記と比べると、だいぶ環境も変わってきたみたいだね。
特に仕事でのストレスが増えているように見えるけど、過去にも同じような時期があったよ。
その時は運動と読書でリフレッシュしてたよね。今回も試してみたら？`,成長:`成長について考えているんだね。
1年前の2023年9月の日記を見ると、「こんなことできるかな」って不安に思ってたことが、今では当たり前にできてるよ。
この1年で本当に成長してる。それは日記が証明してる。
だからこれからの1年も、きっと同じくらい成長できるよ。`,仕事:`仕事の話だね。
2ヶ月前の${new Date(c.getFullYear(),c.getMonth()-2,15).toLocaleDateString("ja-JP")}の日記でも、同じように仕事のプレッシャーを感じてたよね。
でもその後、プロジェクトを無事完成させて「やればできる」って自信をつけた。
今回も同じように乗り越えられるはずだよ。`,疲れ:`お疲れさま。本当に頑張ってるよね。
実は先月の${new Date(c.getFullYear(),c.getMonth()-1,20).toLocaleDateString("ja-JP")}の日記でも「疲れた」って書いてた。
でもその翌週には「リフレッシュできた」って書いてある。休息を取ったからだよね。
疲れを感じるのは頑張っている証拠。少し休んでも大丈夫だよ。`}))if(a.includes(b))return f;return b?`そうなんだね。しっかり聞かせてもらうよ。
過去の日記を読んでいると、あなたがいろいろなことを乗り越えてきたことがわかる。
${d.toLocaleDateString("ja-JP")}頃の日記でも似たような状況があったけど、ちゃんと前に進んでいるよ。
今回もきっと大丈夫。一緒に考えていこう。`:`話を聞かせてくれてありがとう。
まだ日記が少ないから、あなたのことをもっと知りたいな。
これから日記が増えるにつれて、もっと的確なアドバイスができるようになるよ。
今はどんなことを話したい？`}async extractKeywords(a){if("mock"===this.provider)return this.extractMockKeywords(a);let b=`
日記の内容から重要なキーワードを5つ抽出してください。

日記の内容:
${a}

必ずJSON形式でキーワードの配列を返してください。他の説明は一切不要です:
{"keywords": ["キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5"]}
`;try{if("google"===this.provider&&this.geminiModel){let a=(await this.geminiModel.generateContent(b)).response.text().match(/\{[\s\S]*\}/);if(a)return JSON.parse(a[0]).keywords||[]}else if("openai"===this.provider&&this.openai){let a=await this.openai.chat.completions.create({model:process.env.AI_MODEL||"gpt-3.5-turbo",messages:[{role:"system",content:"あなたはテキスト分析の専門家です。"},{role:"user",content:b}],temperature:.3,max_tokens:200,response_format:{type:"json_object"}});return JSON.parse(a.choices[0].message.content||"{}").keywords||[]}}catch(a){console.error("キーワード抽出エラー:",a)}return this.extractMockKeywords(a)}generateMockQuestions(a){let b=[];for((a.includes("子供")||a.includes("家族"))&&b.push({question:"看病の合間に、どんな気持ちで本や映画を楽しみましたか？",category:"reflection"}),(a.includes("仕事")||a.includes("焦"))&&b.push({question:"焦りを感じた時、体のどこにその感覚を感じましたか？",category:"emotion"}),(a.includes("映画")||a.includes("本")||a.includes("小説"))&&b.push({question:"その作品から受け取った一番大切なメッセージは何でしたか？",category:"detail"}),a.includes("集中")&&b.push({question:"集中できた時間は、普段と何が違っていましたか？",category:"reflection"});b.length<2;)0===b.length?b.push({question:"今日の中で、自分を褒めてあげたい瞬間はありましたか？",category:"reflection"}):b.push({question:"明日も続けたい、今日見つけた小さな習慣は何ですか？",category:"action"});return b.slice(0,2)}analyzeMockEmotions(a){let b={joy:0,sadness:0,anger:0,fear:0,surprise:0,disgust:0,trust:0,anticipation:0},c=[];return(a.includes("嬉しい")||a.includes("楽しい")||a.includes("良い"))&&(b.joy=70,c.push("喜び")),(a.includes("悲しい")||a.includes("辛い"))&&(b.sadness=60,c.push("悲しみ")),(a.includes("焦る")||a.includes("不安"))&&(b.fear=50,b.anticipation=40,c.push("不安")),(a.includes("集中")||a.includes("満足"))&&(b.trust=60,b.joy=50,c.includes("喜び")||c.push("満足感")),0===c.length&&(b.trust=40,b.anticipation=30,c.push("平穏")),{overallScore:Math.max(1,Math.min(5,Math.round(3+((b.joy+b.trust+b.anticipation)/3-(b.sadness+b.anger+b.fear+b.disgust)/4)/50))),emotions:b,dominantEmotions:c.slice(0,3)}}extractMockKeywords(a){let b=[];for(let[c,d]of Object.entries({子供:"家族",仕事:"仕事",メール:"業務",小説:"読書",映画:"エンタメ",集中:"集中力",焦:"ストレス",看病:"介護",熱:"体調",インプット:"学習"}))a.includes(c)&&!b.includes(d)&&b.push(d);return 0===b.length&&b.push("日常","振り返り"),b.slice(0,5)}}let g=new f},78335:()=>{},96487:()=>{}};