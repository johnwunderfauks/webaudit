const { Audit } = require("lighthouse");

class MetaDescriptionCount extends Audit {
	static get meta() {
		return {
			id: 'meta-description-count',
			title: 'There is just one meta description.',
			failureTitle: 'There is more than one meta description.',
			description: 'Check for multiple meta descriptions.',
			requiredArtifacts: ['MetaElements'],
		}
	}

	/**
	* @param {LH.Artifacts} artifacts
	* @param {LH.Audit.Context} context
	*/
	static audit(artifacts, context) {
		// Get the data / elements collected by the gatherer
		const metaDescription = artifacts.MetaElements.filter(meta => meta.name === 'description');

		/**
		* @return {LH.Product}
		*/

		if(metaDescription.length > 1) {
			return {
				score: 0
			}
		}

		return {
			score: 1,
		};
	}
}

module.exports = MetaDescriptionCount;