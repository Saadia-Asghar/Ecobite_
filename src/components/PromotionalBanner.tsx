import { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';
import { SponsorBanner } from '../data/mockData';

interface PromotionalBannerProps {
    banner: SponsorBanner;
    onClose?: () => void;
}

export default function PromotionalBanner({ banner, onClose }: PromotionalBannerProps) {
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref);
    const hasTrackedImpression = useRef(false);

    useEffect(() => {
        if (isInView) {
            controls.start("visible");

            if (!hasTrackedImpression.current) {
                // Track Impression via API
                fetch(`http://localhost:3002/api/banners/${banner.id}/impression`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }).catch(err => console.error('Failed to track impression:', err));

                hasTrackedImpression.current = true;
            }
        }
    }, [controls, isInView, banner.id]);

    const handleBannerClick = () => {
        // Track Click via API
        fetch(`http://localhost:3002/api/banners/${banner.id}/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }).catch(err => console.error('Failed to track click:', err));
    };

    if (!banner.active) return null;

    const isSidebar = banner.placement === 'sidebar';
    const containerClasses = isSidebar
        ? "w-full mb-6 relative group overflow-hidden"
        : "w-full mb-6 relative group overflow-hidden";

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
                hidden: { opacity: 0, scale: 0.95, y: 20 },
                visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } }
            }}
            className={containerClasses}
        >
            <a
                href={banner.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleBannerClick}
                className={`block relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow ${isSidebar ? 'h-full' : ''}`}
            >
                {banner.type === 'image' && banner.imageUrl ? (
                    <div className={`relative w-full ${isSidebar ? 'aspect-[3/4]' : 'aspect-[4/1]'}`}>
                        <img
                            src={banner.imageUrl}
                            alt={banner.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider">
                            Sponsored
                        </div>
                    </div>
                ) : (
                    <div className={`relative p-6 flex ${isSidebar ? 'flex-col text-center items-center gap-4' : 'items-center justify-between'} bg-gradient-to-r ${banner.backgroundColor || 'from-blue-50 to-blue-100'} dark:from-gray-800 dark:to-gray-700`}>
                        {/* Sponsored Badge */}
                        <div className="absolute top-2 right-2 bg-forest-900/80 dark:bg-ivory/90 text-ivory dark:text-forest-900 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm">
                            Sponsored
                        </div>

                        <div className={`flex ${isSidebar ? 'flex-col items-center gap-3' : 'items-center gap-6'}`}>
                            {banner.logoUrl && (
                                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center p-2 flex-shrink-0">
                                    <img src={banner.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div>
                                <div className={`flex ${isSidebar ? 'flex-col items-center gap-1' : 'items-center gap-2 mb-1'} `}>
                                    <span className="bg-forest-900/10 dark:bg-ivory/20 text-forest-900 dark:text-ivory text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                        Partner
                                    </span>
                                    <h3 className={`font-bold text-forest-900 dark:text-ivory ${isSidebar ? 'text-lg' : 'text-xl'}`}>{banner.content}</h3>
                                </div>
                                <p className={`text-forest-600 dark:text-forest-300 text-sm ${isSidebar ? '' : 'max-w-xl'}`}>
                                    {banner.description}
                                </p>
                            </div>
                        </div>
                        <div className={`${isSidebar ? 'w-full' : 'hidden md:flex'} items-center justify-center gap-2 text-forest-900 dark:text-ivory font-bold text-sm bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors`}>
                            Visit Site <ExternalLink className="w-4 h-4" />
                        </div>
                    </div>
                )}
            </a>
            {onClose && (
                <button
                    onClick={(e) => { e.preventDefault(); onClose(); }}
                    className="absolute top-2 right-2 p-1 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </motion.div>
    );
}
