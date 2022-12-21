const { Audit } = require("lighthouse");

class H1Elements extends Audit {
	static get meta() {
		return {
			id: 'h1-tag',
			title: 'Has H1 Tag(s) and are not empty.',
			failureTitle: 'Does not have any h1 tags or tags are empty.',
			description: 'Detecting H1 tag on a page.',
			requiredArtifacts: ['H1Elements'],
		}
	}

	/**
	* @param {LH.Artifacts} artifacts
	* @param {LH.Audit.Context} context
	*/
	static audit(artifacts, context) {
		// Get the data / elements collected by the gatherer
		const elementSummaries = artifacts.H1Elements;

		const results = elementSummaries.map(element => ({
			node: Audit.makeNodeItem(element.node),
			tagName: element.tagName,
			textContent: element.textContent
		}));

		const emptyTags = elementSummaries.filter(element => element.textContent.trim() == '');

		/** @type {LH.Audit.Details.Table['headings']} */
		const headings = [
			{ key: 'tagName', itemType: 'text', text: 'Tag name' },
			{ key: 'node', itemType: 'node', text: 'Elements' },
			{ key: 'textContent', itemType: 'text', text: 'Content' }
		];

		/**
		* @return {LH.Product}
		*/

		if(emptyTags.length > 0) {
			return {
				score: 0,
				explanation: 'There are empty H1 tags.',
			};
		}
		return {
			score: Number(results.length > 0), // Number between 0 and 1
			numericValue: results.length,
			numericUnit: 'element',
			displayValue: `${results.length} elements`,
			details: Audit.makeTableDetails(headings, results),
		};
	}
}

module.exports = H1Elements;