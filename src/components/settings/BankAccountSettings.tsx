import { useState, useEffect } from 'react';
import { CreditCard, Plus, Check, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';

interface BankAccount {
    id: string;
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    iban?: string;
    branchCode?: string;
    accountType: 'savings' | 'current' | 'business' | 'mobile_wallet' | 'digital_payment';
    isDefault: number;
    isVerified: number;
    status: string;
}

export default function BankAccountSettings() {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        iban: '',
        branchCode: '',
        accountType: 'savings' as 'savings' | 'current' | 'business' | 'mobile_wallet' | 'digital_payment',
        isDefault: true
    });

    useEffect(() => {
        if (user) {
            fetchAccounts();
        }
    }, [user]);

    const fetchAccounts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/bank-accounts/user/${user?.id}`);
            if (response.ok) {
                const data = await response.json();
                setAccounts(data);
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
            const url = editingAccount
                ? `${API_URL}/api/bank-accounts/${editingAccount.id}`
                : `${API_URL}/api/bank-accounts`;

            const response = await fetch(url, {
                method: editingAccount ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    userId: user?.id
                })
            });

            if (response.ok) {
                alert(editingAccount ? '✅ Account updated!' : '✅ Account added!');
                fetchAccounts();
                resetForm();
            } else {
                const error = await response.json();
                alert(`❌ ${error.error}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('❌ Failed to save account');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this account?')) return;

        try {
            const response = await fetch(`${API_URL}/api/bank-accounts/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('✅ Account deleted!');
                fetchAccounts();
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('❌ Failed to delete account');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/bank-accounts/${id}/set-default`, {
                method: 'POST'
            });

            if (response.ok) {
                alert('✅ Default account updated!');
                fetchAccounts();
            }
        } catch (error) {
            console.error('Set default error:', error);
            alert('❌ Failed to set default');
        }
    };

    const resetForm = () => {
        setFormData({
            accountHolderName: '',
            bankName: '',
            accountNumber: '',
            iban: '',
            branchCode: '',
            accountType: 'savings',
            isDefault: accounts.length === 0
        });
        setShowAddForm(false);
        setEditingAccount(null);
    };

    const startEdit = (account: BankAccount) => {
        setFormData({
            accountHolderName: account.accountHolderName,
            bankName: account.bankName,
            accountNumber: account.accountNumber,
            iban: account.iban || '',
            branchCode: account.branchCode || '',
            accountType: account.accountType,
            isDefault: account.isDefault === 1
        });
        setEditingAccount(account);
        setShowAddForm(true);
    };

    if (loading) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    return (
        <div className="space-y-4 p-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <CreditCard className="w-6 h-6" />
                            Bank Accounts
                        </h3>
                        <p className="text-white/90 text-sm mt-1">
                            Manage your bank accounts for receiving funds
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
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Bank / Payment Method *</label>
                            <select
                                required
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-700"
                            >
                                <option value="">Select Bank or Payment Method</option>

                                <optgroup label="🏦 Traditional Banks">
                                    <option value="HBL Bank">HBL Bank</option>
                                    <option value="UBL Bank">UBL Bank</option>
                                    <option value="MCB Bank">MCB Bank</option>
                                    <option value="Allied Bank">Allied Bank</option>
                                    <option value="Bank Alfalah">Bank Alfalah</option>
                                    <option value="Meezan Bank">Meezan Bank</option>
                                    <option value="Faysal Bank">Faysal Bank</option>
                                    <option value="Standard Chartered">Standard Chartered</option>
                                    <option value="Askari Bank">Askari Bank</option>
                                    <option value="Bank Al Habib">Bank Al Habib</option>
                                    <option value="Soneri Bank">Soneri Bank</option>
                                    <option value="Habib Metro Bank">Habib Metro Bank</option>
                                    <option value="Silk Bank">Silk Bank</option>
                                    <option value="Summit Bank">Summit Bank</option>
                                    <option value="JS Bank">JS Bank</option>
                                    <option value="Samba Bank">Samba Bank</option>
                                    <option value="National Bank">National Bank of Pakistan</option>
                                </optgroup>

                                <optgroup label="📱 Mobile Wallets">
                                    <option value="EasyPaisa">EasyPaisa</option>
                                    <option value="JazzCash">JazzCash</option>
                                    <option value="SadaPay">SadaPay</option>
                                    <option value="NayaPay">NayaPay</option>
                                    <option value="Upaisa">Upaisa</option>
                                    <option value="SimSim">SimSim</option>
                                </optgroup>

                                <optgroup label="🌐 Digital Payment Platforms">
                                    <option value="PayPal">PayPal</option>
                                    <option value="Payoneer">Payoneer</option>
                                    <option value="Skrill">Skrill</option>
                                    <option value="Wise">Wise (TransferWise)</option>
                                    <option value="Western Union">Western Union</option>
                                    <option value="MoneyGram">MoneyGram</option>
                                </optgroup>

                                <optgroup label="💳 Other">
                                    <option value="Other">Other (Specify in account number)</option>
                                </optgroup>
                            </select>
                            <p className="text-xs text-forest-500 dark:text-forest-400 mt-1">
                                Select your bank or mobile wallet provider
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Account Number / Wallet ID *</label>
                            <input
                                type="text"
                                required
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-700"
                                placeholder="1234567890 or 03001234567"
                            />
                            <p className="text-xs text-forest-500 dark:text-forest-400 mt-1">
                                For mobile wallets, enter your registered phone number
                            </p>
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
                            <p className="text-xs text-forest-500 dark:text-forest-400 mt-1">
                                Only for traditional bank accounts
                            </p>
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
                            <p className="text-xs text-forest-500 dark:text-forest-400 mt-1">
                                Only for traditional bank accounts
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Account Type *</label>
                            <select
                                value={formData.accountType}
                                onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                                className="w-full px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-700"
                            >
                                <option value="savings">Savings Account</option>
                                <option value="current">Current Account</option>
                                <option value="business">Business Account</option>
                                <option value="mobile_wallet">Mobile Wallet</option>
                                <option value="digital_payment">Digital Payment Platform</option>
                            </select>
                            <p className="text-xs text-forest-500 dark:text-forest-400 mt-1">
                                Select 'Mobile Wallet' for EasyPaisa, JazzCash, etc.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <label htmlFor="isDefault" className="text-sm">Set as default account</label>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
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
                            Add a bank account to receive approved fund requests
                        </p>
                    </div>
                ) : (
                    accounts.map((account) => (
                        <motion.div
                            key={account.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white dark:bg-forest-800 p-4 rounded-2xl border border-forest-100 dark:border-forest-700"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-bold text-forest-900 dark:text-ivory">
                                            {account.bankName}
                                        </h4>
                                        {account.isDefault === 1 && (
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
                                                Default
                                            </span>
                                        )}
                                        {account.isVerified === 1 && (
                                            <Check className="w-4 h-4 text-green-600" />
                                        )}
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
                                    {account.isDefault === 0 && (
                                        <button
                                            onClick={() => handleSetDefault(account.id)}
                                            className="p-2 hover:bg-forest-100 dark:hover:bg-forest-700 rounded-lg transition-colors"
                                            title="Set as default"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
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
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>💡 Note:</strong> When your money request is approved, funds will be transferred to your default bank account. Make sure your account details are correct!
                </p>
            </div>
        </div>
    );
}
