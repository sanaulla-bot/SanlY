import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../../components/Layout';
import VideoCard from '../../components/VideoCard';
import { VideoCardSkeletonGrid } from '../../components/Skeleton';
import {
  fetchChannelById,
  fetchChannelVideos,
  formatSubCount,
  subscribeChannel,
  unsubscribeChannel,
  getSubscriptionId,
} from '../../lib/youtube';
import { useSession, signIn } from 'next-auth/react';
import { HiVideoCamera, HiClock, HiInformationCircle } from 'react-icons/hi';

const TABS = ['Videos', 'Shorts', 'About'];

export default function ChannelPage() {
  const router = useRouter();
  const { id: channelId } = router.query;
  const { data: session } = useSession();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [nextPageToken, setNextPageToken] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('Videos');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    if (!channelId) return;
    async function load() {
      setLoading(true);
      try {
        const [channelData, videosData] = await Promise.all([
          fetchChannelById(channelId),
          fetchChannelVideos(channelId),
        ]);
        setChannel(channelData);
        setVideos(videosData.items || []);
        setNextPageToken(videosData.nextPageToken || '');
        setHasMore(!!videosData.nextPageToken);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [channelId]);

  // Check sub status
  useEffect(() => {
    if (!session?.accessToken || !channelId) return;
    async function check() {
      const subId = await getSubscriptionId(session.accessToken, channelId);
      setIsSubscribed(!!subId);
      setSubscriptionId(subId);
    }
    check();
  }, [session, channelId]);

  const loadMore = async () => {
    if (!hasMore || loadingVideos) return;
    setLoadingVideos(true);
    try {
      const data = await fetchChannelVideos(channelId, nextPageToken);
      setVideos((prev) => [...prev, ...(data.items || [])]);
      setNextPageToken(data.nextPageToken || '');
      setHasMore(!!data.nextPageToken);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleSubscribe = async () => {
    if (!session) {
      signIn('google');
      return;
    }
    setSubLoading(true);
    try {
      if (isSubscribed && subscriptionId) {
        await unsubscribeChannel(session.accessToken, subscriptionId);
        setIsSubscribed(false);
        setSubscriptionId(null);
      } else {
        const result = await subscribeChannel(session.accessToken, channelId);
        setIsSubscribed(true);
        setSubscriptionId(result.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubLoading(false);
    }
  };

  if (!channelId) return null;

  const snippet = channel?.snippet || {};
  const stats = channel?.statistics || {};
  const branding = channel?.brandingSettings?.image || {};

  // Transform channel videos to standard video format
  const formattedVideos = videos.map((item) => ({
    id: item.contentDetails?.videoId,
    snippet: item.snippet,
    statistics: item.statistics,
    contentDetails: item.contentDetails,
  }));

  return (
    <>
      <Head>
        <title>{snippet.title ? `${snippet.title} - SanlY` : 'Channel - SanlY'}</title>
      </Head>
      <Layout>
        {loading ? (
          <div>
            <div className="skeleton w-full h-40 rounded-xl mb-4" />
            <div className="flex items-center gap-4 mb-6">
              <div className="skeleton w-20 h-20 rounded-full" />
              <div>
                <div className="skeleton h-6 w-48 rounded mb-2" />
                <div className="skeleton h-4 w-32 rounded" />
              </div>
            </div>
            <VideoCardSkeletonGrid count={8} />
          </div>
        ) : (
          <>
            {/* Banner */}
            <div className="channel-banner mb-4">
              {branding.bannerExternalUrl && (
                <img
                  src={branding.bannerExternalUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Channel info */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6 px-2">
              {snippet.thumbnails?.medium?.url ? (
                <Image
                  src={snippet.thumbnails.medium.url}
                  alt={snippet.title}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0"
                  style={{ background: '#5b21b6' }}
                >
                  {snippet.title?.[0]}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {snippet.title}
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  @{snippet.customUrl?.replace('@', '') || snippet.title?.toLowerCase().replace(/\s+/g, '')}
                  {stats.subscriberCount && ` • ${formatSubCount(stats.subscriberCount)} subscribers`}
                  {stats.videoCount && ` • ${parseInt(stats.videoCount).toLocaleString()} videos`}
                </p>
                {snippet.description && (
                  <p
                    className="text-sm mt-1 line-clamp-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {snippet.description}
                  </p>
                )}
              </div>
              <button
                onClick={handleSubscribe}
                disabled={subLoading}
                className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
              >
                {subLoading ? '...' : isSubscribed ? '✓ Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex border-b mb-6"
              style={{ borderColor: 'var(--border-color)' }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-current'
                      : ''
                  }`}
                  style={{
                    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'Videos' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                  {formattedVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMore}
                      disabled={loadingVideos}
                      className="px-6 py-2 rounded-full text-sm font-medium"
                      style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)' }}
                    >
                      {loadingVideos ? 'Loading...' : 'Load more'}
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'About' && (
              <div className="max-w-2xl">
                <h2 className="text-base font-medium mb-3">Description</h2>
                <p
                  className="text-sm whitespace-pre-line"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {snippet.description || 'No description available.'}
                </p>
                <div className="mt-6">
                  <h2 className="text-base font-medium mb-3">Stats</h2>
                  <div className="flex flex-col gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <p className="text-sm">
                      Joined: {snippet.publishedAt ? new Date(snippet.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                    </p>
                    {stats.viewCount && (
                      <p className="text-sm">
                        {parseInt(stats.viewCount).toLocaleString()} views
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Layout>
    </>
  );
}
