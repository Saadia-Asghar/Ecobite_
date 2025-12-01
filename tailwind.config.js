/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                forest: {
                    50: '#f2f7f4',
                    100: '#e1efe6',
                    200: '#c5dfcd',
                    300: '#9cc5aa',
                    400: '#6fa382',
                    500: '#4d8562',
                    600: '#38694a',
                    700: '#2d543d',
                    800: '#254333',
                    900: '#1a4d2e', // Deep Green from PRD
                    950: '#0e2a1a',
                },
                ivory: {
                    DEFAULT: '#fdfbf7',
                    100: '#fdfbf7',
                    200: '#f7f3e8',
                },
                mint: {
                    DEFAULT: '#e8f5e9',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
