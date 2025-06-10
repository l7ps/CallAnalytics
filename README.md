# 📞 CallAnalytics

**CallAnalytics** é uma aplicação desktop voltada à análise detalhada de dados de chamadas telefônicas extraídas de sistemas de telefonia interna. O sistema foi desenvolvido como projeto **interno corporativo**, com o objetivo de transformar registros de chamadas em **insights acionáveis** que ajudem na **gestão, auditoria e otimização do atendimento telefônico** da empresa.

> ⚠️ Este projeto é de uso **interno** e restrito à organização.

---

## 🧩 Objetivos

- Acompanhar desempenho individual e por unidade.
- Visualizar padrões de uso da telefonia.
- Otimizar tempo de atendimento e identificar gargalos.
- Melhorar a experiência do cliente via telefone.

---

<details>
<summary>🎯 <strong>Principais Funcionalidades</strong></summary>

### 📂 Carregamento e Processamento de Dados
- Upload de arquivos `.csv` contendo registros detalhados de chamadas (CDRs).
- Associação automática com colaboradores (nome, unidade, ramal).
- Identificação da direção da chamada (recebida, originada, interna, indeterminada).

### 🔍 Filtros Avançados
- Período (data inicial e final).
- Múltiplos ramais ou colaboradores.
- Duração mínima para chamadas atendidas.
- Causa de desconexão.
- Unidade e direção da chamada.
- Opção para exibir apenas chamadas concluídas.

### 📊 Dashboard Interativo
- Total de chamadas, atendidas, perdidas.
- Chamadas curtas (<10s).
- Tempo médio de atendimento.
- Volume por tipo de chamada (recebida, originada, interna).

### 📈 Visualizações Gráficas
- Volume por hora do dia.
- Ranking de atendimento por ramal.
- Agrupamento por unidade.
- Gráficos interativos com visualização detalhada ao clicar.

### 🧑‍💼 Desempenho por Colaborador
- Tabela com número de chamadas atendidas/não atendidas.
- Duração total/média.
- Volume por tipo de chamada.

### 📊 Comparativo (em desenvolvimento)
- Comparação lado a lado entre até 4 colaboradores ou unidades.

### 👥 Gestão de Colaboradores
- Cadastro e edição de nomes e unidades por ramal.

### 📋 Tabela Detalhada
- Tabela paginada com todos os dados filtrados.
- Inclusão de dados do colaborador e tradução das causas de desconexão.

### 📘 Tutorial Embutido
- Explicações sobre cada métrica, gráficos e uso da interface.

</details>

---

<details>
<summary>💻 <strong>Tecnologia</strong></summary>

- **Electron**: Aplicação desktop multiplataforma (Windows, macOS, Linux).
- **JavaScript / TypeScript**
- **Bibliotecas de Visualização Gráfica** (ex: Chart.js, D3.js)
- **Node.js**: Backend de processamento.
- Interface moderna e responsiva.
</details>

---

<details>
<summary>🖨️ <strong>Relatório Otimizado para Impressão</strong></summary>

A aba **Relatório** consolida os principais gráficos e métricas para geração de PDFs ou impressão direta via navegador.
</details>

---

## 🛠️ Instalação e Execução

> ⚠️ Projeto interno — acesso ao código fonte e arquivos de build é restrito.

```bash
# Clone o repositório (interno)
git clone git@empresa.com:callanalytics.git

# Instale as dependências
npm install

# Rode o app em modo desenvolvimento
npm run dev

# Para empacotar como aplicativo desktop:
npm run build
