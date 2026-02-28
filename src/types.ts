export interface Player {
  id: string;
  name: string;
  handling: number;
  shooting: number;
  defense: number;
  rebounding: number;
  stamina: number;
}

export interface AnalysisResult {
  structure: string;
  positions: string;
  roles: string;
  offense: string;
  defense: string;
  possession: string;
}
