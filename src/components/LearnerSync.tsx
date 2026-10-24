import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { networkClient } from '../lib/network';
import { clearMembership, fetchMembership, loadMembership, saveMembership, syncLearnerProgress } from '../lib/cohorts';

// Keeps the learner's cohort access honest and their progress summary current.
// Renders nothing. If staff removed the learner or the session belongs to someone
// else, access is revoked and the learner goes back to the student sign-in.
export function LearnerSync() {
  const navigate = useNavigate();
  const { userProfile } = useApp();
  const verifiedUser = useRef<string | null>(null);
  const profileRef = useRef(userProfile);
  profileRef.current = userProfile;

  useEffect(() => {
    const membership = loadMembership();
    if (!networkClient || !membership) return;
    let alive = true;
    networkClient.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      const user = data.session?.user;
      if (!user || user.id !== membership.userId) {
        clearMembership();
        navigate('/student', { replace: true });
        return;
      }
      try {
        const fresh = await fetchMembership(user.id);
        if (!alive) return;
        if (!fresh) {
          clearMembership();
          navigate('/student', { replace: true });
          return;
        }
        saveMembership(fresh);
        verifiedUser.current = user.id;
        syncLearnerProgress(user.id, profileRef.current).catch(() => undefined);
      } catch {
        // Offline or a temporary API error: keep the cached access.
        verifiedUser.current = user.id;
      }
    });
    return () => {
      alive = false;
    };
  }, [navigate]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const userId = verifiedUser.current;
      if (userId) syncLearnerProgress(userId, userProfile).catch(() => undefined);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [userProfile]);

  return null;
}
