import { useEffect, useRef, useState } from 'react';

export function useTaskData({ api, filters }) {
  const [snapshot, setSnapshot] = useState({ tasks: [], categories: [], meta: { total: 0 } });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [pending, setPending] = useState(false);

  // Актуальные фильтры без перезапуска эффектов при каждой операции.
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const seqRef = useRef(0);
  const loadControllerRef = useRef(null);
  const mutationControllerRef = useRef(null);
  const pendingRef = useRef(false);
  const mountedRef = useRef(true);

  // Отслеживание монтирования и отмена мутации при размонтировании.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      mutationControllerRef.current?.abort();
    };
  }, []);

  async function loadCurrent() {
    const seq = ++seqRef.current;
    const controller = new AbortController();
    loadControllerRef.current?.abort();
    loadControllerRef.current = controller;

    setStatus('loading');
    setError(null);

    try {
      const data = await api.loadInitialData(filtersRef.current, { signal: controller.signal });
      if (!mountedRef.current || seq !== seqRef.current) return;
      setSnapshot(data);
      setStatus('ready');
    } catch (err) {
      if (!mountedRef.current || seq !== seqRef.current) return;
      if (err?.kind === 'aborted' || err?.name === 'AbortError') return;
      setError(err);
      setStatus('error');
    }
  }

  // Реакция на смену filters; cleanup отменяет устаревший GET.
  useEffect(() => {
    loadCurrent();
    return () => { loadControllerRef.current?.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, filters]);

  async function runMutation(action) {
    if (pendingRef.current) return false;
    pendingRef.current = true;
    if (mountedRef.current) {
      setPending(true);
      setMutationError(null);
    }

    const controller = new AbortController();
    mutationControllerRef.current = controller;

    try {
      await action(controller.signal);
      if (!mountedRef.current) return false;
      // После успеха всегда перечитываем список с актуальными фильтрами.
      await loadCurrent();
      return true;
    } catch (err) {
      if (!mountedRef.current) return false;
      if (err?.kind === 'aborted' || err?.name === 'AbortError') return false;
      setMutationError(err);
      return false;
    } finally {
      pendingRef.current = false;
      if (mountedRef.current) {
        setPending(false);
        mutationControllerRef.current = null;
      }
    }
  }

  function refresh() {
    return loadCurrent();
  }

  function saveTask(id, value) {
    return runMutation(signal => id === null
      ? api.createTask(value, { signal })
      : api.updateTask(id, value, { signal }));
  }

  function toggleTask(task) {
    return runMutation(signal => api.setTaskCompleted(task.id, !task.completed, { signal }));
  }

  function deleteTask(id) {
    return runMutation(signal => api.deleteTask(id, { signal }));
  }

  function resetData() {
    return runMutation(signal => api.resetDemoData({ signal }));
  }

  return {
    snapshot,
    status,
    error,
    mutationError,
    pending,
    refresh,
    saveTask,
    toggleTask,
    deleteTask,
    resetData,
  };
}
