export interface ContainerDef {
	capMl: number;
	innerWidth: number;
	innerHeight: number;
	shape: 'glass' | 'bottle' | 'bathtub' | 'pool';
}

export const CONTAINERS: Record<string, ContainerDef> = {
	glass: { capMl: 300, innerWidth: 10, innerHeight: 5, shape: 'glass' },
	bottle: { capMl: 4000, innerWidth: 10, innerHeight: 8, shape: 'bottle' },
	bathtub: { capMl: 150000, innerWidth: 28, innerHeight: 5, shape: 'bathtub' },
	pool: { capMl: 8000000, innerWidth: 36, innerHeight: 5, shape: 'pool' }
};

export function pickContainer(ml: number): string {
	if (ml < 300) return 'glass';
	if (ml < 4000) return 'bottle';
	if (ml < 150000) return 'bathtub';
	return 'pool';
}
