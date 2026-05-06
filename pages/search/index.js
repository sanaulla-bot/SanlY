import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { VideoCardSkeletonGrid } from '../../components/Skeleton';
import VideoCard from '../../components/VideoCard';
import { searchVideos, formatViewCount } from '../../lib/youtube';
import { formatDistanceToNow } from '../../lib/timeUtils';
import { HiFilter } from 'react-icons/hi';

const FILTERS = ['All', 'Video', 'Channel', 'Playlist', 'Short'];

export default function SearchPage() {
  const router = useRouter();
  const { q } = router.query;

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const loadMoreRef = useRef(null);
  const observerRef = useRef(null);

  const doSearch = useCallback(async (query, pageToken = '', append = false) => {
    if (!query) return;
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const data = await searchVideos(query, pageToken);
      setResults((prev) => (append ? [...prev, ...data.items] : data.items || []));
      setNextPageToken(data.nextPageToken || '');
      setHasMore(!!data.nextPageToken);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (q) {
      setResults([]);
      setNextPageToken('');
      doSearch(q);
    }
  }, [q, doSearch]);

  // Infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading && q) {
          doSearch(q, nextPageToken, true);
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, nextPageToken, q, doSearch]);

  return (
    <>
      <Head>
        <title>{q ? `${q} - SanlY Search` : 'Search - SanlY'}</title>
      </Head>
      <Layout>
        {/* Filter row */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto scrollbar-none pb-2">
          <style>{`.scrollbar-none::-webkit-scrollbar{display:none}`}</style>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`chip flex-shrink-0 ${activeFilter === f ? 'chip-active' : 'chip-inactive'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <VideoCardSkeletonGrid count={8} />
        ) : (
          <div className="flex flex-col gap-4 max-w-3xl">
            {results.map((item) => {
              const id = typeof item.id === 'object' ? item.id.videoId : item.id;
              const snippet = item.snippet;

              // Channel result
              if (typeof item.id === 'object' && item.id.kind === 'youtube#channel') {
                return (
                  <Link
                    key={item.id.channelId}
                    href={`/channel/${item.id.channelId}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-opacity-50"
                    style={{ background: 'var(--hover-bg)' }}
                  >
                    {snippet.thumbnails?.medium?.url ? (
                      <Image
                        src={snippet.thumbnails.medium.url}
                        alt={snippet.title}
                        width={80}
                        height={80}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-purple-700 flex items-center justify-center text-white text-2xl font-bold">
                        {snippet.title?.[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{snippet.title}</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        @{snippet.customUrl || snippet.title?.toLowerCase().replace(/\s+/g, '')}
                      </p>
                      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {snippet.description?.slice(0, 80)}...
                      </p>
                    </div>
                  </Link>
                );
              }

              // Video result (horizontal layout for search)
              return (
                <Link
                  key={id}
                  href={`/watch?v=${id}`}
                  className="flex gap-4 group"
                >
                  <div
                    className="thumbnail-wrapper flex-shrink-0"
                    style={{ width: 240, borderRadius: 12 }}
                  >
                    <img
                      src={
                        snippet.thumbnails?.medium?.url ||
                        `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
                      }
                      alt={snippet.title}
                      className="thumbnail-img"
                      style={{ width: 240, height: 135, objectFit: 'cover', borderRadius: 12 }}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-base font-medium line-clamp-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {snippet.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {formatDistanceToNow(snippet.publishedAt)}
                    </p>
                    <Link
                      href={`/channel/${snippet.channelId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 mt-2"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: '#5b21b6' }}
                      >
                        {snippet.channelTitle?.[0]}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {snippet.channelTitle}
                      </span>
                    </Link>
                    <p
                      className="text-sm mt-2 line-clamp-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {snippet.description}
                    </p>
                  </div>
                </Link>
              );
            })}

            {/* Load more */}
            <div ref={loadMoreRef} className="h-12 flex items-center justify-center">
              {loadingMore && <div className="spinner" />}
            </div>

            {results.length === 0 && !loading && q && (
              <div
                className="text-center py-20"
                style={{ color: 'var(--text-secondary)' }}
              >
                <p className="text-xl mb-2">No results for "{q}"</p>
                <p className="text-sm">
                  Try different keywords or check spelling
                </p>
              </div>
            )}
          </div>
        )}
      </Layout>
    </>
  );
}
