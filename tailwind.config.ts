import tailwindAnimate from "tailwindcss-animate";
import type { Config } from "tailwindcss";
const config: Config = {
darkMode: ["class"],
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
theme: {
container: {
center: true,
padding: "2rem",
screens: {
"2xl": "1400px",
},
},
extend: {
colors: {
border: "hsl(var(--border))",
input: "hsl(var(--input))",
ring: "hsl(var(--ring))",
background: "hsl(var(--background))",
foreground: "hsl(var(--foreground))",
primary: {
DEFAULT: "hsl(var(--primary))",
foreground: "hsl(var(--primary-foreground))",
},
secondary: {
DEFAULT: "hsl(var(--secondary))",
foreground: "hsl(var(--secondary-foreground))",
},
destructive: {
DEFAULT: "hsl(var(--destructive))",
foreground: "hsl(var(--destructive-foreground))",
},
muted: {
DEFAULT: "hsl(var(--muted))",
foreground: "hsl(var(--muted-foreground))",
},
accent: {
DEFAULT: "hsl(var(--accent))",
foreground: "hsl(var(--accent-foreground))",
},
popover: {
DEFAULT: "hsl(var(--popover))",
foreground: "hsl(var(--popover-foreground))",
},
card: {
DEFAULT: "hsl(var(--card))",
foreground: "hsl(var(--card-foreground))",
},
chart: {
"1": "hsl(var(--chart-1))",
"2": "hsl(var(--chart-2))",
"3": "hsl(var(--chart-3))",
"4": "hsl(var(--chart-4))",
"5": "hsl(var(--chart-5))",
},
sidebar: {
DEFAULT: "hsl(var(--sidebar-background))",
foreground: "hsl(var(--sidebar-foreground))",
primary: "hsl(var(--sidebar-primary))",
"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
accent: "hsl(var(--sidebar-accent))",
"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
border: "hsl(var(--sidebar-border))",
ring: "hsl(var(--sidebar-ring))",
},
// 专业心理测评配色方案 - 增强版
psychology: {
primary: "hsl(217, 91%, 60%)", // 更现代的蓝色主色
primary_light: "hsl(217, 91%, 75%)", // 浅一些的主色
primary_dark: "hsl(217, 91%, 45%)", // 深一些的主色
secondary: "hsl(198, 93%, 50%)", // 清新的蓝绿色辅色
accent: "hsl(276, 88%, 75%)", // 柔和的紫色强调
accent_light: "hsl(276, 88%, 85%)", // 浅紫色
calm: "hsl(208, 25%, 97%)", // 更柔和的冷静背景
warm: "hsl(32, 85%, 96%)", // 更温暖的背景
success: "hsl(142, 76%, 36%)", // 更专业的成功绿
warning: "hsl(35, 85%, 48%)", // 更温暖的警告橙
danger: "hsl(0, 79%, 58%)", // 更柔和的危险红
neutral: "hsl(220, 15%, 95%)", // 中性背景
neutral_dark: "hsl(220, 15%, 85%)", // 深中性色
gradient_1: "hsl(217, 91%, 60%)", // 渐变色1
gradient_2: "hsl(198, 93%, 50%)", // 渐变色2
gradient_3: "hsl(276, 88%, 75%)", // 渐变色3
},
},
borderRadius: {
lg: "var(--radius)",
md: "calc(var(--radius) - 2px)",
sm: "calc(var(--radius) - 4px)",
},
keyframes: {
"accordion-down": {
from: {
height: "0",
},
to: {
height: "var(--radix-accordion-content-height)",
},
},
"accordion-up": {
from: {
height: "var(--radix-accordion-content-height)",
},
to: {
height: "0",
},
},
"fade-in": {
"0%": { opacity: "0", transform: "translateY(20px)" },
"100%": { opacity: "1", transform: "translateY(0)" },
},
"fade-in-up": {
"0%": { opacity: "0", transform: "translateY(30px)" },
"100%": { opacity: "1", transform: "translateY(0)" },
},
"slide-in-right": {
"0%": { opacity: "0", transform: "translateX(50px)" },
"100%": { opacity: "1", transform: "translateX(0)" },
},
"pulse-scale": {
"0%, 100%": { transform: "scale(1)" },
"50%": { transform: "scale(1.05)" },
},
"float": {
"0%, 100%": { transform: "translateY(0px)" },
"50%": { transform: "translateY(-10px)" },
},
"glow": {
"0%, 100%": { boxShadow: "0 0 20px hsl(217, 91%, 60%, 0.3)" },
"50%": { boxShadow: "0 0 30px hsl(217, 91%, 60%, 0.6)" },
},
},
animation: {
"accordion-down": "accordion-down 0.2s ease-out",
"accordion-up": "accordion-up 0.2s ease-out",
"fade-in": "fade-in 0.6s ease-out",
"fade-in-up": "fade-in-up 0.8s ease-out",
"slide-in-right": "slide-in-right 0.5s ease-out",
"pulse-scale": "pulse-scale 2s ease-in-out infinite",
"float": "float 3s ease-in-out infinite",
"glow": "glow 2s ease-in-out infinite",
},
fontFamily: {
sans: ["Inter", "Noto Sans SC", "system-ui", "sans-serif"],
display: ["Inter", "Noto Sans SC", "system-ui", "sans-serif"],
mono: ["JetBrains Mono", "Fira Code", "monospace"],
},
boxShadow: {
'soft': '0 2px 15px -3px hsl(217, 91%, 60%, 0.1), 0 4px 6px -2px hsl(217, 91%, 60%, 0.05)',
'soft-lg': '0 10px 40px -10px hsl(217, 91%, 60%, 0.15), 0 4px 25px -5px hsl(217, 91%, 60%, 0.1)',
'glow': '0 0 20px hsl(217, 91%, 60%, 0.3)',
'glow-lg': '0 0 40px hsl(217, 91%, 60%, 0.4)',
},
},
},
plugins: [tailwindAnimate],
};
export default config;