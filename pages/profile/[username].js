import React from 'react'
import { withAuth } from '../../src/lib/auth'
import Layout from '../../src/components/Layout'
import Box from '../../src/components/Box'
import { ProfileRelationsBoxWrapper } from '../../src/components/ProfileRelations'
import { GIFT_CATALOG, giftMeta } from '../../src/lib/gifts'
import ScrapText, { SmileyBar } from '../../src/components/ScrapText'

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
  const [giftType, setGiftType] = React.useState('coracao')
  const [giftMessage, setGiftMessage] = React.useState('')
  const [isFan, setIsFan] = React.useState(false)
  const [fanCount, setFanCount] = React.useState(0)
  const [hasCrush, setHasCrush] = React.useState(false)
  const [crushMatch, setCrushMatch] = React.useState(false)
  const [replyTo, setReplyTo] = React.useState(null)
  const [privateProfile, setPrivateProfile] = React.useState(false)

  React.useEffect(() => {
    Promise.all([
      fetch(`/api/followers?followerId=${loggedUser}`).then((r) => r.json()),
      fetch(`/api/profile?username=${targetUser}`).then((r) => r.json()),
      fetch(`/api/scraps?receiverId=${targetUser}`).then((r) => r.json()),
      fetch(`/api/badges?receiverId=${targetUser}&loggedUser=${loggedUser}`).then((r) => r.json()),
      fetch(`/api/testimonials?receiverId=${targetUser}`).then((r) => r.json()),
      fetch(`/api/followers?followerId=${targetUser}`).then((r) => r.json()),
      fetch(`/api/members?userId=${targetUser}`).then((r) => r.json()),
      fetch('/api/comunidades').then((r) => r.json()),
      fetch(`/api/albums?ownerId=${targetUser}`).then((r) => r.json()),
      fetch(`/api/gifts?userId=${targetUser}`).then((r) => r.json()),
      fetch('/api/friends').then((r) => r.json()),
      fetch(`/api/fans?userId=${targetUser}`).then((r) => r.json()),
      fetch('/api/crush').then((r) => r.json()),
    ]).then(([followersData, profileDataRes, scrapsRes, badgesRes, testimonialsRes, friendsRes, membershipsRes, comRes, albumsRes, giftsRes, myFriends, fansRes, crushRes]) => {
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
      const mine = (membershipsRes.data || []).map((m) => m.communityId)
      const all = comRes.data?.allCommunities || []
      setCommunities(all.filter((c) => mine.includes(c.id)))
      const allPhotos = (albumsRes.data || []).flatMap((a) => a.photos || [])
      setPhotos(allPhotos)
      setGifts(giftsRes.data || [])
      const out = (myFriends.data?.outgoing || []).some((r) => r.toId === targetUser)
      setPendingRequest(out)
      const fans = fansRes.data?.fans || []
      setFanCount(fans.length)
      setIsFan(fans.some((f) => f.fanId === loggedUser))
      const crush = (crushRes.data?.mine || []).find((c) => c.toId === targetUser)
      setHasCrush(Boolean(crush))
      setCrushMatch(Boolean(crush?.matched))
      if (profileDataRes.user?.privacy === 'friends' && loggedUser !== targetUser && !follows.some((f) => f.followingId === targetUser)) {
        setPrivateProfile(true)
      }
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
            {loggedUser !== targetUser && (
              <form onSubmit={(e) => {
                e.preventDefault()
                if (!testimonialText) return
                fetch('/api/testimonials', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ receiverId: targetUser, text: testimonialText }),
                }).then((res) => res.json()).then(() => {
                  setTestimonialText('')
                  alert('Depoimento enviado. O dono do perfil precisa aprovar para aparecer no mural.')
                })
              }}>
                <input type="text" value={testimonialText} onChange={(e) => setTestimonialText(e.target.value)} placeholder="Escreva um depoimento..." />
                <button type="submit">Enviar depoimento</button>
              </form>
            )}
            <ul style={{ listStyle: 'none', marginTop: 12 }}>
              {testimonials.map((t) => (
                <li key={t.id} style={{ background: '#f4f4f4', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px' }}>
                  <strong>{t.senderId}:</strong> "{t.text}"
                  {!t.isPublic && loggedUser === targetUser && (
                    <div style={{ marginTop: 8 }}>
                      <button type="button" onClick={() => fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', id: t.id }) }).then((r) => r.json()).then((res) => setTestimonials(testimonials.map((item) => item.id === t.id ? res.data : item)))}>Aprovar</button>
                      <button type="button" onClick={() => fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'hide', id: t.id }) }).then(() => setTestimonials(testimonials.filter((item) => item.id !== t.id)))} style={{ marginLeft: 8 }}>Recusar</button>
                    </div>
                  )}
                  {!t.isPublic && loggedUser === targetUser && <p style={{ color: '#888', marginTop: 4 }}>Aguardando aprovacao</p>}
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
          {userInfo?.lastSeen ? ` | visto ${new Date(userInfo.lastSeen).toLocaleString()}` : ''}
          {` | ${fanCount} fas`}
        </p>
        {(userInfo?.whoAmI || userInfo?.lookingFor || userInfo?.interests) && (
          <div style={{ fontSize: 13, marginTop: 8 }}>
            {userInfo.whoAmI && <p><strong>Quem eu sou:</strong> {userInfo.whoAmI}</p>}
            {userInfo.lookingFor && <p><strong>Procurando:</strong> {userInfo.lookingFor}</p>}
            {userInfo.interests && <p><strong>Interesses:</strong> {userInfo.interests}</p>}
            {userInfo.movies && <p><strong>Filmes:</strong> {userInfo.movies}</p>}
            {userInfo.music && <p><strong>Musicas:</strong> {userInfo.music}</p>}
            {userInfo.books && <p><strong>Livros:</strong> {userInfo.books}</p>}
          </div>
        )}
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
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" onClick={() => fetch('/api/fans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ starId: targetUser }) }).then((r) => r.json()).then((res) => { setIsFan(res.action === 'added'); setFanCount((n) => n + (res.action === 'added' ? 1 : -1)) })} style={{ flex: 1, background: isFan ? '#eee' : '#2E7BB4', color: isFan ? '#333' : '#fff', border: 0, padding: 8, borderRadius: 8 }}>{isFan ? 'Deixar de ser fa' : 'Ser fa'}</button>
              <button type="button" onClick={() => fetch('/api/crush', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toId: targetUser }) }).then((r) => r.json()).then((res) => { setHasCrush(res.data && res.data.action !== 'removed'); setCrushMatch(Boolean(res.matched)) })} style={{ flex: 1, background: hasCrush ? '#CE007E' : '#eee', color: hasCrush ? '#fff' : '#333', border: 0, padding: 8, borderRadius: 8 }}>{crushMatch ? 'Match!' : hasCrush ? 'Crush marcado' : 'Crush'}</button>
            </div>
            <button type="button" onClick={() => { if (confirm('Bloquear esta pessoa?')) fetch('/api/block', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ blockedId: targetUser }) }).then(() => window.location.href = '/') }} style={{ width: '100%', marginTop: 8, background: 'transparent', color: '#888', border: 0 }}>Bloquear</button>
            <a href={`/mensagens?with=${targetUser}`} style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>Enviar recado privado</a>
            <form onSubmit={(e) => {
              e.preventDefault()
              fetch('/api/gifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: targetUser, giftType, message: giftMessage }),
              }).then((r) => r.json()).then((res) => {
                if (res.data) setGifts([res.data, ...gifts])
                setGiftMessage('')
              })
            }} style={{ marginTop: 12 }}>
              <p style={{ fontSize: 12, marginBottom: 6 }}>Mandar um presente</p>
              <select value={giftType} onChange={(e) => setGiftType(e.target.value)}>
                {GIFT_CATALOG.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>
              <input value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} placeholder="Mensagem (opcional)" />
              <button type="submit">Presentear</button>
            </form>
          </>
        )}
      </Box>
      {privateProfile && (
        <Box>
          <p>Este perfil e so para amigos. Envie um pedido de amizade para ver o mural completo.</p>
        </Box>
      )}
      {!privateProfile && profileData && (
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
      {!privateProfile && gifts.length > 0 && (
        <Box>
          <h2 className="subTitle">Presentes ({gifts.length})</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {gifts.slice(0, 8).map((g) => {
              const meta = giftMeta(g.giftType)
              return (
                <div key={g.id} style={{ background: meta.color, color: '#fff', padding: '8px 12px', borderRadius: 8, minWidth: 90 }}>
                  <strong>{meta.label}</strong>
                  <p style={{ fontSize: 11 }}>de <a href={`/profile/${g.senderId}`} style={{ color: '#fff' }}>{g.senderId}</a></p>
                </div>
              )
            })}
          </div>
        </Box>
      )}
      {!privateProfile && photos.length > 0 && (
        <Box>
          <h2 className="subTitle">Fotos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {photos.slice(0, 6).map((p) => (
              <img key={p.id} src={p.imageUrl} alt={p.caption || 'foto'} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
        </Box>
      )}
      {!privateProfile && (
      <Box>
        <h2 className="subTitle">Scrapbook ({scraps.length})</h2>
        <form onSubmit={(e) => {
          e.preventDefault()
          if (!scrapText) return
          fetch('/api/scraps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiverId: targetUser, text: scrapText, parentId: replyTo }),
          }).then((res) => res.json()).then((data) => {
            setScraps([data.data, ...scraps])
            setScrapText('')
            setReplyTo(null)
          })
        }}>
          <SmileyBar onPick={(code) => setScrapText((prev) => `${prev} ${code}`)} />
          <textarea value={scrapText} onChange={(e) => setScrapText(e.target.value)} placeholder={replyTo ? 'Respondendo um recado...' : 'Deixe um recado... use :) :D <3'} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CE007E', marginBottom: '8px', minHeight: '80px' }} />
          {replyTo && <button type="button" onClick={() => setReplyTo(null)} style={{ marginRight: 8, background: '#eee', color: '#333' }}>Cancelar resposta</button>}
          <button type="submit">Postar Scrap</button>
        </form>
        <ul style={{ listStyle: 'none', marginTop: 16 }}>
          {scraps.filter((s) => !s.parentId).map((scrap) => (
            <li key={scrap.id} style={{ display: 'flex', gap: '12px', padding: '16px 0', borderTop: '1px solid #eee' }}>
              <img src={`https://github.com/${scrap.senderId}.png`} alt={scrap.senderId} style={{ width: 50, height: 50, borderRadius: 8 }} />
              <div>
                <strong><a href={`/profile/${scrap.senderId}`}>{scrap.senderId}</a></strong>
                <small> {new Date(scrap.createdAt).toLocaleString()}</small>
                <ScrapText text={scrap.text} />
                <button type="button" onClick={() => setReplyTo(scrap.id)} style={{ background: 'transparent', color: '#2E7BB4', border: 0, padding: 0 }}>Responder</button>
                {scraps.filter((r) => r.parentId === scrap.id).map((reply) => (
                  <div key={reply.id} style={{ marginTop: 8, paddingLeft: 8, borderLeft: '2px solid #CE007E' }}>
                    <strong><a href={`/profile/${reply.senderId}`}>{reply.senderId}</a></strong>
                    <p>{reply.text}</p>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </Box>
      )}
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
