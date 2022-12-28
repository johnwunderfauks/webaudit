const { Audit } = require("lighthouse");

class UrlLength extends Audit {
	static get meta() {
		return {
			id: 'url-length',
			title: 'Length of URLs are ideal.',
			failureTitle: 'Length of URLs are too long.',
			description: 'Appropriate length of a URL is 75 characters long.',
			requiredArtifacts: ['AnchorElements'],
		}
	}

	/**
	* @param {LH.Artifacts} artifacts
	* @param {LH.Audit.Context} context
	*/
	static audit(artifacts, context) {
		// Get the data / elements collected by the gatherer
		const anchors = artifacts.AnchorElements.filter(anchor => anchor.href.length > 75);

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

module.exports = UrlLength;