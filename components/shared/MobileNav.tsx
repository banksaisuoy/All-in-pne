'use client';

import Link from 'next/link';
import { Home, ShoppingBag, Radio, ShoppingCart, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Feed', href: '/feed', icon: ShoppingBag },
    { name: 'Live', href: '/live', icon: Radio },
    { name: 'Cart', href: '/checkout', icon: ShoppingCart },
    { name: 'Admin', href: '/admin/products', icon: User },
  ];

  // Hide on admin routes
  if (pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe pt-2 px-2 z-50 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
                key={item.name}
                href={item.href}
                className={clsx(
                    "flex flex-col items-center p-2 rounded-xl transition-all w-16",
                    isActive ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
                )}
            >
              <item.icon className={clsx("w-6 h-6 mb-1", isActive && "fill-current")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
