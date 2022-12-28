const { Audit } = require("lighthouse");

class UrlDynamicParams extends Audit {
	static get meta() {
		return {
			id: 'url-dynamic-params',
			title: 'All URLs are static.',
			failureTitle: 'One or more URLs are dynamic.',
			description: 'Multiple query string parameters can be used within a single URL, which can impact a website\'s SEO and organic search performance in several ways, including causing duplicate content and crawling issues.',
			requiredArtifacts: ['AnchorElements'],
		}
	}

	/**
	* @param {LH.Artifacts} artifacts
	* @param {LH.Audit.Context} context
	*/
	static audit(artifacts, context) {
		// Get the data / elements collected by the gatherer
		const anchors = artifacts.AnchorElements.filter(anchor => anchor.href.match(/(\?|\&)([^=]+)\=([^&]+)/gi));
		
		/**
		* @return {LH.Product}
		*/

		if(anchors.length > 0) {
			return {
				score: 0,
				numericValue: anchors.length,
				numericUnit: 'links',
				displayValue: `${anchors.length} links`,
			}
		}

		return {
			score: 1,
		};
	}
}

module.exports = UrlDynamicParams;