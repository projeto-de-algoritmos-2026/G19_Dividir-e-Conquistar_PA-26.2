# Grupo 19 — Arena de Encontros

Projeto da disciplina de **Projeto de Algoritmos**. A Arena de Encontros
simula personagens que se movimentam em um espaço 2D e identifica o par
globalmente mais próximo. O projeto também oferece um laboratório interativo
para visualizar e comparar os algoritmos de força bruta e divisão e conquista.

## Integrantes

| Matrícula | Nome |
| :---: | :--- |
| 241025990 | Pedro Henrique Ferreira Xavier |
| 241040350 | Philipe Amancio Reis Caetano |

---

## Vídeo de Apresentação

[![Assistir ao vídeo de apresentação]()]()

LINK: 

---

## Objetivos

- Aplicar **Merge Sort** na ordenação dos pontos usados pela solução eficiente.
- Implementar o problema do par de pontos mais próximos por **divisão e
  conquista**, com complexidade O(n log n).
- Manter uma solução de **força bruta** como referência e comparar resultados,
  verificações de distância e tempos medidos.
- Demonstrar visualmente as etapas da solução eficiente e comparar a execução
  dos algoritmos sobre os mesmos pontos.
- Integrar os algoritmos a uma simulação interativa sem misturar lógica
  algorítmica, movimento e renderização.

## Aplicação

O projeto possui duas páginas:

- **Arena (`index.html`)**: simulação ao vivo com geração de personagens,
  movimento, encontro, controles e seleção do algoritmo usado para encontrar o
  par mais próximo.
- **Laboratório (`algorithm-lab.html`)**: página independente com cenários,
  geração de pontos, reprodução passo a passo, comparação visual e benchmark.
  Também pode receber um snapshot das posições atuais da arena.

Na arena, cada personagem tem identificador, nome, cor, posição, velocidade e
raio. O movimento é linear e reflete nas bordas. A aplicação monitora somente o
par globalmente mais próximo: quando a distância fica dentro do limite
configurado, exibe um encontro; não há colisões, combate nem mudança de
velocidade.

O encontro ativo só emite um evento de início uma vez. Ele termina quando o par
deixa de atender ao limite ou quando o par mais próximo muda. A simulação pode
ser pausada para adicionar ou arrastar personagens. Com zero ou um personagem,
não há par a exibir.

### Controles da arena

- **Personagens e semente**: quantidade entre 0 e 500 e semente para gerar uma
  distribuição reproduzível.
- **Gerar arena**: cria uma nova distribuição e guarda o estado inicial usado
  pelo botão de reinício.
- **Iniciar/Pausar** e **Reiniciar**: controlam o movimento.
- **Velocidade**: ajusta a velocidade da simulação.
- **Distância de encontro**: define o limite, em pixels, para sinalizar o par
  mais próximo.
- **Algoritmo ao vivo**: alterna entre força bruta e divisão e conquista.
- **Adicionar personagem** e arrastar: disponíveis com a simulação pausada.
- **Abrir laboratório com esta arena**: pausa a simulação e carrega as posições
  atuais no laboratório como um snapshot estático.

## Algoritmos

### Merge Sort

Implementado em `src/algorithms/mergeSort.js`. O algoritmo é genérico: recebe
uma lista e uma função de comparação, devolve uma nova lista ordenada e não
altera a entrada. O mesmo módulo exporta `mergeSorted`, usado para intercalar
listas que já estão ordenadas.

- Tempo: O(n log n).
- Espaço: O(n).

### Par mais próximo por divisão e conquista

Implementado em `src/algorithms/closestPair.js`. A execução ordena os pontos por
x uma vez, divide cada conjunto em metades, resolve grupos pequenos diretamente
e intercala os resultados ordenados por y. Na combinação, examina uma faixa ao
redor da divisão e considera candidatos em ordem de y.

- Tempo esperado: O(n log n).
- Espaço: O(n), além da pilha recursiva.
- A profundidade da chamada raiz é zero.
- As comparações usam distância ao quadrado; a raiz quadrada é calculada para
  apresentar a distância final.
- A métrica `distanceChecks` conta avaliações de distância entre pontos.
- Com `recordSteps: true`, retorna eventos de divisão, comparação, melhor par,
  faixa e conclusão para o modo didático.

Exemplo de uso:

```js
import {
  findClosestPairDivideConquer
} from "./src/algorithms/closestPair.js";

const points = [
  { id: "A", x: 100, y: 120 },
  { id: "B", x: 110, y: 125 }
];

const result = findClosestPairDivideConquer(points);
console.log(result.pair, result.distance);
```

O resultado contém `pair`, `distanceSquared`, `distance`, `metrics` e `steps`.
Para menos de dois pontos, o par e as distâncias são `null`.

### Força bruta

Implementada em `src/algorithms/bruteForceClosestPair.js`. Avalia todos os pares
e serve como solução de referência, opção da arena e algoritmo oficial da
comparação integrada.

- Tempo: O(n²).
- Espaço adicional: O(1), sem contar os passos opcionais.

O laboratório independente mantém `src/lab/referenceClosestPair.js` como sua
referência local. Ao receber posições da arena, o benchmark usa a
implementação oficial de força bruta.

## Laboratório e comparação

O laboratório oferece cenários predefinidos, geração de pontos com semente,
execução passo a passo (início, anterior, próximo e reprodução) e comparação
visual dos algoritmos.

O benchmark:

- executa ambos os algoritmos sobre o mesmo snapshot;
- não grava passos durante a medição;
- realiza aquecimentos e múltiplas repetições;
- apresenta a mediana dos tempos e as verificações de distância;
- confere se os algoritmos encontraram a mesma distância mínima.

A comparação visual é limitada a 30 pontos para manter a reprodução prática.
Os tempos podem variar conforme o navegador e o hardware, especialmente para
entradas pequenas.

## Estrutura do projeto

```text
.
├── index.html                         # Interface da simulação
├── algorithm-lab.html                 # Interface do laboratório
├── styles/
│   ├── arena.css                      # Estilos da arena
│   └── lab.css                        # Estilos do laboratório
├── src/
│   ├── app.js                         # Controlador principal da arena
│   ├── labEntry.js                    # Controlador do laboratório
│   ├── algorithms/
│   │   ├── bruteForceClosestPair.js   # Força bruta oficial
│   │   ├── closestPair.js             # Divisão e conquista
│   │   └── mergeSort.js               # Merge Sort e intercalação
│   ├── arena-ui/
│   │   └── renderer.js                # Desenho da arena em Canvas
│   ├── simulation/
│   │   ├── characters.js              # Geração e projeção dos personagens
│   │   ├── encounters.js              # Estado dos encontros
│   │   └── movement.js                # Movimento e reflexão nas bordas
│   └── lab/
│       ├── benchmark.js               # Medição dos algoritmos
│       ├── comparisonPlayer.js        # Reprodutor da comparação visual
│       ├── fixtures.js                # Cenários e pontos aleatórios
│       ├── labRenderer.js              # Desenho do laboratório
│       ├── referenceClosestPair.js    # Referência local do laboratório
│       └── stepPlayer.js               # Reprodutor de passos didáticos
├── tests/
│   ├── benchmark.test.mjs              # Testes do benchmark
│   ├── closestPair.test.mjs            # Testes da solução eficiente
│   ├── closestPairOracle.test.mjs      # Comparação com o oráculo
│   ├── closestPairSteps.test.mjs       # Testes dos eventos didáticos
│   ├── comparisonPlayer.test.mjs       # Testes da comparação visual
│   ├── mergeSort.test.mjs              # Testes do Merge Sort
│   ├── referenceClosestPair.test.mjs   # Testes da referência do laboratório
│   ├── stepPlayer.test.mjs              # Testes da reprodução de passos
│   ├── helpers/
│   │   └── closestPairOracle.mjs       # Oráculo independente para testes
│   └── simulation/
│       ├── bruteForceClosestPair.test.mjs
│       └── simulation.test.mjs          # Geração, movimento e encontros
└── package.json
```

## Como executar

É necessário ter Node.js 18 ou superior para executar os testes. Não há
dependências externas nem backend.

Como a aplicação usa módulos ES no navegador, execute-a por um servidor HTTP
local, a partir da raiz do projeto:

```bash
python -m http.server 8000
```

Depois, abra <http://localhost:8000/>. O laboratório independente está em
<http://localhost:8000/algorithm-lab.html>.

## Testes

Execute todos os testes automatizados com:

```bash
npm test
```

O comando usa o test runner nativo do Node.js e descobre os testes nas pastas
`tests/` e suas subpastas. A suíte cobre Merge Sort, divisão e conquista,
oráculo de força bruta, eventos didáticos, benchmark, reprodução de passos,
geração de personagens, movimento, reflexão nas bordas e estado de encontros.
