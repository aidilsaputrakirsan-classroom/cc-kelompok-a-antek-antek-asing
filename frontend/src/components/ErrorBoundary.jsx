import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4 font-sans">
          <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
            <div className="bg-red-500 h-2 w-full"></div>
            <div className="p-8">
              <div className="flex items-center justify-center mb-6 text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-center mb-4 tracking-tight">
                Oops! Terjadi Kesalahan
              </h2>
              <p className="text-gray-400 text-center mb-8 leading-relaxed">
                Maaf, sistem mengalami kendala teknis. Kami sedang berusaha
                memperbaikinya. Silakan coba muat ulang halaman.
              </p>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Muat Ulang Halaman
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full bg-transparent border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl transition duration-200 focus:outline-none"
                >
                  Kembali ke Beranda
                </button>
              </div>
              {process.env.NODE_ENV === "development" && (
                <div className="mt-8 p-4 bg-gray-900 rounded-lg overflow-auto max-h-40 border border-gray-700">
                  <p className="text-xs font-mono text-red-400">
                    {this.state.error?.toString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
