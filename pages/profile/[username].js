import React from 'react'
import { withAuth } from '../../src/lib/auth'
import Layout from '../../src/components/Layout'
import Box from '../../src/components/Box'
import { ProfileRelationsBoxWrapper } from '../../src/components/ProfileRelations'

function BadgeIcon({ type, count, hasVoted, onToggle }) {
  const icons = { trusty: 'C', cool: 'L', sexy: 'S' }
  const labels = { trusty: 'Confiavel', cool: 'Legal', sexy: 'Sexy' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => onToggle(type)}>
      <span style={{ fontSize: '18px', fontWeight: 'bold', opacity: hasVoted ? 1 : 0.5 }}>{icons[type]}</span>
      <span style={{ fontSize: '12px', fontWeight: hasVoted ? 'bold' : 'normal' }}>{labels[type]}</span>
      <span style={{ fontSize: '12px', background: '#eee', borderRadius: '8px', padding: '2px 6px', marginTop: '4px' }}>{count}</span>
    </div>
  )
}

export default function ProfilePage(props) {
  const { loggedUser, targetUser } = props
  const [loading, setLoading] = React.useState(true)
  const [isFollowing, setIsFollowing] = React.useState(false)
  const [profileData, setProfileData] = React.useState(null)
  const [userInfo, setUserInfo] = React.useState(null)
  const [level, setLevel] = React.useState(null)
  const [devBadges, setDevBadges] = React.useState([])
  const [scraps, setScraps] = React.useState([])
  const [scrapText, setScrapText] = React.useState('')
  const [badges, setBadges] = React.useState({ counts: { trusty: 0, cool: 0, sexy: 0 }, myVotes: { trusty: false, cool: false, sexy: false } })
  const [testimonials, setTestimonials] = React.useState([])
  const [testimonialText, setTestimonialText] = React.useState('')
  const [friends, setFriends] = React.useState([])
  const [communities, setCommunities] = React.useState([])
  const [photos, setPhotos] = React.useState([])
  const [pendingRequest, setPendingRequest] = React.useState(false)
  const [gifts, setGifts] = React.useState([])

  React.useEffect(() => {
    Promise.all([
      fetch(`/api/followers?followerId=${loggedUser}`).then((r) => r.json()),
      fetch(`/api/profile?username=${targetUser}`).then((r) => r.json()),
      fetch(`/api/scraps?receiverId=${targetUser}`).then((r) => r.json()),
      fetch(`/api/badges?receiverId=${targetUser}&loggedUser=${loggedUser}`).then((r) => r.json()),
      fetch(`/api/testimonials?receiverId=${targetUser}`).then((r) => r.json()),
      fetch(`/api/followers?followerId=${targetUser}`).then((r) => r.json()),
      fetch('/api/comunidades').then((r) => r.json()),
      fetch(`/api/albums?ownerId=${targetUser}`).then((r) => r.json()),
      fetch(`/api/gifts?userId=${targetUser}`).then((r) => r.json()),
      fetch('/api/friends').then((r) => r.json()),
    ]).then(([followersData, profileDataRes, scrapsRes, badgesRes, testimonialsRes, friendsRes, comRes, albumsRes, giftsRes, myFriends]) => {
      const follows = followersData.data?.following || []
      setIsFollowing(follows.some((f) => f.followingId === targetUser))
      if (profileDataRes.data) setProfileData(profileDataRes.data)
      if (profileDataRes.user) setUserInfo(profileDataRes.user)
      if (profileDataRes.level) setLevel(profileDataRes.level)
      if (profileDataRes.badges) setDevBadges(profileDataRes.badges)
      if (scrapsRes.data) setScraps(scrapsRes.data)
      if (badgesRes.data) setBadges(badgesRes.data)
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data)
      const localFriends = (friendsRes.data?.following || []).map((f) => ({
        id: f.id,
        login: f.followingId,
        avatar_url: `https://github.com/${f.followingId}.png`,
      }))
      setFriends(localFriends)
      if (comRes.data?.allCommunities) setCommunities(comRes.data.allCommunities)
      const allPhotos = (albumsRes.data || []).flatMap((a) => a.photos || [])
      setPhotos(allPhotos)
      setGifts(giftsRes.data || [])
      const out = (myFriends.data?.outgoing || []).some((r) => r.toId === targetUser)
      setPendingRequest(out)
      setLoading(false)
    })
    if (loggedUser !== targetUser) {
      fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitedId: targetUser }),
      })
    }
  }, [loggedUser, targetUser])

  const handleFollowToggle = () => {
    if (isFollowing) {
      fetch(`/api/followers?followingId=${targetUser}`, { method: 'DELETE' }).then(() => setIsFollowing(false))
    } else {
      fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', toId: targetUser }),
      }).then(() => setPendingRequest(true))
    }
  }

  const handleBadgeToggle = (type) => {
    fetch('/api/badges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: targetUser, badgeType: type }),
    }).then((res) => res.json()).then((data) => {
      setBadges((prev) => {
        const isAdding = data.data.action === 'added'
        return {
          counts: { ...prev.counts, [type]: prev.counts[type] + (isAdding ? 1 : -1) },
          myVotes: { ...prev.myVotes, [type]: isAdding },
        }
      })
    })
  }

  return (
    <Layout
      githubUser={loggedUser}
      right={(
        <>
          <Box>
            <h2 className="smallTitle">Depoimentos ({testimonials.length})</h2>
            <form onSubmit={(e) => {
              e.preventDefault()
              if (!testimonialText) return
              fetch('/api/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: targetUser, text: testimonialText }),
              }).then((res) => res.json()).then((data) => {
                setTestimonials([data.data, ...testimonials])
                setTestimonialText('')
              })
            }}>
              <input type="text" value={testimonialText} onChange={(e) => setTestimonialText(e.target.value)} placeholder="Escreva um depoimento..." />
              <button type="submit">Enviar Depoimento</button>
            </form>
            <ul style={{ listStyle: 'none', marginTop: 12 }}>
              {testimonials.map((t) => (
                <li key={t.id} style={{ background: '#f4f4f4', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px' }}>
                  <strong>{t.senderId}:</strong> "{t.text}"
                </li>
              ))}
            </ul>
          </Box>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">Amigos ({friends.length})</h2>
            <ul>
              {friends.slice(0, 16).map((f) => (
                <li key={f.id}>
                  <a href={`/profile/${f.login}`} title={f.login}>
                    <img src={f.avatar_url} alt={f.login} />
                    <span>{f.login}</span>
                  </a>
                </li>
              ))}
            </ul>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">Comunidades ({communities.length})</h2>
            <ul>
              {communities.slice(0, 16).map((c) => (
                <li key={c.id}>
                  <a href={`/comunidades/${c.id}`} title={c.title}>
                    <img src={c.imageUrl} alt={c.title} />
                    <span>{c.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </ProfileRelationsBoxWrapper>
        </>
      )}
    >
      <Box style={{ background: userInfo?.profileColor || '#fff' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <img src={`https://github.com/${targetUser}.png`} alt="Avatar" style={{ width: 96, height: 96, borderRadius: 8 }} />
          <div>
            <h1 className="title" style={{ marginBottom: 4 }}>{userInfo?.displayName || targetUser} {userInfo?.verified ? '(verificado)' : ''}</h1>
            <p>@{targetUser}</p>
            {userInfo?.mood && <p style={{ fontSize: 12 }}>Humor: {userInfo.mood} {userInfo.statusText && `- ${userInfo.statusText}`}</p>}
            {level && <span style={{ display: 'inline-block', marginTop: 8, background: level.color, color: '#fff', padding: '2px 8px', borderRadius: 99, fontSize: 12 }}>{level.name}</span>}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {devBadges.map((b) => (
                <span key={b.id} title={b.hint} style={{ background: '#EDDAEE', padding: '2px 8px', borderRadius: 99, fontSize: 11 }}>{b.label}</span>
              ))}
            </div>
          </div>
        </div>
        <p style={{ marginTop: 12 }}>{userInfo?.bio || 'Ola, sou um desenvolvedor entusiasta!'}</p>
        <p style={{ fontSize: 12, color: '#666' }}>
          {userInfo?.location || 'Brasil'} | {userInfo?.relationship || 'Solteiro(a)'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
          <BadgeIcon type="trusty" count={badges.counts.trusty} hasVoted={badges.myVotes.trusty} onToggle={handleBadgeToggle} />
          <BadgeIcon type="cool" count={badges.counts.cool} hasVoted={badges.myVotes.cool} onToggle={handleBadgeToggle} />
          <BadgeIcon type="sexy" count={badges.counts.sexy} hasVoted={badges.myVotes.sexy} onToggle={handleBadgeToggle} />
        </div>
        {!loading && loggedUser !== targetUser && (
          <>
            <button onClick={handleFollowToggle} style={{ width: '100%', background: isFollowing || pendingRequest ? '#eee' : '#CE007E', color: isFollowing || pendingRequest ? '#333' : '#fff', border: 0, padding: '8px', borderRadius: '8px' }}>
              {isFollowing ? 'Desfazer amizade' : pendingRequest ? 'Pedido enviado' : 'Adicionar Amigo'}
            </button>
            <a href={`/mensagens?with=${targetUser}`} style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>Enviar recado privado</a>
          </>
        )}
      </Box>
      {profileData && (
        <Box>
          <h2 className="subTitle">Skills e stats do GitHub</h2>
          <p>{profileData.totalStars} estrelas | {profileData.totalRepos} repositorios</p>
          <ul style={{ listStyle: 'none', marginTop: 8 }}>
            {JSON.parse(profileData.reposData || '[]').map((repo) => (
              <li key={repo.name} style={{ background: '#f4f4f4', padding: '8px', borderRadius: '4px', marginBottom: '4px' }}>
                <a href={repo.url} target="_blank" rel="noopener noreferrer">{repo.name}</a>
              </li>
            ))}
          </ul>
        </Box>
      )}
      {gifts.length > 0 && (
        <Box>
          <h2 className="subTitle">Presentes ({gifts.length})</h2>
          {gifts.slice(0, 8).map((g) => (
            <p key={g.id}>{g.giftType} de <a href={`/profile/${g.senderId}`}>{g.senderId}</a></p>
          ))}
        </Box>
      )}
      {photos.length > 0 && (
        <Box>
          <h2 className="subTitle">Fotos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {photos.slice(0, 6).map((p) => (
              <img key={p.id} src={p.imageUrl} alt={p.caption || 'foto'} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
        </Box>
      )}
      <Box>
        <h2 className="subTitle">Scrapbook ({scraps.length})</h2>
        <form onSubmit={(e) => {
          e.preventDefault()
          if (!scrapText) return
          fetch('/api/scraps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverId: targetUser, text: scrapText }),
          }).then((res) => res.json()).then((data) => {
            setScraps([data.data, ...scraps])
            setScrapText('')
          })
        }}>
          <textarea value={scrapText} onChange={(e) => setScrapText(e.target.value)} placeholder="Deixe um recado..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CE007E', marginBottom: '8px', minHeight: '80px' }} />
          <button type="submit">Postar Scrap</button>
        </form>
        <ul style={{ listStyle: 'none', marginTop: 16 }}>
          {scraps.map((scrap) => (
            <li key={scrap.id} style={{ display: 'flex', gap: '12px', padding: '16px 0', borderTop: '1px solid #eee' }}>
              <img src={`https://github.com/${scrap.senderId}.png`} alt={scrap.senderId} style={{ width: 50, height: 50, borderRadius: 8 }} />
              <div>
                <strong><a href={`/profile/${scrap.senderId}`}>{scrap.senderId}</a></strong>
                <small> {new Date(scrap.createdAt).toLocaleString()}</small>
                <p>{scrap.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Box>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  const auth = await withAuth(context)
  if (auth.redirect) return auth
  return {
    props: {
      ...auth.props,
      loggedUser: auth.props.githubUser,
      targetUser: context.query.username,
    },
  }
}
