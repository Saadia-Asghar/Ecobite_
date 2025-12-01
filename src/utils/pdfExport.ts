import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: typeof autoTable;
    }
}

// Helper function to add header to PDF
const addPDFHeader = (doc: jsPDF, title: string) => {
    doc.setFontSize(20);
    doc.setTextColor(26, 77, 46);
    doc.text('EcoBite Admin Panel', 14, 20);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);

    doc.setDrawColor(26, 77, 46);
    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42);
};

// Helper function to add footer
const addPDFFooter = (doc: jsPDF) => {
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
        doc.text(
            'EcoBite - Food Waste Management System',
            14,
            doc.internal.pageSize.getHeight() - 10
        );
    }
};

// Export Users to PDF
export const exportUsersToPDF = (users: any[], filters?: { search?: string; role?: string }) => {
    const doc = new jsPDF();
    addPDFHeader(doc, 'Users Report');

    let yPos = 50;
    if (filters && (filters.search || filters.role !== 'all')) {
        doc.setFontSize(10);
        doc.text('Filters Applied:', 14, yPos);
        yPos += 6;

        if (filters.search) {
            doc.setFontSize(9);
            doc.text(`• Search: "${filters.search}"`, 20, yPos);
            yPos += 5;
        }
        if (filters.role && filters.role !== 'all') {
            doc.setFontSize(9);
            doc.text(`• Role: ${filters.role}`, 20, yPos);
            yPos += 5;
        }
        yPos += 5;
    }

    doc.setFontSize(11);
    doc.text(`Total Users: ${users.length}`, 14, yPos);
    yPos += 10;

    autoTable(doc, {
        startY: yPos,
        head: [['Name', 'Email', 'Role', 'Organization', 'EcoPoints', 'Location']],
        body: users.map(user => [
            user.name || '-',
            user.email || '-',
            (user.type || '-').toUpperCase(),
            user.organization || '-',
            user.ecoPoints?.toString() || '0',
            user.location || '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [26, 77, 46], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    addPDFFooter(doc);
    doc.save(`EcoBite_Users_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Donations to PDF
export const exportDonationsToPDF = (donations: any[], filter?: string) => {
    const doc = new jsPDF();
    addPDFHeader(doc, 'Donations Report');

    let yPos = 50;
    if (filter && filter !== 'all') {
        doc.setFontSize(10);
        doc.text(`Filter: ${filter} Donations`, 14, yPos);
        yPos += 10;
    }

    doc.setFontSize(11);
    doc.text(`Total Donations: ${donations.length}`, 14, yPos);
    yPos += 10;

    autoTable(doc, {
        startY: yPos,
        head: [['Food Type', 'Quantity', 'Status', 'Quality', 'Date', 'Location']],
        body: donations.map(d => [
            d.aiFoodType || 'Food Item',
            d.quantity || '-',
            d.status || '-',
            `${d.aiQualityScore || 0}%`,
            new Date(d.createdAt).toLocaleDateString(),
            d.location || '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [26, 77, 46] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    addPDFFooter(doc);
    doc.save(`EcoBite_Donations_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Vouchers to PDF
export const exportVouchersToPDF = (vouchers: any[], filter?: string) => {
    const doc = new jsPDF();
    addPDFHeader(doc, 'Vouchers Report');

    let yPos = 50;
    if (filter && filter !== 'all') {
        doc.setFontSize(10);
        doc.text(`Filter: ${filter} Vouchers`, 14, yPos);
        yPos += 10;
    }

    doc.setFontSize(11);
    doc.text(`Total Vouchers: ${vouchers.length}`, 14, yPos);
    yPos += 10;

    autoTable(doc, {
        startY: yPos,
        head: [['Code', 'Title', 'Discount', 'Min Points', 'Redemptions', 'Status', 'Expiry']],
        body: vouchers.map(v => [
            v.code || '-',
            v.title || '-',
            `${v.discountValue}%`,
            v.minEcoPoints?.toString() || '0',
            `${v.currentRedemptions}/${v.maxRedemptions}`,
            v.status || '-',
            new Date(v.expiryDate).toLocaleDateString()
        ]),
        theme: 'striped',
        headStyles: { fillColor: [26, 77, 46] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    addPDFFooter(doc);
    doc.save(`EcoBite_Vouchers_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Transactions to PDF
export const exportTransactionsToPDF = (transactions: any[], filter?: string, balance?: any) => {
    const doc = new jsPDF();
    addPDFHeader(doc, 'Financial Transactions Report');

    let yPos = 50;

    if (balance) {
        doc.setFontSize(12);
        doc.text('Financial Summary:', 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Total Balance: $${balance.totalBalance?.toFixed(2) || '0.00'}`, 20, yPos);
        yPos += 6;
        doc.text(`Total Donations: $${balance.totalDonations?.toFixed(2) || '0.00'}`, 20, yPos);
        yPos += 6;
        doc.text(`Total Withdrawals: $${balance.totalWithdrawals?.toFixed(2) || '0.00'}`, 20, yPos);
        yPos += 10;
    }

    if (filter && filter !== 'all') {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Filter: ${filter} Transactions`, 14, yPos);
        yPos += 8;
    }

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Transactions: ${transactions.length}`, 14, yPos);
    yPos += 10;

    autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Type', 'Amount', 'Category', 'Description']],
        body: transactions.map(t => [
            new Date(t.createdAt).toLocaleDateString(),
            (t.type || '-').toUpperCase(),
            `$${t.amount?.toFixed(2) || '0.00'}`,
            t.category || '-',
            t.description || '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [26, 77, 46] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
            2: { halign: 'right' }
        }
    });

    addPDFFooter(doc);
    doc.save(`EcoBite_Transactions_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Admin Logs to PDF
export const exportLogsToPDF = (logs: any[]) => {
    const doc = new jsPDF();
    addPDFHeader(doc, 'Admin Activity Logs');

    const yPos = 50;
    doc.setFontSize(11);
    doc.text(`Total Log Entries: ${logs.length}`, 14, yPos);

    autoTable(doc, {
        startY: yPos + 10,
        head: [['Date & Time', 'Admin', 'Action', 'Details']],
        body: logs.map(log => [
            new Date(log.createdAt).toLocaleString(),
            log.adminName || 'System',
            log.action.replace(/_/g, ' '),
            log.details || '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [26, 77, 46] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
            0: { cellWidth: 40 },
            3: { cellWidth: 'auto' }
        }
    });

    addPDFFooter(doc);
    doc.save(`EcoBite_Admin_Logs_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export EcoPoints Report to PDF
export const exportEcoPointsToPDF = (users: any[]) => {
    const doc = new jsPDF();
    addPDFHeader(doc, 'EcoPoints Distribution Report');

    const sortedUsers = [...users].sort((a, b) => b.ecoPoints - a.ecoPoints);

    let yPos = 50;
    const totalPoints = users.reduce((sum, u) => sum + (u.ecoPoints || 0), 0);
    const avgPoints = users.length > 0 ? totalPoints / users.length : 0;

    doc.setFontSize(12);
    doc.text('Summary Statistics:', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total EcoPoints: ${totalPoints.toLocaleString()}`, 20, yPos);
    yPos += 6;
    doc.text(`Average per User: ${avgPoints.toFixed(2)}`, 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Badge Distribution:', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Eco Starter (100+): ${users.filter(u => u.ecoPoints >= 100).length} users`, 20, yPos);
    yPos += 6;
    doc.text(`Eco Warrior (500+): ${users.filter(u => u.ecoPoints >= 500).length} users`, 20, yPos);
    yPos += 6;
    doc.text(`Eco Champion (1000+): ${users.filter(u => u.ecoPoints >= 1000).length} users`, 20, yPos);
    yPos += 6;
    doc.text(`Eco Legend (2000+): ${users.filter(u => u.ecoPoints >= 2000).length} users`, 20, yPos);
    yPos += 12;

    autoTable(doc, {
        startY: yPos,
        head: [['Rank', 'Name', 'Role', 'EcoPoints', 'Badge']],
        body: sortedUsers.slice(0, 20).map((user, idx) => {
            let badge = '-';
            if (user.ecoPoints >= 2000) badge = 'Eco Legend';
            else if (user.ecoPoints >= 1000) badge = 'Eco Champion';
            else if (user.ecoPoints >= 500) badge = 'Eco Warrior';
            else if (user.ecoPoints >= 100) badge = 'Eco Starter';

            return [
                `#${idx + 1}`,
                user.name || '-',
                (user.type || '-').toUpperCase(),
                user.ecoPoints?.toLocaleString() || '0',
                badge
            ];
        }),
        theme: 'striped',
        headStyles: { fillColor: [26, 77, 46] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
            0: { halign: 'center', cellWidth: 20 },
            3: { halign: 'right' }
        }
    });

    addPDFFooter(doc);
    doc.save(`EcoBite_EcoPoints_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export Complete Admin Report
export const exportCompleteReportToPDF = (data: {
    users: any[];
    donations: any[];
    vouchers: any[];
    transactions: any[];
    balance: any;
    logs: any[];
}) => {
    const doc = new jsPDF();
    addPDFHeader(doc, 'Complete System Report');

    let yPos = 50;

    doc.setFontSize(14);
    doc.text('Executive Summary', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Users: ${data.users.length}`, 20, yPos);
    yPos += 6;
    doc.text(`Total Donations: ${data.donations.length}`, 20, yPos);
    yPos += 6;
    doc.text(`Active Vouchers: ${data.vouchers.filter(v => v.status === 'active').length}`, 20, yPos);
    yPos += 6;
    doc.text(`Total Transactions: ${data.transactions.length}`, 20, yPos);
    yPos += 6;
    doc.text(`Current Balance: $${data.balance.totalBalance?.toFixed(2) || '0.00'}`, 20, yPos);
    yPos += 6;
    doc.text(`Total EcoPoints: ${data.users.reduce((sum, u) => sum + (u.ecoPoints || 0), 0).toLocaleString()}`, 20, yPos);

    addPDFFooter(doc);
    doc.save(`EcoBite_Complete_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
