
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { wpFetch } from '../../../lib/graphql';
import { CATEGORY_BY_SLUG_QUERY } from '../../../lib/queries';
import './category-page.css';


export const revalidate = 300;

type Props = {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ after?: string }>;
};

function timeAgo(dateString?: string) {
	if (!dateString) return '';
	const then = new Date(dateString).getTime();
	const now = Date.now();
	const diff = Math.max(0, now - then);
	const minutes = Math.floor(diff / 60000);
	if (minutes < 60) return `${minutes || 1} min ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hrs ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days} days ago`;
	const weeks = Math.floor(days / 7);
	if (weeks < 4) return `${weeks} wks ago`;
	const months = Math.floor(days / 30);
	return `${months} mo ago`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	try {
		const data = await wpFetch<{ category: any }>(
			CATEGORY_BY_SLUG_QUERY,
			{ slug },
			revalidate
		);
		if (!data?.category) {
			return { title: 'Category not found' };
		}
		const category = data.category;
		const seo = category.seo || {};
		return {
			title: seo.title || category.name || 'Category',
			description: seo.metaDesc || category.description || '',
			alternates: { canonical: seo.canonical || '' },
			robots: {
				index: seo.metaRobotsNoindex !== 'noindex',
				follow: seo.metaRobotsNofollow !== 'nofollow',
			},
			openGraph: {
				title: seo.opengraphTitle || seo.title || category.name || '',
				description: seo.opengraphDescription || seo.metaDesc || category.description || '',
				url: seo.canonical || '',
				type: 'website',
				locale: 'hi_IN',
				siteName: process.env.SITE_NAME || 'Pahari Patrika',
				images: seo.opengraphImage?.sourceUrl
					? [{ url: seo.opengraphImage.sourceUrl, width: 1200, height: 630, alt: category.name }]
					: [],
			},
			twitter: {
				card: 'summary_large_image',
				title: seo.twitterTitle || seo.title || category.name || '',
				description: seo.twitterDescription || seo.metaDesc || category.description || '',
				images: seo.twitterImage?.sourceUrl ? [seo.twitterImage.sourceUrl] : [],
			},
		};
	} catch {
		return { title: 'Category not found' };
	}
}

export default async function CategoryPage({ params, searchParams }: Props) {
	const { slug } = await params;
	const sp = await searchParams;
	const pageParam = (sp as Record<string, any>)["page"];
	const page = pageParam ? Number(pageParam) : 1;
	const postsPerPage = 10;

	let afterCursor: string | null = null;
	if (page > 1) {
		let lastCursor: string | null = null;
		for (let i = 1; i < page; i++) {
			const prevData: { category: any } = await wpFetch(
				CATEGORY_BY_SLUG_QUERY,
				{ slug, first: postsPerPage, after: lastCursor },
				revalidate
			);
			lastCursor = prevData?.category?.posts?.pageInfo?.endCursor || null;
		}
		afterCursor = lastCursor;
	}

	const data = await wpFetch<{ category: any }>(
		CATEGORY_BY_SLUG_QUERY,
		{ slug, first: postsPerPage, after: afterCursor },
		revalidate
	);

	if (!data?.category) {
		notFound();
	}

	const category = data.category;
	const posts = category.posts?.nodes ?? [];
	const _pageInfo = category.posts?.pageInfo;
	const totalPosts = category.count || 0;
	const totalPages = Math.max(1, Math.ceil(totalPosts / postsPerPage));
	const siteUrl = (process.env.SITE_URL || '').replace(/\/$/, '');
	const _firstPost = posts[0];
	const _morePosts = posts.slice(1);


		// Only inject Yoast schema if present
		let yoastSchema = '';
		if (category.seo?.schema?.raw) {
			yoastSchema = category.seo.schema.raw;
		}

	const canonicalUrl = page === 1 ? `${siteUrl}${category.uri}` : `${siteUrl}${category.uri}?page=${page}`;
	const prevUrl = page > 1 ? (page === 2 ? `${siteUrl}${category.uri}` : `${siteUrl}${category.uri}?page=${page - 1}`) : null;
	const nextUrl = page < totalPages ? `${siteUrl}${category.uri}?page=${page + 1}` : null;

		return (
			<>
				<link rel="canonical" href={canonicalUrl} />
				{prevUrl && <link rel="prev" href={prevUrl} />}
				{nextUrl && <link rel="next" href={nextUrl} />}
				{/* Inject Yoast schema only if present */}
				{yoastSchema && (
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{ __html: yoastSchema }}
					/>
				)}
				<main className="category-page">
				<div className="category-container">
					{/* Breadcrumb */}
					<nav className="cat-breadcrumb" aria-label="breadcrumb">
						<Link href="/" className="cat-breadcrumb__link">Home</Link>
						<span className="cat-breadcrumb__sep">/</span>
						<span className="cat-breadcrumb__current">{category.name}</span>
					</nav>

					{/* Page Title with Red Line */}
					<div className="cat-header">
						<h1 className="cat-header__title">{category.name.toUpperCase()}</h1>
						<div className="cat-header__line"></div>
					</div>

					{posts.length === 0 ? (
						<div className="cat-no-posts">
							<p>No posts found in this category.</p>
						</div>
					) : (
						<div className="cat-posts">
							{posts.map((post: any, index: number) => {
								const isFirst = index === 0;
								return (
									<article key={post.slug} className={`cat-post ${isFirst ? 'cat-post--featured' : ''}`}>
										<Link href={post.uri || `/${post.slug}`} className="cat-post__link">
											{post.featuredImage?.node?.sourceUrl && (
												<div className="cat-post__image">
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img
														src={post.featuredImage.node.sourceUrl}
														alt={post.featuredImage.node.altText || post.title}
														loading={index < 3 ? 'eager' : 'lazy'}
													/>
												</div>
											)}
											<div className="cat-post__content">
												<h2 className="cat-post__title">{post.title}</h2>
												<div className="cat-post__meta">
													<span className="cat-post__author">
														{post?.author?.node?.name || 'Staff'}
													</span>
													<span className="cat-post__dot">•</span>
													<time className="cat-post__time" dateTime={post.date}>
														{timeAgo(post.date)}
													</time>
												</div>
											</div>
										</Link>
									</article>
								);
							})}
						</div>
					)}

					{/* Pagination */}
					{totalPages > 1 && (
						<nav className="cat-pagination" aria-label="Pagination">
							{(() => {
								let currentPage = 1;
								if (typeof window === 'undefined') {
									if (page && !isNaN(Number(page))) {
										currentPage = Number(page);
									}
								} else {
									const urlParams = new URLSearchParams(window.location.search);
									const pageParam = urlParams.get('page');
									if (pageParam && !isNaN(Number(pageParam))) {
										currentPage = Number(pageParam);
									}
								}
								const maxPages = 5;
								let start = Math.max(1, currentPage - Math.floor(maxPages / 2));
								let end = start + maxPages - 1;
								if (end > totalPages) {
									end = totalPages;
									start = Math.max(1, end - maxPages + 1);
								}
								if (currentPage > 1) {
									const prevHref = currentPage - 1 === 1 ? `${category.uri}` : `${category.uri}?page=${currentPage - 1}`;
									return (
										<>
											<Link
												href={prevHref}
												className="cat-pagination__btn cat-pagination__prev"
												aria-label="Previous page"
											>
												‹
											</Link>
											{Array.from({ length: end - start + 1 }, (_, i) => {
												const pageNum = start + i;
												const isCurrent = pageNum === currentPage;
												const href = pageNum === 1 ? `${category.uri}` : `${category.uri}?page=${pageNum}`;
												return (
													<Link
														key={pageNum}
														href={href}
														className={`cat-pagination__page${isCurrent ? ' cat-pagination__page--current' : ''}`}
														style={{ color: '#fff', background: isCurrent ? '#ff4d4f' : 'transparent', borderRadius: '4px', padding: '0.2em 0.7em', margin: '0 2px', fontWeight: isCurrent ? 700 : 400 }}
													>
														{pageNum}
													</Link>
												);
											})}
											{currentPage < totalPages && (
												<Link
													href={`${category.uri}?page=${currentPage + 1}`}
													className="cat-pagination__btn cat-pagination__next"
													aria-label="Next page"
												>
													›
												</Link>
											)}
										</>
									);
								} else {
									return (
										<>
											{Array.from({ length: end - start + 1 }, (_, i) => {
												const pageNum = start + i;
												const isCurrent = pageNum === currentPage;
												const href = pageNum === 1 ? `${category.uri}` : `${category.uri}?page=${pageNum}`;
												return (
													<Link
														key={pageNum}
														href={href}
														className={`cat-pagination__page${isCurrent ? ' cat-pagination__page--current' : ''}`}
														style={{ color: '#fff', background: isCurrent ? '#ff4d4f' : 'transparent', borderRadius: '4px', padding: '0.2em 0.7em', margin: '0 2px', fontWeight: isCurrent ? 700 : 400 }}
													>
														{pageNum}
													</Link>
												);
											})}
											{currentPage < totalPages && (
												<Link
													href={`${category.uri}?page=${currentPage + 1}`}
													className="cat-pagination__btn cat-pagination__next"
													aria-label="Next page"
												>
													›
												</Link>
											)}
										</>
									);
								}
							})()}
						</nav>
					)}
				</div>
			</main>
		</>
	);
}
