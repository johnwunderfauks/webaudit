const { Audit } = require("lighthouse");

class LinkToHTTP extends Audit {
	static get meta() {
		return {
			id: 'link-to-http',
			title: 'All links are to HTTPS.',
			failureTitle: 'There are one or more links to HTTP.',
			description: 'Check links for HTTP',
			requiredArtifacts: ['AnchorElements', 'LinkElements', 'ImageElements', 'IFrameElements', 'ScriptElements'],
		}
	}

	/**
	* @param {LH.Artifacts} artifacts
	* @param {LH.Audit.Context} context
	*/
	static audit(artifacts, context) {
		// Get the data / elements collected by the gatherer
		const anchors = artifacts.AnchorElements.filter(anchor => anchor.href && anchor.href.startsWith('http:'));
		const links = artifacts.LinkElements.filter(link => link.href && link.href.startsWith('http:'));
		const images = artifacts.ImageElements.filter(image => image.src && image.src.startsWith('http:'));
		const iframes = artifacts.IFrameElements.filter(iframe => iframe.src && iframe.src.startsWith('http:'));
		const scripts = artifacts.ScriptElements.filter(script => script.src && script.src.startsWith('http:'));

		const all = [...anchors, ...links, ...images, ...iframes, ...scripts].map(element => ({
			node: Audit.makeNodeItem(element.node),
			source: element.href || element.src
		}));

		/** @type {LH.Audit.Details.Table['headings']} */
		const headings = [
			{ key: 'node', itemType: 'node', text: 'Elements' },
			{ key: 'source', itemType: 'text', text: 'URL Source' }
		];

		/**
		* @return {LH.Product}
		*/

		if(all.length > 0) {
			return {
				score: 0,
				numericValue: all.length,
				numericUnit: 'sources',
				displayValue: `${all.length} sources`,
				details: Audit.makeTableDetails(headings, all),
			}
		}

		return {
			score: 1,
		};
	}
}

module.exports = LinkToHTTP;