export interface ContainerDef {
	capMl: number;
	innerWidth: number;
	innerHeight: number;
}

export const CONTAINERS: Record<string, ContainerDef> = {
	glass: { capMl: 300, innerWidth: 10, innerHeight: 5 },
	bottle: { capMl: 4000, innerWidth: 10, innerHeight: 8 },
	bathtub: { capMl: 150000, innerWidth: 28, innerHeight: 5 },
	pool: { capMl: 8000000, innerWidth: 36, innerHeight: 5 }
};

export function pickContainer(ml: number): string {
	if (ml < 300) return 'glass';
	if (ml < 4000) return 'bottle';
	if (ml < 150000) return 'bathtub';
	return 'pool';
}
