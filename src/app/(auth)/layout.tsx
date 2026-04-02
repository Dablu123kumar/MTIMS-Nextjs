export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e1e2d] relative overflow-hidden">
        <div className="flex flex-col items-center justify-center w-full px-16 text-center">
          {/* Logo */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white font-bold text-3xl mb-8 shadow-lg">
            D
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">DABIMS</h1>
          <p className="text-lg text-[#636674] max-w-md">
            Multi-tenant Institute Management System built for modern education
          </p>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary/20 rounded-full" />
          <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-primary/30 rounded-full" />
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-6">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}
