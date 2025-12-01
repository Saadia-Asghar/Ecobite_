import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-ivory dark:bg-forest-900 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-forest-100 dark:hover:bg-forest-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-forest-900 dark:text-ivory" />
                    </button>
                    <h1 className="text-2xl font-bold text-forest-900 dark:text-ivory">Terms & Privacy</h1>
                </div>

                <div className="bg-white dark:bg-forest-800 rounded-2xl p-6 border border-forest-100 dark:border-forest-700 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div>
                        <h2 className="text-xl font-bold text-forest-900 dark:text-ivory mb-3">Terms of Service</h2>
                        <div className="space-y-3 text-forest-700 dark:text-forest-300 text-sm">
                            <p>
                                <strong>1. Acceptance of Terms</strong><br />
                                By accessing and using EcoBite, you accept and agree to be bound by the terms and
                                provision of this agreement.
                            </p>
                            <p>
                                <strong>2. Use License</strong><br />
                                Permission is granted to temporarily use EcoBite for personal, non-commercial transitory viewing only.
                            </p>
                            <p>
                                <strong>3. Food Safety</strong><br />
                                Donors are responsible for ensuring food safety and quality. EcoBite provides AI analysis
                                as a guide but does not guarantee food safety.
                            </p>
                            <p>
                                <strong>4. User Conduct</strong><br />
                                Users must not misuse the platform, provide false information, or engage in fraudulent activities.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-forest-900 dark:text-ivory mb-3">Privacy Policy</h2>
                        <div className="space-y-3 text-forest-700 dark:text-forest-300 text-sm">
                            <p>
                                <strong>Information We Collect</strong><br />
                                We collect information you provide directly (name, email, location) and automatically
                                (usage data, device information).
                            </p>
                            <p>
                                <strong>How We Use Your Information</strong><br />
                                • To provide and improve our services<br />
                                • To communicate with you<br />
                                • To analyze usage patterns<br />
                                • To prevent fraud and abuse
                            </p>
                            <p>
                                <strong>Data Security</strong><br />
                                We implement appropriate security measures to protect your personal information.
                                However, no method of transmission over the Internet is 100% secure.
                            </p>
                            <p>
                                <strong>Data Sharing</strong><br />
                                We do not sell your personal information. We may share data with service providers
                                who assist in operating our platform.
                            </p>
                            <p>
                                <strong>Your Rights</strong><br />
                                You have the right to access, correct, or delete your personal information.
                                Contact us at privacy@ecobite.com to exercise these rights.
                            </p>
                            <p>
                                <strong>Cookies</strong><br />
                                We use cookies to enhance user experience and analyze site traffic.
                                You can control cookies through your browser settings.
                            </p>
                        </div>
                    </div>

                    <div className="bg-forest-50 dark:bg-forest-700 p-4 rounded-xl">
                        <p className="text-sm text-forest-700 dark:text-forest-300">
                            <strong>Last Updated:</strong> November 2024<br />
                            <strong>Contact:</strong> legal@ecobite.com
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
