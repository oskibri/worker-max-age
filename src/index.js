function getBrowser(userAgent) {
	if (!userAgent) return 'unknown';
	userAgent = userAgent.toLowerCase();

	if (userAgent.includes('edg/')) return 'microsoft edge';
	if (userAgent.includes('opr/') || userAgent.includes('opera')) return 'opera';

	if (userAgent.includes('chrome') &&
		!userAgent.includes('chromium') &&
		!userAgent.includes('edg/')) {
			return 'chrome';
	} // chrome

	if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
	if (userAgent.includes('firefox')) return 'firefox';
	if (userAgent.includes('msie') || userAgent.includes('trident/')) return 'internet explorer';

	return 'unknown';
}

export default {
	async fetch(request) {
		const browser = getBrowser(request.headers.get('user-agent'));
		const accept = request.headers.get('accept') || '';

		if (!accept.includes('text/html')) return fetch(request);
		else console.log('Request is HTML doc');

		const response = await caches.default.match(request) || await fetch(request);

		const contentType = response.headers.get('content-type') || '';
		if (!contentType.includes('text/html')) return response;

		const newResponse = new Response(response.body, response);
		const cacheControl = newResponse.headers.get('cache-control'); // old cache-control string

		if (cacheControl && ['chrome', 'safari'].includes(browser)) {
			const newMaxAge = 5;
			const newCacheControl = cacheControl.replace(/max-age\s*=\s*\d+/i, `max-age=${newMaxAge}`);
			newResponse.headers.set('cache-control', newCacheControl);
		}

		return newResponse;
	},
};
