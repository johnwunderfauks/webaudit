const { Audit } = require("lighthouse");

class MetaDescriptionLength extends Audit {
	static get meta() {
		return {
			id: 'meta-description-length',
			title: 'Meta description character count is ideal.',
			failureTitle: 'Meta description character count is NOT ideal.',
			description: 'Meta description character count.',
			requiredArtifacts: ['MetaElements'],
		}
	}

	/**
	* @param {LH.Artifacts} artifacts
	* @param {LH.Audit.Context} context
	*/
	static audit(artifacts, context) {
		// Get the data / elements collected by the gatherer
		const metaDescription = artifacts.MetaElements.find(meta => meta.name === 'description');

		const min = 70;
		const max = 160;

		/**
		* @return {LH.Product}
		*/

		const description = metaDescription.content || '';
		const characterCount = description.trim().length;
		if (characterCount < min || characterCount > max) {
			return {
				score: 0,
				explanation: (characterCount < min ? 'Meta description is too short.' : (characterCount > max ? 'Meta description is too long.' : '')),
			};
		}

		return {
			score: 1,
			displayValue: `${characterCount} characters`,
		};
	}
}

module.exports = MetaDescriptionLength;