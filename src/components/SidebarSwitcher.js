'use client';

import { usePathname } from 'next/navigation';
import LegacySidebar from '@/components/admin/Sidebar';
import TailwindSidebar from '@/components/tailwindcss/Sidebar';

export default function SidebarSwitcher() {
    return <TailwindSidebar />;
}
