interface BadgeIconProps {
    type: 'first-step' | 'helping-hand' | 'food-rescuer' | 'eco-warrior' | 'planet-saver' | 'century-saver';
    earned?: boolean;
    size?: number;
}

export default function BadgeIcon({ type, earned = false, size = 64 }: BadgeIconProps) {
    const opacity = earned ? 1 : 0.3;

    const badges = {
        'first-step': (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill={earned ? "#10b981" : "#d1d5db"} opacity={opacity} />
                <path d="M32 18C32 18 28 22 28 28C28 34 32 38 32 38C32 38 36 34 36 28C36 22 32 18 32 18Z" fill="white" />
                <ellipse cx="32" cy="40" rx="4" ry="2" fill="#8b4513" />
                <path d="M30 28L32 24L34 28L32 32L30 28Z" fill="#4ade80" />
            </svg>
        ),
        'helping-hand': (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill={earned ? "#f59e0b" : "#d1d5db"} opacity={opacity} />
                <path d="M20 32C20 32 24 28 28 28C30 28 30 30 30 32C30 32 32 30 34 30C36 30 36 32 36 34C36 34 38 32 40 32C42 32 44 34 44 36C44 40 40 44 36 44C32 44 28 40 24 36C22 34 20 32 20 32Z" fill="white" />
            </svg>
        ),
        'food-rescuer': (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill={earned ? "#f97316" : "#d1d5db"} opacity={opacity} />
                <path d="M24 20C24 20 26 18 32 18C38 18 40 20 40 20L42 24H22L24 20Z" fill="white" />
                <rect x="26" y="24" width="12" height="2" fill="white" />
                <ellipse cx="32" cy="36" rx="10" ry="8" fill="white" />
                <circle cx="28" cy="34" r="2" fill="#f97316" />
                <circle cx="36" cy="34" r="2" fill="#f97316" />
                <path d="M28 38C28 38 30 40 32 40C34 40 36 38 36 38" stroke="white" strokeWidth="2" />
            </svg>
        ),
        'eco-warrior': (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill={earned ? "#8b5cf6" : "#d1d5db"} opacity={opacity} />
                <path d="M32 16L36 28L44 28L38 34L40 46L32 40L24 46L26 34L20 28L28 28L32 16Z" fill="white" />
                <path d="M28 32L32 28L36 32" stroke="#8b5cf6" strokeWidth="2" />
            </svg>
        ),
        'planet-saver': (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill={earned ? "#3b82f6" : "#d1d5db"} opacity={opacity} />
                <circle cx="32" cy="32" r="16" fill="#10b981" />
                <path d="M24 28C24 28 28 26 32 28C36 30 38 32 38 32" stroke="white" strokeWidth="2" />
                <path d="M26 36C26 36 30 34 34 36C38 38 40 40 40 40" stroke="white" strokeWidth="2" />
                <circle cx="28" cy="24" r="3" fill="white" />
                <circle cx="36" cy="38" r="2" fill="white" />
            </svg>
        ),
        'century-saver': (
            <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" fill={earned ? "#fbbf24" : "#d1d5db"} opacity={opacity} />
                <text x="32" y="40" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle">100</text>
                <path d="M32 16L34 22L40 22L35 26L37 32L32 28L27 32L29 26L24 22L30 22L32 16Z" fill="white" />
                <path d="M16 32L18 28L22 28L19 25L20 20L16 23L12 20L13 25L10 28L14 28L16 32Z" fill="white" opacity="0.6" />
                <path d="M48 32L50 28L54 28L51 25L52 20L48 23L44 20L45 25L42 28L46 28L48 32Z" fill="white" opacity="0.6" />
            </svg>
        )
    };

    return badges[type];
}
