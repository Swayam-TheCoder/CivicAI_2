import { useState, useCallback, useEffect } from "react";
import { issuesApi } from "../services/api";

export function useIssues(autoLoad = true) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [pagination, setPagination] = useState(null);

  const load = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await issuesApi.list(params);
      setIssues(res.data);
      setPagination(res.pagination);
      return res;
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (autoLoad) load(); }, [autoLoad, load]);

  const vote = useCallback(async (id) => {
    try {
      const res = await issuesApi.vote(id);
      setIssues(prev => prev.map(i =>
        (i._id === id || i.id === id)
          ? { ...i, votes: res.data.votes }
          : i
      ));
      return res.data;
    } catch (err) { setError(err.message); }
  }, []);

  return { issues, loading, error, pagination, load, vote, setIssues };
}

export function useStats() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await issuesApi.stats();
      setStats(res.data);
    } catch (_) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stats, loading, reload: load };
}

export function useMyIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await issuesApi.myReports();
      setIssues(res.data);
    } catch (_) {} finally { setLoading(false); }
  }, []);

  return { issues, loading, load };
}
