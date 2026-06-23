// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeExternalLinks from 'rehype-external-links';

// https://astro.build/config
export default defineConfig({
	site: 'https://codecharta.com',
	integrations: [
		starlight({
			title: 'CodeCharta',
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
						'docs/overview/getting-started/docker',
						'docs/overview/getting-started/npm',
						'docs/overview/getting-started/local',
					],
				},
				{
					label: 'Visualization',
					items: [
						'docs/visualization/web-studio',
						{
							label: 'User Controls',
							items: [
								{ label: 'Overview', slug: 'docs/visualization/user-controls' },
								'docs/visualization/user-controls/upload',
								'docs/visualization/user-controls/change-maps',
								'docs/visualization/user-controls/explore',
								'docs/visualization/user-controls/compare',
								'docs/visualization/user-controls/3d-print',
								'docs/visualization/user-controls/metrics',
								'docs/visualization/user-controls/explorer',
								'docs/visualization/user-controls/sidebar',
								'docs/visualization/user-controls/map',
								'docs/visualization/user-controls/viewcube',
								'docs/visualization/user-controls/fileextensionbar',
								'docs/visualization/user-controls/settings',
								'docs/visualization/user-controls/labels',
								'docs/visualization/user-controls/legend',
								'docs/visualization/custom-views',
							],
						},
					],
				},
				{
					label: 'CLI',
					items: [
						{
							label: 'CodeCharta Shell',
							items: [
								{ label: 'Overview', slug: 'docs/analysis/codecharta-shell' },
								'docs/analysis/metrics',
								'docs/analysis/examples',
								'docs/analysis/example-sonar-qube',
								'docs/analysis/local-changes',
								'docs/analysis/commit-analysis',
							],
						},
						{
							label: 'Importer',
							items: [
								{ label: 'Sonar', slug: 'docs/importer/sonar' },
								{ label: 'Tokei', slug: 'docs/importer/tokei' },
								{ label: 'Coverage', slug: 'docs/importer/coverage' },
								{ label: 'CSV', slug: 'docs/importer/csv' },
								{ label: 'SourceMonitor', slug: 'docs/importer/sourcemonitor' },
								{ label: 'Code Maat', slug: 'docs/importer/code-maat' },
								{ label: 'DependaCharta', slug: 'docs/importer/dependacharta' },
							],
						},
						{
							label: 'Parser',
							items: [
								{ label: 'Unified', slug: 'docs/parser/unified' },
								{ label: 'Raw Text', slug: 'docs/parser/raw-text' },
								{ label: 'Git Log', slug: 'docs/parser/git-log' },
								{ label: 'SVN Log', slug: 'docs/parser/svn-log' },
							],
						},
						{
							label: 'Exporter',
							items: [
								{ label: 'CSV', slug: 'docs/exporter/csv' },
							],
						},
						{
							label: 'Filter',
							items: [
								{ label: 'Merge', slug: 'docs/filter/merge-filter' },
								{ label: 'Edge', slug: 'docs/filter/edge-filter' },
								{ label: 'Structure Modifier', slug: 'docs/filter/structure-modifier' },
								{ label: 'Inspection Tool', slug: 'docs/filter/inspection-tool' },
							],
						},
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
		rehypePlugins: [
			[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
		],
	},
	// Legacy Jekyll permalinks preserved for SEO (collected from `redirect_from`).
	redirects: {
		'/docs': '/docs/overview/introduction',
		'/overview': '/docs/overview/introduction',
		'/visualization': '/docs/visualization/web-studio',
		'/docs/visualization/3d-printing': '/docs/visualization/user-controls/3d-print',
		'/docs/visualization/delta-view': '/docs/visualization/user-controls/compare',
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
