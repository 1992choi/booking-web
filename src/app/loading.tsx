import Header from '@/components/Header';

export default function Loading() {
  return (
    <>
      <Header />
      <main className="max-w-screen-sm mx-auto px-4 py-6 space-y-3">
        <div className="h-8 w-40 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      </main>
    </>
  );
}
