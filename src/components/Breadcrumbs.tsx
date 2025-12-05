"use client";

import Link from "next/link";
import { SlideUp } from "./ui/motion";

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <SlideUp>
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6 font-[family-name:var(--font-orbitron)]">
                <Link href="/" className="hover:text-purple-400 transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                </Link>
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {index === items.length - 1 ? (
                            <span className="text-white font-medium text-gradient-animated">{item.label}</span>
                        ) : (
                            <Link href={item.href} className="hover:text-purple-400 transition-colors">
                                {item.label}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>
        </SlideUp>
    );
}
