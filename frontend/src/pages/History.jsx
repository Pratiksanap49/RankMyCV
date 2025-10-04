import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getHistorySessions, deleteHistorySession } from './api';

const formatDateTime = (value) => {
    try {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(new Date(value));
    } catch (err) {
        return value;
    }
};

const truncateText = (text, maxLength = 180) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}…`;
};

function History() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState({}); // id -> boolean

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                const response = await getHistorySessions();
                if (!cancelled) {
                    setSessions(response.data || []);
                    setError('');
                }
            } catch (err) {
                console.error('Failed to fetch history', err);
                if (!cancelled) {
                    const message = err.response?.data?.message || 'Unable to load history right now.';
                    setError(message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const hasSessions = useMemo(() => sessions.length > 0, [sessions]);

    const handleDelete = useCallback(async (id) => {
        const confirm = window.confirm('Delete this session? This cannot be undone.');
        if (!confirm) return;

        // optimistic update
        setDeleting((d) => ({ ...d, [id]: true }));
        const prev = sessions;
        setSessions((s) => s.filter((sess) => sess.id !== id));
        try {
            await deleteHistorySession(id);
        } catch (err) {
            console.error('Delete failed', err);
            setSessions(prev); // revert
            const message = err.response?.data?.message || 'Failed to delete session';
            setError(message);
        } finally {
            setDeleting((d) => ({ ...d, [id]: false }));
        }
    }, [sessions]);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-neutral">Ranking history</h1>
                <p className="max-w-2xl text-sm text-neutral/70">
                    Review previous ranking sessions, revisit top candidates, and quickly reopen a report. Sessions are stored securely and scoped to your account.
                </p>
            </header>

            {loading && (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <p className="text-sm text-neutral/60">Fetching your resume ranking sessions…</p>
                </div>
            )}

            {!loading && error && (
                <div className="alert alert-error">
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && !hasSessions && (
                <div className="rounded-3xl border border-dashed border-base-300 bg-base-100 p-12 text-center">
                    <h2 className="text-xl font-semibold text-neutral">No sessions yet</h2>
                    <p className="mt-2 text-sm text-neutral/60">Upload resumes to generate your first ranking session.</p>
                    <div className="mt-6">
                        <button type="button" className="btn btn-primary" onClick={() => navigate('/upload')}>
                            Upload resumes
                        </button>
                    </div>
                </div>
            )}

            {!loading && !error && hasSessions && (
                <div className="grid gap-6 lg:grid-cols-2">
                    {sessions.map((session) => (
                        <article key={session.id} className="card border border-base-300 bg-base-100 shadow-sm hover:border-primary/40 transition-colors">
                            <div className="card-body space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="card-title text-lg text-neutral">Session #{session.id.slice(-6)}</h2>
                                        <p className="text-xs text-neutral/60">Created {formatDateTime(session.createdAt)}</p>
                                    </div>
                                    {session.topCandidate && (
                                        <span className="badge badge-primary badge-outline">
                                            Top: {session.topCandidate.name || 'Candidate'} · {session.topCandidate.finalScore}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 text-sm text-neutral/70">
                                    <div>
                                        <h3 className="font-semibold text-neutral">Job description</h3>
                                        <p>{truncateText(session.jobDescription)}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {(session.requiredKeywords || []).map((keyword) => (
                                            <span key={keyword} className="badge badge-outline border-primary/30 bg-primary/5 text-primary">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-neutral/60 gap-2">
                                    <span>{session.candidateCount} candidate{session.candidateCount === 1 ? '' : 's'}</span>
                                    <div className="flex items-center gap-2">
                                        <button type="button" className="btn btn-sm btn-primary" onClick={() => navigate(`/results/${session.id}`)}>
                                            View results
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-error btn-outline"
                                            disabled={!!deleting[session.id]}
                                            onClick={() => handleDelete(session.id)}
                                        >
                                            {deleting[session.id] ? (
                                                <span className="loading loading-spinner loading-xs" />
                                            ) : (
                                                'Delete'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

export default History;
