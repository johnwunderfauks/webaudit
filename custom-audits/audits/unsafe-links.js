const { Audit } = require("lighthouse");

class UnsafeLinks extends Audit {
	static get meta() {
		return {
			id: 'unsafe-links',
			title: 'Unsafe links prevented.',
			failureTitle: 'Links to cross-origin destinations are unsafe.',
			description: 'Add rel="noopener" or rel="noreferrer" to any external links to inprove performance and prevent security vulnerabilities.',
			requiredArtifacts: ['AnchorElements'],
		}
	}

	/**
	* @param {LH.Artifacts} artifacts
	* @param {LH.Audit.Context} context
	*/
	static audit(artifacts, context) {
		// Get the data / elements collected by the gatherer
		const anchors = artifacts.AnchorElements.filter(anchor => anchor.target == '_blank' && anchor.rel == '');

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

module.exports = UnsafeLinks;