import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MetricsDashboard } from '@/components/wandb/MetricsDashboard'
import { 
  PenSquare, 
  Brain, 
  BarChart3, 
  MessageSquare,
  Sparkles,
  Shield,
  Clock,
  Heart
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: PenSquare,
      title: 'シンプルな日記入力',
      description: '直感的なインターフェースで、毎日の思い出を簡単に記録できます。',
    },
    {
      icon: Brain,
      title: 'マインドマップ自動生成',
      description: '日記からAIが関連する質問を生成し、より深い自己理解を促します。',
    },
    {
      icon: BarChart3,
      title: '感情分析と可視化',
      description: '気分の変化や頻出単語を分析し、自分の傾向を把握できます。',
    },
    {
      icon: MessageSquare,
      title: 'AI相談モード',
      description: '過去の日記を学習したAIが、あなたの最高の相談相手になります。',
    },
    {
      icon: Sparkles,
      title: '自己PR生成',
      description: '蓄積された日記から、転職や自己紹介に使える自己PRを自動生成。',
    },
    {
      icon: Shield,
      title: 'プライバシー重視',
      description: 'あなたのデータは安全に暗号化され、完全にプライベートです。',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center py-12 sm:py-16 lg:py-20">
        <div className="space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            あなたの物語を、
            <span className="text-primary-500 block sm:inline"> AIと共に</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            毎日の記録が、深い自己理解へ。
            AIが支援する次世代の日記アプリで、あなたの成長を可視化しましょう。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 px-4">
            <Link href="/diary/new">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <PenSquare className="h-5 w-5" />
                日記を始める
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                詳しく見る
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900 dark:text-white px-4">
          主な機能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary-500 mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            今すぐ始めましょう
          </h2>
          <p className="text-lg mb-8 opacity-90">
            無料で始められます。クレジットカード不要。
          </p>
          <Link href="/auth/register">
            <Button 
              size="lg" 
              className="bg-white text-primary-600 hover:bg-gray-100"
            >
              無料アカウント作成
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <Clock className="h-8 w-8 mx-auto mb-2 text-primary-500" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">5分</div>
            <div className="text-gray-600 dark:text-gray-400">平均記入時間</div>
          </div>
          <div>
            <Heart className="h-8 w-8 mx-auto mb-2 text-primary-500" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">92%</div>
            <div className="text-gray-600 dark:text-gray-400">満足度</div>
          </div>
          <div>
            <Shield className="h-8 w-8 mx-auto mb-2 text-primary-500" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">100%</div>
            <div className="text-gray-600 dark:text-gray-400">プライバシー</div>
          </div>
          <div>
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary-500" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">AI</div>
            <div className="text-gray-600 dark:text-gray-400">サポート</div>
          </div>
        </div>
      </section>

      {/* W&B Metrics Dashboard */}
      <section className="py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          AI パフォーマンス
        </h2>
        <MetricsDashboard />
      </section>
    </div>
  )
}