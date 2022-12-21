const { Audit } = require("lighthouse");

class DeadEndPage extends Audit {
	static get meta() {
		return {
			id: 'dead-end-page',
			title: 'Page has outgoing links.',
			failureTitle: 'Page has no outgoing links.',
			description: 'Check page for any outgoing links.',
			requiredArtifacts: ['AnchorElements'],
		}
	}

	/**
	* @param {LH.Artifacts} artifacts
	* @param {LH.Audit.Context} context
	*/
	static audit(artifacts, context) {
		// Get the data / elements collected by the gatherer
		const anchors = artifacts.AnchorElements;
		const anchorsWithURL = artifacts.AnchorElements.filter(anchor => anchor.rawHref.length != 0);

		/**
		* @return {LH.Product}
		*/

		if(anchors.length == 0 || anchorsWithURL.length == 0) {
			return {
				score: 0,
			}
		}

		return {
			score: 1,
		};
	}
}

module.exports = DeadEndPage;