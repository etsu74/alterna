import { SnapshotGrid } from '@/components/snapshot-grid';

export default function SnapshotsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          投資案件スナップショット
        </h1>
        <p className="text-gray-600">
          投資機会のスナップショット画像一覧です。画像をクリックすると元のページに移動します。
        </p>
      </div>

      <SnapshotGrid />
    </div>
  );
}