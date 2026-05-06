import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';
import Layout from '../../components/Layout';
import VideoCard from '../../components/VideoCard';
import { VideoCardSkeletonGrid } from '../../components/Skeleton';
import axios from 'axios';

export default function SubscriptionsPage() {
  const { data: session, status } = useSession();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.accessToken) return;
    async function load() {
      setLoading(true);
      try {
        // Fetch subscriptions list
        const subRes = await axios.get(
          'https://www.googleapis.com/youtube/v3/subscriptions',
          {
            params: { part: 'snippet', mine: true, maxResults: 10 },
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }
        );
        const channelIds = subRes.data.items
          .map((s) => s.snippet.resourceId.channelId)
          .join(',');

        if (!channelIds) return;

        // Fetch latest video from each subscribed channel
        const searchResults = await Promise.all(
          subRes.data.items.map((sub) =>
            axios
              .get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                  part: 'snippet',
                  channelId: sub.snippet.resourceId.channelId,
                  type: 'video',
                  order: 'date',
                  maxResults: 3,
                  key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
                },
              })
              .then((r) => r.data.items)
              .catch(() => [])
          )
        );

        const allVideos = searchResults.flat();
        setVideos(allVideos);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [session]);

  if (status === 'loading') {
    return (
      <Layout>
        <VideoCardSkeletonGrid count={8} />
      </Layout>
    );
  }

  if (!session) {
    return (
      <>
        <Head>
          <title>Subscriptions - SanlY</title>
        </Head>
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-96 text-center">
            <div className="text-7xl mb-6">ðŸ“¬</div>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Don&apos;t miss new videos from your favourite channels
            </h2>
            <p
              className="text-sm mb-6 max-w-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Sign in to see updates from your favourite YouTube channels
            </p>
            <button
              onClick={() => signIn('google')}
              className="flex items-center gap-2 px-6 py-2 rounded-full border font-medium text-sm"
              style={{ borderColor: '#3ea6ff', color: '#3ea6ff' }}
            >
              Sign in
            </button>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Subscriptions - SanlY</title>
      </Head>
      <Layout>
        <h1
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          Subscriptions
        </h1>
        {loading ? (
          <VideoCardSkeletonGrid count={12} />
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((video) => {
              const id =
                typeof video.id === 'object' ? video.id.videoId : video.id;
              return <VideoCard key={id} video={video} />;
            })}
          </div>
        ) : (
          <div
            className="text-center py-20"
            style={{ color: 'var(--text-secondary)' }}
          >
            <p>No recent videos from your subscriptions</p>
          </div>
        )}
      </Layout>
    </>
  );
}
