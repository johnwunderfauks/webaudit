const { Audit } = require("lighthouse");

class ContentWordCount extends Audit {
	static get meta() {
		return {
			id: 'content-word-count',
			title: 'Page has minimum content word count.',
			failureTitle: 'Page has low content word count.',
			description: 'Check page for low content word count.',
			requiredArtifacts: ['ContentElements'],
		}
	}

	/**
	* @param {LH.Artifacts} artifacts
	* @param {LH.Audit.Context} context
	*/
	static audit(artifacts, context) {
		// Get the data / elements collected by the gatherer
		const content = artifacts.ContentElements.map(element => element.textContent.replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, '').split(' ')).flat();

		/**
		* @return {LH.Product}
		*/

		if(content.length < 300) {
			return {
				score: 0,
			}
		}

		return {
			score: 1,
		};
	}
}

module.exports = ContentWordCount;