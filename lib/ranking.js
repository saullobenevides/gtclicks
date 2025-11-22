/**
 * Calculate a ranking score for photos based on multiple metrics
 * Higher score = better ranking
 */
export function calculateRankingScore(foto) {
  const now = new Date();
  const createdAt = new Date(foto.createdAt);
  const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

  // Weight factors
  const weights = {
    views: 1,
    likes: 5,
    downloads: 10,
    recency: 2,
  };

  // Recency score (newer photos get higher score)
  // Decays exponentially: 100% at day 0, 50% at 30 days, ~0% at 90+ days
  const recencyScore = Math.max(0, 100 * Math.exp(-ageInDays / 30));

  // Calculate weighted score
  const score =
    (foto.views || 0) * weights.views +
    (foto.likes || 0) * weights.likes +
    (foto.downloads || 0) * weights.downloads +
    recencyScore * weights.recency;

  return Math.round(score);
}

/**
 * Sort photos by ranking score
 */
export function rankPhotos(photos) {
  return photos
    .map((foto) => ({
      ...foto,
      rankingScore: calculateRankingScore(foto),
    }))
    .sort((a, b) => b.rankingScore - a.rankingScore);
}

/**
 * Get trending photos (high engagement recently)
 */
export function getTrendingPhotos(photos, daysWindow = 7) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - daysWindow * 24 * 60 * 60 * 1000);

  return photos
    .filter((foto) => new Date(foto.createdAt) >= windowStart)
    .sort((a, b) => {
      const scoreA = (a.views || 0) + (a.likes || 0) * 3 + (a.downloads || 0) * 5;
      const scoreB = (b.views || 0) + (b.likes || 0) * 3 + (b.downloads || 0) * 5;
      return scoreB - scoreA;
    });
}
