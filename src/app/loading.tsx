import Header from '@/components/Header';
import Skeleton from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <>
      <Header />
      <main className="max-w-screen-sm mx-auto px-4 py-6 space-y-3">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </main>
    </>
  );
}
