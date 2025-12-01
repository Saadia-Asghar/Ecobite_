import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HelpPage() {
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
                    <h1 className="text-2xl font-bold text-forest-900 dark:text-ivory">Help & Support</h1>
                </div>

                <div className="bg-white dark:bg-forest-800 rounded-2xl p-6 border border-forest-100 dark:border-forest-700 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-forest-900 dark:text-ivory mb-3">Frequently Asked Questions</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="border-b border-forest-100 dark:border-forest-700 pb-4">
                            <h3 className="font-bold text-forest-900 dark:text-ivory mb-2">How do I donate food?</h3>
                            <p className="text-forest-700 dark:text-forest-300 text-sm">
                                Click the "+ Donate Food" button, upload a photo of your food, fill in the details,
                                and submit. Our AI will analyze the food quality automatically.
                            </p>
                        </div>

                        <div className="border-b border-forest-100 dark:border-forest-700 pb-4">
                            <h3 className="font-bold text-forest-900 dark:text-ivory mb-2">How do I claim a donation?</h3>
                            <p className="text-forest-700 dark:text-forest-300 text-sm">
                                Browse available donations in the Stats tab, find one near you, and click "Claim Donation".
                                You'll receive the pickup details.
                            </p>
                        </div>

                        <div className="border-b border-forest-100 dark:border-forest-700 pb-4">
                            <h3 className="font-bold text-forest-900 dark:text-ivory mb-2">What are EcoPoints?</h3>
                            <p className="text-forest-700 dark:text-forest-300 text-sm">
                                EcoPoints are rewards you earn for donating food. Use them to unlock vouchers and
                                discounts at partner restaurants and shops.
                            </p>
                        </div>

                        <div className="border-b border-forest-100 dark:border-forest-700 pb-4">
                            <h3 className="font-bold text-forest-900 dark:text-ivory mb-2">How do vouchers work?</h3>
                            <p className="text-forest-700 dark:text-forest-300 text-sm">
                                Earn enough EcoPoints to unlock vouchers. Click "Use Now" to get your unique coupon code,
                                then show it at the partner location to redeem.
                            </p>
                        </div>

                        <div className="border-b border-forest-100 dark:border-forest-700 pb-4">
                            <h3 className="font-bold text-forest-900 dark:text-ivory mb-2">Can I claim packaging costs?</h3>
                            <p className="text-forest-700 dark:text-forest-300 text-sm">
                                Yes! When donating food, enter the number of packages and cost per package.
                                The amount will be reimbursed from the donation pool.
                            </p>
                        </div>

                        <div className="pb-4">
                            <h3 className="font-bold text-forest-900 dark:text-ivory mb-2">How do I donate money?</h3>
                            <p className="text-forest-700 dark:text-forest-300 text-sm">
                                Click "💰 Donate Money", select an amount, choose your payment method
                                (JazzCash, EasyPaisa, Card, or PayPal), and complete the transaction.
                            </p>
                        </div>
                    </div>

                    <div className="bg-forest-50 dark:bg-forest-700 p-4 rounded-xl">
                        <h3 className="font-bold text-forest-900 dark:text-ivory mb-2">Still need help?</h3>
                        <p className="text-forest-700 dark:text-forest-300 text-sm mb-3">
                            Contact our support team:
                        </p>
                        <p className="text-forest-700 dark:text-forest-300 text-sm">
                            📧 Email: support@ecobite.com<br />
                            📞 Phone: +92-300-1234567<br />
                            ⏰ Hours: 9 AM - 6 PM (Mon-Fri)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
