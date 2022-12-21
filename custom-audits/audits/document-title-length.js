const { Audit, AxeAudit } = require("lighthouse");

class TitleLength extends Audit {
	static get meta() {
		return {
			id: 'document-title-length',
			title: 'Document title character count is ideal.',
			failureTitle: 'Document title character count is NOT ideal.',
			description: 'Document title character count.',
			requiredArtifacts: ['HeadElements'],
		}
	}
	
	static audit(artifacts, context) {
		const min = 50;
		const max = 60;

		const documentTitle = artifacts.HeadElements.length > 0 ? artifacts.HeadElements[0].textContent : '';

		if(documentTitle.length < min || documentTitle.length > max) {
			return {
				score: 0,
				explanation: (documentTitle.length < min ? 'Document title is too short.' : (documentTitle.length > max ? 'Document title is too long.' : '')),
			};
		}
		return {
			score: 1, // Number between 0 and 1
			numericValue: documentTitle.length,
			numericUnit: 'characters',
			displayValue: `${documentTitle.length} characters`,
		};
	}
}

module.exports = TitleLength;