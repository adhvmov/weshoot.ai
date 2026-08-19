/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#0f1115',
                    800: '#161a20',
                    700: '#1a1d23',
                    600: '#242931',
                }
            }
        },
    },
    plugins: [],
}
