# Escopo — Amazonas em camadas

## Pergunta e resultado esperado

O que existe abaixo da superfície do Amazonas? O visitante deve conseguir explicar o mecanismo depois de explorar a cena e acionar seus controles.

Um corte geográfico localizado, com água, leito e camadas do subsolo identificadas. Usar um esquema claramente ilustrativo enquanto não houver batimetria verificável.

## Conjuntos da primeira versão

- Superfície da água
- Leito do trecho escolhido
- Sedimentos
- Camadas do subsolo
- Escala e localização
- Fontes e incertezas

Esses grupos são uma proposta semântica; validar sua correspondência com a geometria e as fontes antes de nomear peças como reais.

## Ações principais

| Controle | Comportamento planejado |
|---|---|
| Retirar água | Expõe o leito representado sem transformar hipótese em dado medido. |
| Separar camadas | Afasta as camadas mantendo legenda, posição de referência e indicação de escala. |
| Ver fonte | Mostra origem, data, resolução e limites de cada informação. |

Base de exploração: órbita, zoom, seleção por lista ou clique, isolamento, reenquadrar e reset. Desmontagem e corte só se aplicam aos conjuntos para os quais forem úteis e tecnicamente coerentes. Som, malha e captura são complementos, posteriores à clareza do mecanismo.

## Estado do mecanismo

`surface ↔ riverbed ↔ layers; waterLevel e layerSeparation são controles visuais, não previsão hidrológica.`

## Critérios específicos de conclusão

- O visitante distingue levantamento real de corte ilustrativo na própria interface.
- Não representar o fluxo subterrâneo chamado Hamza como um rio aberto numa caverna; apurar a pesquisa e seus limites.
- Não extrapolar batimetria marinha para o rio; profundidades e escala vertical precisam de fonte e localização.

- A pergunta inicial é respondida por uma interação observável, com texto curto e fontes acessíveis.
- O modelo funciona no desktop e no celular de referência, com reset e fallback conferidos.
- Nenhum botão visível é apenas decorativo ou promete função pendente.

## Fora da primeira versão

- Reconstrução precisa do rio inteiro sem dados correspondentes.
- Túneis subterrâneos fantasiosos, profundidades inventadas e extrapolação da foz para todo o rio.

Ampliações entram no backlog após o piloto, com evidência de uso e esforço. Não incluir funcionalidades só para repetir todas as opções do Fusquinha.
