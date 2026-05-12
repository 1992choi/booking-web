export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Booking Platform</h1>
        <p className="text-gray-500 mb-8">범용 예약 플랫폼 프론트엔드</p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            로그인
          </a>
          <a
            href="/signup"
            className="px-6 py-3 border border-black rounded-lg hover:bg-gray-50 transition-colors"
          >
            회원가입
          </a>
        </div>
      </div>
    </main>
  );
}
