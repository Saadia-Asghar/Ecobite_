import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, Award, ShieldCheck, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';
import BadgeIcon from './BadgeIcon';

interface ImpactCertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    badge: {
        name: string;
        description: string;
        iconType: 'first-step' | 'helping-hand' | 'food-rescuer' | 'eco-warrior' | 'planet-saver' | 'century-saver';
    };
    stats: {
        co2Saved: number;
        peopleFed: number;
        donations: number;
    };
}

export default function ImpactCertificateModal({ isOpen, onClose, user, badge, stats }: ImpactCertificateModalProps) {
    const [generating, setGenerating] = useState(false);

    if (!isOpen) return null;

    const downloadCertificate = () => {
        setGenerating(true);
        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const width = doc.internal.pageSize.getWidth();
            const height = doc.internal.pageSize.getHeight();

            // Background color
            doc.setFillColor(252, 252, 248); // ivory
            doc.rect(0, 0, width, height, 'F');

            // Emerald Border
            doc.setDrawColor(6, 78, 59); // forest-900
            doc.setLineWidth(2);
            doc.rect(10, 10, width - 20, height - 20);

            // Gold Inner Border
            doc.setDrawColor(180, 150, 50); // Gold
            doc.setLineWidth(0.5);
            doc.rect(13, 13, width - 26, height - 26);

            // Header Icon (Placeholders for design)
            doc.setDrawColor(180, 150, 50);
            doc.setLineWidth(1);
            doc.circle(width / 2, 35, 15);

            // Title
            doc.setTextColor(6, 78, 59); // forest-900
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(36);
            doc.text('CERTIFICATE OF IMPACT', width / 2, 60, { align: 'center' });

            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.text('This official credential recognizes the outstanding environmental contribution of', width / 2, 75, { align: 'center' });

            // User Name
            doc.setFontSize(32);
            doc.setTextColor(180, 150, 50); // Gold
            doc.setFont('times', 'italic');
            doc.text(user?.name || user?.organization || 'EcoBite Hero', width / 2, 95, { align: 'center' });

            doc.setTextColor(6, 78, 59);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'normal');
            doc.text(`For achieving the verified rank of`, width / 2, 110, { align: 'center' });

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.text(badge.name.toUpperCase(), width / 2, 120, { align: 'center' });

            // Environmental Stats Section
            doc.setFillColor(240, 253, 244); // mint-50
            doc.roundedRect(40, 130, width - 80, 35, 5, 5, 'F');

            doc.setTextColor(6, 78, 59);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('VERIFIED SUSTAINABILITY METRICS', width / 2, 138, { align: 'center' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.text(`CO2 Emissions Prevented: ${stats.co2Saved} kg`, 60, 150);
            doc.text(`People Supported: ${stats.peopleFed}`, width / 2, 150, { align: 'center' });
            doc.text(`Total Food Rescues: ${stats.donations}`, width - 60, 150, { align: 'right' });

            // Footer / Verification
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            doc.text(`Issued on ${dateStr} | Verification ID: EB-${Math.random().toString(36).substring(7).toUpperCase()}`, width / 2, 185, { align: 'center' });

            doc.setFontSize(8);
            doc.text('Powered by Azure AI & EcoBite Sustainability Engine', width / 2, 192, { align: 'center' });

            // Corner decorations
            doc.setDrawColor(180, 150, 50);
            doc.line(10, 10, 30, 10);
            doc.line(10, 10, 10, 30);
            doc.line(width - 10, 10, width - 30, 10);
            doc.line(width - 10, 10, width - 10, 30);

            doc.save(`EcoBite_Certificate_${badge.name.replace(/\s+/g, '_')}.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleShare = async () => {
        const shareText = `🌟 Huge Milestone! I've officially been certified as a "${badge.name}" on EcoBite. Together we've saved ${stats.co2Saved}kg of CO2 and provided ${stats.peopleFed} meals. Join the movement! 🌍 #EcoBite #Sustainability #ImagineCup #ZeroWaste`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Verification of Impact - EcoBite',
                    text: shareText,
                    url: window.location.origin
                });
            } catch (err) {
                console.log('Share error:', err);
            }
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Impact summary copied to clipboard! Share it on your favorite platform.');
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-forest-900 rounded-[2rem] w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative border border-white/20"
                >
                    {/* Decorative Background */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-mint rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
                    </div>

                    <div className="p-8 relative">
                        <button
                            onClick={onClose}
                            className="absolute right-6 top-6 p-2 hover:bg-forest-100 dark:hover:bg-forest-800 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-forest-500" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl mb-4">
                                <Award className="w-8 h-8 text-amber-600" />
                            </div>
                            <h2 className="text-3xl font-black text-forest-900 dark:text-ivory">Your Impact Asset</h2>
                            <p className="text-forest-600 dark:text-forest-400">Verified and ready for the world to see</p>
                        </div>

                        {/* Certificate Preview Card */}
                        <div className="bg-ivory dark:bg-forest-800 p-6 rounded-3xl border-4 border-forest-900 dark:border-forest-700 relative mb-8 shadow-inner overflow-hidden">
                            <div className="absolute inset-0 border-[1px] border-amber-500/30 m-2 rounded-[1.5rem]" />

                            <div className="relative z-10 text-center py-4">
                                <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <BadgeIcon type={badge.iconType} size={80} earned={true} />
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                            className="absolute -inset-2 border-2 border-dashed border-amber-500/50 rounded-full"
                                        />
                                    </div>
                                </div>

                                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Impact Certificate</h3>
                                <div className="text-2xl font-serif italic text-forest-900 dark:text-ivory mb-4">
                                    {user?.name || user?.organization || 'EcoBite Hero'}
                                </div>

                                <div className="h-[2px] w-24 bg-forest-900/10 dark:bg-white/10 mx-auto mb-4" />

                                <p className="text-sm text-forest-600 dark:text-forest-400 max-w-sm mx-auto mb-6">
                                    Recognized as a verified <b>{badge.name}</b> for preventing <b>{stats.co2Saved}kg</b> of CO2 emissions.
                                </p>

                                <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-white/50 dark:bg-black/20 rounded-2xl backdrop-blur-sm">
                                    <div className="text-center">
                                        <div className="text-lg font-black text-forest-900 dark:text-ivory">{stats.donations}</div>
                                        <div className="text-[10px] uppercase text-forest-500">Rescues</div>
                                    </div>
                                    <div className="text-center border-x border-forest-100 dark:border-forest-700">
                                        <div className="text-lg font-black text-forest-900 dark:text-ivory">{stats.peopleFed}</div>
                                        <div className="text-[10px] uppercase text-forest-500">Meals</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-black text-forest-900 dark:text-ivory">{stats.co2Saved}<span className="text-[10px] ml-0.5">kg</span></div>
                                        <div className="text-[10px] uppercase text-forest-500">CO2 Saved</div>
                                    </div>
                                </div>
                            </div>

                            {/* Seal */}
                            <div className="absolute bottom-4 right-4 tilt-6">
                                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center border-4 border-amber-600 shadow-lg">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center gap-2 py-4 bg-forest-100 dark:bg-forest-800 text-forest-900 dark:text-ivory rounded-2xl font-bold hover:bg-forest-200 dark:hover:bg-forest-700 transition-all border-2 border-transparent hover:border-forest-300 dark:hover:border-forest-600"
                            >
                                <Share2 className="w-5 h-5" />
                                Share Story
                            </button>
                            <button
                                onClick={downloadCertificate}
                                disabled={generating}
                                className="flex items-center justify-center gap-2 py-4 bg-forest-900 dark:bg-forest-600 text-ivory rounded-2xl font-bold hover:bg-forest-800 dark:hover:bg-forest-500 transition-all shadow-xl shadow-forest-900/20 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                {generating ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Download PDF
                                    </>
                                )}
                            </button>
                        </div>

                        {/* LinkedIn Prompt */}
                        <p className="text-center mt-6 text-xs text-forest-500 flex items-center justify-center gap-2">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Add this verified credential to your LinkedIn profile
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
