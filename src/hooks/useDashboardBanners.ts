import { useState, useEffect } from 'react';
import { SponsorBanner, mockBanners } from '../data/mockData';

type DashboardType = 'individual' | 'restaurant' | 'ngo' | 'shelter' | 'fertilizer' | 'all';

/**
 * Custom hook to fetch active banners for a specific dashboard
 * @param dashboardType - Type of dashboard (individual, restaurant, ngo, shelter, fertilizer, all)
 * @returns Array of active banners for the dashboard
 */
export function useDashboardBanners(dashboardType: DashboardType) {
    const [banners, setBanners] = useState<SponsorBanner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch('http://localhost:3002/api/banners');

                if (response.ok) {
                    const data = await response.json();
                    // Filter banners for this dashboard type
                    const filteredBanners = data.filter((banner: SponsorBanner) =>
                        banner.active &&
                        (banner.targetDashboards?.includes('all') ||
                            banner.targetDashboards?.includes(dashboardType))
                    );
                    setBanners(filteredBanners);
                } else {
                    // Fallback to mock data
                    const filteredBanners = mockBanners.filter(banner =>
                        banner.active &&
                        (banner.targetDashboards?.includes('all') ||
                            banner.targetDashboards?.includes(dashboardType))
                    );
                    setBanners(filteredBanners);
                }
            } catch (error) {
                console.error('Error fetching banners:', error);
                // Fallback to mock data
                const filteredBanners = mockBanners.filter(banner =>
                    banner.active &&
                    (banner.targetDashboards?.includes('all') ||
                        banner.targetDashboards?.includes(dashboardType))
                );
                setBanners(filteredBanners);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, [dashboardType]);

    return { banners, loading };
}
