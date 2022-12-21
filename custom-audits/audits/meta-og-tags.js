const { Audit } = require("lighthouse");

class OpenGraphTags extends Audit {
	static get meta() {
		return {
			id: 'meta-og-tags',
			title: 'There are no missing Open Graph tags.',
			failureTitle: 'One or more Open Graph tags are missing.',
			description: 'Check for any missing Open Graph tags.',
			requiredArtifacts: ['MetaElements'],
		}
	}

	/**
	* @param {LH.Artifacts} artifacts
	* @param {LH.Audit.Context} context
	*/
	static audit(artifacts, context) {
		// Get the data / elements collected by the gatherer
		const requiredTags = ['og:title', 'og:url', 'og:image', 'og:type', 'og:description'];
		var missingTags = [];

		requiredTags.forEach(tag => {
			var ogTag  = artifacts.MetaElements.find(meta => meta.property == tag);

			if(!ogTag) {
				missingTags.push(tag);
			}
		});

		/** @type {LH.Audit.Details.Table['headings']} */
		const headings = [
			{ key: 'property', itemType: 'text', text: 'Property name' }
		];
		const results = missingTags.map(element => ({
			property: element
		}));

		/**
		* @return {LH.Product}
		*/

		if(missingTags.length > 0) {
			return {
				score: 0,
				details: Audit.makeTableDetails(headings, results),
			}
		}

		return {
			score: 1
		};
	}
}

module.exports = OpenGraphTags;