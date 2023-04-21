import { EpisodesConteiner } from './animeInfo__body'
import './index.scss'
import { AnimeInfoHeader } from './animeInfo__header'
import { listPageLinks } from '../../utils/listsPagesLinks'
import { Welcome } from './Welcome'
import { Contribute } from './contribute'
import { useAnimeContext } from '../../../contexts/contextHome'
import Icons from '../../../../Icons'
import { AnimeList } from '../../../../../../types'
type Props = {
  anime: AnimeList
}
function LinkToAnilist({ anime }: Props) {
  return (
    <a className="anilist" href={`https://anilist.co/anime/${anime.dataAnilist.id}`} target="_blank" rel="noreferrer">
      <Icons iconName="IconExternalLink" className="anilist__externalLink" />
      <span>Ver en Anilist</span>
      <img className="anilist__img" src="/pages_icons/anilist.svg" alt="anilist icons" />
    </a>
  )
}
function Description({ anime }: Props) {
  return (
    <div className="renderInfo__description">
      <img
        className="renderInfo__description--img"
        src={anime.dataAnilist.coverImage.large}
        alt={anime.dataAnilist.title.romaji}
      />
      <p className="renderInfo__description--title">Descripción:</p>
      <p className="renderInfo__description--body">{anime.dataAnilist.description ?? 'ola'}</p>
    </div>
  )
}

function renderInfo() {
  const { anime, setAnime } = useAnimeContext()
  if (!anime) return <Welcome />
  const list = listPageLinks(anime)
  return (
    <div className="renderInfo">
      <div className="renderInfo__actions">
        <button
          className="renderInfo__actions--close"
          onClick={() => {
            setAnime(undefined)
          }}
        >
          <Icons iconName="IconClose" />
        </button>
        <LinkToAnilist anime={anime} />
      </div>
      <h3 className="renderInfo__title">{anime.dataAnilist.title.romaji}</h3>
      <AnimeInfoHeader anime={anime} />
      <Description anime={anime} />
      <EpisodesConteiner list={list} />
      <Contribute />
    </div>
  )
}
export default renderInfo
