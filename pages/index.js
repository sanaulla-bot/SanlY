import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import VideoCard from '../components/VideoCard';
import { VideoCardSkeletonGrid } from '../components/Skeleton';
import { fetchHomeVideos, fetchVideoCategories } from '../lib/youtube';

const ALWAYS_CHIPS = [
  { id: '', title: 'All' },
  { id: '10', title: 'Music' },
  { id: '20', title: 'Gaming' },
  { id: '28', title: 'Science & Tech' },
  { id: '27', title: 'Education' },
  { id: '22', title: 'People & Blogs' },
  { id: '24', title: 'Entertainment' },
  { id: '17', title: 'Sports' },
  { id: '25', title: 'News & Politics' },
  { id: '26', title: 'How-to & Style' },
  { id: '23', title: 'Comedy' },
];

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeChip, setActiveChip] = useState('');
  const [nextPageToken, setNextPageToken] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const loadVideos = useCallback(async (categoryId, pageToken = '', append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const data = await fetchHomeVideos(categoryId, pageToken);
      const items = data.items || [];

      setVideos((prev) => (append ? [...prev, ...items] : items));
      setNextPageToken(data.nextPageToken || '');
      setHasMore(!!data.nextPageToken);
    } catch (err) {
      console.error('Failed to fetch videos:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadVideos(activeChip);
  }, [activeChip, loadVideos]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadVideos(activeChip, nextPageToken, true);
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, nextPageToken, activeChip, loadVideos]);

  const handleChipClick = (chipId) => {
    if (chipId === activeChip) return;
    setActiveChip(chipId);
    setVideos([]);
    setNextPageToken('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>SanlY - Home</title>
      </Head>
      <Layout>
        {/* Filter chips */}
        <div
          className="sticky top-14 z-50 -mx-6 px-6 py-2 flex gap-3 overflow-x-auto scrollbar-none"
          style={{ background: 'var(--bg-primary)' }}
        >
          <style>{`.scrollbar-none::-webkit-scrollbar{display:none}`}</style>
          {ALWAYS_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => handleChipClick(chip.id)}
              className={`chip flex-shrink-0 ${
                chip.id === activeChip ? 'chip-active' : 'chip-inactive'
              }`}
            >
              {chip.title}
            </button>
          ))}
        </div>

        {/* Video grid */}
        <div className="mt-4">
          {loading ? (
            <VideoCardSkeletonGrid count={12} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>

              {/* Load more trigger */}
              <div ref={loadMoreRef} className="h-16 flex items-center justify-center">
                {loadingMore && (
                  <div className="spinner" />
                )}
              </div>

              {videos.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--text-secondary)' }}>
                  <p className="text-lg">No videos found</p>
                  <p className="text-sm mt-2">Try a different category</p>
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </>
  );
}
