// src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const workflowCards = [
    {
        title: 'Resume Intake',
        description: 'Upload multiple PDF or DOCX resumes and a target job description in one place.',
        icon: '📄',
    },
    {
        title: 'AI Scoring',
        description: 'Groq-powered analysis returns semantic, keyword, and final scores for every CV.',
        icon: '🤖',
    },
    {
        title: 'Exports & Sharing',
        description: 'Download CSV or PDF summaries to circulate shortlists with your hiring team.',
        icon: '📊',
    },
];

const featureHighlights = [
    {
        title: 'Keyword Coverage Report',
        description: 'See which required keywords are present or missing so recruiters can follow up quickly.',
    },
    {
        title: 'Session History',
        description: 'Every ranking run is saved, letting you revisit and compare previous hiring rounds.',
    },
    {
        title: 'Downloadable Deliverables',
        description: 'Export polished CSV and PDF reports that capture scores, reasons, and keyword matches.',
    },
];

const stats = [
    { label: 'Average analysis time', value: '< 60 seconds' },
    { label: 'Supported formats', value: 'PDF & DOCX' },
    { label: 'Exports available', value: 'CSV & PDF' },
];

function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto space-y-12 text-neutral">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent/80 text-primary-content shadow-xl">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_55%)]" aria-hidden="true" />
                <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] px-8 py-10 sm:px-12">
                    <div className="space-y-6">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold tracking-wide uppercase">
                            AI-powered resume intelligence
                        </span>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                                Rank resumes with precision and confidence.
                            </h1>
                            <p className="mt-4 max-w-xl text-sm sm:text-base text-primary-content/90">
                                Use RankMyCV to transform raw resumes into actionable hiring insights. Upload applicant CVs, provide job-specific keywords, and receive transparent scoring you can share with your hiring panel.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/upload')}
                                className="btn btn-primary btn-wide shadow-lg shadow-primary/40"
                            >
                                Get Started
                            </button>
                            <div className="hidden sm:flex flex-col text-xs text-primary-content/80">
                                <span className="font-semibold">No credit card required</span>
                                <span>Secure processing &amp; private storage</span>
                            </div>
                        </div>

                        <dl className="grid gap-3 pt-4 sm:grid-cols-3 text-sm">
                            {stats.map((stat) => (
                                <div key={stat.label} className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur">
                                    <dt className="text-xs uppercase tracking-wide text-primary-content/60">{stat.label}</dt>
                                    <dd className="mt-1 text-lg font-semibold">{stat.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="space-y-4">
                        {workflowCards.map((card, index) => (
                            <article
                                key={card.title}
                                className="group rounded-2xl border border-base-300/70 bg-base-100/90 p-6 shadow-lg shadow-primary/10 backdrop-blur transition-transform hover:-translate-y-1"
                                style={{ transform: `translateY(${index * 4}px)` }}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                                        {card.icon}
                                    </span>
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral">{card.title}</h3>
                                        <p className="mt-2 text-sm text-neutral/70">{card.description}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Highlights */}
            <section className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-neutral">Key capabilities</h2>
                        <p className="text-sm text-neutral/70">Everything you need to evaluate resumes objectively and efficiently.</p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-2 text-xs font-medium uppercase tracking-wide text-neutral/70">
                        Updated for 2025 hiring workflows
                    </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {featureHighlights.map((feature) => (
                        <article key={feature.title} className="h-full rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition-colors hover:border-primary/60">
                            <h3 className="text-lg font-semibold text-neutral">{feature.title}</h3>
                            <p className="mt-3 text-sm text-neutral/70">{feature.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Next steps callout */}
            <section className="rounded-3xl border border-dashed border-primary/40 bg-base-100 p-8 text-center shadow-sm">
                <h2 className="text-2xl font-semibold text-neutral">Ready to evaluate your next batch of candidates?</h2>
                <p className="mt-3 text-sm text-neutral/70">
                    Start by uploading the resumes you received today and RankMyCV will surface the strongest matches instantly.
                </p>
                <div className="mt-6 flex justify-center">
                    <button
                        type="button"
                        onClick={() => navigate('/upload')}
                        className="btn btn-primary btn-wide"
                    >
                        Get Started
                    </button>
                </div>
            </section>
        </div>
    );
}

export default Dashboard;