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

Implementados quatro grupos selecionáveis: água, leito/margens, depósitos sedimentares e subsolo sedimentar. Localização, escala e incertezas são informações da interface, sem virar peças fictícias. A amostra de poros fica em uma vista independente.

## Ações principais

| Controle | Comportamento entregue |
|---|---|
| Retirar água | Expõe o leito representado sem transformar hipótese em dado medido. |
| Separar camadas | Afasta as camadas mantendo legenda, posição de referência e indicação de escala. |
| Ver fonte | Mostra origem, data, resolução e limites de cada informação. |

Base de exploração: órbita, zoom, seleção por lista ou clique, isolamento, reenquadrar e reset. Desmontagem e corte só se aplicam aos conjuntos para os quais forem úteis e tecnicamente coerentes. Som, malha e captura são complementos, posteriores à clareza do mecanismo.

## Estado do mecanismo

`water` e `separation` variam de 0 a 1; `mode` alterna corte e poros. Água muda visibilidade, sem alterar o nível físico. As três etapas definem estados reversíveis; transições têm pausa e respeitam movimento reduzido.

## Critérios específicos de conclusão

- O visitante distingue levantamento real de corte ilustrativo na própria interface.
- Não representar o fluxo subterrâneo chamado Hamza como um rio aberto numa caverna; apurar a pesquisa e seus limites.
- Não extrapolar batimetria marinha para o rio; profundidades e escala vertical precisam de fonte e localização.

- A pergunta inicial é respondida por uma interação observável, com texto curto e fontes acessíveis.
- Desktop e celular emulado foram validados, com reset/fallback conferidos; teste em telefone físico não integra a evidência disponível.
- Nenhum botão visível é apenas decorativo ou promete função pendente.

## Fora da primeira versão

- Reconstrução precisa do rio inteiro sem dados correspondentes.
- Túneis subterrâneos fantasiosos, profundidades inventadas e extrapolação da foz para todo o rio.

Ampliações entram no backlog após o piloto, com evidência de uso e esforço. Não incluir funcionalidades só para repetir todas as opções do Fusquinha.

## Aceite em 07/11/2026

Escopo implementado e conferido no Chrome. Superfície, leito e camadas têm ações reais, retorno determinístico e fontes específicas. A posição de referência vem do CHM; geometria, espessuras e amostra são explicitamente ilustrativas. O trabalho primário de Óbidos e a pesquisa de fluxos subterrâneos foram apurados, sem copiar figuras. Sete testes e 94 checks de navegador; limites em VALIDACAO.md. Sem deploy ou postagem.
