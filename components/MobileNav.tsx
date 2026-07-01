'use client';

import Link from 'next/link';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function MobileNav() {
    const pathname = usePathname();

    const links = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/search', icon: Search, label: 'Search' },
        { href: '/checkout', icon: ShoppingCart, label: 'Cart' },
        { href: '/admin/products', icon: User, label: 'Me' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t sm:hidden flex justify-around p-3 pb-safe z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            {links.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                            isActive ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Icon className="h-6 w-6 mb-1" />
                        <span className="text-xs">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
