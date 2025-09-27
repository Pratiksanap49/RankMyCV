// src/pages/Results.jsx
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from './api';

const scoreClasses = (score) => {
	if (score >= 80) return 'badge-success';
	if (score >= 60) return 'badge-warning';
	return 'badge-error';
};

function Results() {
	const navigate = useNavigate();
	const location = useLocation();
	const ranking = location.state?.ranking;
	const originals = location.state?.originals || [];
	const [downloading, setDownloading] = useState(false);
	const createdAt = useMemo(() => {
		if (!ranking?.createdAt) return null;
		try {
			return new Intl.DateTimeFormat(undefined, {
				dateStyle: 'medium',
				timeStyle: 'short',
			}).format(new Date(ranking.createdAt));
		} catch (err) {
			console.error('Failed to format date', err);
			return ranking.createdAt;
		}
	}, [ranking]);

	const originalFileMap = useMemo(() => {
		const map = new Map();
		originals.forEach((entry) => {
			if (!entry) return;
			const id = entry.id || entry.sourceId || entry.name || entry.file?.name;
			const file = entry.file ?? entry;
			if (id && file) {
				map.set(id, file);
			}
		});
		return map;
	}, [originals]);

	const summary = useMemo(() => {
		if (!ranking?.cvs?.length) return null;
		const count = ranking.cvs.length;
		const topCandidate = ranking.cvs.reduce((best, current) => (
			current.finalScore > (best?.finalScore ?? -Infinity) ? current : best
		), null);
		const totals = ranking.cvs.reduce((acc, cv) => {
			acc.final += cv.finalScore;
			acc.semantic += cv.semanticScore;
			acc.keyword += cv.keywordScore;
			return acc;
		}, { final: 0, semantic: 0, keyword: 0 });
		return {
			count,
			topCandidate,
			averageFinal: (totals.final / count).toFixed(1),
			averageSemantic: Math.round(totals.semantic / count),
			averageKeyword: Math.round(totals.keyword / count),
		};
	}, [ranking]);

	const downloadReport = useCallback(async (format) => {
		if (!ranking?.sessionId) return;
		setDownloading(true);
		const extension = format === 'csv' ? 'csv' : 'pdf';

		try {
			const response = await API.get(`/results/${ranking.sessionId}/export/${extension}`, {
				responseType: 'blob',
			});

			const blob = new Blob([response.data], { type: extension === 'csv' ? 'text/csv' : 'application/pdf' });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `rankmycv-session-${ranking.sessionId}.${extension}`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
		} catch (err) {
			console.error('Failed to download report', err);
		} finally {
			setDownloading(false);
		}
	}, [ranking]);

	const downloadCV = useCallback((cv) => {
		if (!cv) return;
		const original = cv.sourceId ? originalFileMap.get(cv.sourceId) : null;

		try {
			if (original) {
				const blobUrl = URL.createObjectURL(original);
				const link = document.createElement('a');
				link.href = blobUrl;
				link.download = original.name || cv.cvName || 'candidate_cv';
				document.body.appendChild(link);
				link.click();
				link.remove();
				URL.revokeObjectURL(blobUrl);
				return;
			}

			if (cv.cvText) {
				const textBlob = new Blob([cv.cvText], { type: 'text/plain;charset=utf-8' });
				const textUrl = URL.createObjectURL(textBlob);
				const link = document.createElement('a');
				const sanitizedName = (cv.cvName || 'candidate_cv').replace(/\.[^/.]+$/, '');
				link.href = textUrl;
				link.download = `${sanitizedName}-extracted.txt`;
				document.body.appendChild(link);
				link.click();
				link.remove();
				URL.revokeObjectURL(textUrl);
			}
		} catch (err) {
			console.error('Failed to download CV', err);
		}
	}, [originalFileMap]);

	if (!ranking) {
		return (
			<div className="max-w-4xl mx-auto text-center space-y-4">
				<h1 className="text-3xl font-bold text-neutral">No ranking available yet</h1>
				<p className="text-sm text-neutral/70">Start by uploading resumes and running a new analysis.</p>
				<button type="button" className="btn btn-primary" onClick={() => navigate('/upload')}>
					Go to upload
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold text-neutral">Ranking overview</h1>
					{createdAt && <p className="text-sm text-neutral/60">Session created {createdAt}</p>}
					<div>
						<h2 className="text-sm font-semibold uppercase tracking-wide text-neutral/50">Required keywords</h2>
						<div className="mt-2 flex flex-wrap gap-2 text-xs">
							{ranking.requiredKeywords.map((keyword) => (
								<span key={keyword} className="badge badge-outline border-primary/40 bg-primary/5 text-primary">
									{keyword}
								</span>
							))}
						</div>
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					<button type="button" className="btn btn-outline btn-sm" onClick={() => downloadReport('csv')} disabled={downloading}>
						{downloading ? 'Preparing…' : 'Download CSV'}
					</button>
					<button type="button" className="btn btn-outline btn-sm" onClick={() => downloadReport('pdf')} disabled={downloading}>
						{downloading ? 'Preparing…' : 'Download PDF'}
					</button>
				</div>
			</div>

			{summary && (
				<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
					<article className="rounded-2xl border border-primary/40 bg-primary/10 p-5 shadow-sm">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-primary/80">Top candidate</h3>
						<p className="mt-2 text-lg font-semibold text-primary">{summary.topCandidate?.cvName || '—'}</p>
						{summary.topCandidate && (
							<p className="text-xs text-primary/70">Final score {summary.topCandidate.finalScore}</p>
						)}
					</article>
					<article className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-neutral/50">Total candidates</h3>
						<p className="mt-2 text-2xl font-bold text-neutral">{summary.count}</p>
					</article>
					<article className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-neutral/50">Average final score</h3>
						<p className="mt-2 text-2xl font-bold text-neutral">{summary.averageFinal}</p>
					</article>
					<article className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-neutral/50">Avg semantic score</h3>
						<p className="mt-2 text-2xl font-bold text-neutral">{summary.averageSemantic}</p>
					</article>
					<article className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
						<h3 className="text-xs font-semibold uppercase tracking-wide text-neutral/50">Avg keyword score</h3>
						<p className="mt-2 text-2xl font-bold text-neutral">{summary.averageKeyword}</p>
					</article>
				</section>
			)}

			<section className="card border border-base-300 bg-base-100 shadow-sm">
				<div className="card-body space-y-4">
					<h2 className="card-title text-lg">Job description (summary)</h2>
					<p className="whitespace-pre-wrap text-sm text-neutral/80">{ranking.jobDescription}</p>
				</div>
			</section>

			<section className="card border border-base-300 bg-base-100 shadow-sm">
				<div className="card-body overflow-x-auto">
					<table className="table">
						<thead>
							<tr>
								<th>Candidate</th>
								<th>Final score</th>
								<th>Semantic</th>
								<th>Keyword</th>
								<th>Highlights</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{ranking.cvs.map((cv, index) => (
								<tr key={cv.sourceId || `${cv.cvName}-${index}`} className={index === 0 ? 'bg-primary/5' : ''}>
									<td>
										<div className="font-semibold text-neutral">{cv.cvName}</div>
										<div className="text-xs text-neutral/60">
											Matched: {(cv.matchedKeywords || []).join(', ') || '—'}
										</div>
										<div className="text-xs text-neutral/60">
											Missing: {(cv.missingKeywords || []).join(', ') || '—'}
										</div>
									</td>
									<td>
										<span className={`badge ${scoreClasses(cv.finalScore)} badge-lg`}>{cv.finalScore}</span>
									</td>
									<td>{cv.semanticScore}</td>
									<td>{cv.keywordScore}</td>
									<td className="max-w-xs text-sm text-neutral/70">
										{cv.reason || 'No summary provided.'}
									</td>
									<td>
										<button type="button" className="btn btn-xs btn-outline" onClick={() => downloadCV(cv)}>
											Download CV
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<div className="flex justify-end">
				<button type="button" className="btn btn-primary" onClick={() => navigate('/upload')}>
					Run another session
				</button>
			</div>
		</div>
	);
}

export default Results;
