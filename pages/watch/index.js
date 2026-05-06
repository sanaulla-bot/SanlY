import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import Layout from '../../components/Layout';
import VideoCard from '../../components/VideoCard';
import { HorizontalVideoSkeleton } from '../../components/Skeleton';
import {
  fetchVideoById,
  fetchRelatedVideos,
  fetchChannelById,
  formatViewCount,
  formatSubCount,
  checkSubscription,
  subscribeChannel,
  unsubscribeChannel,
  getSubscriptionId,
} from '../../lib/youtube';
import { formatDistanceToNow } from '../../lib/timeUtils';
import { HiThumbUp, HiShare, HiDotsHorizontal, HiChevronDown, HiChevronUp } from 'react-icons/hi';

export default function WatchPage() {
  const router = useRouter();
  const { v: videoId } = router.query;
  const { data: session } = useSession();

  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [subLoading, setSubLoading] = useState(false);
  const [showDesc, setShowDesc] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    setLoading(true);
    setVideo(null);
    setRelated([]);

    async function load() {
      try {
        const [videoData, relatedData] = await Promise.all([
          fetchVideoById(videoId),
          fetchRelatedVideos(videoId),
        ]);
        setVideo(videoData);
        setRelated(relatedData);

        if (videoData?.snippet?.channelId) {
          const channelData = await fetchChannelById(videoData.snippet.channelId);
          setChannel(channelData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [videoId]);

  // Check subscription status
  useEffect(() => {
    if (!session?.accessToken || !channel?.id) return;
    async function checkSub() {
      const subId = await getSubscriptionId(session.accessToken, channel.id);
      setIsSubscribed(!!subId);
      setSubscriptionId(subId);
    }
    checkSub();
  }, [session, channel]);

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
        const result = await subscribeChannel(session.accessToken, channel.id);
        setIsSubscribed(true);
        setSubscriptionId(result.id);
      }
    } catch (err) {
      console.error('Subscribe error:', err);
    } finally {
      setSubLoading(false);
    }
  };

  if (!videoId) return null;

  const snippet = video?.snippet || {};
  const stats = video?.statistics || {};
  const channelSnippet = channel?.snippet || {};
  const channelStats = channel?.statistics || {};

  return (
    <>
      <Head>
        <title>{snippet.title ? `${snippet.title} - SanlY` : 'SanlY'}</title>
      </Head>
      <Layout hideSidebar={false}>
        <div className="flex flex-col lg:flex-row gap-6 max-w-screen-2xl mx-auto">
          {/* Main: Video + Info */}
          <div className="flex-1 min-w-0">
            {/* Video Player */}
            <div className="video-player-wrapper">
              {videoId && (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={snippet.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              )}
            </div>

            {/* Video Info */}
            <div className="mt-3">
              {loading ? (
                <div>
                  <div className="skeleton h-6 w-4/5 rounded mb-3" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                </div>
              ) : (
                <>
                  <h1
                    className="text-lg font-semibold leading-snug"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {snippet.title}
                  </h1>

                  {/* Channel row + actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                    {/* Channel info */}
                    <div className="flex items-center gap-3">
                      <Link href={`/channel/${snippet.channelId}`}>
                        {channelSnippet.thumbnails?.default?.url ? (
                          <Image
                            src={channelSnippet.thumbnails.default.url}
                            alt={snippet.channelTitle}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ background: '#5b21b6' }}
                          >
                            {snippet.channelTitle?.[0] || 'S'}
                          </div>
                        )}
                      </Link>
                      <div>
                        <Link
                          href={`/channel/${snippet.channelId}`}
                          className="text-sm font-medium hover:underline"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {snippet.channelTitle}
                        </Link>
                        {channelStats.subscriberCount && (
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {formatSubCount(channelStats.subscriberCount)} subscribers
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleSubscribe}
                        disabled={subLoading}
                        className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''} ml-2`}
                      >
                        {subLoading ? '...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        className="flex items-center gap-2 px-4 h-9 rounded-full text-sm font-medium"
                        style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)' }}
                      >
                        <HiThumbUp size={18} />
                        <span>{stats.likeCount ? formatViewCount(stats.likeCount).replace(' views','') : 'Like'}</span>
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 h-9 rounded-full text-sm font-medium"
                        style={{ background: 'var(--hover-bg)', color: 'var(--text-primary)' }}
                      >
                        <HiShare size={18} />
                        Share
                      </button>
                      <button
                        className="icon-btn"
                        style={{ background: 'var(--hover-bg)' }}
                      >
                        <HiDotsHorizontal size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div
                    className="mt-3 rounded-xl p-3 cursor-pointer"
                    style={{ background: 'var(--hover-bg)' }}
                    onClick={() => setShowDesc(!showDesc)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3 text-sm font-medium">
                        <span>{formatViewCount(stats.viewCount)}</span>
                        <span>{formatDistanceToNow(snippet.publishedAt)}</span>
                      </div>
                      {showDesc ? <HiChevronUp size={18} /> : <HiChevronDown size={18} />}
                    </div>
                    {showDesc && (
                      <p
                        className="text-sm whitespace-pre-line mt-2"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {snippet.description}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar: Related videos */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Up next
            </h3>
            {loading ? (
              <HorizontalVideoSkeleton count={8} />
            ) : (
              <div className="flex flex-col gap-3">
                {related.map((vid) => {
                  const id = typeof vid.id === 'object' ? vid.id.videoId : vid.id;
                  return <VideoCard key={id} video={vid} horizontal />;
                })}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
