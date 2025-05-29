
"use client";

import type { ChangeEvent } from "react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Papa from "papaparse";
import { format, isValid } from "date-fns";
import { ptBR } from 'date-fns/locale/pt-BR';

import type { CallRecord, FiltersState, ChartData, Collaborator, Collaborators, ExtensionPerformanceStats, CallDirection, MetricsSet, ComparisonType, ComparisonSelection, ComparisonResults, ComparisonElementResult } from "@/types";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, AlertCircle, ArrowDownLeft, ArrowUpRight, BarChart2 as BarChartIcon, BookOpen, FileText, Filter, Hourglass, ListFilter, Loader2, Pencil, Phone, PhoneForwarded, PhoneOff, Repeat, Users, UserPlus, Info, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { ChartContainer, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LabelList, ResponsiveContainer } from "recharts";

// Tipagem para os dados brutos do CSV antes de adicionar informações do colaborador
type RawCsvRecord = Omit<CallRecord, 'nome_colaborador' | 'unidade_colaborador' | 'call_direction'>;


const RAMAIS_INICIAL: Collaborators = {
  "2052": { "nome": "Letícia", "unidade": "Matriz - Tubarão" },
  "2000": { "nome": "Carine", "unidade": "Filial - Tubarão" },
  "2001": { "nome": "Vitória", "unidade": "Filial - Tubarão" },
  "2002": { "nome": "Vazio", "unidade": "Filial - Tubarão" },
  "2003": { "nome": "Diane", "unidade": "Filial - Tubarão" },
  "2004": { "nome": "Liana", "unidade": "Filial - Tubarão" },
  "2005": { "nome": "Mayara", "unidade": "Filial - Tubarão" },
  "2006": { "nome": "Maria Eduarda Ventura", "unidade": "Filial - Tubarão" },
  "2007": { "nome": "Gisele", "unidade": "Filial - Tubarão" },
  "2018": { "nome": "Gisnary", "unidade": "Filial - Tubarão" },
  "2029": { "nome": "Juliana/Renata", "unidade": "Filial - Tubarão" },
  "2030": { "nome": "Daniela", "unidade": "Filial - Tubarão" },
  "2033": { "nome": "Henrique", "unidade": "Filial - Tubarão" },
  "2037": { "nome": "Sidineia", "unidade": "Filial - Tubarão" },
  "2008": { "nome": "Sagira", "unidade": "Matriz - Tubarão" },
  "2009": { "nome": "Geovani", "unidade": "Matriz - Tubarão" },
  "2010": { "nome": "Maria Eduarda Coutinho", "unidade": "Matriz - Tubarão" },
  "2011": { "nome": "Juliana/Renata", "unidade": "Matriz - Tubarão" },
  "2012": { "nome": "Catia", "unidade": "Matriz - Tubarão" },
  "2013": { "nome": "Maria Eduarda Souza", "unidade": "Matriz - Tubarão" },
  "2014": { "nome": "Mariana", "unidade": "Matriz - Tubarão" },
  "2015": { "nome": "Consultas", "unidade": "Matriz - Tubarão" },
  "2019": { "nome": "Consultas", "unidade": "Matriz - Tubarão" },
  "2020": { "nome": "Lidiane", "unidade": "Matriz - Tubarão" },
  "2021": { "nome": "Thiago", "unidade": "Matriz - Tubarão" },
  "2023": { "nome": "Samuel", "unidade": "Matriz - Tubarão" },
  "2024": { "nome": "Jardel", "unidade": "Matriz - Tubarão" },
  "2025": { "nome": "Luciane", "unidade": "Matriz - Tubarão" },
  "2026": { "nome": "Cristiane", "unidade": "Matriz - Tubarão" },
  "2028": { "nome": "Muriel", "unidade": "Matriz - Tubarão" },
  "2031": { "nome": "Fabiana", "unidade": "Matriz - Tubarão" },
  "2035": { "nome": "Consultas", "unidade": "Matriz - Tubarão" },
  "2056": { "nome": "Maria Eduarda Gonçalves", "unidade": "Matriz - Tubarão" },
  "2098": { "nome": "Sala de Reunião", "unidade": "Matriz - Tubarão" },
  "2016": { "nome": "Consultas", "unidade": "Filial - Jaguaruna" },
  "2017": { "nome": "Vazio", "unidade": "Filial - Laguna" },
  "2027": { "nome": "Elaine", "unidade": "Filial - Jaguaruna" },
  "2032": { "nome": "Vyctor", "unidade": "Filial - Laguna" },
  "2034": { "nome": "Maria Eduarda Manso", "unidade": "Provida" },
  "2036": { "nome": "Franciele", "unidade": "Filial - Imbituba" }
};

const HANGUP_CAUSE_TRANSLATIONS: Record<string, string> = {
  "NORMAL_CLEARING": "Desligamento normal – A chamada foi encerrada normalmente por uma das partes.",
  "USER_BUSY": "Usuário ocupado – O destinatário está em outra ligação e não pôde atender.",
  "NO_ANSWER": "Sem resposta – O telefone chamou, mas ninguém atendeu.",
  "ORIGINATOR_CANCEL": "Cancelada pelo originador – Quem iniciou a chamada desligou antes do outro lado atender.",
  "CALL_REJECTED": "Chamada rejeitada – O destinatário recusou a chamada de forma proposital.",
  "LOSE_RACE": "Perdeu a corrida – Outro destino atendeu a chamada primeiro.",
  "NORMAL_TEMPORARY_FAILURE": "Falha temporária – Um erro temporário impediu a continuação da chamada.",
  "UNALLOCATED_NUMBER": "Número inexistente – O número chamado não está atribuído ou não existe.",
  "NETWORK_OUT_OF_ORDER": "Rede fora de serviço – Falha na rede entre os pontos da ligação.",
  "RECOVERY_ON_TIMER_EXPIRE": "Tempo de resposta excedido – O sistema não recebeu resposta dentro do tempo esperado.",
  "NORMAL_UNSPECIFIED": "Desligamento não especificado – A chamada foi encerrada, mas sem motivo específico registrado.",
  "ALLOTTED_TIMEOUT": "Tempo máximo excedido – O tempo total permitido para a chamada foi ultrapassado.",
  "SUBSCRIBER_ABSENT": "Usuário não registrado – O usuário de destino não está registrado ou está offline.",
  "MEDIA_TIMEOUT": "Tempo de mídia excedido – Não foi recebida mídia (áudio) dentro do tempo esperado.",
  "ATTENDED_TRANSFER": "Transferência assistida – A chamada foi transferida com assistência.",
  "INCOMPATIBLE_DESTINATION": "Destino incompatível – Erro de configuração/terminal.",
  "NO_USER_RESPONSE": "Sem Resposta do Usuário (após atender)",
  "NO_ROUTE_DESTINATION": "Sem Rota para o Destino",
  "CHAN_UNAVAIL": "Canal Indisponível",
  "SYSTEM_SHUTDOWN": "Sistema Desligado",
  "DESTINATION_OUT_OF_ORDER": "Destino Fora de Serviço",
  "INVALID_MSG_UNSPECIFIED": "Mensagem Inválida (Não Especificado)",
  "MANDATORY_IE_MISSING": "Elemento de Informação Obrigatório Ausente",
  "MESSAGE_TYPE_NONEXIST": "Tipo de Mensagem Inexistente",
  "WRONG_CALL_STATE": "Estado da Chamada Incorreto",
};

const METRIC_DESCRIPTIONS: Record<string, string> = {
  "Total de Chamadas": "Número total de registros de chamadas para o elemento.",
  "Chamadas Atendidas": "Chamadas que foram completadas com sucesso (desligamento normal).",
  "Chamadas Perdidas": "Chamadas não atendidas por diversos motivos (ex: sem resposta, ocupado).",
  "Chamadas Curtas (<10s)": "Chamadas atendidas com duração inferior a 10 segundos.",
  "Tempo Médio Atend.": "Duração média das chamadas atendidas (em segundos e minutos).",
  "Chamadas Recebidas": "Chamadas entrantes para um ramal/unidade cadastrado, de origem externa.",
  "Chamadas Originadas": "Chamadas saintes de um ramal/unidade cadastrado para um destino externo.",
  "Chamadas Internas": "Chamadas entre dois ramais/unidades cadastrados.",
};

const translateHangupCause = (cause: string): string => {
  return HANGUP_CAUSE_TRANSLATIONS[cause] || cause;
};

const ITEMS_PER_PAGE_DETAILED_LOGS = 50;

const CallDataAnalyzer: React.FC = () => {
  const [initialCsvData, setInitialCsvData] = useState<RawCsvRecord[]>([]);
  const [allData, setAllData] = useState<CallRecord[]>([]);
  const [filteredData, setFilteredData] = useState<CallRecord[]>([]);
  const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
  const { toast } = useToast();

  const initialFilters: FiltersState = {
    startDate: null,
    endDate: null,
    extension: [],
    minDuration: 0,
    hangupCause: "",
    unit: "",
    callDirection: "",
    showOnlySuccessfulCalls: false,
  };
  const [filters, setFilters] = useState<FiltersState>(initialFilters);

  const [isLoadingCsv, setIsLoadingCsv] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [collaborators, setCollaborators] = useState<Collaborators>(RAMAIS_INICIAL);
  const [newCollaboratorForm, setNewCollaboratorForm] = useState<{ ramal: string; nome: string; unidade: string }>({
    ramal: "",
    nome: "",
    unidade: "",
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRamal, setEditingRamal] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ nome: string; unidade: string }>({ nome: "", unidade: "" });

  const [comparisonSelection, setComparisonSelection] = useState<ComparisonSelection>({
    type: '',
    elementA: '',
    elementB: '',
    elementC: '',
    elementD: '',
  });
  const [comparisonResults, setComparisonResults] = useState<ComparisonResults | null>(null);

  // State for chart click details modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailModalTitle, setDetailModalTitle] = useState("");
  const [detailModalData, setDetailModalData] = useState<CallRecord[]>([]);

  // State for pagination of detailed logs
  const [currentPageDetailedLogs, setCurrentPageDetailedLogs] = useState(1);


  useEffect(() => {
    if (initialCsvData.length === 0) {
      setAllData([]);
      return;
    }
    const dataWithCollaboratorsAndDirection = initialCsvData.map(rawRecord => {
      const record = { ...rawRecord } as CallRecord;
      const extensionStr = String(record.extension || "");
      const collaboratorInfo = collaborators[extensionStr];
      record.nome_colaborador = collaboratorInfo ? collaboratorInfo.nome : (extensionStr ? `Ramal ${extensionStr}`: 'Desconhecido');
      record.unidade_colaborador = collaboratorInfo ? collaboratorInfo.unidade : 'Desconhecida';

      const callerId = String(record.caller_id_number || "").trim();
      const destinationNumber = String(record.destination_number || "").trim();

      const isCallerInternal = !!(callerId && collaborators[callerId]);
      const isDestinationInternal = !!(destinationNumber && collaborators[destinationNumber]);

      if (isDestinationInternal && !isCallerInternal) {
        record.call_direction = 'recebida';
      } else if (isCallerInternal && !isDestinationInternal) {
        record.call_direction = 'originada';
      } else if (isCallerInternal && isDestinationInternal) {
        record.call_direction = 'interna';
      } else {
        record.call_direction = 'indeterminada';
      }
      return record;
    });
    setAllData(dataWithCollaboratorsAndDirection);
  }, [initialCsvData, collaborators]);


  const uniqueHangupCauses = useMemo(() => {
    if (allData.length === 0) return [];
    const causes = new Set(allData.map(d => d.hangup_cause));
    return Array.from(causes).sort();
  }, [allData]);

  const uniqueUnits = useMemo(() => {
    const units = new Set(Object.values(collaborators).map(c => c.unidade).filter(Boolean));
    return Array.from(units).sort();
  }, [collaborators]);

  const sortedCollaboratorsArray = useMemo(() => {
    return Object.entries(collaborators)
      .map(([ramal, details]) => ({ ramal, ...details }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [collaborators]);

  const handleAddCollaborator = () => {
    const { ramal, nome, unidade } = newCollaboratorForm;
    if (ramal.trim() && nome.trim() && unidade.trim()) {
      if (collaborators[ramal.trim()]) {
        toast({ title: "Erro", description: `Ramal ${ramal} já existe.`, variant: "destructive" });
        return;
      }
      setCollaborators(prev => ({
        ...prev,
        [ramal.trim()]: { nome: nome.trim(), unidade: unidade.trim() }
      }));
      setNewCollaboratorForm({ ramal: "", nome: "", unidade: "" });
      toast({ title: "Sucesso", description: "Colaborador adicionado!" });
    } else {
      toast({ title: "Erro", description: "Preencha todos os campos para adicionar um colaborador.", variant: "destructive" });
    }
  };

  const handleOpenEditDialog = (ramal: string) => {
    const collaborator = collaborators[ramal];
    if (collaborator) {
      setEditingRamal(ramal);
      setEditForm({ nome: collaborator.nome, unidade: collaborator.unidade });
      setEditDialogOpen(true);
    }
  };

  const handleSaveEditCollaborator = () => {
    if (editingRamal && editForm.nome.trim() && editForm.unidade.trim()) {
      setCollaborators(prev => ({
        ...prev,
        [editingRamal]: { nome: editForm.nome.trim(), unidade: editForm.unidade.trim() }
      }));
      setEditDialogOpen(false);
      setEditingRamal(null);
      toast({ title: "Sucesso", description: "Colaborador atualizado!" });
    } else {
      toast({ title: "Erro", description: "Nome e Unidade não podem ser vazios.", variant: "destructive" });
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoadingCsv(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (result) => {
        if (result.errors.length > 0) {
          setError(`Erro ao processar CSV: ${result.errors.map(e => e.message).join(', ')}`);
          setIsLoadingCsv(false);
          return;
        }
        if (result.data.length === 0) {
          setError("O arquivo CSV está vazio ou não possui linhas de dados.");
          setIsLoadingCsv(false);
          return;
        }

        const parsedRows = (result.data as Record<string, string>[]).map((row) => {
          const rawRecord: any = {};
          Object.keys(row).forEach(key => {
            if (key === 'start_stamp') {
              const dateValue = new Date(row[key]);
              rawRecord[key] = isValid(dateValue) ? dateValue : new Date(0);
            } else if (key === 'duration' || key === 'tempo_toque') {
              rawRecord[key] = parseFloat(row[key]) || 0;
            } else if (key === 'extension' || key === 'caller_id_number' || key === 'destination_number') {
               rawRecord[key] = String(row[key] || "");
            } else if (key === 'hangup_cause'){
                rawRecord[key] = row[key] || "DESCONHECIDO";
            }
            else {
              rawRecord[key] = row[key];
            }
          });
          return rawRecord as RawCsvRecord;
        });

        setInitialCsvData(parsedRows);
        setColumnHeaders(result.meta.fields || Object.keys(parsedRows[0] || {}));
        setIsLoadingCsv(false);
      },
      error: (err) => {
        setError(`Falha ao processar CSV: ${err.message}`);
        setIsLoadingCsv(false);
      }
    });
  };

  const applyFilters = useCallback(() => {
    let dataToFilter = allData;
    if (filters.startDate) {
      dataToFilter = dataToFilter.filter(d => d.start_stamp >= filters.startDate!);
    }
    if (filters.endDate) {
      const adjustedEndDate = new Date(filters.endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      dataToFilter = dataToFilter.filter(d => d.start_stamp <= adjustedEndDate);
    }
    if (filters.extension.length > 0) {
      dataToFilter = dataToFilter.filter(d => filters.extension.includes(String(d.extension)));
    }
    if (filters.minDuration > 0) {
      dataToFilter = dataToFilter.filter(d => d.hangup_cause === "NORMAL_CLEARING" && d.duration >= filters.minDuration);
    }
    if (filters.hangupCause) {
      dataToFilter = dataToFilter.filter(d => d.hangup_cause === filters.hangupCause);
    }
    if (filters.showOnlySuccessfulCalls) {
        dataToFilter = dataToFilter.filter(d => d.hangup_cause === "NORMAL_CLEARING");
    }
    if (filters.unit) {
      dataToFilter = dataToFilter.filter(d => d.unidade_colaborador === filters.unit);
    }
    if (filters.callDirection) {
      dataToFilter = dataToFilter.filter(d => d.call_direction === filters.callDirection);
    }
    setFilteredData(dataToFilter);
    setCurrentPageDetailedLogs(1); // Reset pagination on filter apply
    return dataToFilter;
  }, [allData, filters]);

  useEffect(() => {
    const currentFilters = applyFilters();
    if (comparisonResults && currentFilters.length !== filteredData.length) { // A check to see if filters actually changed the dataset
        setComparisonResults(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, allData]);


  const resetFilters = () => {
    setFilters(initialFilters);
    setFilteredData(allData);
    setComparisonResults(null);
    setCurrentPageDetailedLogs(1);
  };

  const calculateMetricsForSet = useCallback((dataSet: CallRecord[]): MetricsSet => {
    const total = dataSet.length;
    const attended = dataSet.filter(d => d.hangup_cause === "NORMAL_CLEARING").length;
    const lostCauses = ["NO_ANSWER", "ORIGINATOR_CANCEL", "LOSE_RACE", "USER_BUSY", "NO_USER_RESPONSE", "CALL_REJECTED", "SUBSCRIBER_ABSENT"];
    const lost = dataSet.filter(d => lostCauses.includes(d.hangup_cause)).length;
    const short = dataSet.filter(d => d.duration < 10 && d.hangup_cause === "NORMAL_CLEARING").length;
    const totalDurationAttended = dataSet.filter(d => d.hangup_cause === "NORMAL_CLEARING").reduce((sum, d) => sum + d.duration, 0);

    const averageTimeInSecondsRaw = attended > 0 ? (totalDurationAttended / attended) : 0;

    const received = dataSet.filter(d => d.call_direction === 'recebida').length;
    const originated = dataSet.filter(d => d.call_direction === 'originada').length;
    const internal = dataSet.filter(d => d.call_direction === 'interna').length;

    return {
      total,
      attended,
      lost,
      short,
      averageTimeDisplay: (
        <>
          <span className="block">{averageTimeInSecondsRaw.toFixed(2)}s</span>
          <span className="block text-base font-normal text-muted-foreground">({(averageTimeInSecondsRaw / 60).toFixed(2)} min)</span>
        </>
      ),
      averageTimeSeconds: averageTimeInSecondsRaw,
      received,
      originated,
      internal,
    };
  }, []);


  const metrics = useMemo(() => {
    return calculateMetricsForSet(filteredData);
  }, [filteredData, calculateMetricsForSet]);

  const callsByHourChartData: ChartData[] = useMemo(() => {
    const counts: { [hour: string]: number } = {};
    for (let i = 0; i < 24; i++) counts[String(i).padStart(2, '0')] = 0;
    filteredData.forEach(d => {
      const hour = String(d.start_stamp.getHours()).padStart(2, '0');
      counts[hour] = (counts[hour] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: `${name}h`, value }));
  }, [filteredData]);

  const callsByExtensionChartData: ChartData[] = useMemo(() => {
    const counts: { [ext: string]: { value: number, name: string, originalExtension: string } } = {};
    filteredData.forEach(d => {
      if (d.hangup_cause === "NORMAL_CLEARING") {
        const ext = String(d.extension || "Desconhecido");
        if (!counts[ext]) {
          counts[ext] = { value: 0, name: collaborators[ext]?.nome || `Ramal ${ext}`, originalExtension: ext };
        }
        counts[ext].value++;
      }
    });
    return Object.values(counts)
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [filteredData, collaborators]);

  const callsByUnitChartData: ChartData[] = useMemo(() => {
    const counts: { [unit: string]: number } = {};
    filteredData.forEach(d => {
      if (d.hangup_cause === "NORMAL_CLEARING" && d.unidade_colaborador) {
        counts[d.unidade_colaborador] = (counts[d.unidade_colaborador] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const extensionPerformanceData: ExtensionPerformanceStats[] = useMemo(() => {
    const statsByExtension: Record<string, ExtensionPerformanceStats> = {};

    Object.keys(collaborators).forEach(ramal => {
        statsByExtension[ramal] = {
            ramal,
            nome_colaborador: collaborators[ramal].nome,
            unidade_colaborador: collaborators[ramal].unidade,
            chamadasAtendidas: 0,
            chamadasNaoAtendidas: 0,
            duracaoTotalEmChamada: 0,
            duracaoMediaEmChamada: 0,
            chamadasRecebidasEnvolvendoRamal: 0,
            chamadasOriginadasEnvolvendoRamal: 0,
            chamadasInternasEnvolvendoRamal: 0,
        };
    });

    filteredData.forEach(d => {
      const ext = String(d.extension);
      if (!statsByExtension[ext] && collaborators[ext]) {
         statsByExtension[ext] = {
            ramal: ext,
            nome_colaborador: collaborators[ext]?.nome || `Ramal ${ext}`,
            unidade_colaborador: collaborators[ext]?.unidade || 'Desconhecida',
            chamadasAtendidas: 0,
            chamadasNaoAtendidas: 0,
            duracaoTotalEmChamada: 0,
            duracaoMediaEmChamada: 0,
            chamadasRecebidasEnvolvendoRamal: 0,
            chamadasOriginadasEnvolvendoRamal: 0,
            chamadasInternasEnvolvendoRamal: 0,
        };
      } else if (!statsByExtension[ext] && !collaborators[ext]) {
        return;
      }


      if (d.hangup_cause === "NORMAL_CLEARING") {
        statsByExtension[ext].chamadasAtendidas++;
        statsByExtension[ext].duracaoTotalEmChamada += d.duration;
      } else if (["NO_ANSWER", "USER_BUSY", "NO_USER_RESPONSE"].includes(d.hangup_cause)) {
        statsByExtension[ext].chamadasNaoAtendidas++;
      }

      if (d.call_direction === 'recebida' && String(d.destination_number) === ext) {
        statsByExtension[ext].chamadasRecebidasEnvolvendoRamal++;
      } else if (d.call_direction === 'originada' && String(d.caller_id_number) === ext) {
        statsByExtension[ext].chamadasOriginadasEnvolvendoRamal++;
      } else if (d.call_direction === 'interna' && (String(d.caller_id_number) === ext || String(d.destination_number) === ext)) {
        statsByExtension[ext].chamadasInternasEnvolvendoRamal++;
      }
    });

    return Object.values(statsByExtension).map(stat => ({
      ...stat,
      duracaoMediaEmChamada: stat.chamadasAtendidas > 0 ? parseFloat((stat.duracaoTotalEmChamada / stat.chamadasAtendidas).toFixed(2)) : 0,
    })).sort((a,b) => (a.nome_colaborador || "").localeCompare(b.nome_colaborador || ""));
  }, [filteredData, collaborators]);

  const chartConfig = {
    value: { label: "Chamadas" },
  } satisfies ChartConfig;


  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    setFilters(prev => ({ ...prev, [field]: date || null }));
  };

  const handleExtensionMultiSelect = (extensionValue: string) => {
    setFilters(prevFilters => {
      const newSelectedExtensions = prevFilters.extension.includes(extensionValue)
        ? prevFilters.extension.filter(ext => ext !== extensionValue)
        : [...prevFilters.extension, extensionValue];
      return { ...prevFilters, extension: newSelectedExtensions };
    });
  };

  const getSelectedExtensionsText = () => {
    if (filters.extension.length === 0) return "Todos os Ramais";
    if (filters.extension.length === 1) {
      const ext = filters.extension[0];
      return collaborators[ext]?.nome || `Ramal ${ext}`;
    }
    return `${filters.extension.length} Ramais Selecionados`;
  };

  const handleApplyComparison = useCallback(() => {
    const { type, elementA, elementB, elementC, elementD } = comparisonSelection;

    if (!type) {
      toast({ title: "Seleção Incompleta", description: "Por favor, selecione o tipo de comparação.", variant: "destructive" });
      setComparisonResults(null);
      return;
    }

    const selectedElements = [elementA, elementB, elementC, elementD].filter(Boolean) as string[];
    if (selectedElements.length < 2) {
        toast({ title: "Seleção Incompleta", description: "Selecione pelo menos dois elementos para comparação.", variant: "destructive" });
        setComparisonResults(null);
        return;
    }

    const uniqueSelectedElements = Array.from(new Set(selectedElements));
    if (uniqueSelectedElements.length !== selectedElements.length) {
        toast({ title: "Seleção Inválida", description: "Os elementos selecionados devem ser diferentes.", variant: "destructive" });
        setComparisonResults(null);
        return;
    }

    const baseFilteredData = applyFilters();
    const activeElementsResults: ComparisonElementResult[] = [];
    const elementKeys = ['A', 'B', 'C', 'D'] as const;

    uniqueSelectedElements.forEach((elementValue, index) => {
        let dataForElement: CallRecord[] = [];
        let displayName = elementValue;

        if (type === 'colaborador') {
            dataForElement = baseFilteredData.filter(d => String(d.extension) === elementValue);
            displayName = collaborators[elementValue]?.nome || `Ramal ${elementValue}`;
        } else if (type === 'unidade') {
            dataForElement = baseFilteredData.filter(d => d.unidade_colaborador === elementValue);
        }

        activeElementsResults.push({
            id: elementKeys[index],
            displayName: displayName,
            metrics: calculateMetricsForSet(dataForElement),
            data: dataForElement,
        });
    });

    const hourlyCounts: { [hour: string]: { [displayName: string]: number } } = {};
    for (let i = 0; i < 24; i++) {
      const hourStr = String(i).padStart(2, '0');
      hourlyCounts[hourStr] = {};
      activeElementsResults.forEach(el => {
        hourlyCounts[hourStr][el.displayName] = 0;
      });
    }

    activeElementsResults.forEach(elResult => {
        elResult.data.forEach(d => {
            const hour = String(d.start_stamp.getHours()).padStart(2, '0');
            if (hourlyCounts[hour]) {
                 hourlyCounts[hour][elResult.displayName] = (hourlyCounts[hour][elResult.displayName] || 0) + 1;
            }
        });
    });

    const chartDataCallsByHour = Object.keys(hourlyCounts).map(hour => {
        const entry: { [key: string]: string | number } = { name: `${hour}h` };
        activeElementsResults.forEach(elResult => {
            entry[elResult.displayName] = hourlyCounts[hour][elResult.displayName];
        });
        return entry;
    });

    setComparisonResults({ activeElements: activeElementsResults, chartDataCallsByHour });
    toast({ title: "Comparação Aplicada", description: `Comparando ${activeElementsResults.map(e => e.displayName).join(' vs ')}.`});

  }, [comparisonSelection, applyFilters, calculateMetricsForSet, collaborators, toast]);

  const openDetailModal = useCallback((title: string, data: CallRecord[]) => {
    setDetailModalTitle(title);
    setDetailModalData(data);
    setIsDetailModalOpen(true);
  }, []);

  const handleChartClick = useCallback((chartType: string, clickedItemData: any, seriesName?: string) => {
    let relevantCalls: CallRecord[] = [];
    let modalTitle = "Detalhes da Seleção";

    const baseDataForFiltering = seriesName && comparisonResults?.activeElements
      ? comparisonResults.activeElements.find(el => el.displayName === seriesName)?.data || filteredData
      : filteredData;

    switch (chartType) {
      case 'byHour':
        const hourString = clickedItemData.name.replace('h', '');
        const hour = parseInt(hourString, 10);
        if (!isNaN(hour)) {
          relevantCalls = baseDataForFiltering.filter(call => call.start_stamp.getHours() === hour);
          modalTitle = seriesName ? `Chamadas de ${seriesName} às ${hour}h` : `Chamadas às ${hour}h`;
        }
        break;
      case 'byExtension':
        if (clickedItemData.originalExtension) {
          relevantCalls = filteredData.filter(call => String(call.extension) === clickedItemData.originalExtension && call.hangup_cause === "NORMAL_CLEARING");
          modalTitle = `Chamadas Atendidas por ${clickedItemData.name}`;
        }
        break;
      case 'byUnit':
        relevantCalls = filteredData.filter(call => call.unidade_colaborador === clickedItemData.name && call.hangup_cause === "NORMAL_CLEARING");
        modalTitle = `Chamadas Atendidas pela Unidade: ${clickedItemData.name}`;
        break;
      default:
        return;
    }

    if (relevantCalls.length > 0) {
      openDetailModal(modalTitle, relevantCalls);
    } else {
      toast({ title: "Nenhum dado", description: "Nenhum registro encontrado para esta seleção.", variant: "default" });
    }
  }, [filteredData, openDetailModal, toast, comparisonResults]);


  // Pagination for Detailed Logs
  const totalPagesDetailedLogs = Math.ceil(filteredData.length / ITEMS_PER_PAGE_DETAILED_LOGS);
  const startIndexDetailedLogs = (currentPageDetailedLogs - 1) * ITEMS_PER_PAGE_DETAILED_LOGS;
  const endIndexDetailedLogs = startIndexDetailedLogs + ITEMS_PER_PAGE_DETAILED_LOGS;
  const currentDetailedLogsData = filteredData.slice(startIndexDetailedLogs, endIndexDetailedLogs);

  const handleNextPageDetailedLogs = () => {
    setCurrentPageDetailedLogs(prev => Math.min(prev + 1, totalPagesDetailedLogs));
  };
  const handlePreviousPageDetailedLogs = () => {
    setCurrentPageDetailedLogs(prev => Math.max(prev - 1, 1));
  };


  const renderMetricsCard = () => (
    <Card className="shadow-lg mb-6 renderMetricsCard">
      <CardHeader>
        <CardTitle>Métricas Chave</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-center">
          {[
            { label: "Total de Chamadas", value: metrics.total, icon: <FileText className="mx-auto mb-1 text-accent" /> },
            { label: "Chamadas Atendidas", value: metrics.attended, icon: <Phone className="mx-auto mb-1 text-accent" /> },
            { label: "Chamadas Perdidas", value: metrics.lost, icon: <PhoneOff className="mx-auto mb-1 text-accent" /> },
            { label: "Chamadas Curtas (<10s)", value: metrics.short, icon: <Hourglass className="mx-auto mb-1 text-accent" /> },
            { label: "Tempo Médio Atend.", value: metrics.averageTimeDisplay, icon: <Activity className="mx-auto mb-1 text-accent" /> },
            { label: "Chamadas Recebidas", value: metrics.received, icon: <ArrowDownLeft className="mx-auto mb-1 text-accent" /> },
            { label: "Chamadas Originadas", value: metrics.originated, icon: <ArrowUpRight className="mx-auto mb-1 text-accent" /> },
            { label: "Chamadas Internas", value: metrics.internal, icon: <Repeat className="mx-auto mb-1 text-accent" /> },
          ].map(metric => (
            <li key={metric.label} className="p-4 bg-card rounded-lg shadow-sm border">
              {metric.icon}
              <span className="block text-sm text-muted-foreground">{metric.label}</span>
              <strong className="block text-2xl text-primary">{metric.value}</strong>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );

  const renderCallsByHourChart = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Volume de Chamadas por Hora</CardTitle>
      </CardHeader>
      <CardContent>
        {callsByHourChartData.length > 0 ? (
           <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={callsByHourChartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }} onClick={(data) => data && data.activePayload && data.activePayload[0] && handleChartClick('byHour', data.activePayload[0].payload)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <RechartsTooltip
                cursor={{ fill: 'hsl(var(--accent)/0.3)' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Chamadas" cursor="pointer">
                <LabelList dataKey="value" position="top" style={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (<p className="text-muted-foreground">Nenhum dado para exibir neste gráfico.</p>)}
      </CardContent>
    </Card>
  );

  const renderCallsByExtensionChart = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Volume de Chamadas Atendidas por Ramal (Top 15)</CardTitle>
      </CardHeader>
      <CardContent>
        {callsByExtensionChartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart data={callsByExtensionChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }} onClick={(data) => data && data.activePayload && data.activePayload[0] && handleChartClick('byExtension', data.activePayload[0].payload)}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={10} width={100} interval={0} />
               <RechartsTooltip
                cursor={{ fill: 'hsl(var(--accent)/0.3)' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} name="Chamadas Atendidas" cursor="pointer">
                <LabelList dataKey="value" position="right" offset={5} style={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (<p className="text-muted-foreground">Nenhum dado para exibir neste gráfico.</p>)}
      </CardContent>
    </Card>
  );

  const renderCallsByUnitChart = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Volume de Chamadas Atendidas por Unidade</CardTitle>
      </CardHeader>
      <CardContent>
        {callsByUnitChartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={callsByUnitChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }} onClick={(data) => data && data.activePayload && data.activePayload[0] && handleChartClick('byUnit', data.activePayload[0].payload)}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={10} width={120} interval={0} />
              <RechartsTooltip
                cursor={{ fill: 'hsl(var(--accent)/0.3)' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="value" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} name="Chamadas Atendidas" cursor="pointer">
                 <LabelList dataKey="value" position="right" offset={5} style={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (<p className="text-muted-foreground">Nenhum dado para exibir neste gráfico.</p>)}
      </CardContent>
    </Card>
  );


  const renderExtensionPerformanceTable = () => (
    <Card className="shadow-lg renderExtensionPerformanceTable">
      <CardHeader>
        <CardTitle>Desempenho Detalhado por Ramal</CardTitle>
      </CardHeader>
      <CardContent>
        {extensionPerformanceData.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome Colaborador</TableHead>
                  <TableHead>Ramal</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead className="text-center">Chamadas Atendidas</TableHead>
                  <TableHead className="text-center">Chamadas Não Atendidas (pelo ramal)</TableHead>
                  <TableHead className="text-center">Duração Total Atend. (s)</TableHead>
                  <TableHead className="text-center">Duração Média Atend.</TableHead>
                  <TableHead className="text-center">Chamadas Recebidas (envolvendo ramal)</TableHead>
                  <TableHead className="text-center">Chamadas Originadas (envolvendo ramal)</TableHead>
                  <TableHead className="text-center">Chamadas Internas (envolvendo ramal)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extensionPerformanceData.map((stat) => (
                  <TableRow key={stat.ramal}>
                    <TableCell>{stat.nome_colaborador || '-'}</TableCell>
                    <TableCell>{stat.ramal}</TableCell>
                    <TableCell>{stat.unidade_colaborador || '-'}</TableCell>
                    <TableCell className="text-center">{stat.chamadasAtendidas}</TableCell>
                    <TableCell className="text-center">{stat.chamadasNaoAtendidas}</TableCell>
                    <TableCell className="text-center">{stat.duracaoTotalEmChamada.toFixed(0)}</TableCell>
                    <TableCell className="text-center">
                      {stat.duracaoMediaEmChamada.toFixed(2)}s
                      <span className="block text-xs text-muted-foreground">
                        ({(stat.duracaoMediaEmChamada / 60).toFixed(2)} min)
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{stat.chamadasRecebidasEnvolvendoRamal}</TableCell>
                    <TableCell className="text-center">{stat.chamadasOriginadasEnvolvendoRamal}</TableCell>
                    <TableCell className="text-center">{stat.chamadasInternasEnvolvendoRamal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum dado de desempenho para exibir com base nos filtros atuais.</p>
        )}
      </CardContent>
    </Card>
  );

 const renderComparisonMetricsTable = () => {
    if (!comparisonResults || !comparisonResults.activeElements || comparisonResults.activeElements.length === 0) return null;
    const { activeElements } = comparisonResults;

    const metricLabels = [
        "Total de Chamadas", "Chamadas Atendidas", "Chamadas Perdidas",
        "Chamadas Curtas (<10s)", "Tempo Médio Atend.",
        "Chamadas Recebidas", "Chamadas Originadas", "Chamadas Internas"
    ];

    const getMetricValue = (metrics: MetricsSet, label: string) => {
        switch (label) {
            case "Total de Chamadas": return metrics.total;
            case "Chamadas Atendidas": return metrics.attended;
            case "Chamadas Perdidas": return metrics.lost;
            case "Chamadas Curtas (<10s)": return metrics.short;
            case "Tempo Médio Atend.": return metrics.averageTimeDisplay;
            case "Chamadas Recebidas": return metrics.received;
            case "Chamadas Originadas": return metrics.originated;
            case "Chamadas Internas": return metrics.internal;
            default: return '';
        }
    };

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Métricas Comparativas</CardTitle>
                <CardDescription>Comparando: {activeElements.map(e => `"${e.displayName}"`).join(' vs ')}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Métrica</TableHead>
                            {activeElements.map(element => (
                                <TableHead key={element.id} className="text-center">{element.displayName}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {metricLabels.map(label => (
                            <TableRow key={label}>
                                <TableCell className="font-medium">
                                  {label}
                                  {METRIC_DESCRIPTIONS[label] && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {METRIC_DESCRIPTIONS[label]}
                                    </p>
                                  )}
                                </TableCell>
                                {activeElements.map(element => (
                                    <TableCell key={element.id} className="text-center">
                                        {getMetricValue(element.metrics, label)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
  };

  const renderComparisonCallsByHourChart = () => {
    if (!comparisonResults || !comparisonResults.chartDataCallsByHour || !comparisonResults.activeElements || comparisonResults.activeElements.length === 0) return null;
    const { chartDataCallsByHour, activeElements } = comparisonResults;

    const chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"];

    const dynamicChartConfig: ChartConfig = {};
    activeElements.forEach((element, index) => {
        dynamicChartConfig[element.displayName] = {
            label: element.displayName,
            color: chartColors[index % chartColors.length],
        };
    });

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Volume de Chamadas por Hora (Comparativo)</CardTitle>
                 <CardDescription>Comparando: {activeElements.map(e => `"${e.displayName}"`).join(' vs ')}</CardDescription>
            </CardHeader>
            <CardContent>
                {chartDataCallsByHour.length > 0 ? (
                    <ChartContainer config={dynamicChartConfig} className="h-[350px] w-full">
                        <BarChart 
                            data={chartDataCallsByHour} 
                            margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
                            onClick={(data, index, event) => {
                                if (data && data.activePayload && data.activePayload.length > 0) {
                                    const clickedBarData = data.activePayload[0];
                                    const seriesName = clickedBarData.dataKey as string; // This should be the displayName of the element
                                    handleChartClick('byHour', clickedBarData.payload, seriesName);
                                }
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                            <RechartsTooltip
                                cursor={{ fill: 'hsl(var(--accent)/0.3)' }}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            {activeElements.map((element, index) => (
                                <Bar
                                  key={element.id}
                                  dataKey={element.displayName}
                                  fill={chartColors[index % chartColors.length]}
                                  radius={[4, 4, 0, 0]}
                                  name={element.displayName}
                                  cursor="pointer"
                                >
                                  <LabelList dataKey={element.displayName} position="top" style={{ fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                                </Bar>
                            ))}
                        </BarChart>
                    </ChartContainer>
                ) : (<p className="text-muted-foreground">Nenhum dado para exibir neste gráfico comparativo.</p>)}
            </CardContent>
        </Card>
    );
  };

  const renderTutorialTab = () => (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Tutorial da Aplicação</CardTitle>
        <CardDescription>
          Entenda como utilizar o CallAnalytics e o que cada seção significa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-primary mb-2">Visão Geral</h3>
          <p className="text-muted-foreground">
            O CallAnalytics é uma ferramenta para analisar dados de chamadas de um sistema de telefonia, geralmente exportados em formato CSV.
            Ele permite visualizar tendências, identificar padrões de atendimento e gerenciar informações de colaboradores associadas aos ramais.
            <br /><strong>Nota:</strong> A análise é otimizada e validada para dados originários da central telefônica Handix (dados iniciais) CSV.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-primary mb-2">1. Carregar Arquivo CSV</h3>
          <p className="text-muted-foreground">
            Clique no botão "Escolher arquivo" na seção "Carregar Arquivo CSV" e selecione o arquivo CSV contendo os registros de chamadas.
            O arquivo deve ter um cabeçalho na primeira linha com os nomes das colunas. As colunas esperadas incluem (mas não se limitam a):
          </p>
          <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
            <li><code>start_stamp</code>: Data e hora de início da chamada (ex: "2023-10-26 10:00:00").</li>
            <li><code>duration</code>: Duração da chamada em segundos.</li>
            <li><code>hangup_cause</code>: Código da causa da desconexão (ex: NORMAL_CLEARING, NO_ANSWER).</li>
            <li><code>extension</code>: Ramal principal envolvido na chamada (do ponto de vista do PABX).</li>
            <li><code>caller_id_number</code>: Número de quem originou a chamada.</li>
            <li><code>destination_number</code>: Número para o qual a chamada foi destinada.</li>
            <li><code>tempo_toque</code> (Opcional): Duração em segundos que a chamada tocou antes de ser atendida.</li>
            <li>Outros campos como <code>caller_id_name</code> podem estar presentes.</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-primary mb-2">2. Filtros</h3>
          <p className="text-muted-foreground">
            Após carregar os dados, utilize os filtros para refinar sua análise:
          </p>
          <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-2">
            <li><strong>Data Inicial/Final</strong>: Selecione um período para analisar as chamadas.</li>
            <li><strong>Ramal/Colaborador</strong>: Filtre por um ou mais ramais/colaboradores específicos. Se nenhum for selecionado, todos são considerados.</li>
            <li><strong>Duração Mín. Atendida (s)</strong>: Mostra apenas chamadas ATENDIDAS com duração igual ou superior ao valor inserido (em segundos).</li>
            <li><strong>Causa da Desconexão</strong>: Filtre por um motivo específico pelo qual a chamada terminou.</li>
            <li><strong>Unidade</strong>: Filtre por uma unidade específica de colaborador.</li>
            <li><strong>Direção da Chamada</strong>: Filtre por chamadas Recebidas, Originadas (saentes), Internas (entre ramais cadastrados) ou Indeterminadas.</li>
            <li><strong>Mostrar apenas chamadas concluídas</strong>: Marque esta opção para ver apenas as chamadas que foram completadas com sucesso (ou seja, com causa "Desligamento normal").</li>
          </ul>
          <p className="text-muted-foreground mt-2">
            Clique em "Aplicar Filtros" para atualizar os dados e gráficos, ou "Limpar Filtros" para remover todas as seleções.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-primary mb-2">3. Abas de Análise</h3>

          <div className="mt-4 space-y-3">
            <h4><strong>Aba: Relatório</strong></h4>
            <p className="text-muted-foreground ml-4">Consolida as informações mais importantes para uma visão completa: Métricas Chave, Gráficos de Volume (por Hora, Ramal, Unidade) e a Tabela de Desempenho por Ramal. É a aba mais recomendada para impressão (Ctrl+P).</p>

            <h4><strong>Aba: Visão Geral</strong></h4>
            <p className="text-muted-foreground ml-4">Apresenta as "Métricas Chave" e os gráficos principais: "Volume de Chamadas por Hora", "Volume de Chamadas Atendidas por Ramal" e "Volume de Chamadas Atendidas por Unidade".</p>
            <ul className="list-disc list-inside text-muted-foreground ml-8 mt-1 space-y-1">
                <li><strong>Métricas Chave</strong>:
                    <ul className="list-disc list-inside text-muted-foreground ml-6 mt-1">
                        <li><strong>Total de Chamadas</strong>: Número total de registros no período filtrado.</li>
                        <li><strong>Chamadas Atendidas</strong>: Chamadas com causa "Desligamento normal".</li>
                        <li><strong>Chamadas Perdidas</strong>: Chamadas não atendidas por diversos motivos (ex: Sem Resposta, Cancelada, Ocupado).</li>
                        <li><strong>Chamadas Curtas (&lt;10s)</strong>: Chamadas atendidas com duração inferior a 10 segundos.</li>
                        <li><strong>Tempo Médio Atend.</strong>: Duração média das chamadas atendidas (em segundos e minutos).</li>
                        <li><strong>Chamadas Recebidas</strong>: Total de chamadas identificadas como entrantes para um ramal cadastrado, vindas de um número não cadastrado.</li>
                        <li><strong>Chamadas Originadas</strong>: Total de chamadas identificadas como saintes de um ramal cadastrado para um número não cadastrado.</li>
                        <li><strong>Chamadas Internas</strong>: Total de chamadas entre dois ramais cadastrados.</li>
                    </ul>
                </li>
                <li><strong>Volume de Chamadas por Hora</strong>: Gráfico de barras mostrando a quantidade total de chamadas (atendidas ou não) iniciadas em cada hora do dia. Clique em uma barra para ver os detalhes das chamadas dessa hora.</li>
                <li><strong>Volume de Chamadas Atendidas por Ramal (Top 15)</strong>: Gráfico de barras mostrando as chamadas ATENDIDAS por cada ramal/colaborador. Exibe os 15 ramais com maior volume. Clique em uma barra para ver os detalhes das chamadas atendidas por esse ramal.</li>
                <li><strong>Volume de Chamadas Atendidas por Unidade</strong>: Gráfico de barras mostrando o total de chamadas ATENDIDAS agrupadas pela unidade do colaborador. Clique em uma barra para ver os detalhes das chamadas atendidas por essa unidade.</li>
            </ul>

            <h4><strong>Aba: Desempenho por Ramal</strong></h4>
            <p className="text-muted-foreground ml-4">Exibe uma tabela detalhada com estatísticas por ramal/colaborador:</p>
            <ul className="list-disc list-inside text-muted-foreground ml-8 mt-1 space-y-1">
              <li><strong>Nome Colaborador, Ramal, Unidade</strong>: Informações do colaborador.</li>
              <li><strong>Chamadas Atendidas</strong>: Quantidade de chamadas efetivamente atendidas pelo ramal.</li>
              <li><strong>Chamadas Não Atendidas (pelo ramal)</strong>: Chamadas que tocaram no ramal, mas não foram atendidas por ele (ex: NO_ANSWER, USER_BUSY no ramal).</li>
              <li><strong>Duração Total Atend. (s)</strong>: Soma da duração de todas as chamadas atendidas pelo ramal.</li>
              <li><strong>Duração Média Atend.</strong>: Tempo médio das chamadas atendidas pelo ramal (em segundos e minutos).</li>
              <li><strong>Chamadas Recebidas (envolvendo ramal)</strong>: Quantas chamadas globais classificadas como "Recebidas" tiveram este ramal como destino principal.</li>
              <li><strong>Chamadas Originadas (envolvendo ramal)</strong>: Quantas chamadas globais classificadas como "Originadas" tiveram este ramal como origem principal.</li>
              <li><strong>Chamadas Internas (envolvendo ramal)</strong>: Quantas chamadas globais classificadas como "Internas" tiveram este ramal como origem ou destino.</li>
            </ul>

            <h4><strong>Aba: Comparativo</strong></h4>
            <p className="text-muted-foreground ml-4">Permite comparar o desempenho de até quatro colaboradores ou quatro unidades lado a lado para o período filtrado globalmente. <strong>Atenção: Esta funcionalidade está em desenvolvimento e em fase de testes. Alguns resultados ou comportamentos podem não ser finais.</strong></p>
            <ul className="list-disc list-inside text-muted-foreground ml-8 mt-1 space-y-1">
              <li><strong>Configuração</strong>: Selecione se deseja comparar por "Colaborador" ou "Unidade". Em seguida, escolha de dois a quatro elementos para a comparação. Clique em "Aplicar Comparação". Os filtros globais da seção "Filtros" serão aplicados ANTES da separação dos dados para cada elemento.</li>
              <li><strong>Métricas Comparativas</strong>: Uma tabela mostrará as principais métricas para cada elemento selecionado. Cada métrica na tabela também possui uma breve descrição abaixo do seu nome.</li>
              <li><strong>Gráfico de Volume por Hora (Comparativo)</strong>: Exibe o volume de chamadas por hora para os elementos selecionados no mesmo gráfico. Clique em uma barra para ver os detalhes das chamadas daquela hora para o elemento específico da barra.</li>
            </ul>


            <h4><strong>Aba: Gerenciar Colaboradores</strong></h4>
            <p className="text-muted-foreground ml-4">Permite associar nomes e unidades aos ramais. Ramais cadastrados aqui são usados para identificar chamadas internas, recebidas e originadas.</p>
            <ul className="list-disc list-inside text-muted-foreground ml-8 mt-1 space-y-1">
              <li><strong>Adicionar Novo Colaborador</strong>: Preencha Ramal, Nome e Unidade. O ramal deve ser único.</li>
              <li><strong>Colaboradores Existentes</strong>: Lista os colaboradores. Clique em <Pencil className="inline h-4 w-4" /> para editar Nome e Unidade.</li>
            </ul>

             <h4><strong>Aba: Registros Detalhados</strong></h4>
            <p className="text-muted-foreground ml-4">
              Mostra uma tabela com os dados brutos das chamadas que correspondem aos filtros aplicados.
              Esta aba utiliza paginação para melhor performance, exibindo {ITEMS_PER_PAGE_DETAILED_LOGS} registros por vez. Utilize os botões "Anterior" e "Próxima" para navegar. Colunas incluem dados do CSV (incluindo <code>tempo_toque</code> se presente), informações do colaborador e a "Direção da Chamada" identificada.
              Utilize o filtro "Mostrar apenas chamadas concluídas" em conjunto com outros filtros para investigar chamadas problemáticas.
            </p>
            <p className="text-muted-foreground ml-4 mt-2">
              <strong>Impressão dos Registros Detalhados:</strong> Ao imprimir (Ctrl+P) esta aba, apenas a página de registros atualmente visível será impressa. Para um relatório completo e otimizado para impressão, utilize a aba "Relatório". Para exportar todos os dados detalhados, aguarde uma futura funcionalidade de "Exportar CSV".
            </p>
          </div>
        </div>
         <div>
          <h3 className="text-xl font-semibold text-primary mb-2">Dicas</h3>
          <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
            <li>Para exportar um relatório visual, utilize a função "Imprimir para PDF" do seu navegador (Ctrl+P ou Cmd+P) enquanto estiver na aba "Relatório". A impressão foi otimizada para esta aba.</li>
            <li>Ao clicar em segmentos dos gráficos (barras), uma janela (modal) será aberta mostrando os registros de chamadas detalhados que compõem aquele segmento específico.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );


  return (
    <>
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <header className="text-left mb-8">
        <img src="https://acesso.siprov.com.br/siprov-web/imagem?id=51875&cli=155" alt="Logo da Empresa" className="h-10 w-auto mb-2" />
        <h1 className="text-4xl font-bold text-primary flex items-center">
          <Activity className="w-10 h-10 mr-3 text-accent" /> CallAnalytics
        </h1>
        <p className="text-muted-foreground mt-2">Carregue seu CSV de dados de chamadas para analisar tendências e obter insights.</p>
      </header>

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Carregar Arquivo CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="file" id="csvFile" accept=".csv" onChange={handleFileUpload} className="max-w-md" disabled={isLoadingCsv} />
          {isLoadingCsv && <p className="text-sm text-muted-foreground mt-2 flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando CSV...</p>}
        </CardContent>
      </Card>

      {allData.length > 0 && (
        <>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div>
                  <Label htmlFor="filtroDataInicio">Data Inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {filters.startDate ? format(filters.startDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={filters.startDate || undefined} onSelect={(date) => handleDateChange('startDate', date)} initialFocus locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="filtroDataFim">Data Final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {filters.endDate ? format(filters.endDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={filters.endDate || undefined} onSelect={(date) => handleDateChange('endDate', date)} initialFocus locale={ptBR} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="filtroRamal">Ramal/Colaborador</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {getSelectedExtensionsText()}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                      <DropdownMenuLabel>Selecionar Ramais</DropdownMenuLabel>
                      <DropdownMenuCheckboxItem
                        checked={filters.extension.length === 0}
                        onCheckedChange={() => setFilters(prev => ({ ...prev, extension: [] }))}
                        onSelect={(e) => e.preventDefault()}
                      >
                        Todos os Ramais
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      {sortedCollaboratorsArray.map(collab => (
                        <DropdownMenuCheckboxItem
                          key={collab.ramal}
                          checked={filters.extension.includes(collab.ramal)}
                          onCheckedChange={() => handleExtensionMultiSelect(collab.ramal)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          {collab.nome} ({collab.ramal})
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <Label htmlFor="filtroDuracao">Duração Mín. Atendida (s)</Label>
                  <Input id="filtroDuracao" type="number" value={filters.minDuration} onChange={e => setFilters(prev => ({ ...prev, minDuration: parseInt(e.target.value) || 0 }))} min="0" />
                </div>
                <div>
                  <Label htmlFor="filtroCausaDesconexao">Causa da Desconexão</Label>
                  <Select
                    value={filters.hangupCause}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, hangupCause: value === "todas" ? "" : value }))}
                  >
                    <SelectTrigger id="filtroCausaDesconexao" className="w-full">
                      <SelectValue placeholder="Selecione uma causa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Causas</SelectItem>
                      {uniqueHangupCauses.map(cause => (
                        <SelectItem key={cause} value={cause}>
                          {translateHangupCause(cause)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filtroUnidade">Unidade</Label>
                  <Select
                    value={filters.unit}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, unit: value === "todas" ? "" : value }))}
                  >
                    <SelectTrigger id="filtroUnidade" className="w-full">
                      <SelectValue placeholder="Selecione uma unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as Unidades</SelectItem>
                      {uniqueUnits.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filtroDirecaoChamada">Direção da Chamada</Label>
                  <Select
                    value={filters.callDirection || "todas-direcoes"}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, callDirection: value === "todas-direcoes" ? "" : value as CallDirection | "" }))}
                  >
                    <SelectTrigger id="filtroDirecaoChamada" className="w-full">
                      <SelectValue placeholder="Selecione a direção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas-direcoes">Todas as Direções</SelectItem>
                      <SelectItem value="recebida">Recebida</SelectItem>
                      <SelectItem value="originada">Originada</SelectItem>
                      <SelectItem value="interna">Interna</SelectItem>
                      <SelectItem value="indeterminada">Indeterminada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-4 md:pt-6">
                  <Checkbox
                    id="filtroConcluidas"
                    checked={filters.showOnlySuccessfulCalls}
                    onCheckedChange={(checked) => setFilters(prev => ({ ...prev, showOnlySuccessfulCalls: !!checked }))} />
                  <Label htmlFor="filtroConcluidas" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Mostrar apenas chamadas concluídas
                  </Label>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button onClick={applyFilters} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                   Aplicar Filtros
                </Button>
                <Button onClick={resetFilters} variant="outline" className="w-full sm:w-auto">
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="report" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 mb-4">
              <TabsTrigger value="report">Relatório</TabsTrigger>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="extension-performance">Desempenho por Ramal</TabsTrigger>
              <TabsTrigger value="comparativo"><Users className="mr-1 h-4 w-4" />Comparativo</TabsTrigger>
              <TabsTrigger value="collaborators">Gerenciar Colaboradores</TabsTrigger>
              <TabsTrigger value="detailed-logs">Registros Detalhados</TabsTrigger>
              <TabsTrigger value="tutorial"><BookOpen className="mr-1 h-4 w-4" />Tutorial</TabsTrigger>
            </TabsList>

            <TabsContent value="report" className="space-y-6">
              <h2 className="text-2xl font-semibold text-primary">Relatório Consolidado</h2>
              {renderMetricsCard()}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderCallsByHourChart()}
                {renderCallsByExtensionChart()}
              </div>
              <div className="grid grid-cols-1 gap-6 mt-6">
                 {renderCallsByUnitChart()}
              </div>
              {renderExtensionPerformanceTable()}
            </TabsContent>

            <TabsContent value="overview">
              {renderMetricsCard()}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderCallsByHourChart()}
                {renderCallsByExtensionChart()}
              </div>
              <div className="grid grid-cols-1 gap-6 mt-6">
                 {renderCallsByUnitChart()}
              </div>
            </TabsContent>

            <TabsContent value="extension-performance">
              {renderExtensionPerformanceTable()}
            </TabsContent>

            <TabsContent value="comparativo" className="space-y-6">
                <Alert variant="default" className="shadow-md border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30">
                  <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <AlertTitle className="text-yellow-700 dark:text-yellow-300">Atenção!</AlertTitle>
                  <AlertDescription className="text-yellow-600 dark:text-yellow-400">
                    Esta funcionalidade de Comparativo está em desenvolvimento e em fase de testes. Alguns resultados ou comportamentos podem não ser finais.
                  </AlertDescription>
                </Alert>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center"><Users className="mr-2" />Configurar Comparação</CardTitle>
                        <CardDescription>
                          Selecione como e quais elementos (2 a 4) deseja comparar.
                          Os filtros globais (Data, Causa, Unidade, etc.) definidos na seção principal de "Filtros" serão aplicados ANTES da separação dos dados para cada elemento da comparação.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <Label htmlFor="comparisonType">Comparar por:</Label>
                                <Select
                                    value={comparisonSelection.type}
                                    onValueChange={(value) => setComparisonSelection({ type: value as ComparisonType, elementA: '', elementB: '', elementC: '', elementD: '' })}
                                >
                                    <SelectTrigger id="comparisonType">
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="colaborador">Colaborador</SelectItem>
                                        <SelectItem value="unidade">Unidade</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {comparisonSelection.type && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                {['A', 'B', 'C', 'D'].map(elKey => (
                                    <div key={`element-${elKey}`}>
                                        <Label htmlFor={`comparisonElement${elKey}`}>Elemento {elKey}:</Label>
                                        <Select
                                            value={comparisonSelection[`element${elKey as 'A' | 'B' | 'C' | 'D'}` as keyof Omit<ComparisonSelection, 'type'>]}
                                            onValueChange={(value) => setComparisonSelection(prev => ({ ...prev, [`element${elKey as 'A' | 'B' | 'C' | 'D'}`]: value }))}
                                            disabled={!comparisonSelection.type}
                                        >
                                            <SelectTrigger id={`comparisonElement${elKey}`}>
                                                <SelectValue placeholder={`Selecione ${comparisonSelection.type === 'colaborador' ? 'Colaborador' : 'Unidade'} ${elKey}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {comparisonSelection.type === 'colaborador' && sortedCollaboratorsArray.map(c => (
                                                    <SelectItem
                                                        key={`${elKey}-${c.ramal}`}
                                                        value={c.ramal}
                                                        disabled={Object.values(comparisonSelection).includes(c.ramal) && comparisonSelection[`element${elKey as 'A' | 'B' | 'C' | 'D'}` as keyof Omit<ComparisonSelection, 'type'>] !== c.ramal}
                                                    >
                                                        {c.nome} ({c.ramal})
                                                    </SelectItem>
                                                ))}
                                                {comparisonSelection.type === 'unidade' && uniqueUnits.map(u => (
                                                    <SelectItem
                                                        key={`${elKey}-${u}`}
                                                        value={u}
                                                        disabled={Object.values(comparisonSelection).includes(u) && comparisonSelection[`element${elKey as 'A' | 'B' | 'C' | 'D'}` as keyof Omit<ComparisonSelection, 'type'>] !== u}
                                                    >
                                                        {u}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Button
                            onClick={handleApplyComparison}
                            disabled={!comparisonSelection.type || !comparisonSelection.elementA || !comparisonSelection.elementB}
                            className="mt-4"
                        >
                            Aplicar Comparação
                        </Button>
                    </CardContent>
                </Card>
                {comparisonResults && (
                    <div className="space-y-6 mt-6">
                        {renderComparisonMetricsTable()}
                        {renderComparisonCallsByHourChart()}
                    </div>
                )}
                 {!comparisonResults && comparisonSelection.type && (
                    <p className="text-muted-foreground text-center mt-6">Preencha pelo menos os Elementos A e B e clique em "Aplicar Comparação" para ver os resultados.</p>
                )}
            </TabsContent>

            <TabsContent value="collaborators">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Gerenciar Colaboradores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-4 border rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">Adicionar Novo Colaborador</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="newRamal">Ramal</Label>
                          <Input id="newRamal" value={newCollaboratorForm.ramal} onChange={e => setNewCollaboratorForm({...newCollaboratorForm, ramal: e.target.value})} placeholder="Ex: 2052" />
                        </div>
                        <div>
                          <Label htmlFor="newNome">Nome</Label>
                          <Input id="newNome" value={newCollaboratorForm.nome} onChange={e => setNewCollaboratorForm({...newCollaboratorForm, nome: e.target.value})} placeholder="Ex: Letícia" />
                        </div>
                        <div>
                          <Label htmlFor="newUnidade">Unidade</Label>
                          <Input id="newUnidade" value={newCollaboratorForm.unidade} onChange={e => setNewCollaboratorForm({...newCollaboratorForm, unidade: e.target.value})} placeholder="Ex: Matriz - Tubarão" />
                        </div>
                        <Button onClick={handleAddCollaborator} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                          <UserPlus className="mr-2 h-4 w-4" /> Adicionar Colaborador
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 p-4 border rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold mb-2">Colaboradores Existentes</h3>
                      <div className="max-h-80 overflow-y-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ramal</TableHead>
                              <TableHead>Nome</TableHead>
                              <TableHead>Unidade</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedCollaboratorsArray.map(collab => (
                              <TableRow key={collab.ramal}>
                                <TableCell>{collab.ramal}</TableCell>
                                <TableCell>{collab.nome}</TableCell>
                                <TableCell>{collab.unidade}</TableCell>
                                <TableCell>
                                  <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(collab.ramal)}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detailed-logs">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Registros Detalhados de Chamadas</CardTitle>
                   {filteredData.length > 0 && (
                     <CardDescription>
                       Exibindo {currentDetailedLogsData.length > 0 ? startIndexDetailedLogs + 1 : 0}-
                       {Math.min(endIndexDetailedLogs, filteredData.length)} de {filteredData.length} registros.
                       (Página {currentPageDetailedLogs} de {totalPagesDetailedLogs})
                     </CardDescription>
                   )}
                </CardHeader>
                <CardContent>
                  {currentDetailedLogsData.length > 0 && columnHeaders.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {columnHeaders.map(header => <TableHead key={header}>{header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableHead>)}
                              <TableHead>Nome Colaborador</TableHead>
                              <TableHead>Unidade Colaborador</TableHead>
                              <TableHead>Direção Chamada</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentDetailedLogsData.map((row, index) => (
                              <TableRow key={`detailed-log-${startIndexDetailedLogs + index}`}>
                                {columnHeaders.map(header => (
                                  <TableCell key={header}>
                                    {header === 'start_stamp' && row[header] instanceof Date
                                      ? format(row[header] as Date, "yyyy-MM-dd HH:mm:ss")
                                      : header === 'hangup_cause'
                                      ? translateHangupCause(String(row[header]))
                                      : header === 'tempo_toque' && typeof row[header] === 'number'
                                      ? `${row[header]}s`
                                      : String(row[header] === undefined || row[header] === null ? '' : row[header])}
                                  </TableCell>
                                ))}
                                <TableCell>{row.nome_colaborador || '-'}</TableCell>
                                <TableCell>{row.unidade_colaborador || '-'}</TableCell>
                                <TableCell>{row.call_direction || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {totalPagesDetailedLogs > 1 && (
                        <div className="flex items-center justify-between mt-4 pagination-controls">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPageDetailedLogs}
                            disabled={currentPageDetailedLogs === 1}
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Página {currentPageDetailedLogs} de {totalPagesDetailedLogs}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPageDetailedLogs}
                            disabled={currentPageDetailedLogs === totalPagesDetailedLogs}
                          >
                            Próxima
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (<p className="text-muted-foreground">Nenhum registro de chamada para exibir com base nos filtros atuais.</p>)}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tutorial">
              {renderTutorialTab()}
            </TabsContent>
          </Tabs>
        </>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Colaborador (Ramal: {editingRamal})</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editNome" className="text-right">
                Nome
              </Label>
              <Input
                id="editNome"
                value={editForm.nome}
                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editUnidade" className="text-right">
                Unidade
              </Label>
              <Input
                id="editUnidade"
                value={editForm.unidade}
                onChange={(e) => setEditForm({ ...editForm, unidade: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEditCollaborator}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{detailModalTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto">
            {detailModalData.length > 0 ? (
               <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columnHeaders.map(header => <TableHead key={header}>{header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableHead>)}
                      <TableHead>Nome Colaborador</TableHead>
                      <TableHead>Unidade Colaborador</TableHead>
                      <TableHead>Direção Chamada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailModalData.slice(0, 50).map((row, index) => (
                      <TableRow key={`modal-row-${index}`}>
                        {columnHeaders.map(header => (
                          <TableCell key={`modal-cell-${header}-${index}`}>
                            {header === 'start_stamp' && row[header] instanceof Date
                              ? format(row[header] as Date, "yyyy-MM-dd HH:mm:ss")
                              : header === 'hangup_cause'
                              ? translateHangupCause(String(row[header]))
                              : header === 'tempo_toque' && typeof row[header] === 'number'
                              ? `${row[header]}s`
                              : String(row[header] === undefined || row[header] === null ? '' : row[header])}
                          </TableCell>
                        ))}
                        <TableCell>{row.nome_colaborador || '-'}</TableCell>
                        <TableCell>{row.unidade_colaborador || '-'}</TableCell>
                        <TableCell>{row.call_direction || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  {detailModalData.length > 50 && <TableCaption>Exibindo os primeiros 50 de {detailModalData.length} registros.</TableCaption>}
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum registro encontrado para esta seleção.</p>
            )}
          </div>
          <DialogFooter>
            {/* <Button variant="outline" onClick={() => {}}> <Download className="mr-2 h-4 w-4" /> Baixar CSV </Button> */}
            <DialogClose asChild>
                <Button type="button" variant="secondary">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
    <footer className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
      Desenvolvido por Letícia Pereira - 2025
    </footer>
    </>
  );
};

export default CallDataAnalyzer;

