const { Audit } = require("lighthouse");

class UrlUnderscore extends Audit {
	static get meta() {
		return {
			id: 'url-underscore',
			title: 'All URLs do not have underscores.',
			failureTitle: 'One or more URLs have underscores.',
			description: 'Consider using hyphens to separate words in your URLs, as it helps users and search engines identify concepts in the URL more easily.',
			requiredArtifacts: ['AnchorElements'],
		}
	}

	/**
	* @param {LH.Artifacts} artifacts
	* @param {LH.Audit.Context} context
	*/
	static audit(artifacts, context) {
		// Get the data / elements collected by the gatherer
		const anchors = artifacts.AnchorElements.filter(anchor => anchor.href.includes('_'));

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

module.exports = UrlUnderscore;