export interface SourceRow {
	id: string;
	label: string;
	tokens: number;
	files: number;
}

export interface ModelRow {
	model: string;
	tokens: number;
	mlPer1k: number;
}

export interface HistoryData {
	totalTokens: number;
	totalMl: number;
	runCount: number;
}

export interface AquaExport {
	version: 1;
	exportedAt: string;
	mode: 'sync' | 'auto';
	totalTokens: number;
	totalMl: number;
	sources: SourceRow[];
	modelBreakdown: ModelRow[];
	history: HistoryData;
}
