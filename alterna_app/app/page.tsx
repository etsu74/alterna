import { NewsTimeline } from "@/components/news-timeline";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ニュースタイムライン
        </h1>
        <p className="text-gray-600">
          ALTERNA投資案件の最新情報を時系列で表示します。新着案件、償還情報、運用結果などをご確認いただけます。
        </p>
      </div>

      <NewsTimeline />
    </div>
  );
}
