import Link from 'next/link';
import Header from '@/components/Header';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="max-w-screen-sm mx-auto px-4 py-20 text-center">
        <p className="text-sm text-gray-400 mb-4">페이지를 찾을 수 없습니다.</p>
        <Link
          href="/"
          className="inline-block text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          홈으로
        </Link>
      </main>
    </>
  );
}
