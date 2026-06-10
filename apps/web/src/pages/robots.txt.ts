export function GET() {
	const sitemapUrl = 'https://config.jannael.com/sitemap-index.xml'

	const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain',
		},
	})
}
