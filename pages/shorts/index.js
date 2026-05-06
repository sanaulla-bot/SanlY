import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { fetchShorts } from '../../lib/youtube';
import { HiThumbUp, HiShare, HiDotsHorizontal, HiVolumeUp, HiVolumeOff } from 'react-icons/hi';
import { formatViewCount } from '../../lib/youtube';

export default function ShortsPage() {
  const router = useRouter();
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchShorts();
        setShorts(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const itemHeight = containerRef.current.clientHeight;
    const idx = Math.round(scrollTop / itemHeight);
    setCurrentIndex(idx);
  };

  const scrollTo = (idx) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: idx * containerRef.current.clientHeight,
      behavior: 'smooth',
    });
    setCurrentIndex(idx);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Shorts - SanlY</title>
      </Head>
      <Layout hideSidebar={false}>
        <div className="flex justify-center">
          {/* Shorts container */}
          <div className="relative" style={{ width: 390, maxWidth: '100%' }}>
            <div
              ref={containerRef}
              onScroll={handleScroll}
              className="overflow-y-scroll snap-y snap-mandatory"
              style={{
                height: 'calc(100vh - 72px)',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <style>{`div::-webkit-scrollbar{display:none}`}</style>
              {shorts.map((short, idx) => {
                const id =
                  typeof short.id === 'object' ? short.id.videoId : short.id;
                const snippet = short.snippet;
                const isActive = idx === currentIndex;

                return (
                  <div
                    key={id}
                    className="snap-start relative flex items-center justify-center"
                    style={{
                      height: 'calc(100vh - 72px)',
                      background: '#000',
                    }}
                  >
                    {/* YouTube embed */}
                    {isActive ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0${muted ? '&mute=1' : ''}`}
                        title={snippet.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                        }}
                      />
                    ) : (
                      <img
                        src={
                          snippet.thumbnails?.high?.url ||
                          `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
                        }
                        alt={snippet.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}

                    {/* Overlay: title + channel */}
                    <div
                      className="absolute bottom-0 left-0 right-0 p-4"
                      style={{
                        background:
                          'linear-gradient(transparent, rgba(0,0,0,0.75))',
                        pointerEvents: 'none',
                      }}
                    >
                      <p className="text-white font-medium text-sm line-clamp-2">
                        {snippet.title}
                      </p>
                      <p className="text-white text-xs mt-1 opacity-80">
                        @{snippet.channelTitle?.toLowerCase().replace(/\s+/g, '')}
                      </p>
                    </div>

                    {/* Right action buttons */}
                    <div
                      className="absolute right-2 bottom-20 flex flex-col items-center gap-5"
                      style={{ color: '#fff' }}
                    >
                      <button
                        className="flex flex-col items-center gap-1"
                        onClick={() => router.push(`/watch?v=${id}`)}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                          <img
                            src={
                              snippet.thumbnails?.default?.url ||
                              `https://i.ytimg.com/vi/${id}/default.jpg`
                            }
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs">+</span>
                      </button>
                      <button className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                          <HiThumbUp size={22} />
                        </div>
                        <span className="text-xs">Like</span>
                      </button>
                      <button className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                          <HiShare size={22} />
                        </div>
                        <span className="text-xs">Share</span>
                      </button>
                      <button
                        className="flex flex-col items-center gap-1"
                        onClick={() => setMuted(!muted)}
                      >
                        <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                          {muted ? <HiVolumeOff size={22} /> : <HiVolumeUp size={22} />}
                        </div>
                        <span className="text-xs">{muted ? 'Unmute' : 'Mute'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation arrows */}
            {currentIndex > 0 && (
              <button
                onClick={() => scrollTo(currentIndex - 1)}
                className="absolute top-4 right-2 w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white z-10"
              >
                ↑
              </button>
            )}
            {currentIndex < shorts.length - 1 && (
              <button
                onClick={() => scrollTo(currentIndex + 1)}
                className="absolute bottom-4 right-2 w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white z-10"
              >
                ↓
              </button>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
