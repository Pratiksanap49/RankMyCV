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
							</tr>
						</thead>
						<tbody>
							{ranking.cvs.map((cv) => (
								<tr key={cv.cvName}>
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
