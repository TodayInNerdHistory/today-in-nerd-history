import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(r => {
      const s = r.data?.session
      if (s?.user) {
        setUser(s.user)
        fetchProfile(s.user.id)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    fetchPosts()

    return () => listener?.subscription?.unsubscribe()
  }, [])

  async function fetchProfile(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (!error) setProfile(data)
  }

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles:author(display_name, avatar_url)')
      .order('created_at', { ascending: false })
    if (!error) setPosts(data)
  }

  async function signUpOrSignIn() {
    setLoading(true)
    const email = prompt('Enter your email for a sign-in link:')
    if (!email) { setLoading(false); return }
    await supabase.auth.signInWithOtp({ email })
    alert('Check your email for sign-in link.')
    setLoading(false)
  }

  async function createProfileIfMissing(user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single().catch(()=>({data:null}))
    if (!data) {
      await supabase.from('profiles').insert({
        id: user.id,
        username: user.email.split('@')[0],
        display_name: user.email.split('@')[0]
      })
      fetchProfile(user.id)
    }
  }

  async function uploadImageAndGetUrl(fileObj) {
    if (!fileObj) return null
    const fileName = `${Date.now()}_${fileObj.name}`
    const { data, error } = await supabase.storage.from('post-images').upload(fileName, fileObj)
    if (error) { console.error(error); return null }
    const publicUrl = supabase.storage.from('post-images').getPublicUrl(data.path).data.publicUrl
    return publicUrl
  }

  async function submitPost() {
    if (!user) return alert('Please sign in first.')
    setLoading(true)
    await createProfileIfMissing(user)
    const imageUrl = await uploadImageAndGetUrl(file)
    const insert = {
      author: user.id,
      content,
      image_url: imageUrl,
      created_at: new Date()
    }
    const { error } = await supabase.from('posts').insert(insert)
    if (error) { alert('Error creating post'); console.error(error) }
    else {
      setContent(''); setFile(null)
      fetchPosts()
    }
    setLoading(false)
  }

  async function likePost(postId) {
    if (!user) return alert('Please sign in to like.')
    await supabase.from('post_likes').upsert({ post_id: postId, user_id: user.id })
  }

  return (
    <div className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl neon">TODAY IN NERD HISTORY</h1>
          <div className="text-sm text-slate-300">Sci-Fi Hologram UI — Feed</div>
        </div>
        <div>
          {user ? (
            <div>
              <div className="text-sm">Signed in as {user.email}</div>
              <button className="mt-2 px-3 py-1 border" onClick={() => supabase.auth.signOut()}>Sign out</button>
            </div>
          ):(
            <button className="px-3 py-1 border" onClick={signUpOrSignIn}>Sign in / Sign up</button>
          )}
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="card p-4 mb-6">
            <h2 className="font-semibold">Create Post</h2>
            <textarea value={content} onChange={e=>setContent(e.target.value)} className="w-full mt-2 p-2 bg-transparent border rounded h-28" placeholder="Write your nerd history..."></textarea>
            <input type="file" onChange={(e)=>setFile(e.target.files[0])} className="mt-2 text-sm"/>
            <div className="mt-3 flex gap-2">
              <button className="px-4 py-2 border" onClick={submitPost} disabled={loading}>Post</button>
            </div>
          </div>

          <div>
            {posts.map(p => (
              <article key={p.id} className="card p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-700"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{p.profiles?.display_name || 'Unknown'}</div>
                        <div className="text-xs text-slate-400">{new Date(p.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-3">{p.content}</div>
                    {p.image_url && <div className="mt-3"><img src={p.image_url} alt="post" className="max-w-full rounded" /></div>}
                    <div className="mt-3 flex gap-3 items-center">
                      <button className="px-2 py-1 border text-xs" onClick={()=>likePost(p.id)}>👍 Like</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside>
          <div className="card p-4 mb-4">
            <h3 className="font-semibold">Today — quick link</h3>
            <p className="text-sm mt-2">Pin your official FB link or daily highlight here.</p>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold">Admin</h3>
            <p className="text-sm mt-2">If your profile role is admin you'll see moderation tools here (coming soon).</p>
          </div>
        </aside>
      </main>
    </div>
  )
}
