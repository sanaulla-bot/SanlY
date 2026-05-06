import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from '../lib/timeUtils';
import { formatViewCount, parseDuration } from '../lib/youtube';

export default function VideoCard({ video, horizontal = false }) {
  if (!video) return null;

  // Handle both search results (snippet.thumbnails) and video list results
  const snippet = video.snippet || {};
  const id = typeof video.id === 'object' ? video.id.videoId : video.id;
  const thumbnail =
    snippet.thumbnails?.medium?.url ||
    snippet.thumbnails?.default?.url ||
    `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
  const title = snippet.title || '';
  const channelTitle = snippet.channelTitle || '';
  const channelId = snippet.channelId || '';
  const publishedAt = snippet.publishedAt;
  const viewCount = video.statistics?.viewCount;
  const duration = parseDuration(video.contentDetails?.duration);

  if (horizontal) {
    return (
      <Link href={`/watch?v=${id}`} className="flex gap-2 group video-card">
        <div className="thumbnail-wrapper flex-shrink-0 w-40" style={{ borderRadius: 8 }}>
          <Image
            src={thumbnail}
            alt={title}
            width={160}
            height={90}
            className="thumbnail-img"
            style={{ borderRadius: 8 }}
          />
          {duration && <span className="duration-badge">{duration}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium line-clamp-2"
            style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}
          >
            {title}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {channelTitle}
          </p>
          {viewCount && (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {formatViewCount(viewCount)}
              {publishedAt && ` • ${formatDistanceToNow(publishedAt)}`}
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/watch?v=${id}`} className="video-card block">
      <div className="thumbnail-wrapper relative">
        <Image
          src={thumbnail}
          alt={title}
          width={320}
          height={180}
          className="thumbnail-img"
          unoptimized
        />
        {duration && <span className="duration-badge">{duration}</span>}
      </div>
      <div className="flex gap-3 mt-3">
        {/* Channel avatar placeholder */}
        <Link
          href={`/channel/${channelId}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: '#5b21b6' }}
          >
            {channelTitle?.[0]?.toUpperCase() || 'S'}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium line-clamp-2"
            style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}
            title={title}
          >
            {title}
          </p>
          <Link
            href={`/channel/${channelId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs mt-0.5 block hover:underline"
            style={{ color: 'var(--text-secondary)' }}
          >
            {channelTitle}
          </Link>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {viewCount ? `${formatViewCount(viewCount)} • ` : ''}
            {publishedAt ? formatDistanceToNow(publishedAt) : ''}
          </p>
        </div>
      </div>
    </Link>
  );
}
