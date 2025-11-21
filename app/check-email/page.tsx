// src/app/check-email/page.tsx
export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
        <p className="text-gray-600 mb-6">
          We sent a verification link to your email. Click it to activate your account.
        </p>
        <p className="text-sm text-gray-500">
          Didn’t get it? Check spam or sign up again.
        </p>
      </div>
    </div>
  );
}