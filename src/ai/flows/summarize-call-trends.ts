// Este arquivo foi intencionalmente deixado vazio ou pode ser removido,
// pois a funcionalidade de resumo de chamadas por IA foi desativada conforme solicitado.
// Manter o arquivo (mesmo que vazio) evita erros de importação em outros lugares se houver referências legadas,
// mas idealmente ele seria removido do projeto se não houver mais nenhuma referência.

// 'use server';
// /**
//  * @fileOverview Resume tendências encontradas em registros detalhados de chamadas (CDR).
//  *
//  * - summarizeCallTrends - Uma função que gera um resumo das tendências de chamadas.
//  * - SummarizeCallTrendsInput - O tipo de entrada para a função summarizeCallTrends.
//  * - SummarizeCallTrendsOutput - O tipo de retorno para a função summarizeCallTrends.
//  */

// import {ai} from '@/ai/genkit';
// import {z} from 'genkit';

// const SummarizeCallTrendsInputSchema = z.object({
//   callVolumeByHour: z.record(z.number()).describe('Volume de chamadas por hora do dia.'),
//   callVolumeByExtension: z.record(z.number()).describe('Volume de chamadas por ramal.'),
//   abandonedCalls: z.number().describe('Número de chamadas abandonadas.'),
// });
// export type SummarizeCallTrendsInput = z.infer<typeof SummarizeCallTrendsInputSchema>;

// const SummarizeCallTrendsOutputSchema = z.object({
//   summary: z.string().describe('Um resumo das principais tendências nos registros detalhados de chamadas.'),
// });
// export type SummarizeCallTrendsOutput = z.infer<typeof SummarizeCallTrendsOutputSchema>;

// export async function summarizeCallTrends(input: SummarizeCallTrendsInput): Promise<SummarizeCallTrendsOutput> {
//   return summarizeCallTrendsFlow(input);
// }

// const summarizeCallTrendsPrompt = ai.definePrompt({
//   name: 'summarizeCallTrendsPrompt',
//   input: {schema: SummarizeCallTrendsInputSchema},
//   output: {schema: SummarizeCallTrendsOutputSchema},
//   prompt: `Você é um especialista em IA na análise de dados de call center. Forneça um resumo conciso das principais tendências nos seguintes registros detalhados de chamadas. Certifique-se de destacar informações importantes sobre padrões de chamadas, volume de chamadas por hora, volume de chamadas por ramal e chamadas abandonadas.

// Volume de Chamadas por Hora: {{{callVolumeByHour}}}
// Volume de Chamadas por Ramal: {{{callVolumeByExtension}}}
// Chamadas Abandonadas: {{{abandonedCalls}}}
// `,
// });

// const summarizeCallTrendsFlow = ai.defineFlow(
//   {
//     name: 'summarizeCallTrendsFlow',
//     inputSchema: SummarizeCallTrendsInputSchema,
//     outputSchema: SummarizeCallTrendsOutputSchema,
//   },
//   async input => {
//     const {output} = await summarizeCallTrendsPrompt(input);
//     return output!;
//   }
// );
