import axios from 'axios';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = process.env.YOUTUBE_API_KEY;

const youtube = axios.create({
  baseURL: BASE_URL,
  params: {
    key: API_KEY,
  },
});

// Format view count: 1200000 -> "1.2M views"
export function formatViewCount(count) {
  if (!count) return '0 views';
  const n = parseInt(count);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B views`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

// Format subscriber count
export function formatSubCount(count) {
  if (!count) return '0';
  const n = parseInt(count);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

// Parse ISO 8601 duration to "H:MM:SS" or "M:SS"
export function parseDuration(iso) {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Fetch home feed videos by category
export async function fetchHomeVideos(categoryId = '', pageToken = '') {
  const params = {
    part: 'snippet,contentDetails,statistics',
    chart: 'mostPopular',
    regionCode: 'BD',
    maxResults: 24,
    hl: 'en',
  };
  if (categoryId) params.videoCategoryId = categoryId;
  if (pageToken) params.pageToken = pageToken;

  const res = await youtube.get('/videos', { params });
  return res.data;
}

// Fetch video categories
export async function fetchVideoCategories() {
  const res = await youtube.get('/videoCategories', {
    params: {
      part: 'snippet',
      regionCode: 'BD',
      hl: 'en',
    },
  });
  return res.data.items;
}

// Search videos
export async function searchVideos(query, pageToken = '', type = 'video') {
  const res = await youtube.get('/search', {
    params: {
      part: 'snippet',
      q: query,
      type,
      maxResults: 20,
      pageToken: pageToken || undefined,
    },
  });
  return res.data;
}

// Fetch single video details
export async function fetchVideoById(videoId) {
  const res = await youtube.get('/videos', {
    params: {
      part: 'snippet,contentDetails,statistics',
      id: videoId,
    },
  });
  return res.data.items[0];
}

// Fetch related videos
export async function fetchRelatedVideos(videoId) {
  const res = await youtube.get('/search', {
    params: {
      part: 'snippet',
      relatedToVideoId: videoId,
      type: 'video',
      maxResults: 15,
    },
  });
  return res.data.items;
}

// Fetch channel details
export async function fetchChannelById(channelId) {
  const res = await youtube.get('/channels', {
    params: {
      part: 'snippet,statistics,brandingSettings',
      id: channelId,
    },
  });
  return res.data.items[0];
}

// Fetch channel videos
export async function fetchChannelVideos(channelId, pageToken = '') {
  // Get uploads playlist ID first
  const channelRes = await youtube.get('/channels', {
    params: {
      part: 'contentDetails',
      id: channelId,
    },
  });
  const uploadsPlaylistId =
    channelRes.data.items[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) return { items: [], nextPageToken: null };

  const res = await youtube.get('/playlistItems', {
    params: {
      part: 'snippet,contentDetails',
      playlistId: uploadsPlaylistId,
      maxResults: 24,
      pageToken: pageToken || undefined,
    },
  });

  // Get video stats
  const videoIds = res.data.items.map((i) => i.contentDetails.videoId).join(',');
  const statsRes = await youtube.get('/videos', {
    params: {
      part: 'statistics,contentDetails',
      id: videoIds,
    },
  });

  const statsMap = {};
  statsRes.data.items.forEach((v) => {
    statsMap[v.id] = { statistics: v.statistics, contentDetails: v.contentDetails };
  });

  const enriched = res.data.items.map((item) => {
    const vid = item.contentDetails.videoId;
    return {
      ...item,
      statistics: statsMap[vid]?.statistics || {},
      contentDetails: statsMap[vid]?.contentDetails || {},
    };
  });

  return { items: enriched, nextPageToken: res.data.nextPageToken };
}

// Fetch Shorts (vertical short videos)
export async function fetchShorts(pageToken = '') {
  const res = await youtube.get('/search', {
    params: {
      part: 'snippet',
      q: '#shorts',
      type: 'video',
      videoDuration: 'short',
      maxResults: 18,
      pageToken: pageToken || undefined,
      order: 'viewCount',
      regionCode: 'BD',
    },
  });
  return res.data;
}

// Check subscription status (requires OAuth token)
export async function checkSubscription(accessToken, channelId) {
  try {
    const res = await axios.get(`${BASE_URL}/subscriptions`, {
      params: {
        part: 'snippet',
        mine: true,
        forChannelId: channelId,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data.items.length > 0;
  } catch {
    return false;
  }
}

// Subscribe to channel
export async function subscribeChannel(accessToken, channelId) {
  const res = await axios.post(
    `${BASE_URL}/subscriptions`,
    {
      snippet: {
        resourceId: {
          kind: 'youtube#channel',
          channelId,
        },
      },
    },
    {
      params: { part: 'snippet' },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data;
}

// Unsubscribe from channel
export async function unsubscribeChannel(accessToken, subscriptionId) {
  await axios.delete(`${BASE_URL}/subscriptions`, {
    params: { id: subscriptionId },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// Get subscription ID for a channel
export async function getSubscriptionId(accessToken, channelId) {
  const res = await axios.get(`${BASE_URL}/subscriptions`, {
    params: {
      part: 'snippet',
      mine: true,
      forChannelId: channelId,
    },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data.items[0]?.id || null;
}

export default youtube;
