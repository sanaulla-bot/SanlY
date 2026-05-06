import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext';
import {
  HiMenu,
  HiSearch,
  HiMicrophone,
  HiBell,
  HiVideoCamera,
  HiSun,
  HiMoon,
  HiLogout,
  HiUser,
} from 'react-icons/hi';

export default function Navbar({ onMenuClick }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isDark, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Prefill search query from URL
  useEffect(() => {
    if (router.query.q) setQuery(router.query.q);
  }, [router.query.q]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSearch(false);
    }
  };

  return (
    <nav className="navbar">
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button className="icon-btn" onClick={onMenuClick} aria-label="Menu">
          <HiMenu size={22} />
        </button>
        <Link href="/" className="flex items-center gap-1 ml-1">
          <img
            src="/logo.png"
            alt="SanlY"
            className="h-8 w-auto"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <span
            style={{ display: 'none', fontWeight: 700, fontSize: 20, letterSpacing: '-0.5px' }}
          >
            <span style={{ color: '#5b21b6' }}>Sanl</span>
            <span style={{ color: '#1e3a5f' }}>Y</span>
          </span>
        </Link>
      </div>

      {/* Center: Search bar (desktop) */}
      <div className="hidden md:flex flex-1 justify-center px-4">
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search"
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <HiSearch size={20} />
          </button>
        </form>
        <button className="icon-btn ml-2 tooltip" data-tip="Search with your voice">
          <HiMicrophone size={20} />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Mobile search toggle */}
        <button
          className="icon-btn md:hidden"
          onClick={() => setShowSearch(!showSearch)}
          aria-label="Search"
        >
          <HiSearch size={22} />
        </button>

        {/* Theme toggle */}
        <button className="icon-btn tooltip" data-tip={isDark ? 'Light mode' : 'Dark mode'} onClick={toggleTheme}>
          {isDark ? <HiSun size={22} /> : <HiMoon size={22} />}
        </button>

        {session ? (
          <>
            <button className="icon-btn tooltip" data-tip="Create">
              <HiVideoCamera size={22} />
            </button>
            <button className="icon-btn tooltip" data-tip="Notifications">
              <HiBell size={22} />
            </button>
            {/* Avatar with dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name}
                    width={32}
                    height={32}
                    className="avatar cursor-pointer"
                  />
                ) : (
                  <div className="avatar flex items-center justify-center bg-purple-700 text-white font-bold">
                    {session.user.name?.[0]}
                  </div>
                )}
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    {session.user.image && (
                      <Image src={session.user.image} alt="" width={40} height={40} className="rounded-full" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{session.user.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{session.user.email}</p>
                    </div>
                  </div>
                  <button className="dropdown-item w-full" onClick={toggleTheme}>
                    {isDark ? <HiSun size={18} /> : <HiMoon size={18} />}
                    {isDark ? 'Light mode' : 'Dark mode'}
                  </button>
                  <button
                    className="dropdown-item w-full"
                    onClick={() => signOut()}
                  >
                    <HiLogout size={18} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium"
            style={{
              borderColor: '#3ea6ff',
              color: '#3ea6ff',
            }}
          >
            <HiUser size={18} />
            <span className="hidden sm:inline">Sign in</span>
          </button>
        )}
      </div>

      {/* Mobile search bar */}
      {showSearch && (
        <div className="absolute top-full left-0 right-0 p-3 md:hidden" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
          <form onSubmit={handleSearch} className="search-bar w-full max-w-full">
            <input
              type="text"
              className="search-input"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="search-btn">
              <HiSearch size={20} />
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}
