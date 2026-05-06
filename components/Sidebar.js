import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  HiHome,
  HiViewGrid,
  HiVideoCamera,
  HiClipboardList,
  HiClock,
  HiThumbUp,
  HiDownload,
  HiFire,
  HiMusicNote,
  HiAcademicCap,
  HiGlobe,
  HiChevronDown,
  HiChevronUp,
  HiCog,
  HiFlag,
  HiQuestionMarkCircle,
  HiInformationCircle,
} from 'react-icons/hi';

const mainLinks = [
  { href: '/', icon: HiHome, label: 'Home' },
  { href: '/shorts', icon: HiViewGrid, label: 'Shorts' },
  { href: '/subscriptions', icon: HiVideoCamera, label: 'Subscriptions' },
];

const libraryLinks = [
  { href: '/history', icon: HiClipboardList, label: 'History' },
  { href: '/playlist', icon: HiClipboardList, label: 'Playlists' },
  { href: '/watch-later', icon: HiClock, label: 'Watch later' },
  { href: '/liked', icon: HiThumbUp, label: 'Liked videos' },
  { href: '/downloads', icon: HiDownload, label: 'Downloads' },
];

const exploreLinks = [
  { href: '/trending', icon: HiFire, label: 'Trending' },
  { href: '/music', icon: HiMusicNote, label: 'Music' },
  { href: '/learning', icon: HiAcademicCap, label: 'Learning' },
  { href: '/news', icon: HiGlobe, label: 'News' },
];

function SidebarSection({ title, links, mini, router }) {
  return (
    <>
      {!mini && title && (
        <p
          className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          {title}
        </p>
      )}
      {links.map((link) => {
        const Icon = link.icon;
        const active = router.pathname === link.href;
        if (mini) {
          return (
            <Link key={link.href} href={link.href} className={`sidebar-mini-item ${active ? 'sidebar-item-active' : ''}`}>
              <Icon size={22} />
              <span style={{ fontSize: 10, lineHeight: 1 }}>{link.label}</span>
            </Link>
          );
        }
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}
          >
            <Icon size={22} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </>
  );
}

export default function Sidebar({ mini }) {
  const router = useRouter();

  return (
    <aside className={`sidebar ${mini ? 'sidebar-mini' : ''}`}>
      <SidebarSection links={mainLinks} mini={mini} router={router} />

      <div className="sidebar-divider" />

      {!mini && <SidebarSection title="Library" links={libraryLinks} mini={mini} router={router} />}
      {mini && <SidebarSection links={libraryLinks} mini={mini} router={router} />}

      {!mini && (
        <>
          <div className="sidebar-divider" />
          <SidebarSection title="Explore" links={exploreLinks} mini={mini} router={router} />
          <div className="sidebar-divider" />
          <div className="px-4 py-2">
            <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              About Press Copyright Contact us Creators Advertise Developers
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              © 2024 SanlY
            </p>
          </div>
        </>
      )}
    </aside>
  );
}
