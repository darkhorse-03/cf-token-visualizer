export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card bg-base-100 shadow-md max-w-md w-full">
        <div className="card-body text-center">
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p className="text-base-content/70">The route you requested does not exist.</p>
        </div>
      </div>
    </div>
  );
}
