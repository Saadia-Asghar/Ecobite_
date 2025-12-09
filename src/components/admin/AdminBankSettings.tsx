import { useState, useEffect } from 'react';
import { CreditCard, Plus, Check, Edit2, Trash2, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminBankAccount {
    id: string;
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    iban?: string;
    branchCode?: string;
    accountType: 'savings' | 'current' | 'business';
    purpose: string; // 'donations' | 'operations'
    isActive: number;
}

export default function AdminBankSettings() {
    const [accounts, setAccounts] = useState<AdminBankAccount[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState<AdminBankAccount | null>(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        accountHolderName: 'EcoBite Foundation',
        bankName: '',
        accountNumber: '',
        iban: '',
        branchCode: '',
        accountType: 'business' as 'savings' | 'current' | 'business',
        purpose: 'donations'
    });

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            // For now, use localStorage to store admin bank accounts
            const stored = localStorage.getItem('adminBankAccounts');
            if (stored) {
                setAccounts(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const newAccount: AdminBankAccount = {
                id: editingAccount?.id || `admin-bank-${Date.now()}`,
                ...formData,
                isActive: 1
            };

            let updatedAccounts;
            if (editingAccount) {
                updatedAccounts = accounts.map(acc =>
                    acc.id === editingAccount.id ? newAccount : acc
                );
            } else {
                updatedAccounts = [...accounts, newAccount];
            }

            localStorage.setItem('adminBankAccounts', JSON.stringify(updatedAccounts));
            setAccounts(updatedAccounts);
            alert(editingAccount ? '✅ Account updated!' : '✅ Account added!');
            resetForm();
        } catch (error) {
            console.error('Submit error:', error);
            alert('❌ Failed to save account');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this account?')) return;

        try {
            const updatedAccounts = accounts.filter(acc => acc.id !== id);
            localStorage.setItem('adminBankAccounts', JSON.stringify(updatedAccounts));
            setAccounts(updatedAccounts);
            alert('✅ Account deleted!');
        } catch (error) {
            console.error('Delete error:', error);
            alert('❌ Failed to delete account');
        }
    };

    const toggleActive = (id: string) => {
        const updatedAccounts = accounts.map(acc =>
            acc.id === id ? { ...acc, isActive: acc.isActive === 1 ? 0 : 1 } : acc
        );
        localStorage.setItem('adminBankAccounts', JSON.stringify(updatedAccounts));
        setAccounts(updatedAccounts);
    };

    const resetForm = () => {
        setFormData({
            accountHolderName: 'EcoBite Foundation',
            bankName: '',
            accountNumber: '',
            iban: '',
            branchCode: '',
            accountType: 'business',
            purpose: 'donations'
        });
        setShowAddForm(false);
        setEditingAccount(null);
    };

    const startEdit = (account: AdminBankAccount) => {
        setFormData({
            accountHolderName: account.accountHolderName,
            bankName: account.bankName,
            accountNumber: account.accountNumber,
            iban: account.iban || '',
            branchCode: account.branchCode || '',
            accountType: account.accountType,
            purpose: account.purpose
        });
        setEditingAccount(account);
        setShowAddForm(true);
    };

    const activeDonationAccount = accounts.find(acc => acc.purpose === 'donations' && acc.isActive === 1);

    if (loading) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    return (
        <div className="space-y-4 p-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Building2 className="w-6 h-6" />
                            Admin Bank Accounts
                        </h3>
                        <p className="text-white/90 text-sm mt-1">
                            Manage organization bank accounts for receiving donations
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl font-bold transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Account
                    </button>
                </div>
            </div>

            {/* Active Donation Account Info */}
            {activeDonationAccount && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-300 mb-2">
                        <strong>✅ Active Donation Account:</strong>
                    </p>
                    <p className="text-sm font-mono text-green-900 dark:text-green-200">
                        {activeDonationAccount.bankName} - {activeDonationAccount.accountNumber}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                        This account will be shown to donors on the donation page
                    </p>
                </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700"
                >
                    <h4 className="font-bold text-lg mb-4">
                        {editingAccount ? 'Edit Account' : 'Add New Account'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Account Holder Name</label>
                            <input
                                type="text"
                                required
                                value={formData.accountHolderName}
                                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-700"
                                placeholder="EcoBite Foundation"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Bank Name</label>
                            <input
                                type="text"
                                required
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-700"
                                placeholder="HBL, UBL, MCB, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Account Number</label>
                            <input
                                type="text"
                                required
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-700"
                                placeholder="1234567890"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">IBAN (Optional)</label>
                            <input
                                type="text"
                                value={formData.iban}
                                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-700"
                                placeholder="PK36SCBL0000001123456702"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Branch Code (Optional)</label>
                            <input
                                type="text"
                                value={formData.branchCode}
                                onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-700"
                                placeholder="0123"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Account Type</label>
                            <select
                                value={formData.accountType}
                                onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                                className="w-full px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-700"
                            >
                                <option value="savings">Savings</option>
                                <option value="current">Current</option>
                                <option value="business">Business</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Purpose</label>
                            <select
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-700"
                            >
                                <option value="donations">Receive Donations</option>
                                <option value="operations">Operations</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
                            >
                                {editingAccount ? 'Update Account' : 'Add Account'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Accounts List */}
            <div className="space-y-3">
                {accounts.length === 0 ? (
                    <div className="bg-white dark:bg-forest-800 p-8 rounded-2xl text-center border border-forest-100 dark:border-forest-700">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">No bank accounts added yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Add a bank account to receive donations
                        </p>
                    </div>
                ) : (
                    accounts.map((account) => (
                        <motion.div
                            key={account.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`bg-white dark:bg-forest-800 p-4 rounded-2xl border ${account.isActive === 1
                                    ? 'border-green-300 dark:border-green-700'
                                    : 'border-forest-100 dark:border-forest-700'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-bold text-forest-900 dark:text-ivory">
                                            {account.bankName}
                                        </h4>
                                        {account.isActive === 1 && (
                                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                                                Active
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-full capitalize">
                                            {account.purpose}
                                        </span>
                                    </div>
                                    <p className="text-sm text-forest-600 dark:text-forest-300">
                                        {account.accountHolderName}
                                    </p>
                                    <p className="text-sm text-forest-500 dark:text-forest-400 font-mono">
                                        {account.accountNumber}
                                    </p>
                                    {account.iban && (
                                        <p className="text-xs text-forest-400 dark:text-forest-500 font-mono mt-1">
                                            IBAN: {account.iban}
                                        </p>
                                    )}
                                    <p className="text-xs text-forest-400 dark:text-forest-500 mt-1 capitalize">
                                        {account.accountType} Account
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleActive(account.id)}
                                        className={`p-2 rounded-lg transition-colors ${account.isActive === 1
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700'
                                                : 'hover:bg-forest-100 dark:hover:bg-forest-700'
                                            }`}
                                        title={account.isActive === 1 ? 'Deactivate' : 'Activate'}
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => startEdit(account)}
                                        className="p-2 hover:bg-forest-100 dark:hover:bg-forest-700 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(account.id)}
                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Info Box */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                    <strong>💡 Note:</strong> The active "Donations" account will be automatically displayed on the donation page for users to transfer money. You can update it anytime and it will reflect immediately.
                </p>
            </div>
        </div>
    );
}

// Export function to get active donation account
export function getActiveDonationAccount(): AdminBankAccount | null {
    try {
        const stored = localStorage.getItem('adminBankAccounts');
        if (stored) {
            const accounts: AdminBankAccount[] = JSON.parse(stored);
            return accounts.find(acc => acc.purpose === 'donations' && acc.isActive === 1) || null;
        }
    } catch (error) {
        console.error('Failed to get donation account:', error);
    }
    return null;
}
