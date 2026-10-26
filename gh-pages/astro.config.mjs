// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeExternalLinks from 'rehype-external-links';
import { unified } from '@astrojs/markdown-remark';

const SITE = 'https://codecharta.com';

const SOFTWARE_APPLICATION = {
	'@context': 'https://schema.org',
	'@type': 'SoftwareApplication',
	name: 'CodeCharta',
	applicationCategory: 'DeveloperApplication',
	operatingSystem: 'Web, Windows, macOS, Linux',
	description:
		'Open-source code visualization: turn any codebase into a 3D map of code metrics, domain language and dependencies to find hotspots and technical debt.',
	url: SITE,
	downloadUrl: 'https://github.com/MaibornWolff/codecharta/releases',
	license: 'https://opensource.org/licenses/BSD-3-Clause',
	offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
	author: { '@type': 'Organization', name: 'MaibornWolff', url: 'https://www.maibornwolff.de/en' },
};

// https://astro.build/config
export default defineConfig({
	site: SITE,
	// Astro 7's default ('jsx') drops the spaces between inline elements in Starlight's header and sidebar.
	compressHTML: true,
	integrations: [
		starlight({
			title: 'CodeCharta',
			description:
				'CodeCharta turns your codebase into an interactive 3D map of code metrics, domain language and dependencies. Free, open source and fully local.',
			head: [
				{ tag: 'meta', attrs: { property: 'og:image', content: `${SITE}/assets/images/og-image.png` } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
				{ tag: 'meta', attrs: { property: 'og:image:alt', content: 'A codebase rendered as a 3D city by CodeCharta' } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: `${SITE}/assets/images/og-image.png` } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#4a93c7' } },
				{ tag: 'link', attrs: { rel: 'icon', href: '/assets/images/favicon/favicon.ico', sizes: '32x32' } },
				{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/assets/images/favicon/apple-touch-icon.png' } },
				{ tag: 'link', attrs: { rel: 'manifest', href: '/assets/images/favicon/site.webmanifest' } },
				{ tag: 'script', attrs: { type: 'application/ld+json' }, content: JSON.stringify(SOFTWARE_APPLICATION) },
			],
			customCss: ['./src/styles/examples.css'],
			components: {
				PageTitle: './src/components/PageTitle.astro',
				SocialIcons: './src/components/SocialIcons.astro',
			},
			logo: {
				src: './src/assets/codecharta_logo.svg',
				alt: 'CodeCharta',
			},
			favicon: '/favicon.svg',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/MaibornWolff/codecharta',
				},
			],
			sidebar: [
				{
					label: 'Overview',
					items: [
						'docs/overview/introduction',
						'docs/overview/data-privacy',
						'docs/overview/service-offerings',
					],
				},
				{
					label: 'Getting started',
					items: [
						'docs/overview/getting-started',
						'docs/overview/getting-started/npm',
						'docs/overview/getting-started/docker',
						'docs/overview/getting-started/desktop',
						'docs/overview/getting-started/local',
					],
				},
				{
					label: 'Visualization',
					items: [
						'docs/visualization/web-studio',
						{ label: 'Interface overview', slug: 'docs/visualization/user-controls' },
						'docs/visualization/user-controls/loading-maps',
						'docs/visualization/user-controls/views',
						{
							label: 'Metric view',
							items: [
								'docs/visualization/user-controls/code-map',
								'docs/visualization/user-controls/metrics',
								'docs/visualization/user-controls/layouts',
								'docs/visualization/user-controls/labels',
								'docs/visualization/user-controls/legend',
								'docs/visualization/user-controls/distribution-bar',
								'docs/visualization/user-controls/map-tools',
							],
						},
						{
							label: 'Domain view',
							items: [
								'docs/visualization/user-controls/domain-view',
								'docs/visualization/user-controls/domain-words',
								'docs/visualization/user-controls/domain-bar',
							],
						},
						{
							label: 'Dependencies view',
							items: [
								'docs/visualization/user-controls/dependency-view',
								'docs/visualization/user-controls/dependency-inspector',
								'docs/visualization/user-controls/dependency-bar',
							],
						},
						'docs/visualization/user-controls/compare',
						'docs/visualization/user-controls/explorer',
						'docs/visualization/user-controls/inspector',
						'docs/visualization/user-controls/scenarios',
						'docs/visualization/user-controls/3d-print',
						'docs/visualization/user-controls/settings',
						'docs/visualization/user-controls/keyboard-shortcuts',
					],
				},
				{
					label: 'CLI',
					items: [
						{
							label: 'CodeCharta Shell',
							items: [
								{ label: 'Overview', slug: 'docs/analysis/codecharta-shell' },
								'docs/analysis/examples',
								'docs/analysis/metrics',
								'docs/analysis/example-sonar-qube',
								'docs/analysis/local-changes',
								'docs/analysis/commit-analysis',
							],
						},
						{
							label: 'Parser',
							items: [
								{ label: 'Unified', slug: 'docs/parser/unified' },
								{ label: 'Git Log', slug: 'docs/parser/git-log' },
								{ label: 'SVN Log', slug: 'docs/parser/svn-log' },
								{ label: 'Domain Language', slug: 'docs/parser/domain-language' },
								{ label: 'Dependency', slug: 'docs/parser/dependency' },
								{ label: 'Raw Text', slug: 'docs/parser/raw-text' },
							],
						},
						{
							label: 'Importer',
							items: [
								{ label: 'Sonar', slug: 'docs/importer/sonar' },
								{ label: 'Coverage', slug: 'docs/importer/coverage' },
								{ label: 'Tokei', slug: 'docs/importer/tokei' },
								{ label: 'Code Maat', slug: 'docs/importer/code-maat' },
								{ label: 'SourceMonitor', slug: 'docs/importer/sourcemonitor' },
								{ label: 'CSV', slug: 'docs/importer/csv' },
								{ label: 'DependaCharta', slug: 'docs/importer/dependacharta' },
							],
						},
						{
							label: 'Filter',
							items: [
								{ label: 'Merge', slug: 'docs/filter/merge-filter' },
								{ label: 'Edge', slug: 'docs/filter/edge-filter' },
								{ label: 'Structure Modifier', slug: 'docs/filter/structure-modifier' },
							],
						},
						{
							label: 'Tools',
							items: [
								{ label: 'Analyse', slug: 'docs/analysis/analyse' },
								{ label: 'Quality Gate', slug: 'docs/analysis/quality-gate' },
								{ label: 'Inspect', slug: 'docs/filter/inspection-tool' },
								{ label: 'Convert', slug: 'docs/filter/convert' },
								{ label: 'Validate', slug: 'docs/filter/validation-tool' },
							],
						},
						{
							label: 'Exporter',
							items: [
								{ label: 'CSV', slug: 'docs/exporter/csv' },
							],
						},
					],
				},
				{
					label: 'Integrations',
					items: [
						{ label: 'Overview', slug: 'docs/integrations/overview' },
						'docs/integrations/file-format',
					],
				},
				{
					label: 'About',
					items: [
						'docs/about/license',
						'docs/about/versioning',
						'docs/about/feedback',
						'docs/about/price',
						'docs/about/imprint',
					],
				},
			],
		}),
	],
	markdown: {
		processor: unified({
			rehypePlugins: [
				[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
			],
		}),
	},
	// Legacy Jekyll permalinks preserved for SEO (collected from `redirect_from`).
	redirects: {
		'/docs': '/docs/overview/introduction',
		'/overview': '/docs/overview/introduction',
		'/visualization': '/docs/visualization/web-studio',
		'/docs/visualization/3d-printing': '/docs/visualization/user-controls/3d-print',
		'/docs/visualization/custom-views': '/docs/visualization/user-controls/scenarios',
		'/docs/visualization/user-controls/upload': '/docs/visualization/user-controls/loading-maps',
		'/docs/visualization/user-controls/change-maps': '/docs/visualization/user-controls/loading-maps',
		'/docs/visualization/user-controls/explore': '/docs/visualization/user-controls/code-map',
		'/docs/visualization/user-controls/map': '/docs/visualization/user-controls/code-map',
		'/docs/visualization/user-controls/viewcube': '/docs/visualization/user-controls/map-tools',
		'/docs/visualization/user-controls/sidebar': '/docs/visualization/user-controls/inspector',
		'/docs/visualization/user-controls/fileextensionbar': '/docs/visualization/user-controls/distribution-bar',
		'/docs/visualization/delta-view': '/docs/visualization/user-controls/compare',
		'/docs/docker-containers': '/docs/overview/getting-started/docker',
		'/docs/quick-start-guide': '/docs/overview/getting-started',
		'/docs/ccsh': '/docs/analysis/codecharta-shell',
		'/docs/feedback': '/docs/about/feedback',
		'/analysis': '/docs/analysis/codecharta-shell',
		'/importer': '/docs/importer/sonar',
		'/docs/sonar-importer': '/docs/importer/sonar',
		'/docs/analysis/custom-metrics': '/docs/importer/csv',
		'/parser': '/docs/parser/unified',
		'/docs/git-log-parser': '/docs/parser/git-log',
		'/exporter': '/docs/exporter/csv',
		'/filter': '/docs/filter/edge-filter',
		'/about': '/docs/about/license',
		'/showcase': '/examples',
		'/showcases': '/examples',
	},
});
