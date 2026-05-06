import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';
import VideoCard from '../../components/VideoCard';
import { VideoCardSkeletonGrid } from '../../components/Skeleton';
import { fetchHomeVideos } from '../../lib/youtube';
import { HiFire } from 'react-icons/hi';

const TREND_TABS = [
  { id: '0', label: 'Now' },
  { id: '10', label: 'Music' },
  { id: '17', label: 'Sports' },
  { id: '20', label: 'Gaming' },
  { id: '25', label: 'News' },
  { id: '28', label: 'Technology' },
];

export default function TrendingPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('0');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchHomeVideos(activeTab === '0' ? '' : activeTab);
        setVideos(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeTab]);

  return (
    <>
      <Head>
        <title>Trending - SanlY</title>
      </Head>
      <Layout>
        <div className="flex items-center gap-3 mb-6">
          <HiFire size={28} className="text-red-500" />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Trending
          </h1>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b mb-6 overflow-x-auto"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {TREND_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'border-b-2 border-current' : ''
              }`}
              style={{
                color:
                  activeTab === tab.id
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <VideoCardSkeletonGrid count={12} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </Layout>
    </>
  );
}
