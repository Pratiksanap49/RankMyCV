/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {

                sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        themes: [
            {
                rankmycv: {
                    primary: '#1E3A8A', // deep professional blue
                    'primary-content': '#ffffff',
                    secondary: '#334155', // slate for secondary actions
                    accent: '#0EA5E9', // refined cyan accent
                    neutral: '#1e293b',
                    'base-100': '#ffffff',
                    'base-200': '#f1f5f9',
                    'base-300': '#e2e8f0',
                    info: '#0ea5e9',
                    success: '#16a34a',
                    warning: '#d97706',
                    error: '#dc2626',
                },
            },
        ],
    },
};