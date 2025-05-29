

export interface Collaborator {
  nome: string;
  unidade: string;
}

export interface Collaborators {
  [ramal: string]: Collaborator;
}

export type CallDirection = 'recebida' | 'originada' | 'interna' | 'indeterminada';

export interface CallRecord {
  [key: string]: any; // Allow dynamic properties from CSV
  start_stamp: Date;
  duration: number;
  hangup_cause: string;
  extension: string; // Ensure extension is always a string for consistency
  // Common fields, actual CSV might have more
  caller_id_name?: string;
  caller_id_number?: string;
  destination_number?: string;
  tempo_toque?: number;
  nome_colaborador?: string; // Added for collaborator name
  unidade_colaborador?: string; // Added for collaborator unit
  call_direction?: CallDirection; // Added for call direction
}

export interface FiltersState {
  startDate: Date | null;
  endDate: Date | null;
  extension: string[];
  minDuration: number;
  hangupCause: string;
  unit: string;
  callDirection: CallDirection | "";
  showOnlySuccessfulCalls: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  originalExtension?: string; // Added for callsByExtensionChartData
  // For comparison chart, other keys might be present representing series
  [key: string]: any;
}


export interface ExtensionPerformanceStats {
  ramal: string;
  nome_colaborador?: string;
  unidade_colaborador?: string;
  chamadasAtendidas: number;
  chamadasNaoAtendidas: number;
  duracaoTotalEmChamada: number;
  duracaoMediaEmChamada: number;
  chamadasRecebidasEnvolvendoRamal: number;
  chamadasOriginadasEnvolvendoRamal: number;
  chamadasInternasEnvolvendoRamal: number;
}

export interface MetricsSet {
  total: number;
  attended: number;
  lost: number;
  short: number;
  averageTimeDisplay: React.ReactNode;
  received: number;
  originated: number;
  internal: number;
  averageTimeSeconds: number;
}

export type ComparisonType = 'colaborador' | 'unidade' | '';

export interface ComparisonSelection {
  type: ComparisonType;
  elementA: string;
  elementB: string;
  elementC?: string; // Optional
  elementD?: string; // Optional
}

export interface ComparisonElementResult {
  id: 'A' | 'B' | 'C' | 'D';
  displayName: string;
  metrics: MetricsSet;
  data: CallRecord[]; // Keep original data for each element for chart clicks
}

export interface ComparisonResults {
  activeElements: ComparisonElementResult[];
  chartDataCallsByHour: Array<{[key: string]: string | number}> | null;
}

// Kept for chart config, but not directly in ComparisonResults type for chart data itself
export interface ComparisonChartData {
  name: string;
  // valueA, valueB, valueC, valueD will be dynamically added based on activeElements
  [key: string]: number | string;
}
