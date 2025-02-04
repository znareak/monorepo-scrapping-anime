import searchAnime from './searchAnime'
import compareEpisodes from './compareEpisodes'
import animeDB from '../../database/anime.db'
import logger from '../../shared/log'
import { BuildRefreshCacheAnimes } from './setChacheAnime'
import sendNotifications from './pushNotifications'
import { type Scrap } from '../../../../types/ScrapEpisode'
import episodeErrorDb from '../../database/episodeError.db'

async function validateData({ namePage, episodes }: Scrap) {
  let totalAnimesUpdated = 0
  let totalAnilistUpdated = 0
  let animesUpdated: number[] = []
  let totalErrors = 0
  for (const animeScrap of episodes) {
    if (isNaN(animeScrap.episode)) {
      await episodeErrorDb.createOrUpdate({
        ...animeScrap,
        errorCapture: 'NaN element',
        isOpen: true,
        namePage,
        timestamp: Date.now()
      })
      totalErrors += 1
      continue
    }
    const animeSearch = await searchAnime({ title: animeScrap.title, namePage })
    if (animeSearch == null) {
      await episodeErrorDb.createOrUpdate({
        ...animeScrap,
        errorCapture: 'anime not found in the database or anilist',
        isOpen: true,
        namePage,
        timestamp: Date.now()
      })
      totalErrors += 1
      continue
    }
    const anime = await compareEpisodes({ database: animeSearch.database, episodeScrap: animeScrap, namePage })

    if (animeSearch.hasUpdated || anime.hasUpdated) {
      if (animeSearch.hasUpdated) totalAnilistUpdated += 1
      if (anime.hasUpdated) {
        totalAnimesUpdated += 1
        animesUpdated = [anime.database.dataAnilist.id, ...animesUpdated]
      }
      await animeDB.updateOne({ anime: anime.database, filter: { 'dataAnilist.id': anime.database.dataAnilist.id } })
    }
  }
  return {
    totalAnilistUpdated,
    totalAnimesUpdated,
    totalErrors,
    animesUpdated
  }
}

export default async function index(pagesAttacked: Scrap[]) {
  const refreshCacheAnime = await BuildRefreshCacheAnimes()
  const notifications = sendNotifications()
  let hasUpdated = false
  for (const pageScrap of pagesAttacked) {
    const { episodes, namePage } = pageScrap
    const result = await validateData({ namePage, episodes })
    if (result.totalAnimesUpdated > 0) {
      hasUpdated = true
      refreshCacheAnime.set(result.animesUpdated)
      notifications.setAnimesUpdated(result.animesUpdated)
    }
    if (result.totalAnilistUpdated > 0) hasUpdated = true
    await logger.info({
      content: result,
      message: `result of ${namePage}: ${result.totalAnilistUpdated}uA/  ${result.totalAnimesUpdated}uE/ ${result.totalErrors}E / ${episodes.length} `,
      section: 'push notification'
    })
  }
  await refreshCacheAnime.runUpdate(hasUpdated)
  await notifications.run()
  console.log('finished')
}
