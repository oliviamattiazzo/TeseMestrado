# Infraestrutura

## Frontend

**Tecnologias escolhidas:** React + TypeScript + Vite

### Justificativa
A combinação das tecnologias acima permite a construção de uma interface incremental, onde os elementos vão sendo criados um por vez, facilitando o desenvolvimento. O TypeScript reduz muitos bugs que podem atrapalhar no futuro, por ser uma espécie de "linguagem fortemente tipada", porém para o frontend. O Vite foi escolhido porque funciona bem com SPAs em geral (Single Page Applications).

<!-- Descrever um pouco mais cada tecnologia, especialmente o TypeScript -->

### Outros extras a pesquisar
* Monaco Editor para a entrada da expressão
* Componente de renderização LaTeX para mostrar as fórmulas de maneira adequada
* Uma biblioteca de grafos para desenhar a árvore lógica do processo

## Backend

**Tecnologias escolhidas:** Python + FastAPI

### Justificativa:
FastAPI é rápido de desenvolver, tipado e perfeito para uma API pequena sem estados. Um único endpoint recebe a expressão e devolve algo como `{ cnf, dnf, steps: [...] }`. Além disso, Python tem um ecossistema excelente para manipulação simbólica e parsing. Mesmo escrevendo meu próprio motor de regras, o Python vai ajudar a deixá-lo bem otimizado.

### Plano de estrutura
1. **Parser:** gera a árvore de decisões
2. **Rewriter:** aplica as regras (De Morgan, dupla negação, distributividade, eliminação de ↔/→, etc.)
3. **Stepper:** registra cada regra aplicada com "antes/depois" e metadados

<!-- Justificar melhor: por que o Python vai otimizar melhor? -->

## Deploy & Publicação

Ainda estou avaliando opções. Por ora, temos como candidatos:
* Cloudfare Pages + Cloudfare Workers/Pages Functions
* Vercel + API Functions
* Netlify + Netlify Functions