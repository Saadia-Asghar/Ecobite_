import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, LogOut, Award, Download, Trash2, DollarSign, Plus, Pause, Play, Eye, X, Pencil, FileText, MapPin, Settings, Megaphone, ExternalLink, Check, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import {
    exportUsersToPDF,
    exportDonationsToPDF,
    exportVouchersToPDF,
    exportTransactionsToPDF,
    exportLogsToPDF,
    exportEcoPointsToPDF,
    exportCompleteReportToPDF
} from '../../utils/pdfExport';
import {
    exportUsersToCSV,
    exportDonationsToCSV,
    exportVouchersToCSV,
    exportTransactionsToCSV,
    exportEcoPointsToCSV
} from '../../utils/csvExport';

import {
    MOCK_USERS, MOCK_VOUCHERS, MOCK_DONATIONS, MOCK_TRANSACTIONS,
    MOCK_LOGS, MOCK_BALANCE, MOCK_FINANCIAL_SUMMARY,
    User, Voucher, SponsorBanner, mockBanners, Badge, mockBadges
} from '../../data/mockData';
import NotificationsPanel from '../dashboard/NotificationsPanel';
import MoneyRequestsManagement from '../admin/MoneyRequestsManagement';

export default function AdminDashboard() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const axisStroke = theme === 'dark' ? '#E1EFE6' : '#1A4D2E';
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'donations' | 'money-requests' | 'vouchers' | 'finance' | 'analytics' | 'logs' | 'ecopoints' | 'settings' | 'sponsors'>('overview');
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUserDetails, setShowUserDetails] = useState(false);

    // Data states
    const [stats, setStats] = useState({ users: 0, donations: 0, points: 0, completed: 0 });
    const [users, setUsers] = useState<User[]>([]);
    const [donations, setDonations] = useState<any[]>([]);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [balance, setBalance] = useState<any>({ totalBalance: 0, totalDonations: 0, totalWithdrawals: 0 });
    const [financialSummary, setFinancialSummary] = useState<any>(null);

    // UI states
    const [userFilter, setUserFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [donationFilter, setDonationFilter] = useState('all');
    const [voucherFilter, setVoucherFilter] = useState('all');
    const [financeFilter, setFinanceFilter] = useState('all');
    const [adminLogs, setAdminLogs] = useState<any[]>([]);
    const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
    const [voucherRedemptions, setVoucherRedemptions] = useState<any[]>([]);
    const [showRedemptions, setShowRedemptions] = useState(false);
    const [userBankAccounts, setUserBankAccounts] = useState<any[]>([]);

    // Voucher form
    const [showVoucherForm, setShowVoucherForm] = useState(false);
    const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
    const [voucherForm, setVoucherForm] = useState({
        code: '', title: '', description: '', discountType: 'percentage',
        discountValue: 0, minEcoPoints: 0, maxRedemptions: 100, expiryDate: ''
    });

    // Finance form
    const [showFinanceForm, setShowFinanceForm] = useState(false);
    const [financeType, setFinanceType] = useState<'donation' | 'withdrawal'>('donation');
    const [financeForm, setFinanceForm] = useState({
        amount: 0, userId: '', category: 'general', description: ''
    });

    // Sponsors
    const [banners, setBanners] = useState<SponsorBanner[]>(mockBanners);
    const [redemptionRequests, setRedemptionRequests] = useState<any[]>([]);
    const [showBannerForm, setShowBannerForm] = useState(false);
    const [bannerFormData, setBannerFormData] = useState<Partial<SponsorBanner>>({
        name: '',
        type: 'custom',
        active: false,
        placement: 'dashboard',
        backgroundColor: 'from-blue-50 to-blue-100',
        content: '',
        description: '',
        link: '',
        logoUrl: '',
        imageUrl: '',
        targetDashboards: ['all'],
        campaignName: '',
        awardType: 'sponsored',
        status: 'draft',
        startDate: '',
        endDate: ''
    });

    // Banner filters
    const [bannerUserFilter, setBannerUserFilter] = useState('all'); // all, specific userId
    const [bannerStatusFilter, setBannerStatusFilter] = useState('all'); // all, active, paused, scheduled, expired
    const [bannerCampaignFilter, setBannerCampaignFilter] = useState('all'); // all, specific campaign

    // Badge statistics modal
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [selectedBadge, setSelectedBadge] = useState<{ name: string, threshold: number, emoji: string } | null>(null);
    const [badgeTimeFilter, setBadgeTimeFilter] = useState<'week' | 'month' | 'year' | 'all'>('all');

    // Badge management
    const [badges, setBadges] = useState<Badge[]>(mockBadges);
    const [showBadgeForm, setShowBadgeForm] = useState(false);
    const [badgeFormData, setBadgeFormData] = useState<Partial<Badge>>({
        name: '',
        emoji: '',
        threshold: 100,
        color: 'blue',
        active: true
    });

    // Settings
    const [deliveryCostPerKm, setDeliveryCostPerKm] = useState<number>(100);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        const storedCost = localStorage.getItem('ECOBITE_SETTINGS_DELIVERY_COST');
        if (storedCost) {
            setDeliveryCostPerKm(Number(storedCost));
        }
    }, []);

    const saveSettings = () => {
        localStorage.setItem('ECOBITE_SETTINGS_DELIVERY_COST', String(deliveryCostPerKm));
        setSaveMessage('✅ Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
        // Ideally, we would also log this action
        logAction('UPDATE_SETTINGS', 'system', `Updated delivery cost to PKR ${deliveryCostPerKm}/km`);
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [usersRes, donationsRes, vouchersRes, transactionsRes, balanceRes, summaryRes, logsRes] = await Promise.all([
                fetch('http://localhost:3002/api/users'),
                fetch('http://localhost:3002/api/donations'),
                fetch('http://localhost:3002/api/vouchers'),
                fetch('http://localhost:3002/api/finance'),
                fetch('http://localhost:3002/api/finance/balance'),
                fetch('http://localhost:3002/api/finance/summary?period=month'),
                fetch('http://localhost:3002/api/admin/logs')
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            else setUsers(MOCK_USERS);

            if (donationsRes.ok) {
                const donationsData = await donationsRes.json();
                setDonations(donationsData);
                setStats(prev => ({
                    ...prev,
                    donations: donationsData.length,
                    completed: donationsData.filter((d: any) => d.status === 'Completed').length
                }));
            } else {
                setDonations(MOCK_DONATIONS);
                setStats(prev => ({
                    ...prev,
                    donations: MOCK_DONATIONS.length,
                    completed: MOCK_DONATIONS.filter(d => d.status === 'Completed').length
                }));
            }

            if (vouchersRes.ok) setVouchers(await vouchersRes.json());
            else setVouchers(MOCK_VOUCHERS);

            if (transactionsRes.ok) setTransactions(await transactionsRes.json());
            else setTransactions(MOCK_TRANSACTIONS);

            if (balanceRes.ok) setBalance(await balanceRes.json());
            else setBalance(MOCK_BALANCE);

            if (summaryRes.ok) setFinancialSummary(await summaryRes.json());
            else setFinancialSummary(MOCK_FINANCIAL_SUMMARY);

            if (logsRes.ok) setAdminLogs(await logsRes.json());
            else setAdminLogs(MOCK_LOGS);

            const usersData = usersRes.ok ? await usersRes.json() : MOCK_USERS;
            setStats(prev => ({
                ...prev,
                users: usersData.length,
                points: usersData.reduce((acc: number, u: any) => acc + (u.ecoPoints || 0), 0)
            }));

        } catch (error) {
            console.error('Failed to fetch data, using mocks');
            setUsers(MOCK_USERS);
            setDonations(MOCK_DONATIONS);
            setVouchers(MOCK_VOUCHERS);
            setTransactions(MOCK_TRANSACTIONS);
            setBalance(MOCK_BALANCE);
            setFinancialSummary(MOCK_FINANCIAL_SUMMARY);
            setAdminLogs(MOCK_LOGS);

            setStats({
                users: MOCK_USERS.length,
                donations: MOCK_DONATIONS.length,
                points: MOCK_USERS.reduce((acc, u) => acc + (u.ecoPoints || 0), 0),
                completed: MOCK_DONATIONS.filter(d => d.status === 'Completed').length
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchBanners = async () => {
        try {
            const response = await fetch('http://localhost:3002/api/banners');
            if (response.ok) {
                const data = await response.json();
                setBanners(data);
            } else {
                setBanners(mockBanners);
            }
        } catch (error) {
            console.error('Failed to fetch banners:', error);
            setBanners(mockBanners);
        }
    };

    const fetchRedemptionRequests = async () => {
        try {
            const response = await fetch('http://localhost:3002/api/ad-redemptions');
            if (response.ok) {
                const data = await response.json();
                setRedemptionRequests(data);
            }
        } catch (error) {
            console.error('Failed to fetch redemption requests:', error);
        }
    };

    const handleSaveBanner = async () => {
        try {
            const url = bannerFormData.id
                ? `http://localhost:3002/api/banners/${bannerFormData.id}`
                : 'http://localhost:3002/api/banners';

            const method = bannerFormData.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bannerFormData)
            });

            if (response.ok) {
                await fetchBanners();
                setShowBannerForm(false);
                setBannerFormData({
                    name: '', type: 'custom', active: false, placement: 'dashboard',
                    backgroundColor: 'from-blue-50 to-blue-100', content: '', description: '', link: '', logoUrl: '', imageUrl: '',
                    targetDashboards: ['all'], campaignName: '', awardType: 'sponsored', status: 'draft', startDate: '', endDate: ''
                });
                alert('✅ Banner saved successfully!');
            } else {
                alert('❌ Failed to save banner');
            }
        } catch (error) {
            console.error('Error saving banner:', error);
            // Fallback to mock data
            if (bannerFormData.id) {
                setBanners(banners.map(b => b.id === bannerFormData.id ? { ...b, ...bannerFormData as SponsorBanner } : b));
            } else {
                const newBanner: SponsorBanner = {
                    id: `banner-${Date.now()}`,
                    name: bannerFormData.name || '',
                    type: bannerFormData.type || 'custom',
                    active: bannerFormData.active !== false,
                    placement: bannerFormData.placement || 'dashboard',
                    backgroundColor: bannerFormData.backgroundColor || 'from-blue-50 to-blue-100',
                    content: bannerFormData.content || '',
                    description: bannerFormData.description || '',
                    link: bannerFormData.link || '',
                    logoUrl: bannerFormData.logoUrl,
                    imageUrl: bannerFormData.imageUrl,
                    impressions: 0,
                    clicks: 0,
                    targetDashboards: bannerFormData.targetDashboards || ['all'],
                    campaignName: bannerFormData.campaignName,
                    awardType: bannerFormData.awardType || 'sponsored',
                    status: bannerFormData.status || 'draft',
                    startDate: bannerFormData.startDate,
                    endDate: bannerFormData.endDate
                };
                setBanners([...banners, newBanner]);
            }
            setShowBannerForm(false);
            setBannerFormData({
                name: '', type: 'custom', active: false, placement: 'dashboard',
                backgroundColor: 'from-blue-50 to-blue-100', content: '', description: '', link: '', logoUrl: '', imageUrl: '',
                targetDashboards: ['all'], campaignName: '', awardType: 'sponsored', status: 'draft', startDate: '', endDate: ''
            });
            alert('✅ Banner saved successfully (offline mode)!');
        }
    };

    const handleDeleteBanner = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            const response = await fetch(`http://localhost:3002/api/banners/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await fetchBanners();
                alert('✅ Banner deleted successfully!');
            } else {
                alert('❌ Failed to delete banner');
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
            // Fallback to mock data
            setBanners(banners.filter(b => b.id !== id));
            alert('✅ Banner deleted successfully (offline mode)!');
        }
    };

    const handleToggleBannerStatus = async (id: string) => {
        try {
            const banner = banners.find(b => b.id === id);
            if (!banner) return;

            const response = await fetch(`http://localhost:3002/api/banners/${id}/toggle`, {
                method: 'PUT'
            });

            if (response.ok) {
                await fetchBanners();
            } else {
                // Fallback to mock data update
                setBanners(banners.map(b => b.id === id ? { ...b, active: !b.active } : b));
            }
        } catch (error) {
            console.error('Error toggling banner:', error);
            // Fallback to mock data update
            setBanners(banners.map(b => b.id === id ? { ...b, active: !b.active } : b));
        }
    };

    const handleApproveRedemption = async (redemption: any) => {
        try {
            // Create banner from redemption data
            const bannerData = JSON.parse(redemption.bannerData || '{}');
            const createResponse = await fetch('http://localhost:3002/api/banners', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...bannerData,
                    name: bannerData.name || redemption.userName,
                    link: bannerData.link || '#',
                    active: true,
                    durationMinutes: redemption.durationMinutes,
                    ownerId: redemption.userId
                })
            });

            if (!createResponse.ok) {
                alert('❌ Failed to create banner');
                return;
            }

            const banner = await createResponse.json();

            // Approve redemption
            const approveResponse = await fetch(`http://localhost:3002/api/ad-redemptions/${redemption.id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bannerId: banner.id })
            });

            if (approveResponse.ok) {
                await fetchRedemptionRequests();
                await fetchBanners();
                alert('✅ Redemption approved and banner activated!');
            } else {
                alert('❌ Failed to approve redemption');
            }
        } catch (error) {
            console.error('Error approving redemption:', error);
            alert('❌ Failed to approve redemption');
        }
    };

    const handleRejectRedemption = async (redemption: any) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            const response = await fetch(`http://localhost:3002/api/ad-redemptions/${redemption.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                await fetchRedemptionRequests();
                alert('✅ Redemption rejected and points refunded!');
            } else {
                alert('❌ Failed to reject redemption');
            }
        } catch (error) {
            console.error('Error rejecting redemption:', error);
            alert('❌ Failed to reject redemption');
        }
    };

    // Badge Management Functions
    const handleSaveBadge = () => {
        if (!badgeFormData.name || !badgeFormData.emoji || !badgeFormData.threshold) {
            alert('Please fill in all required fields');
            return;
        }

        if (badgeFormData.id) {
            // Edit existing badge
            setBadges(badges.map(b => b.id === badgeFormData.id ? { ...b, ...badgeFormData as Badge } : b));
            alert('✅ Badge updated successfully!');
        } else {
            // Create new badge
            const newBadge: Badge = {
                id: `badge-${Date.now()}`,
                name: badgeFormData.name,
                emoji: badgeFormData.emoji,
                threshold: badgeFormData.threshold || 100,
                color: badgeFormData.color || 'blue',
                active: badgeFormData.active !== false,
                createdAt: new Date().toISOString()
            };
            setBadges([...badges, newBadge]);
            alert('✅ Badge created successfully!');
        }

        setShowBadgeForm(false);
        setBadgeFormData({ name: '', emoji: '', threshold: 100, color: 'blue', active: true });
    };

    const handleDeleteBadge = (id: string) => {
        if (confirm('Are you sure you want to delete this badge?')) {
            setBadges(badges.filter(b => b.id !== id));
            alert('✅ Badge deleted successfully!');
        }
    };

    const handleToggleBadge = (id: string) => {
        setBadges(badges.map(b => b.id === id ? { ...b, active: !b.active } : b));
    };

    const logAction = async (action: string, targetId: string, details: string) => {
        const newLog = {
            id: `l${Date.now()}`,
            adminId: 'admin-1',
            action,
            targetId,
            details,
            createdAt: new Date().toISOString()
        };

        try {
            await fetch('http://localhost:3002/api/admin/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId: 'admin-1', action, targetId, details })
            });
            const res = await fetch('http://localhost:3002/api/admin/logs');
            if (res.ok) setAdminLogs(await res.json());
            else setAdminLogs(prev => [newLog, ...prev]);
        } catch (error) {
            console.error('Failed to log action, using mock');
            setAdminLogs(prev => [newLog, ...prev]);
        }
    };

    const fetchVoucherRedemptions = async (voucherId: string) => {
        try {
            const res = await fetch(`http://localhost:3002/api/vouchers/${voucherId}/performance`);
            if (!res.ok) throw new Error('Failed to fetch redemptions');

            const data = await res.json();
            setVoucherRedemptions(data.redemptions);
            setSelectedVoucher(data.voucher);
            setShowRedemptions(true);
        } catch (error) {
            // Mock redemptions
            setVoucherRedemptions([
                { id: 'r1', name: 'Ali Khan', email: 'ali@example.com', redeemedAt: '2024-11-15' },
                { id: 'r2', name: 'Sara Ahmed', email: 'sara@example.com', redeemedAt: '2024-11-20' }
            ]);
            setSelectedVoucher(vouchers.find(v => v.id === voucherId));
            setShowRedemptions(true);
        }
    };

    const deleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Delete "${userName}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`http://localhost:3002/api/users/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                await logAction('DELETE_USER', userId, `Deleted user: ${userName}`);
                await fetchAllData();
                alert('✅ User deleted!');
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            // Mock delete
            setUsers(prev => prev.filter(u => u.id !== userId));
            await logAction('DELETE_USER', userId, `Deleted user: ${userName} (Mock)`);
            alert('✅ User deleted (Mock)!');
        }
    };

    const deleteVoucher = async (voucherId: string, voucherTitle: string) => {
        if (!confirm(`Delete voucher "${voucherTitle}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(`http://localhost:3002/api/vouchers/${voucherId}`, { method: 'DELETE' });
            if (res.ok) {
                await logAction('DELETE_VOUCHER', voucherId, `Deleted voucher: ${voucherTitle}`);
                await fetchAllData();
                alert('✅ Voucher deleted!');
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            // Mock delete
            setVouchers(prev => prev.filter(v => v.id !== voucherId));
            await logAction('DELETE_VOUCHER', voucherId, `Deleted voucher: ${voucherTitle} (Mock)`);
            alert('✅ Voucher deleted (Mock)!');
        }
    };

    const handleEditVoucher = (voucher: Voucher) => {
        setEditingVoucherId(voucher.id);
        setVoucherForm({
            code: voucher.code,
            title: voucher.title,
            description: voucher.description || '',
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            minEcoPoints: voucher.minEcoPoints,
            maxRedemptions: voucher.maxRedemptions,
            expiryDate: voucher.expiryDate.split('T')[0]
        });
        setShowVoucherForm(true);
    };

    const handleSaveVoucher = async () => {
        if (editingVoucherId) {
            // Update existing voucher
            try {
                const res = await fetch(`http://localhost:3002/api/vouchers/${editingVoucherId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(voucherForm)
                });

                if (!res.ok) throw new Error('Failed to update');

                await logAction('UPDATE_VOUCHER', editingVoucherId, `Updated voucher: ${voucherForm.title}`);
                await fetchAllData();
                setShowVoucherForm(false);
                setEditingVoucherId(null);
                setVoucherForm({ code: '', title: '', description: '', discountType: 'percentage', discountValue: 0, minEcoPoints: 0, maxRedemptions: 100, expiryDate: '' });
                alert('✅ Voucher updated!');
            } catch (error) {
                // Mock update
                setVouchers(prev => prev.map(v => v.id === editingVoucherId ? { ...v, ...voucherForm, discountType: voucherForm.discountType as 'percentage' | 'fixed' } : v));
                await logAction('UPDATE_VOUCHER', editingVoucherId, `Updated voucher: ${voucherForm.title} (Mock)`);
                setShowVoucherForm(false);
                setEditingVoucherId(null);
                setVoucherForm({ code: '', title: '', description: '', discountType: 'percentage', discountValue: 0, minEcoPoints: 0, maxRedemptions: 100, expiryDate: '' });
                alert('✅ Voucher updated (Mock)!');
            }
        } else {
            // Create new voucher
            try {
                const res = await fetch('http://localhost:3002/api/vouchers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(voucherForm)
                });
                if (res.ok) {
                    const data = await res.json();
                    await logAction('CREATE_VOUCHER', data.id, `Created voucher: ${voucherForm.title}`);
                    await fetchAllData();
                    setShowVoucherForm(false);
                    setVoucherForm({ code: '', title: '', description: '', discountType: 'percentage', discountValue: 0, minEcoPoints: 0, maxRedemptions: 100, expiryDate: '' });
                    alert('✅ Voucher created!');
                } else {
                    throw new Error('Failed');
                }
            } catch (error) {
                // Mock create
                const newVoucher: Voucher = {
                    id: `v${Date.now()}`,
                    ...voucherForm,
                    currentRedemptions: 0,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    discountType: voucherForm.discountType as 'percentage' | 'fixed',
                    expiryDate: voucherForm.expiryDate || new Date(Date.now() + 86400000 * 30).toISOString()
                };
                setVouchers(prev => [newVoucher, ...prev]);
                await logAction('CREATE_VOUCHER', newVoucher.id, `Created voucher: ${voucherForm.title} (Mock)`);
                setShowVoucherForm(false);
                setVoucherForm({ code: '', title: '', description: '', discountType: 'percentage', discountValue: 0, minEcoPoints: 0, maxRedemptions: 100, expiryDate: '' });
                alert('✅ Voucher created (Mock)!');
            }
        }
    };

    const toggleVoucherStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';

        // Optimistic update
        setVouchers(prev => prev.map(v => v.id === id ? { ...v, status: newStatus as any } : v));

        try {
            const res = await fetch(`http://localhost:3002/api/vouchers/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                // If failed, but we want to keep the optimistic update for mock/demo purposes if backend is down
                // throw new Error('Failed to update status');
                console.warn('Backend update failed, keeping local state');
            }

            await logAction('UPDATE_VOUCHER', id, `Changed status to: ${newStatus}`);
        } catch (error) {
            console.error('Update failed', error);
            // If we wanted to revert on error, we would do it here. 
            // But since we want to support "mock" mode when backend is down, we keep the change.
            await logAction('UPDATE_VOUCHER', id, `Changed status to: ${newStatus} (Mock)`);
        }
    };

    const recordTransaction = async () => {
        try {
            const endpoint = financeType === 'donation' ? '/api/finance/donation' : '/api/finance/withdrawal';
            const res = await fetch(`http://localhost:3002${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(financeForm)
            });
            if (res.ok) {
                const data = await res.json();
                await logAction('RECORD_TRANSACTION', data.id, `Recorded ${financeType}: $${financeForm.amount}`);
                await fetchAllData();
                setShowFinanceForm(false);
                setFinanceForm({ amount: 0, userId: '', category: 'general', description: '' });
                alert('✅ Transaction recorded!');
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            // Mock transaction
            const newTransaction = {
                id: `t${Date.now()}`,
                type: financeType,
                ...financeForm,
                createdAt: new Date().toISOString()
            };
            setTransactions(prev => [newTransaction, ...prev]);
            // Update balance mock
            setBalance((prev: any) => ({
                ...prev,
                totalBalance: financeType === 'donation' ? prev.totalBalance + financeForm.amount : prev.totalBalance - financeForm.amount,
                totalDonations: financeType === 'donation' ? prev.totalDonations + financeForm.amount : prev.totalDonations,
                totalWithdrawals: financeType === 'withdrawal' ? prev.totalWithdrawals + financeForm.amount : prev.totalWithdrawals
            }));

            await logAction('RECORD_TRANSACTION', newTransaction.id, `Recorded ${financeType}: $${financeForm.amount} (Mock)`);
            setShowFinanceForm(false);
            setFinanceForm({ amount: 0, userId: '', category: 'general', description: '' });
            alert('✅ Transaction recorded (Mock)!');
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    // Fetch banners and redemption requests
    React.useEffect(() => {
        if (activeTab === 'sponsors') {
            fetchBanners();
            fetchRedemptionRequests();
        }
    }, [activeTab]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen bg-ivory dark:bg-forest-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-900 dark:border-ivory"></div></div>;
    }

    return (
        <div className="min-h-screen bg-ivory dark:bg-forest-950">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 dark:from-forest-950 dark:via-forest-900 dark:to-forest-950 text-ivory p-6 shadow-2xl">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <Award className="w-8 h-8 text-mint" />
                            <div>
                                <h1 className="text-3xl font-bold">Admin Control Center</h1>
                                <p className="text-sm text-forest-300">Complete System Management</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="bg-white/20 rounded-full p-1 relative z-[100]">
                                <NotificationsPanel />
                            </div>
                            <button onClick={toggleTheme} className="p-2 hover:bg-forest-800 rounded-xl">{theme === 'dark' ? '☀️' : '🌙'}</button>
                            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-xl"><LogOut className="w-4 h-4" />Logout</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="bg-white/10 backdrop-blur p-3 rounded-xl"><p className="text-xs mb-1">Users</p><p className="text-2xl font-bold">{stats.users}</p></div>
                        <div className="bg-white/10 backdrop-blur p-3 rounded-xl"><p className="text-xs mb-1">Donations</p><p className="text-2xl font-bold">{stats.donations}</p></div>
                        <div className="bg-white/10 backdrop-blur p-3 rounded-xl"><p className="text-xs mb-1">Vouchers</p><p className="text-2xl font-bold">{vouchers.length}</p></div>
                        <div className="bg-white/10 backdrop-blur p-3 rounded-xl"><p className="text-xs mb-1">Balance</p><p className="text-2xl font-bold">${balance.totalBalance?.toFixed(0)}</p></div>
                        <div className="bg-white/10 backdrop-blur p-3 rounded-xl"><p className="text-xs mb-1">EcoPoints</p><p className="text-2xl font-bold">{stats.points}</p></div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4">
                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {(['overview', 'users', 'donations', 'money-requests', 'vouchers', 'sponsors', 'finance', 'ecopoints', 'analytics', 'logs', 'settings'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl font-bold capitalize whitespace-nowrap ${activeTab === tab ? 'bg-forest-900 text-ivory dark:bg-mint dark:text-forest-900' : 'bg-white dark:bg-forest-800 text-forest-600 dark:text-forest-300'}`}>
                            {tab === 'money-requests' ? 'Money Requests' : tab}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <Users className="w-8 h-8 text-blue-600 mb-2" />
                                <p className="text-3xl font-bold text-forest-900 dark:text-ivory">{stats.users}</p>
                                <p className="text-sm text-forest-600 dark:text-forest-300">Total Users</p>
                            </div>
                            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <Package className="w-8 h-8 text-green-600 mb-2" />
                                <p className="text-3xl font-bold text-forest-900 dark:text-ivory">{stats.donations}</p>
                                <p className="text-sm text-forest-600 dark:text-forest-300">Donations</p>
                            </div>
                            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <DollarSign className="w-8 h-8 text-purple-600 mb-2" />
                                <p className="text-3xl font-bold text-forest-900 dark:text-ivory">${balance.totalBalance?.toFixed(2)}</p>
                                <p className="text-sm text-forest-600 dark:text-forest-300">Fund Balance</p>
                            </div>
                            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <Award className="w-8 h-8 text-amber-600 mb-2" />
                                <p className="text-3xl font-bold text-forest-900 dark:text-ivory">{stats.points}</p>
                                <p className="text-sm text-forest-600 dark:text-forest-300">Total EcoPoints</p>
                            </div>
                        </div>

                        {/* EcoPoints & Badges Tracker */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* EcoPoints Distribution */}
                            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <h3 className="text-lg font-bold text-forest-900 dark:text-ivory mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-mint" />
                                    EcoPoints Distribution
                                </h3>
                                <div className="space-y-3">
                                    {users.slice(0, 5).sort((a, b) => b.ecoPoints - a.ecoPoints).map((user, idx) => (
                                        <div key={user.id} className="flex items-center justify-between p-3 bg-forest-50 dark:bg-forest-700 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-500 text-white' :
                                                    idx === 1 ? 'bg-gray-400 text-white' :
                                                        idx === 2 ? 'bg-orange-600 text-white' :
                                                            'bg-forest-200 dark:bg-forest-600 text-forest-700 dark:text-forest-300'
                                                    }`}>
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-forest-900 dark:text-ivory text-sm">{user.name}</p>
                                                    <p className="text-xs text-forest-600 dark:text-forest-400 capitalize">{user.type}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-mint">{user.ecoPoints}</p>
                                                <p className="text-xs text-forest-500">points</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Eco Badges Tracker */}
                            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-forest-900 dark:text-ivory flex items-center gap-2">
                                        <Award className="w-5 h-5 text-amber-500" />
                                        Eco Badges Earned
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setBadgeFormData({ name: '', emoji: '', threshold: 100, color: 'blue', active: true });
                                            setShowBadgeForm(true);
                                        }}
                                        className="px-3 py-1.5 bg-forest-900 dark:bg-mint text-ivory dark:text-forest-900 rounded-lg text-sm font-bold hover:bg-forest-800 dark:hover:bg-mint/90 transition-all flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Create Badge
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {badges.map(badge => {
                                        const colorClasses = {
                                            green: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800',
                                            blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
                                            purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800',
                                            amber: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800',
                                            red: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800',
                                            pink: 'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-800',
                                            indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800'
                                        };
                                        const textColorClasses = {
                                            green: 'text-green-700 dark:text-green-400',
                                            blue: 'text-blue-700 dark:text-blue-400',
                                            purple: 'text-purple-700 dark:text-purple-400',
                                            amber: 'text-amber-700 dark:text-amber-400',
                                            red: 'text-red-700 dark:text-red-400',
                                            pink: 'text-pink-700 dark:text-pink-400',
                                            indigo: 'text-indigo-700 dark:text-indigo-400'
                                        };
                                        const subtextColorClasses = {
                                            green: 'text-green-600 dark:text-green-500',
                                            blue: 'text-blue-600 dark:text-blue-500',
                                            purple: 'text-purple-600 dark:text-purple-500',
                                            amber: 'text-amber-600 dark:text-amber-500',
                                            red: 'text-red-600 dark:text-red-500',
                                            pink: 'text-pink-600 dark:text-pink-500',
                                            indigo: 'text-indigo-600 dark:text-indigo-500'
                                        };

                                        return (
                                            <div
                                                key={badge.id}
                                                className={`relative p-4 bg-gradient-to-br ${colorClasses[badge.color as keyof typeof colorClasses] || colorClasses.blue} rounded-xl border ${badge.active ? '' : 'opacity-50'}`}
                                            >
                                                {/* Badge Content - Clickable */}
                                                <div
                                                    onClick={() => {
                                                        setSelectedBadge({ name: badge.name, threshold: badge.threshold, emoji: badge.emoji });
                                                        setShowBadgeModal(true);
                                                    }}
                                                    className="cursor-pointer hover:scale-105 transition-transform"
                                                >
                                                    <div className="text-3xl mb-2">{badge.emoji}</div>
                                                    <p className={`font-bold ${textColorClasses[badge.color as keyof typeof textColorClasses] || textColorClasses.blue}`}>
                                                        {badge.name}
                                                    </p>
                                                    <p className={`text-xs ${subtextColorClasses[badge.color as keyof typeof subtextColorClasses] || subtextColorClasses.blue}`}>
                                                        {users.filter(u => u.ecoPoints >= badge.threshold).length} users
                                                    </p>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="absolute top-2 right-2 flex gap-1">
                                                    <button
                                                        onClick={() => handleToggleBadge(badge.id)}
                                                        className={`p-1 rounded ${badge.active ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'} text-white transition-colors`}
                                                        title={badge.active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {badge.active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setBadgeFormData(badge);
                                                            setShowBadgeForm(true);
                                                        }}
                                                        className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBadge(badge.id)}
                                                        className="p-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions & Recent Activity */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <h3 className="text-lg font-bold text-forest-900 dark:text-ivory mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setActiveTab('users')} className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 transition-all">
                                        <Users className="w-6 h-6 text-blue-600 mb-2" />
                                        <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Manage Users</p>
                                    </button>
                                    <button onClick={() => setActiveTab('vouchers')} className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl border border-purple-200 dark:border-purple-800 transition-all">
                                        <Award className="w-6 h-6 text-purple-600 mb-2" />
                                        <p className="text-sm font-bold text-purple-700 dark:text-purple-400">Create Voucher</p>
                                    </button>
                                    <button onClick={() => setActiveTab('finance')} className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800 transition-all">
                                        <DollarSign className="w-6 h-6 text-green-600 mb-2" />
                                        <p className="text-sm font-bold text-green-700 dark:text-green-400">View Finance</p>
                                    </button>
                                    <button onClick={() => setActiveTab('analytics')} className="p-4 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl border border-amber-200 dark:border-amber-800 transition-all">
                                        <Download className="w-6 h-6 text-amber-600 mb-2" />
                                        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Download Report</p>
                                    </button>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <h3 className="text-lg font-bold text-forest-900 dark:text-ivory mb-4">Recent Activity</h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {adminLogs.slice(0, 5).map((log) => (
                                        <div key={log.id} className="flex items-start gap-3 p-3 bg-forest-50 dark:bg-forest-700 rounded-xl">
                                            <div className="w-2 h-2 bg-mint rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-forest-900 dark:text-ivory">{log.action.replace(/_/g, ' ')}</p>
                                                <p className="text-xs text-forest-600 dark:text-forest-400">{log.details}</p>
                                                <p className="text-xs text-forest-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {adminLogs.length === 0 && (
                                        <p className="text-center text-forest-500 py-4">No recent activity</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white dark:bg-forest-800 rounded-2xl border border-forest-100 dark:border-forest-700 overflow-hidden">
                        <div className="p-4 bg-forest-50 dark:bg-forest-700 flex flex-col md:flex-row justify-between gap-4">
                            <h2 className="text-lg font-bold text-forest-900 dark:text-ivory">User Management</h2>
                            <div className="flex gap-2">
                                <input
                                    placeholder="Search users..."
                                    value={userFilter}
                                    onChange={e => setUserFilter(e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-800"
                                />
                                <select
                                    value={roleFilter}
                                    onChange={e => setRoleFilter(e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-800"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="individual">Individual</option>
                                    <option value="restaurant">Restaurant</option>
                                    <option value="ngo">NGO</option>
                                    <option value="shelter">Shelter</option>
                                    <option value="fertilizer">Fertilizer</option>
                                </select>
                                <button
                                    onClick={() => exportUsersToPDF(
                                        users.filter(u =>
                                            (roleFilter === 'all' || u.type === roleFilter) &&
                                            (u.name.toLowerCase().includes(userFilter.toLowerCase()) || u.email.toLowerCase().includes(userFilter.toLowerCase()))
                                        ),
                                        { search: userFilter, role: roleFilter }
                                    )}
                                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-all flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />PDF
                                </button>
                                <button
                                    onClick={() => exportUsersToCSV(
                                        users.filter(u =>
                                            (roleFilter === 'all' || u.type === roleFilter) &&
                                            (u.name.toLowerCase().includes(userFilter.toLowerCase()) || u.email.toLowerCase().includes(userFilter.toLowerCase()))
                                        )
                                    )}
                                    className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-bold hover:bg-green-200 dark:hover:bg-green-900/40 transition-all flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />CSV
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-forest-50 dark:bg-forest-700">
                                    <tr>
                                        <th className="p-3 text-left text-sm font-bold">Name</th>
                                        <th className="p-3 text-left text-sm font-bold">Email</th>
                                        <th className="p-3 text-left text-sm font-bold">Role</th>
                                        <th className="p-3 text-left text-sm font-bold">Category</th>
                                        <th className="p-3 text-left text-sm font-bold">Location</th>
                                        <th className="p-3 text-left text-sm font-bold">Points</th>
                                        <th className="p-3 text-left text-sm font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-forest-100 dark:divide-forest-700">
                                    {users.filter(u =>
                                        (roleFilter === 'all' || u.type === roleFilter) &&
                                        (u.name.toLowerCase().includes(userFilter.toLowerCase()) || u.email.toLowerCase().includes(userFilter.toLowerCase()))
                                    ).map(user => (
                                        <tr key={user.id} className="hover:bg-forest-50 dark:hover:bg-forest-700/50">
                                            <td className="p-3 text-forest-900 dark:text-ivory">{user.name}</td>
                                            <td className="p-3 text-forest-600 dark:text-forest-300 text-sm">{user.email}</td>
                                            <td className="p-3"><span className="px-2 py-1 bg-forest-100 dark:bg-forest-700 rounded text-xs font-bold capitalize">{user.type}</span></td>
                                            <td className="p-3">
                                                {user.category && (
                                                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${user.category === 'donor' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                                        }`}>
                                                        {user.category}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-forest-600 dark:text-forest-300 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.location || 'N/A'}</span>
                                                    {user.address && (
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.address)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                                        >
                                                            <MapPin className="w-3 h-3" />
                                                            {user.address}
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 font-bold">{user.ecoPoints}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            setSelectedUser(user);
                                                            // Fetch bank accounts for this user
                                                            try {
                                                                const response = await fetch(`http://localhost:3002/api/bank-accounts?userId=${user.id}`);
                                                                if (response.ok) {
                                                                    const accounts = await response.json();
                                                                    setUserBankAccounts(accounts);
                                                                } else {
                                                                    setUserBankAccounts([]);
                                                                }
                                                            } catch (error) {
                                                                console.error('Error fetching bank accounts:', error);
                                                                setUserBankAccounts([]);
                                                            }
                                                            setShowUserDetails(true);
                                                        }}
                                                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => deleteUser(user.id, user.name)} className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Donations Tab */}
                {activeTab === 'donations' && (
                    <div className="bg-white dark:bg-forest-800 rounded-2xl border border-forest-100 dark:border-forest-700 overflow-hidden">
                        <div className="p-4 bg-forest-50 dark:bg-forest-700 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-forest-900 dark:text-ivory">Donation Management</h2>
                            <div className="flex gap-2 items-center">
                                <select
                                    value={donationFilter}
                                    onChange={e => setDonationFilter(e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-800"
                                >
                                    <option value="all">All Status</option>
                                    <option value="Available">Available</option>
                                    <option value="Claimed">Claimed</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Recycled">Recycled</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Expired">Expired</option>
                                </select>
                                <span className="px-3 py-1 bg-forest-100 dark:bg-forest-600 rounded-lg text-sm font-bold">{donations.length} Total</span>
                                <button
                                    onClick={() => exportDonationsToPDF(
                                        donations.filter(d => donationFilter === 'all' || d.status === donationFilter),
                                        donationFilter
                                    )}
                                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-all flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />PDF
                                </button>
                                <button
                                    onClick={() => exportDonationsToCSV(
                                        donations.filter(d => donationFilter === 'all' || d.status === donationFilter)
                                    )}
                                    className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-bold hover:bg-green-200 dark:hover:bg-green-900/40 transition-all flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />CSV
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-forest-50 dark:bg-forest-700">
                                    <tr>
                                        <th className="p-3 text-left text-sm font-bold">Item</th>
                                        <th className="p-3 text-left text-sm font-bold">Status</th>
                                        <th className="p-3 text-left text-sm font-bold">Quality</th>
                                        <th className="p-3 text-left text-sm font-bold">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-forest-100 dark:divide-forest-700">
                                    {donations.filter(d => donationFilter === 'all' || d.status === donationFilter).map((donation: any) => (
                                        <tr key={donation.id} className="hover:bg-forest-50 dark:hover:bg-forest-700/50">
                                            <td className="p-3">
                                                <p className="font-bold text-forest-900 dark:text-ivory">{donation.aiFoodType || 'Food Item'}</p>
                                                <p className="text-xs text-forest-600 dark:text-forest-300">{donation.quantity}</p>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${donation.status === 'Available' ? 'bg-green-100 text-green-700' :
                                                    donation.status === 'Claimed' ? 'bg-blue-100 text-blue-700' :
                                                        donation.status === 'Recycled' ? 'bg-orange-100 text-orange-700' :
                                                            donation.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                donation.status === 'Delivered' ? 'bg-indigo-100 text-indigo-700' :
                                                                    donation.status === 'Expired' ? 'bg-red-100 text-red-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {donation.status}
                                                </span>
                                                {['Pending', 'Pending Pickup'].includes(donation.status) && (
                                                    <div className="mt-1 text-[10px] flex gap-2">
                                                        <span className={donation.senderConfirmed ? "text-green-600" : "text-gray-400"}>
                                                            {donation.senderConfirmed ? "✓ Delivered" : "○ Delivering"}
                                                        </span>
                                                        <span className={donation.receiverConfirmed ? "text-green-600" : "text-gray-400"}>
                                                            {donation.receiverConfirmed ? "✓ Received" : "○ Receiving"}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <span className="font-bold text-forest-900 dark:text-ivory">{donation.aiQualityScore}%</span>
                                            </td>
                                            <td className="p-3 text-sm text-forest-600 dark:text-forest-300">
                                                {new Date(donation.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {donations.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-forest-500">No donations found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Money Requests Tab */}
                {activeTab === 'money-requests' && (
                    <MoneyRequestsManagement />
                )}

                {/* Vouchers Tab */}
                {activeTab === 'vouchers' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <button onClick={() => {
                                setShowVoucherForm(!showVoucherForm);
                                setEditingVoucherId(null);
                                setVoucherForm({ code: '', title: '', description: '', discountType: 'percentage', discountValue: 0, minEcoPoints: 0, maxRedemptions: 100, expiryDate: '' });
                            }} className="px-6 py-3 bg-forest-900 dark:bg-mint text-ivory dark:text-forest-900 rounded-xl font-bold flex items-center gap-2">
                                <Plus className="w-5 h-5" />Create Voucher
                            </button>
                            <div className="flex gap-2 items-center">
                                <select value={voucherFilter} onChange={e => setVoucherFilter(e.target.value)} className="px-4 py-3 rounded-xl bg-white dark:bg-forest-800 border border-forest-100 dark:border-forest-700">
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                </select>
                                <button
                                    onClick={() => exportVouchersToPDF(
                                        vouchers.filter(v => voucherFilter === 'all' || v.status === voucherFilter),
                                        voucherFilter
                                    )}
                                    className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-all flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />PDF
                                </button>
                                <button
                                    onClick={() => exportVouchersToCSV(
                                        vouchers.filter(v => voucherFilter === 'all' || v.status === voucherFilter)
                                    )}
                                    className="px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-bold hover:bg-green-200 dark:hover:bg-green-900/40 transition-all flex items-center gap-2"
                                >
                                    <FileText className="w-4 h-4" />CSV
                                </button>
                            </div>
                        </div>

                        {showVoucherForm && (
                            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <h3 className="text-lg font-bold mb-4">{editingVoucherId ? 'Edit Voucher' : 'New Voucher'}</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input placeholder="Code" value={voucherForm.code} onChange={e => setVoucherForm({ ...voucherForm, code: e.target.value })} className="px-4 py-2 rounded-xl bg-forest-50 dark:bg-forest-700 border-0" />
                                    <input placeholder="Title" value={voucherForm.title} onChange={e => setVoucherForm({ ...voucherForm, title: e.target.value })} className="px-4 py-2 rounded-xl bg-forest-50 dark:bg-forest-700 border-0" />
                                    <input placeholder="Discount Value" type="number" value={voucherForm.discountValue} onChange={e => setVoucherForm({ ...voucherForm, discountValue: Number(e.target.value) })} className="px-4 py-2 rounded-xl bg-forest-50 dark:bg-forest-700 border-0" />
                                    <input placeholder="Min EcoPoints" type="number" value={voucherForm.minEcoPoints} onChange={e => setVoucherForm({ ...voucherForm, minEcoPoints: Number(e.target.value) })} className="px-4 py-2 rounded-xl bg-forest-50 dark:bg-forest-700 border-0" />
                                    <input placeholder="Max Redemptions" type="number" value={voucherForm.maxRedemptions} onChange={e => setVoucherForm({ ...voucherForm, maxRedemptions: Number(e.target.value) })} className="px-4 py-2 rounded-xl bg-forest-50 dark:bg-forest-700 border-0" />
                                    <input type="date" value={voucherForm.expiryDate} onChange={e => setVoucherForm({ ...voucherForm, expiryDate: e.target.value })} className="px-4 py-2 rounded-xl bg-forest-50 dark:bg-forest-700 border-0" />
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={handleSaveVoucher} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold">
                                        {editingVoucherId ? 'Update' : 'Create'}
                                    </button>
                                    <button onClick={() => setShowVoucherForm(false)} className="px-6 py-2 bg-gray-500 text-white rounded-xl font-bold">Cancel</button>
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                            {vouchers.filter(v => voucherFilter === 'all' || v.status === voucherFilter).map(v => (
                                <div key={v.id} className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg">{v.title}</h3>
                                            <p className="text-sm text-forest-600 dark:text-forest-300">Code: {v.code}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => fetchVoucherRedemptions(v.id)} className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                                <Users className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEditVoucher(v)}
                                                className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                                                title="Edit Voucher"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleVoucherStatus(v.id, v.status);
                                                }}
                                                className={`p-2 rounded-lg ${v.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                                                title={v.status === 'active' ? 'Pause Voucher' : 'Activate Voucher'}
                                            >
                                                {v.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteVoucher(v.id, v.title);
                                                }}
                                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                title="Delete Voucher"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-forest-900 dark:text-ivory mb-2">{v.discountValue}% OFF</p>
                                    <div className="flex justify-between text-sm">
                                        <span>Min Points: {v.minEcoPoints}</span>
                                        <span>{v.currentRedemptions}/{v.maxRedemptions} used</span>
                                    </div>
                                    <div className="mt-2 h-2 bg-forest-100 dark:bg-forest-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-forest-600" style={{ width: `${(v.currentRedemptions / v.maxRedemptions) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Redemptions Modal */}
                        {showRedemptions && selectedVoucher && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold">Redemption History: {selectedVoucher.title}</h3>
                                        <button onClick={() => setShowRedemptions(false)} className="p-2 hover:bg-gray-100 rounded-full"><LogOut className="w-5 h-5" /></button>
                                    </div>
                                    <table className="w-full">
                                        <thead className="bg-forest-50 dark:bg-forest-700">
                                            <tr>
                                                <th className="p-3 text-left">User</th>
                                                <th className="p-3 text-left">Email</th>
                                                <th className="p-3 text-left">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {voucherRedemptions.map((r: any) => (
                                                <tr key={r.id} className="border-b border-forest-100 dark:border-forest-700">
                                                    <td className="p-3">{r.name}</td>
                                                    <td className="p-3">{r.email}</td>
                                                    <td className="p-3">{new Date(r.redeemedAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                            {voucherRedemptions.length === 0 && (
                                                <tr><td colSpan={3} className="p-4 text-center">No redemptions yet</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Finance Tab */}
                {
                    activeTab === 'finance' && (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border">
                                    <p className="text-sm text-forest-600 dark:text-forest-300">Total Balance</p>
                                    <p className="text-3xl font-bold text-green-600">${balance.totalBalance?.toFixed(2)}</p>
                                </div>
                                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border">
                                    <p className="text-sm text-forest-600 dark:text-forest-300">Total Donations</p>
                                    <p className="text-3xl font-bold text-blue-600">${balance.totalDonations?.toFixed(2)}</p>
                                </div>
                                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border">
                                    <p className="text-sm text-forest-600 dark:text-forest-300">Total Withdrawals</p>
                                    <p className="text-3xl font-bold text-red-600">${balance.totalWithdrawals?.toFixed(2)}</p>
                                </div>
                            </div>

                            <button onClick={() => setShowFinanceForm(!showFinanceForm)} className="px-6 py-3 bg-forest-900 dark:bg-mint text-ivory dark:text-forest-900 rounded-xl font-bold">
                                <Plus className="w-5 h-5 inline mr-2" />Record Transaction
                            </button>

                            {showFinanceForm && (
                                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border">
                                    <div className="flex gap-4 mb-4">
                                        <button onClick={() => setFinanceType('donation')} className={`px-4 py-2 rounded-xl ${financeType === 'donation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Donation</button>
                                        <button onClick={() => setFinanceType('withdrawal')} className={`px-4 py-2 rounded-xl ${financeType === 'withdrawal' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>Withdrawal</button>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input placeholder="Amount" type="number" value={financeForm.amount} onChange={e => setFinanceForm({ ...financeForm, amount: Number(e.target.value) })} className="px-4 py-2 rounded-xl bg-forest-50 dark:bg-forest-700" />
                                        {financeType === 'withdrawal' && (
                                            <select value={financeForm.category} onChange={e => setFinanceForm({ ...financeForm, category: e.target.value })} className="px-4 py-2 rounded-xl bg-forest-50 dark:bg-forest-700">
                                                <option value="transportation">Transportation</option>
                                                <option value="packaging">Packaging</option>
                                                <option value="other">Other</option>
                                            </select>
                                        )}
                                        <input placeholder="Description" value={financeForm.description} onChange={e => setFinanceForm({ ...financeForm, description: e.target.value })} className="px-4 py-2 rounded-xl bg-forest-50 dark:bg-forest-700" />
                                    </div>
                                    <button onClick={recordTransaction} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-xl font-bold">Record</button>
                                </div>
                            )}

                            <div className="bg-white dark:bg-forest-800 rounded-2xl border overflow-hidden">
                                <div className="p-4 bg-forest-50 dark:bg-forest-700 flex justify-between items-center">
                                    <h3 className="font-bold">Recent Transactions</h3>
                                    <div className="flex gap-2 items-center">
                                        <select
                                            value={financeFilter}
                                            onChange={e => setFinanceFilter(e.target.value)}
                                            className="px-4 py-2 rounded-xl border border-forest-200 dark:border-forest-600 bg-white dark:bg-forest-800"
                                        >
                                            <option value="all">All Transactions</option>
                                            <option value="donation">Donations Only</option>
                                            <option value="withdrawal">Withdrawals Only</option>
                                        </select>
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
                                        <button
                                            onClick={() => exportTransactionsToCSV(
                                                transactions.filter(t => financeFilter === 'all' || t.type === financeFilter)
                                            )}
                                            className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-bold hover:bg-green-200 dark:hover:bg-green-900/40 transition-all flex items-center gap-2"
                                        >
                                            <FileText className="w-4 h-4" />CSV
                                        </button>
                                    </div>
                                </div>
                                <div className="divide-y divide-forest-100 dark:divide-forest-700">
                                    {transactions
                                        .filter(t => financeFilter === 'all' || t.type === financeFilter)
                                        .map(t => (
                                            <div key={t.id} className="p-4 flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold">{t.description}</p>
                                                    <p className="text-sm text-forest-600 dark:text-forest-300">{new Date(t.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <p className={`font-bold ${t.type === 'donation' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t.type === 'donation' ? '+' : '-'}${t.amount}
                                                </p>
                                            </div>
                                        ))}
                                    {transactions.filter(t => financeFilter === 'all' || t.type === financeFilter).length === 0 && (
                                        <div className="p-6 text-center text-forest-500">No transactions found</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Analytics Tab */}
                {
                    activeTab === 'analytics' && (
                        <div className="space-y-6">
                            {/* Complete Report Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => exportCompleteReportToPDF({
                                        users,
                                        donations,
                                        vouchers,
                                        transactions,
                                        balance,
                                        logs: adminLogs
                                    })}
                                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg"
                                >
                                    <Download className="w-5 h-5" />Download Complete Report (PDF)
                                </button>
                            </div>

                            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <h3 className="text-lg font-bold mb-4 text-forest-900 dark:text-ivory">Donation Trends (Last 6 Months)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={[
                                        { month: 'Jun', donations: 12, amount: 1200 },
                                        { month: 'Jul', donations: 19, amount: 2100 },
                                        { month: 'Aug', donations: 15, amount: 1800 },
                                        { month: 'Sep', donations: 25, amount: 3200 },
                                        { month: 'Oct', donations: 32, amount: 4500 },
                                        { month: 'Nov', donations: 45, amount: 6000 },
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e1efe6" />
                                        <XAxis dataKey="month" stroke={axisStroke} />
                                        <YAxis stroke={axisStroke} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fdfbf7', borderRadius: '12px' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="donations" stroke="#22c55e" strokeWidth={2} name="Donations Count" />
                                        <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Value ($)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                    <h3 className="text-lg font-bold mb-4 text-forest-900 dark:text-ivory">Financial Overview</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={financialSummary?.byCategory || [
                                            { category: 'Transportation', total: 450 },
                                            { category: 'Packaging', total: 200 },
                                            { category: 'Marketing', total: 150 },
                                            { category: 'Operations', total: 800 }
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e1efe6" />
                                            <XAxis dataKey="category" stroke={axisStroke} />
                                            <YAxis stroke={axisStroke} />
                                            <Tooltip contentStyle={{ backgroundColor: '#fdfbf7', borderRadius: '12px' }} />
                                            <Legend />
                                            <Bar dataKey="total" fill="#1a4d2e" radius={[4, 4, 0, 0]} name="Expense ($)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                    <h3 className="text-lg font-bold mb-4 text-forest-900 dark:text-ivory">Expense Distribution</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <RePieChart>
                                            <Pie
                                                data={financialSummary?.byCategory || [
                                                    { category: 'Transportation', total: 450 },
                                                    { category: 'Packaging', total: 200 },
                                                    { category: 'Marketing', total: 150 },
                                                    { category: 'Operations', total: 800 }
                                                ]}
                                                dataKey="total"
                                                nameKey="category"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label
                                            >
                                                {(financialSummary?.byCategory || [1, 2, 3, 4]).map((_entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#fdfbf7', borderRadius: '12px' }} />
                                            <Legend />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Additional Analytics: Food Outcome & Role Activity */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                    <h3 className="text-lg font-bold mb-4 text-forest-900 dark:text-ivory">Food Donation Outcomes</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <RePieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Community (NGO)', value: donations.filter(d => ['Completed', 'Claimed'].includes(d.status) && users.find(u => u.id === d.claimedById)?.type === 'ngo').length },
                                                    { name: 'Animals (Shelter)', value: donations.filter(d => ['Completed', 'Claimed'].includes(d.status) && users.find(u => u.id === d.claimedById)?.type === 'shelter').length },
                                                    { name: 'Recycled/Fertilizer', value: donations.filter(d => d.status === 'Recycled' || (['Completed', 'Claimed'].includes(d.status) && users.find(u => u.id === d.claimedById)?.type === 'fertilizer')).length },
                                                    { name: 'Expired/Wasted', value: donations.filter(d => d.status === 'Expired').length }
                                                ].filter(d => d.value > 0)}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                <Cell fill="#4d8562" />
                                                <Cell fill="#f59e0b" />
                                                <Cell fill="#1a4d2e" />
                                                <Cell fill="#ef4444" />
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#fdfbf7', borderRadius: '12px' }} />
                                            <Legend />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                    <h3 className="text-lg font-bold mb-4 text-forest-900 dark:text-ivory">Donor vs Beneficiary Activity</h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={[
                                            { name: 'Donations Posted', value: donations.length, fill: '#059669' },
                                            { name: 'Donations Claimed', value: donations.filter(d => d.claimedById).length, fill: '#7c3aed' }
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e1efe6" />
                                            <XAxis dataKey="name" stroke={axisStroke} tick={{ fontSize: 12 }} />
                                            <YAxis stroke={axisStroke} />
                                            <Tooltip contentStyle={{ backgroundColor: '#fdfbf7', borderRadius: '12px' }} />
                                            <Legend />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Activity Count">
                                                <Cell fill="#10b981" />
                                                <Cell fill="#8b5cf6" />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                                <h3 className="text-lg font-bold mb-4 text-forest-900 dark:text-ivory">Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <span className="text-forest-700 dark:text-forest-300">Total Donations Received:</span>
                                        <span className="font-bold text-green-600 dark:text-green-400">${financialSummary?.donations?.total || 12500}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                        <span className="text-forest-700 dark:text-forest-300">Total Withdrawals/Expenses:</span>
                                        <span className="font-bold text-red-600 dark:text-red-400">${financialSummary?.withdrawals?.total || 1600}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <span className="text-forest-700 dark:text-forest-300">Net Balance:</span>
                                        <span className="font-bold text-blue-600 dark:text-blue-400">${financialSummary?.netBalance || 10900}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                {/* Logs Tab */}
                {
                    activeTab === 'logs' && (
                        <div className="bg-white dark:bg-forest-800 rounded-2xl border border-forest-100 dark:border-forest-700 overflow-hidden">
                            <div className="p-4 bg-forest-50 dark:bg-forest-700 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-forest-900 dark:text-ivory">Audit Logs</h2>
                                <button
                                    onClick={() => exportLogsToPDF(adminLogs)}
                                    className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-all flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />PDF
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-forest-50 dark:bg-forest-700">
                                        <tr>
                                            <th className="p-3 text-left text-sm font-bold">Time</th>
                                            <th className="p-3 text-left text-sm font-bold">Admin</th>
                                            <th className="p-3 text-left text-sm font-bold">Action</th>
                                            <th className="p-3 text-left text-sm font-bold">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-forest-100 dark:divide-forest-700">
                                        {adminLogs.map((log: any) => (
                                            <tr key={log.id} className="hover:bg-forest-50 dark:hover:bg-forest-700/50">
                                                <td className="p-3 text-sm text-forest-600 dark:text-forest-300">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className="p-3 text-sm font-bold text-forest-900 dark:text-ivory">
                                                    {log.adminName || 'System'}
                                                </td>
                                                <td className="p-3">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-sm text-forest-600 dark:text-forest-300">
                                                    {log.details}
                                                </td>
                                            </tr>
                                        ))}
                                        {adminLogs.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-6 text-center text-forest-500">No logs found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }

                {/* EcoPoints Tab */}
                {activeTab === 'ecopoints' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory flex items-center gap-2">
                                        <Award className="w-7 h-7 text-amber-500" />
                                        EcoPoints Leaderboard
                                    </h2>
                                    <p className="text-forest-600 dark:text-forest-400 mt-1">Track environmental contributions</p>
                                </div>
                                <button
                                    onClick={() => exportEcoPointsToPDF(users)}
                                    className="px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/40 transition-all flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" />Export PDF
                                </button>
                                <button
                                    onClick={() => exportEcoPointsToCSV(users)}
                                    className="px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-bold hover:bg-green-200 dark:hover:bg-green-900/40 transition-all flex items-center gap-2"
                                >
                                    <FileText className="w-5 h-5" />Export CSV
                                </button>
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                    <p className="text-sm text-amber-700 dark:text-amber-400 mb-1">Total Points</p>
                                    <p className="text-3xl font-bold text-amber-900 dark:text-amber-300">
                                        {users.reduce((sum, u) => sum + (u.ecoPoints || 0), 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                                    <p className="text-sm text-green-700 dark:text-green-400 mb-1">Eco Starters (100+)</p>
                                    <p className="text-3xl font-bold text-green-900 dark:text-green-300">
                                        {users.filter(u => u.ecoPoints >= 100).length}
                                    </p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">Eco Warriors (500+)</p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                                        {users.filter(u => u.ecoPoints >= 500).length}
                                    </p>
                                </div>
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                    <p className="text-sm text-purple-700 dark:text-purple-400 mb-1">Eco Champions (1000+)</p>
                                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">
                                        {users.filter(u => u.ecoPoints >= 1000).length}
                                    </p>
                                </div>
                            </div>
                        </div>

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
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-amber-500 text-white' :
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

                {/* User Details Modal */}
                {showUserDetails && selectedUser && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-forest-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-4 border-b border-forest-100 dark:border-forest-700 flex justify-between items-center bg-forest-50 dark:bg-forest-900/50">
                                <h3 className="font-bold text-lg text-forest-900 dark:text-ivory">User Profile</h3>
                                <button onClick={() => setShowUserDetails(false)} className="p-1 hover:bg-forest-200 dark:hover:bg-forest-700 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-forest-100 dark:bg-forest-700 flex items-center justify-center text-3xl font-bold text-forest-500">
                                        {selectedUser.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-forest-900 dark:text-ivory">{selectedUser.name}</h4>
                                        <p className="text-forest-600 dark:text-forest-400">{selectedUser.email}</p>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-mint/20 text-forest-800 text-xs font-bold rounded-full capitalize">
                                            {selectedUser.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-forest-100 dark:border-forest-700">
                                    <div>
                                        <p className="text-xs text-forest-500 uppercase font-bold">Location</p>
                                        <p className="font-medium text-forest-900 dark:text-ivory">{selectedUser.location || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-forest-500 uppercase font-bold">Joined</p>
                                        <p className="font-medium text-forest-900 dark:text-ivory">{new Date(selectedUser.joinedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-forest-500 uppercase font-bold">Organization</p>
                                        <p className="font-medium text-forest-900 dark:text-ivory">{selectedUser.organization || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-forest-500 uppercase font-bold">User ID</p>
                                        <p className="font-medium text-xs truncate text-forest-900 dark:text-ivory" title={selectedUser.id}>{selectedUser.id}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-forest-500 uppercase font-bold mb-2">Eco Impact</p>
                                    <div className="bg-forest-50 dark:bg-forest-900/30 p-3 rounded-xl flex items-center justify-between">
                                        <span className="font-medium text-forest-900 dark:text-ivory">Total EcoPoints</span>
                                        <span className="text-xl font-bold text-mint">{selectedUser.ecoPoints}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-forest-100 dark:border-forest-700 flex justify-end">
                                <button onClick={() => setShowUserDetails(false)} className="px-4 py-2 bg-forest-100 dark:bg-forest-700 hover:bg-forest-200 dark:hover:bg-forest-600 rounded-xl font-bold transition-colors text-forest-900 dark:text-ivory">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Settings Tab */}
                {
                    activeTab === 'settings' && (
                        <div className="bg-white dark:bg-forest-800 p-6 rounded-2xl border border-forest-100 dark:border-forest-700 max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold mb-6 text-forest-900 dark:text-ivory flex items-center gap-2">
                                <Settings className="w-6 h-6" />
                                System Settings
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-forest-700 dark:text-forest-300 mb-2">
                                        Default Delivery Cost (PKR per km)
                                    </label>
                                    <div className="flex gap-4">
                                        <div className="relative flex-1">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <DollarSign className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                value={deliveryCostPerKm}
                                                onChange={(e) => setDeliveryCostPerKm(Number(e.target.value))}
                                                className="block w-full pl-10 pr-12 py-3 border border-forest-200 dark:border-forest-600 rounded-xl bg-forest-50 dark:bg-forest-700 text-forest-900 dark:text-ivory focus:ring-2 focus:ring-mint focus:border-transparent outline-none transition-all"
                                                placeholder="0.00"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">PKR</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={saveSettings}
                                            className="px-6 py-3 bg-forest-900 dark:bg-mint text-ivory dark:text-forest-900 rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-mint/90 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                    {saveMessage && (
                                        <p className="mt-2 text-sm font-bold text-green-600 dark:text-green-400 animate-pulse">
                                            {saveMessage}
                                        </p>
                                    )}
                                    <p className="mt-2 text-sm text-forest-500 dark:text-forest-400">
                                        This cost will be applied as the default rate for all delivery-based calculations across the platform.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
            {
                activeTab === 'sponsors' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-forest-900 dark:text-ivory flex items-center gap-2">
                                    <Megaphone className="w-7 h-7 text-forest-900 dark:text-mint" />
                                    Sponsor Banners
                                </h2>
                                <p className="text-forest-600 dark:text-forest-400 mt-1">Manage promotional content and advertisements</p>
                            </div>
                            <button
                                onClick={() => {
                                    setBannerFormData({
                                        name: '', type: 'custom', active: true, placement: 'dashboard',
                                        backgroundColor: 'from-blue-50 to-blue-100', content: '', description: '', link: '', logoUrl: '', imageUrl: ''
                                    });
                                    setShowBannerForm(true);
                                }}
                                className="px-6 py-3 bg-forest-900 dark:bg-mint text-ivory dark:text-forest-900 rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-mint/90 transition-all flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> New Banner
                            </button>
                        </div>

                        {/* Filters Section */}
                        <div className="mb-6 bg-white dark:bg-forest-800 p-4 rounded-2xl border border-forest-100 dark:border-forest-700">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                        Status Filter
                                    </label>
                                    <select
                                        value={bannerStatusFilter}
                                        onChange={(e) => setBannerStatusFilter(e.target.value)}
                                        className="w-full p-2 rounded-lg bg-gray-50 dark:bg-forest-700 border border-gray-200 dark:border-forest-600 text-forest-900 dark:text-ivory"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="draft">Draft</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                        Organization Type
                                    </label>
                                    <select
                                        value={bannerUserFilter}
                                        onChange={(e) => setBannerUserFilter(e.target.value)}
                                        className="w-full p-2 rounded-lg bg-gray-50 dark:bg-forest-700 border border-gray-200 dark:border-forest-600 text-forest-900 dark:text-ivory"
                                    >
                                        <option value="all">All Organizations</option>
                                        <option value="type:restaurant">🍽️ Restaurants</option>
                                        <option value="type:ngo">🤝 NGOs</option>
                                        <option value="type:shelter">🏠 Animal Shelters</option>
                                        <option value="type:fertilizer">🌾 Fertilizer Companies</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-forest-700 dark:text-forest-300 mb-2">
                                        Campaign
                                    </label>
                                    <select
                                        value={bannerCampaignFilter}
                                        onChange={(e) => setBannerCampaignFilter(e.target.value)}
                                        className="w-full p-2 rounded-lg bg-gray-50 dark:bg-forest-700 border border-gray-200 dark:border-forest-600 text-forest-900 dark:text-ivory"
                                    >
                                        <option value="all">All Campaigns</option>
                                        {Array.from(new Set(banners.filter(b => b.campaignName).map(b => b.campaignName))).map(campaign => (
                                            <option key={campaign} value={campaign}>
                                                {campaign}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {(bannerStatusFilter !== 'all' || bannerUserFilter !== 'all' || bannerCampaignFilter !== 'all') && (
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-sm text-forest-600 dark:text-forest-400">Active filters:</span>
                                    <button
                                        onClick={() => {
                                            setBannerStatusFilter('all');
                                            setBannerUserFilter('all');
                                            setBannerCampaignFilter('all');
                                        }}
                                        className="text-sm px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Redemption Requests Section */}
                        {redemptionRequests.filter(r => r.status === 'pending').length > 0 && (
                            <div className="mb-8 bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
                                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
                                    <Award className="w-6 h-6" />
                                    Pending Ad Redemption Requests ({redemptionRequests.filter(r => r.status === 'pending').length})
                                </h3>
                                <div className="grid gap-4">
                                    {redemptionRequests.filter(r => r.status === 'pending').map(request => (
                                        <div key={request.id} className="bg-white dark:bg-forest-800 p-4 rounded-xl border border-amber-200 dark:border-amber-700">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-bold text-lg text-forest-900 dark:text-ivory">{request.userName}</h4>
                                                    <p className="text-sm text-forest-600 dark:text-forest-400">{request.userEmail} • {request.userType}</p>
                                                    {request.organization && (
                                                        <p className="text-sm text-forest-500 dark:text-forest-400 mt-1">🏢 {request.organization}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-amber-600">{request.durationMinutes} min</p>
                                                    <p className="text-xs text-forest-500 uppercase font-bold">{request.pointsCost} points</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 items-center mb-3">
                                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                                                    {request.packageId}
                                                </span>
                                                <span className="text-xs text-forest-500">
                                                    Requested {new Date(request.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveRedemption(request)}
                                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Check className="w-4 h-4" /> Approve & Activate
                                                </button>
                                                <button
                                                    onClick={() => handleRejectRedemption(request)}
                                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <X className="w-4 h-4" /> Reject & Refund
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Banner Form Modal */}
                        {showBannerForm && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white dark:bg-forest-800 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-forest-900 dark:text-ivory">{bannerFormData.id ? 'Edit Banner' : 'Create New Banner'}</h3>
                                        <button onClick={() => setShowBannerForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-forest-700 rounded-full">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-ivory">Sponsor Name</label>
                                                <input
                                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                                    value={bannerFormData.name}
                                                    onChange={e => setBannerFormData({ ...bannerFormData, name: e.target.value })}
                                                    placeholder="e.g. Green Energy"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-ivory">Banner Type</label>
                                                <div className="flex bg-gray-100 dark:bg-forest-700 p-1 rounded-xl">
                                                    <button
                                                        onClick={() => setBannerFormData({ ...bannerFormData, type: 'custom' })}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${bannerFormData.type === 'custom' ? 'bg-white dark:bg-forest-600 shadow-sm text-forest-900 dark:text-ivory' : 'text-gray-500 dark:text-gray-400'}`}
                                                    >
                                                        Custom Design
                                                    </button>
                                                    <button
                                                        onClick={() => setBannerFormData({ ...bannerFormData, type: 'image' })}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${bannerFormData.type === 'image' ? 'bg-white dark:bg-forest-600 shadow-sm text-forest-900 dark:text-ivory' : 'text-gray-500 dark:text-gray-400'}`}
                                                    >
                                                        Full Image
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {bannerFormData.type === 'custom' ? (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 dark:text-ivory">Headline</label>
                                                        <input
                                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                                            value={bannerFormData.content}
                                                            onChange={e => setBannerFormData({ ...bannerFormData, content: e.target.value })}
                                                            placeholder="Main promo text"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1 dark:text-ivory">Background Gradient</label>
                                                        <select
                                                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                                            value={bannerFormData.backgroundColor}
                                                            onChange={e => setBannerFormData({ ...bannerFormData, backgroundColor: e.target.value })}
                                                        >
                                                            <option value="from-blue-50 to-blue-100">Blue Breeze</option>
                                                            <option value="from-green-50 to-green-100">Green Nature</option>
                                                            <option value="from-amber-50 to-amber-100">Amber Glow</option>
                                                            <option value="from-purple-50 to-purple-100">Purple Haze</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 dark:text-ivory">Description</label>
                                                    <textarea
                                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                                        value={bannerFormData.description}
                                                        onChange={e => setBannerFormData({ ...bannerFormData, description: e.target.value })}
                                                        rows={2}
                                                        placeholder="Subtitle or longer description"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 dark:text-ivory">Logo URL</label>
                                                    <input
                                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                                        value={bannerFormData.logoUrl}
                                                        onChange={e => setBannerFormData({ ...bannerFormData, logoUrl: e.target.value })}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-ivory">Banner Image URL</label>
                                                <input
                                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                                    value={bannerFormData.imageUrl}
                                                    onChange={e => setBannerFormData({ ...bannerFormData, imageUrl: e.target.value })}
                                                    placeholder="https://..."
                                                />
                                                {bannerFormData.imageUrl && (
                                                    <div className="mt-2 rounded-xl overflow-hidden h-32 w-full">
                                                        <img src={bannerFormData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-ivory">Target Link URL</label>
                                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-forest-700 rounded-xl p-3">
                                                <Settings className="w-4 h-4 text-gray-400" />
                                                <input
                                                    className="w-full bg-transparent border-none outline-none text-forest-900 dark:text-ivory"
                                                    value={bannerFormData.link}
                                                    onChange={e => setBannerFormData({ ...bannerFormData, link: e.target.value })}
                                                    placeholder="https://sponsor-site.com"
                                                />
                                            </div>
                                        </div>

                                        {/* Campaign Name */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-ivory">
                                                Campaign Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                                value={bannerFormData.campaignName || ''}
                                                onChange={e => setBannerFormData({ ...bannerFormData, campaignName: e.target.value })}
                                                placeholder="e.g. Summer Promo 2024"
                                            />
                                        </div>

                                        {/* Scheduling */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-ivory">
                                                    Start Date & Time
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                                    value={bannerFormData.startDate ? new Date(bannerFormData.startDate).toISOString().slice(0, 16) : ''}
                                                    onChange={e => setBannerFormData({ ...bannerFormData, startDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty for immediate start</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-ivory">
                                                    End Date & Time
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                                    value={bannerFormData.endDate ? new Date(bannerFormData.endDate).toISOString().slice(0, 16) : ''}
                                                    onChange={e => setBannerFormData({ ...bannerFormData, endDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty for no expiration</p>
                                            </div>
                                        </div>

                                        {/* Dashboard Targeting */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2 dark:text-ivory">
                                                Show on Dashboards
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {['all', 'individual', 'restaurant', 'ngo', 'shelter', 'fertilizer'].map(dashboard => (
                                                    <label key={dashboard} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-forest-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-forest-600">
                                                        <input
                                                            type="checkbox"
                                                            checked={bannerFormData.targetDashboards?.includes(dashboard as any) || false}
                                                            onChange={e => {
                                                                const current = bannerFormData.targetDashboards || [];
                                                                if (dashboard === 'all') {
                                                                    setBannerFormData({ ...bannerFormData, targetDashboards: e.target.checked ? ['all'] : [] });
                                                                } else {
                                                                    const filtered = current.filter(d => d !== 'all');
                                                                    setBannerFormData({
                                                                        ...bannerFormData,
                                                                        targetDashboards: e.target.checked
                                                                            ? [...filtered, dashboard as any]
                                                                            : filtered.filter(d => d !== dashboard)
                                                                    });
                                                                }
                                                            }}
                                                            className="rounded"
                                                        />
                                                        <span className="text-sm capitalize dark:text-ivory">{dashboard}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status & Award Type */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-ivory">
                                                    Campaign Status
                                                </label>
                                                <select
                                                    value={bannerFormData.status || 'draft'}
                                                    onChange={e => setBannerFormData({ ...bannerFormData, status: e.target.value as any })}
                                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                                >
                                                    <option value="draft">Draft</option>
                                                    <option value="scheduled">Scheduled</option>
                                                    <option value="active">Active</option>
                                                    <option value="paused">Paused</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1 dark:text-ivory">
                                                    Award Type
                                                </label>
                                                <select
                                                    value={bannerFormData.awardType || 'sponsored'}
                                                    onChange={e => setBannerFormData({ ...bannerFormData, awardType: e.target.value as any })}
                                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                                >
                                                    <option value="sponsored">Sponsored</option>
                                                    <option value="purchased">Purchased</option>
                                                    <option value="ecopoints">EcoPoints Award</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer dark:text-ivory">
                                                <div className={`w-12 h-6 rounded-full transition-colors relative ${bannerFormData.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                    onClick={() => setBannerFormData({ ...bannerFormData, active: !bannerFormData.active })}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${bannerFormData.active ? 'left-7' : 'left-1'}`} />
                                                </div>
                                                <span className="font-medium">Active Status</span>
                                            </label>
                                        </div>

                                        <button
                                            onClick={handleSaveBanner}
                                            className="w-full py-3 bg-forest-900 dark:bg-mint text-ivory dark:text-forest-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
                                        >
                                            {bannerFormData.id ? 'Save Changes' : 'Create Banner'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Banners Grid */}
                        <div className="grid md:grid-cols-2 gap-6 pb-12">
                            {banners
                                .filter(banner => {
                                    // Status filter
                                    if (bannerStatusFilter !== 'all') {
                                        if (bannerStatusFilter === 'active' && !banner.active) return false;
                                        if (bannerStatusFilter === 'paused' && banner.active) return false;
                                        if (banner.status && banner.status !== bannerStatusFilter) return false;
                                    }
                                    // User filter
                                    if (bannerUserFilter !== 'all' && banner.ownerId !== bannerUserFilter) return false;
                                    // Campaign filter
                                    if (bannerCampaignFilter !== 'all' && banner.campaignName !== bannerCampaignFilter) return false;
                                    return true;
                                })
                                .map(banner => (
                                    <div key={banner.id} className="bg-white dark:bg-forest-800 p-4 rounded-2xl shadow-sm border border-forest-100 dark:border-forest-700 flex flex-col gap-4">
                                        {/* Preview */}
                                        <div className="relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 h-40 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                                            {banner.type === 'image' && banner.imageUrl ? (
                                                <img src={banner.imageUrl} alt={banner.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className={`w-full h-full p-4 bg-gradient-to-r ${banner.backgroundColor}`}>
                                                    <div className="flex items-center gap-3">
                                                        {banner.logoUrl && <img src={banner.logoUrl} className="w-10 h-10 bg-white rounded-lg p-1 object-contain" />}
                                                        <div>
                                                            <p className="font-bold text-forest-900">{banner.content}</p>
                                                            <p className="text-xs text-forest-700">{banner.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                                                    {banner.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded-lg backdrop-blur-sm uppercase font-bold">
                                                {banner.placement || 'dashboard'}
                                            </div>
                                        </div>

                                        {/* Analytics */}
                                        <div className="grid grid-cols-3 gap-2 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                                            <div className="text-center">
                                                <p className="text-xs text-forest-500 uppercase font-bold">Views</p>
                                                <p className="font-bold text-forest-900 dark:text-ivory">{banner.impressions || 0}</p>
                                            </div>
                                            <div className="text-center border-l border-gray-200 dark:border-gray-600">
                                                <p className="text-xs text-forest-500 uppercase font-bold">Clicks</p>
                                                <p className="font-bold text-forest-900 dark:text-ivory">{banner.clicks || 0}</p>
                                            </div>
                                            <div className="text-center border-l border-gray-200 dark:border-gray-600">
                                                <p className="text-xs text-forest-500 uppercase font-bold">CTR</p>
                                                <p className="font-bold text-forest-900 dark:text-ivory">
                                                    {banner.impressions ? (((banner.clicks || 0) / banner.impressions) * 100).toFixed(1) : '0.0'}%
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-lg dark:text-ivory">{banner.name}</h4>
                                                <a href={banner.link} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                                    {banner.link} <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleToggleBannerStatus(banner.id)}
                                                    className={`p-2 rounded-lg transition-colors ${banner.active ? 'bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 dark:hover:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                                    title={banner.active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {banner.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setBannerFormData(banner);
                                                        setShowBannerForm(true);
                                                    }}
                                                    className="p-2 bg-gray-100 dark:bg-forest-700 rounded-lg hover:bg-gray-200 dark:hover:bg-forest-600 text-forest-700 dark:text-forest-300"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBanner(banner.id)}
                                                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            <button
                                onClick={() => {
                                    setBannerFormData({
                                        name: '', type: 'custom', active: true, placement: 'dashboard',
                                        backgroundColor: 'from-blue-50 to-blue-100', content: '', description: '', link: '', logoUrl: '', imageUrl: ''
                                    });
                                    setShowBannerForm(true);
                                }}
                                className="border-2 border-dashed border-gray-300 dark:border-forest-600 rounded-2xl flex flex-col items-center justify-center p-8 text-gray-400 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-forest-700/50 transition-all h-full min-h-[200px]"
                            >
                                <Plus className="w-8 h-8 mb-2" />
                                <span className="font-bold">Add New Banner</span>
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Badge Statistics Modal */}
            {
                showBadgeModal && selectedBadge && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-forest-800 rounded-3xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl">{selectedBadge.emoji}</span>
                                    <div>
                                        <h3 className="text-2xl font-bold text-forest-900 dark:text-ivory">{selectedBadge.name}</h3>
                                        <p className="text-sm text-forest-600 dark:text-forest-400">
                                            Earned by users with {selectedBadge.threshold}+ EcoPoints
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowBadgeModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-forest-700 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Time Filter */}
                            <div className="flex gap-2 mb-6">
                                {(['all', 'week', 'month', 'year'] as const).map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setBadgeTimeFilter(filter)}
                                        className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${badgeTimeFilter === filter
                                            ? 'bg-forest-900 text-ivory dark:bg-mint dark:text-forest-900'
                                            : 'bg-gray-100 dark:bg-forest-700 text-forest-700 dark:text-forest-300 hover:bg-gray-200 dark:hover:bg-forest-600'
                                            }`}
                                    >
                                        {filter === 'all' ? 'All Time' : `Last ${filter}`}
                                    </button>
                                ))}
                            </div>

                            {/* Statistics */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Users</p>
                                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                                        {(() => {
                                            const now = new Date();
                                            const cutoffDate = badgeTimeFilter === 'week' ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                                                : badgeTimeFilter === 'month' ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                                                    : badgeTimeFilter === 'year' ? new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
                                                        : null;

                                            return users.filter(u => {
                                                if (u.ecoPoints < selectedBadge.threshold) return false;
                                                if (!cutoffDate) return true;
                                                // Mock: assume users earned badge when they joined (for demo)
                                                const userDate = new Date(u.createdAt || now);
                                                return userDate >= cutoffDate;
                                            }).length;
                                        })()}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Avg Points</p>
                                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                                        {(() => {
                                            const qualified = users.filter(u => u.ecoPoints >= selectedBadge.threshold);
                                            const avg = qualified.length > 0
                                                ? Math.round(qualified.reduce((sum, u) => sum + u.ecoPoints, 0) / qualified.length)
                                                : 0;
                                            return avg;
                                        })()}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Top Earner</p>
                                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                                        {(() => {
                                            const qualified = users.filter(u => u.ecoPoints >= selectedBadge.threshold);
                                            const top = qualified.sort((a, b) => b.ecoPoints - a.ecoPoints)[0];
                                            return top ? top.ecoPoints : 0;
                                        })()}
                                    </p>
                                </div>
                            </div>

                            {/* Users List */}
                            <div>
                                <h4 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4">
                                    Users with this Badge
                                </h4>
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {users
                                        .filter(u => {
                                            if (u.ecoPoints < selectedBadge.threshold) return false;
                                            if (badgeTimeFilter === 'all') return true;

                                            const now = new Date();
                                            const cutoffDate = badgeTimeFilter === 'week' ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                                                : badgeTimeFilter === 'month' ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                                                    : new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

                                            const userDate = new Date(u.createdAt || now);
                                            return userDate >= cutoffDate;
                                        })
                                        .sort((a, b) => b.ecoPoints - a.ecoPoints)
                                        .map((user, idx) => (
                                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-forest-700 rounded-xl hover:bg-gray-100 dark:hover:bg-forest-600 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-500 text-white' :
                                                        idx === 1 ? 'bg-gray-400 text-white' :
                                                            idx === 2 ? 'bg-orange-600 text-white' :
                                                                'bg-forest-200 dark:bg-forest-600 text-forest-700 dark:text-forest-300'
                                                        }`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-forest-900 dark:text-ivory">{user.name}</p>
                                                        <p className="text-xs text-forest-600 dark:text-forest-400 capitalize">{user.type}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-forest-900 dark:text-ivory">{user.ecoPoints}</p>
                                                    <p className="text-xs text-forest-600 dark:text-forest-400">EcoPoints</p>
                                                </div>
                                            </div>
                                        ))}
                                    {users.filter(u => u.ecoPoints >= selectedBadge.threshold).length === 0 && (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            No users have earned this badge yet
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Badge Form Modal */}
            {showBadgeForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-forest-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-forest-900 dark:text-ivory">
                                {badgeFormData.id ? 'Edit Badge' : 'Create New Badge'}
                            </h3>
                            <button onClick={() => setShowBadgeForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-forest-700 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Badge Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-forest-700 dark:text-forest-300">
                                    Badge Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={badgeFormData.name || ''}
                                    onChange={e => setBadgeFormData({ ...badgeFormData, name: e.target.value })}
                                    placeholder="e.g., Eco Master"
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                />
                            </div>

                            {/* Emoji */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-forest-700 dark:text-forest-300">
                                    Emoji <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={badgeFormData.emoji || ''}
                                    onChange={e => setBadgeFormData({ ...badgeFormData, emoji: e.target.value })}
                                    placeholder="e.g., ⭐ 🎖️ 👑"
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory text-2xl"
                                    maxLength={2}
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Paste an emoji or use your emoji keyboard
                                    </p>
                                    <a
                                        href="https://emojipedia.org/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Emoji Picker
                                    </a>
                                </div>
                                {/* Quick Emoji Selection */}
                                <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl">
                                    <p className="text-xs font-medium text-forest-700 dark:text-forest-300 mb-2">Quick Select:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['🌱', '🌿', '🌳', '🏆', '⭐', '🎖️', '👑', '💎', '🔥', '⚡', '🌟', '✨', '🎯', '🚀', '💪', '🎉'].map(emoji => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => setBadgeFormData({ ...badgeFormData, emoji })}
                                                className={`text-2xl p-2 rounded-lg transition-all hover:scale-110 ${badgeFormData.emoji === emoji
                                                        ? 'bg-green-500 ring-2 ring-green-600'
                                                        : 'bg-white dark:bg-forest-700 hover:bg-green-100 dark:hover:bg-forest-600'
                                                    }`}
                                                title={emoji}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Points Threshold */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-forest-700 dark:text-forest-300">
                                    EcoPoints Required <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={badgeFormData.threshold || 100}
                                    onChange={e => setBadgeFormData({ ...badgeFormData, threshold: parseInt(e.target.value) || 100 })}
                                    min="1"
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                />
                            </div>

                            {/* Color Selector */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-forest-700 dark:text-forest-300">
                                    Badge Color
                                </label>
                                <select
                                    value={badgeFormData.color || 'blue'}
                                    onChange={e => setBadgeFormData({ ...badgeFormData, color: e.target.value })}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-forest-700 border-none text-forest-900 dark:text-ivory"
                                >
                                    <option value="green">🟢 Green</option>
                                    <option value="blue">🔵 Blue</option>
                                    <option value="purple">🟣 Purple</option>
                                    <option value="amber">🟡 Amber</option>
                                    <option value="red">🔴 Red</option>
                                    <option value="pink">🩷 Pink</option>
                                    <option value="indigo">🔷 Indigo</option>
                                </select>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-forest-700 rounded-xl">
                                <span className="text-sm font-medium text-forest-700 dark:text-forest-300">Active Status</span>
                                <button
                                    onClick={() => setBadgeFormData({ ...badgeFormData, active: !badgeFormData.active })}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${badgeFormData.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${badgeFormData.active ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowBadgeForm(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-forest-700 text-forest-900 dark:text-ivory rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-forest-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveBadge}
                                    className="flex-1 px-4 py-3 bg-forest-900 dark:bg-mint text-ivory dark:text-forest-900 rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-mint/90 transition-colors"
                                >
                                    {badgeFormData.id ? 'Save Changes' : 'Create Badge'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {showUserDetails && selectedUser && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-forest-800 rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-forest-200 dark:border-forest-700">
                            <div>
                                <h3 className="text-2xl font-bold text-forest-900 dark:text-ivory flex items-center gap-2">
                                    <Users className="w-7 h-7 text-blue-600" />
                                    User Details
                                </h3>
                                <p className="text-sm text-forest-600 dark:text-forest-300 mt-1">
                                    Complete profile and financial information
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowUserDetails(false);
                                    setSelectedUser(null);
                                    setUserBankAccounts([]);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-forest-700 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-forest-600 dark:text-forest-300" />
                            </button>
                        </div>

                        {/* User Information */}
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-5 rounded-2xl">
                                <h4 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    Basic Information
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-forest-600 dark:text-forest-400">Name</label>
                                        <p className="font-bold text-forest-900 dark:text-ivory">{selectedUser.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-forest-600 dark:text-forest-400">Email</label>
                                        <p className="font-medium text-forest-900 dark:text-ivory">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-forest-600 dark:text-forest-400">Role</label>
                                        <span className="inline-block px-3 py-1 bg-forest-100 dark:bg-forest-700 rounded-full text-sm font-bold capitalize text-forest-900 dark:text-ivory">
                                            {selectedUser.type}
                                        </span>
                                    </div>
                                    {selectedUser.organization && (
                                        <div>
                                            <label className="text-sm text-forest-600 dark:text-forest-400">Organization</label>
                                            <p className="font-medium text-forest-900 dark:text-ivory">{selectedUser.organization}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm text-forest-600 dark:text-forest-400">EcoPoints</label>
                                        <p className="font-bold text-green-600 text-xl">{selectedUser.ecoPoints}</p>
                                    </div>
                                    {selectedUser.phone && (
                                        <div>
                                            <label className="text-sm text-forest-600 dark:text-forest-400">Phone</label>
                                            <p className="font-medium text-forest-900 dark:text-ivory">{selectedUser.phone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Location Info */}
                            {(selectedUser.location || selectedUser.address) && (
                                <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl">
                                    <h4 className="font-bold text-lg text-forest-900 dark:text-ivory mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                        Location Information
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedUser.location && (
                                            <div>
                                                <label className="text-sm text-forest-600 dark:text-forest-400">City</label>
                                                <p className="font-medium text-forest-900 dark:text-ivory">{selectedUser.location}</p>
                                            </div>
                                        )}
                                        {selectedUser.address && (
                                            <div>
                                                <label className="text-sm text-forest-600 dark:text-forest-400">Full Address</label>
                                                <div className="flex items-start gap-2">
                                                    <p className="font-medium text-forest-900 dark:text-ivory flex-1">{selectedUser.address}</p>
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedUser.address)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                                                    >
                                                        <MapPin className="w-4 h-4" />
                                                        View on Map
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Bank Accounts Section */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-5 rounded-2xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-lg text-forest-900 dark:text-ivory flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-purple-600" />
                                        Bank Accounts ({userBankAccounts.length})
                                    </h4>
                                    {userBankAccounts.length > 0 && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">
                                            {userBankAccounts.filter((a: any) => a.isVerified === 1).length} Verified
                                        </span>
                                    )}
                                </div>

                                {userBankAccounts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <DollarSign className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                        <p className="text-forest-500 dark:text-forest-400">No bank accounts registered</p>
                                        <p className="text-sm text-forest-400 dark:text-forest-500 mt-1">
                                            User hasn't added any bank accounts yet
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {userBankAccounts.map((account: any, index: number) => (
                                            <motion.div
                                                key={account.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="bg-white dark:bg-forest-700 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                            <DollarSign className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-forest-900 dark:text-ivory">
                                                                {account.bankName}
                                                            </h5>
                                                            <p className="text-xs text-forest-600 dark:text-forest-400">
                                                                {account.accountHolderName}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {account.isDefault === 1 && (
                                                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                        {account.isVerified === 1 && (
                                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="bg-gray-50 dark:bg-forest-600 p-3 rounded-lg">
                                                        <label className="text-xs text-forest-500 dark:text-forest-400 block mb-1">
                                                            Account Number
                                                        </label>
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-mono font-bold text-forest-900 dark:text-ivory">
                                                                {account.accountNumber}
                                                            </p>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(account.accountNumber);
                                                                    alert('✅ Account number copied!');
                                                                }}
                                                                className="p-1 hover:bg-gray-200 dark:hover:bg-forest-500 rounded transition-colors"
                                                                title="Copy account number"
                                                            >
                                                                <svg className="w-4 h-4 text-forest-600 dark:text-forest-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50 dark:bg-forest-600 p-3 rounded-lg">
                                                        <label className="text-xs text-forest-500 dark:text-forest-400 block mb-1">
                                                            Account Type
                                                        </label>
                                                        <p className="font-bold text-forest-900 dark:text-ivory capitalize">
                                                            {account.accountType}
                                                        </p>
                                                    </div>

                                                    {account.iban && (
                                                        <div className="col-span-2 bg-gray-50 dark:bg-forest-600 p-3 rounded-lg">
                                                            <label className="text-xs text-forest-500 dark:text-forest-400 block mb-1">
                                                                IBAN
                                                            </label>
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-mono text-sm font-bold text-forest-900 dark:text-ivory">
                                                                    {account.iban}
                                                                </p>
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(account.iban);
                                                                        alert('✅ IBAN copied!');
                                                                    }}
                                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-forest-500 rounded transition-colors"
                                                                    title="Copy IBAN"
                                                                >
                                                                    <svg className="w-4 h-4 text-forest-600 dark:text-forest-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {account.branchCode && (
                                                        <div className="bg-gray-50 dark:bg-forest-600 p-3 rounded-lg">
                                                            <label className="text-xs text-forest-500 dark:text-forest-400 block mb-1">
                                                                Branch Code
                                                            </label>
                                                            <p className="font-mono font-bold text-forest-900 dark:text-ivory">
                                                                {account.branchCode}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="bg-gray-50 dark:bg-forest-600 p-3 rounded-lg">
                                                        <label className="text-xs text-forest-500 dark:text-forest-400 block mb-1">
                                                            Status
                                                        </label>
                                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold capitalize ${account.status === 'active'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                                            }`}>
                                                            {account.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-forest-600">
                                                    <p className="text-xs text-forest-500 dark:text-forest-400">
                                                        Added on {new Date(account.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Account Statistics */}
                            {selectedUser.category && (
                                <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl">
                                    <h4 className="font-bold text-lg text-forest-900 dark:text-ivory mb-3 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-amber-600" />
                                        Additional Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-forest-600 dark:text-forest-400">Category</label>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold capitalize ${selectedUser.category === 'donor'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                }`}>
                                                {selectedUser.category}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="text-sm text-forest-600 dark:text-forest-400">Joined</label>
                                            <p className="font-medium text-forest-900 dark:text-ivory">
                                                {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-6 pt-4 border-t border-forest-200 dark:border-forest-700 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowUserDetails(false);
                                    setSelectedUser(null);
                                    setUserBankAccounts([]);
                                }}
                                className="px-6 py-3 bg-forest-900 dark:bg-mint text-ivory dark:text-forest-900 rounded-xl font-bold hover:bg-forest-800 dark:hover:bg-mint/90 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div >
    );
}
