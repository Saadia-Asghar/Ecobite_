import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-ivory text-forest-900">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Page not found</p>
            <Link to="/" className="px-6 py-3 bg-forest-900 text-ivory rounded-full hover:bg-forest-800 transition-colors">
                Go Home
            </Link>
        </div>
    );
}
