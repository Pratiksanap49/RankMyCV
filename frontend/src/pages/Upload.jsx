// src/pages/Upload.jsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import mammoth from 'mammoth/mammoth.browser';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

const ACCEPTED_TYPES = [
	'application/pdf',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const formatBytes = (bytes) => {
	if (!Number.isFinite(bytes)) return '0 KB';
	const units = ['B', 'KB', 'MB', 'GB'];
	const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
	return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

async function extractTextFromPDF(file) {
	const arrayBuffer = await file.arrayBuffer();
	const pdf = await getDocument({ data: arrayBuffer }).promise;
	let fullText = '';

	for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
		// eslint-disable-next-line no-await-in-loop
		const page = await pdf.getPage(pageNumber);
		// eslint-disable-next-line no-await-in-loop
		const content = await page.getTextContent();
		const pageText = content.items.map((item) => item.str).join(' ');
		fullText += `${pageText}\n`;
	}

	await pdf.cleanup();
	return fullText.trim();
}

async function extractTextFromDOCX(file) {
	const arrayBuffer = await file.arrayBuffer();
	const { value } = await mammoth.extractRawText({ arrayBuffer });
	return value.trim();
}

function Upload() {
	const navigate = useNavigate();
	const fileInputRef = useRef(null);
	const [jobDescription, setJobDescription] = useState('');
	const [keywordsInput, setKeywordsInput] = useState('');
	const [files, setFiles] = useState([]);
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const keywords = useMemo(
		() => keywordsInput.split(/[,\n]/).map((keyword) => keyword.trim()).filter(Boolean),
		[keywordsInput],
	);

	const totalSize = useMemo(() => files.reduce((sum, item) => sum + item.file.size, 0), [files]);

	const handleFiles = useCallback((selectedFiles) => {
		const validEntries = [];
		const rejected = [];

		Array.from(selectedFiles).forEach((file) => {
			if (!ACCEPTED_TYPES.includes(file.type)) {
				rejected.push(file.name);
				return;
			}

			validEntries.push({
				id: `${file.name}-${file.size}-${file.lastModified}`,
				file,
			});
		});

		setFiles((prev) => {
			const existingIds = new Set(prev.map((item) => item.id));
			const merged = [...prev];
			validEntries.forEach((entry) => {
				if (!existingIds.has(entry.id)) merged.push(entry);
			});
			return merged;
		});

		if (rejected.length > 0) {
			setError(`Unsupported file type: ${rejected.join(', ')}`);
		} else {
			setError('');
		}
	}, []);

	const handleFileInputChange = useCallback((event) => {
		handleFiles(event.target.files);
		event.target.value = '';
	}, [handleFiles]);

	const handleDragOver = useCallback((event) => {
		event.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((event) => {
		event.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback((event) => {
		event.preventDefault();
		setIsDragging(false);
		if (event.dataTransfer.files?.length) {
			handleFiles(event.dataTransfer.files);
		}
	}, [handleFiles]);

	const removeFile = useCallback((id) => {
		setFiles((prev) => prev.filter((item) => item.id !== id));
	}, []);

	const resetForm = useCallback(() => {
		setJobDescription('');
		setKeywordsInput('');
		setFiles([]);
	}, []);

	const handleSubmit = useCallback(async (event) => {
		event.preventDefault();
		setError('');

		if (!jobDescription.trim()) {
			setError('Please provide the job description you are hiring for.');
			return;
		}

		if (keywords.length === 0) {
			setError('Add at least one required keyword to guide the analysis.');
			return;
		}

		if (files.length === 0) {
			setError('Upload at least one resume (PDF or DOCX).');
			return;
		}

		setLoading(true);

		try {
			const parsedCVs = await Promise.all(files.map(async ({ file }) => {
				let content = '';
				if (file.type === 'application/pdf') {
					content = await extractTextFromPDF(file);
				} else {
					content = await extractTextFromDOCX(file);
				}

				if (!content) {
					throw new Error(`We could not read any text from ${file.name}. Please verify the file.`);
				}

				return {
					name: file.name,
					content,
				};
			}));

			const payload = {
				jobDescription: jobDescription.trim(),
				requiredKeywords: keywords,
				cvs: parsedCVs,
			};

			const response = await API.post('/results/rank', payload);

			resetForm();
			navigate('/results', { state: { ranking: response.data } });
		} catch (err) {
			const message = err.response?.data?.message || err.message || 'Failed to rank resumes.';
			setError(message);
		} finally {
			setLoading(false);
		}
	}, [files, jobDescription, keywords, navigate, resetForm]);

	return (
		<div className="max-w-6xl mx-auto space-y-8">
			<header className="space-y-2">
				<span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
					Upload resumes
				</span>
				<h1 className="text-3xl font-bold text-neutral">Start a new ranking session</h1>
				<p className="max-w-3xl text-sm text-neutral/70">
					Provide the job description and required keywords so RankMyCV can evaluate each candidate. Drag and drop PDF or DOCX resumes, or browse to add them from your device.
				</p>
			</header>

			<form onSubmit={handleSubmit} className="space-y-6">
				<section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
					<div className="card border border-base-300 bg-base-100 shadow-sm">
						<div className="card-body space-y-4">
							<h2 className="card-title text-lg">Job details</h2>
							<div className="form-control">
								<label className="label">
									<span className="label-text font-medium">Job description</span>
								</label>
								<textarea
									className="textarea textarea-bordered h-36 resize-none"
									placeholder="Paste the core responsibilities, skills, and expectations for the role."
									value={jobDescription}
									onChange={(event) => setJobDescription(event.target.value)}
									required
								/>
							</div>
							<div className="form-control">
								<label className="label">
									<span className="label-text font-medium">Required keywords</span>
									<span className="label-text-alt text-xs text-neutral/60">Separate with commas or new lines</span>
								</label>
								<textarea
									className="textarea textarea-bordered h-24 resize-none"
									placeholder="e.g. React, Node.js, ATS experience"
									value={keywordsInput}
									onChange={(event) => setKeywordsInput(event.target.value)}
								/>
								{keywords.length > 0 && (
									<div className="mt-3 flex flex-wrap gap-2 text-xs">
										{keywords.map((keyword) => (
											<span key={keyword} className="badge badge-outline border-primary/40 bg-primary/5 text-primary">
												{keyword}
											</span>
										))}
									</div>
								)}
							</div>
						</div>
					</div>

					<div
						className={`card border-2 border-dashed ${isDragging ? 'border-primary bg-primary/5' : 'border-base-300'} bg-base-100 shadow-sm transition-colors`}
						onDragOver={handleDragOver}
						onDragEnter={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						role="presentation"
					>
						<div className="card-body items-center text-center space-y-4">
							<div className="rounded-full bg-primary/10 p-4 text-2xl text-primary">⬆️</div>
							<div>
								<h2 className="text-lg font-semibold text-neutral">Drag &amp; drop resumes</h2>
								<p className="text-sm text-neutral/70">PDF and DOCX files up to 10 MB each. Add as many as you need for this session.</p>
							</div>
							<button
								type="button"
								className="btn btn-outline btn-sm"
								onClick={() => fileInputRef.current?.click()}
							>
								Browse files
							</button>
							<input
								ref={fileInputRef}
								type="file"
								multiple
								accept={ACCEPTED_TYPES.join(',')}
								className="hidden"
								onChange={handleFileInputChange}
							/>
						</div>
					</div>
				</section>

				{files.length > 0 && (
					<section className="card border border-base-300 bg-base-100 shadow-sm">
						<div className="card-body space-y-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<h2 className="card-title text-lg">Selected resumes</h2>
								<span className="text-xs text-neutral/60">{files.length} file(s) · {formatBytes(totalSize)}</span>
							</div>
							<ul className="space-y-3">
								{files.map(({ id, file }) => (
									<li key={id} className="flex items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-3 text-sm">
										<div className="flex flex-col">
											<span className="font-medium text-neutral">{file.name}</span>
											<span className="text-xs text-neutral/60">{formatBytes(file.size)}</span>
										</div>
										<button type="button" className="btn btn-ghost btn-xs" onClick={() => removeFile(id)}>
											Remove
										</button>
									</li>
								))}
							</ul>
						</div>
					</section>
				)}

				{error && (
					<div className="alert alert-error text-sm">
						<span>{error}</span>
					</div>
				)}

				<div className="flex flex-wrap justify-between gap-3">
					<div className="text-xs text-neutral/60">
						Sessions are stored securely so you can revisit results from the history view.
					</div>
					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading && <span className="loading loading-spinner" />}
						{loading ? 'Analyzing resumes…' : 'Start ranking' }
					</button>
				</div>
			</form>
		</div>
	);
}

export default Upload;
