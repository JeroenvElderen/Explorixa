// src/components/FollowButton.jsx
import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import { supabase } from 'SupabaseClient'

export default function FollowButton({ authorId }) {
  const [currentUserId, setCurrentUserId] = useState(null)
  const [isFollowing,   setIsFollowing]   = useState(false)
  const [loadingUser,   setLoadingUser]   = useState(true)
  const [loadingStatus, setLoadingStatus] = useState(false)

  // 1) grab the current user's ID
  useEffect(() => {
    let mounted = true
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (!mounted) return
        setCurrentUserId(user?.id ?? null)
      })
      .finally(() => {
        if (mounted) setLoadingUser(false)
      })
    return () => { mounted = false }
  }, [])

  // 2) check follow‐status whenever we know both IDs
  useEffect(() => {
    if (!currentUserId || !authorId) return
    setLoadingStatus(true)
    supabase
      .from('follows')
      .select('*', { head: true, count: 'exact' })
      .eq('follower_id', currentUserId)
      .eq('followee_id', authorId)
      .then(({ count, error }) => {
        if (!error) setIsFollowing(count > 0)
      })
      .finally(() => setLoadingStatus(false))
  }, [currentUserId, authorId])

  // 3) toggle follow/unfollow
  const toggleFollow = async () => {
    if (!currentUserId) return alert('Please log in to follow users.')
    if (loadingStatus) return

    // optimistic update
    setLoadingStatus(true)
    setIsFollowing(f => !f)

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .match({ follower_id: currentUserId, followee_id: authorId })
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, followee_id: authorId })
    }

    setLoadingStatus(false)
  }

  // only hide while we don't know if it's our own profile yet
  if (loadingUser || currentUserId === authorId) return null

  return (
    <Button
      size="small"
      variant={isFollowing ? 'outlined' : 'contained'}
      onClick={toggleFollow}
      disabled={loadingStatus}
      sx={{ ml: 1 }}            // a little left‑margin so it doesn’t jam up
    >
      {loadingStatus ? '…' : isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  )
}
