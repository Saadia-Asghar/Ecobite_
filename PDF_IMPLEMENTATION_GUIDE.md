# PDF Export Implementation - Remaining Tasks

## ✅ Completed
1. Created `src/utils/pdfExport.ts` with all export functions
2. Added PDF export to Users tab
3. Added PDF export to Donations tab
4. Added 'ecopoints' to activeTab type
5. Added 'ecopoints' to tabs navigation

## 🔄 In Progress - Add PDF Buttons to:

### Vouchers Tab
Location: Around line 550
Add button after the filter dropdown:
```tsx
<button 
    onClick={() => exportVouchersToPDF(
        vouchers.filter(v => voucherFilter === 'all' || v.status === voucherFilter),
        voucherFilter
    )}
    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-all flex items-center gap-2"
>
    <Download className="w-4 h-4" />PDF
</button>
```

### Finance Tab
Location: Around line 660
Add button in the header section:
```tsx
<button 
    onClick={() => exportTransactionsToPDF(
        transactions.filter(t => financeFilter === 'all' || t.type === financeFilter),
        financeFilter,
        balance
    )}
    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-all flex items-center gap-2"
>
    <Download className="w-4 h-4" />PDF
</button>
```

### Logs Tab
Location: Around line 760
Add button in the header:
```tsx
<button 
    onClick={() => exportLogsToPDF(adminLogs)}
    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-all flex items-center gap-2"
>
    <Download className="w-4 h-4" />PDF
</button>
```

### Analytics Tab
Add "Download Complete Report" button:
```tsx
<button 
    onClick={() => exportCompleteReportToPDF({
        users,
        donations,
        vouchers,
        transactions,
        balance,
        logs: adminLogs
    })}
    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2"
>
    <Download className="w-5 h-5" />Download Complete Report (PDF)
</button>
```

## 📊 New EcoPoints Tab Content
Add after Vouchers tab, before Finance tab:
```tsx
{/* EcoPoints Tab */}
{activeTab === 'ecopoints' && (
    <div className="space-y-6">
        {/* Header with PDF Button */}
        <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory flex items-center gap-2">
                        <Award className="w-7 h-7 text-amber-500" />
                        EcoPoints Leaderboard
                    </h2>
                    <p className="text-forest-600 dark:text-forest-400 mt-1">
                        Track and reward environmental contributions
                    </p>
                </div>
                <button 
                    onClick={() => exportEcoPointsToPDF(users)}
                    className="px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-all flex items-center gap-2"
                >
                    <Download className="w-5 h-5" />Export PDF
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-1">Total Points</p>
                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-300">
                        {users.reduce((sum, u) => sum + (u.ecoPoints || 0), 0).toLocaleString()}
                    </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-400 mb-1">Eco Starters</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-300">
                        {users.filter(u => u.ecoPoints >= 100).length}
                    </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Eco Warriors</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                        {users.filter(u => u.ecoPoints >= 500).length}
                    </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-700 dark:text-purple-400 mb-1">Eco Champions</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">
                        {users.filter(u => u.ecoPoints >= 1000).length}
                    </p>
                </div>
            </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white dark:bg-forest-800 rounded-2xl border border-forest-100 dark:border-forest-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-forest-50 dark:bg-forest-700">
                        <tr>
                            <th className="p-4 text-left text-sm font-bold">Rank</th>
                            <th className="p-4 text-left text-sm font-bold">User</th>
                            <th className="p-4 text-left text-sm font-bold">Role</th>
                            <th className="p-4 text-left text-sm font-bold">EcoPoints</th>
                            <th className="p-4 text-left text-sm font-bold">Badge</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-forest-100 dark:divide-forest-700">
                        {[...users].sort((a, b) => b.ecoPoints - a.ecoPoints).map((user, idx) => {
                            let badge = { emoji: '', name: '', color: '' };
                            if (user.ecoPoints >= 2000) badge = { emoji: '🏆', name: 'Eco Legend', color: 'text-amber-600' };
                            else if (user.ecoPoints >= 1000) badge = { emoji: '🌳', name: 'Eco Champion', color: 'text-purple-600' };
                            else if (user.ecoPoints >= 500) badge = { emoji: '🌿', name: 'Eco Warrior', color: 'text-blue-600' };
                            else if (user.ecoPoints >= 100) badge = { emoji: '🌱', name: 'Eco Starter', color: 'text-green-600' };
                            
                            return (
                                <tr key={user.id} className="hover:bg-forest-50 dark:hover:bg-forest-700/50">
                                    <td className="p-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                            idx === 0 ? 'bg-amber-500 text-white' :
                                            idx === 1 ? 'bg-gray-400 text-white' :
                                            idx === 2 ? 'bg-orange-600 text-white' :
                                            'bg-forest-200 dark:bg-forest-700 text-forest-700 dark:text-forest-300'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-bold text-forest-900 dark:text-ivory">{user.name}</p>
                                        <p className="text-xs text-forest-600 dark:text-forest-400">{user.email}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-forest-100 dark:bg-forest-700 rounded-full text-xs font-bold capitalize">
                                            {user.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-2xl font-bold text-mint">{user.ecoPoints.toLocaleString()}</p>
                                    </td>
                                    <td className="p-4">
                                        {badge.name && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{badge.emoji}</span>
                                                <span className={`font-bold ${badge.color}`}>{badge.name}</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
)}
```

## 📝 Notes
- All PDF exports use the same styling (red button with Download icon)
- Filters are passed to PDF functions to show what data was exported
- EcoPoints tab shows full leaderboard with badges
- Complete report button in Analytics tab exports everything
