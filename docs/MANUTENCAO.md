# Manutenção e validação

## Antes de cada entrega

- Conferir fonte/data das explicações e a distinção entre ilustração e medição.
- Validar assets, créditos e termos, incluindo autorização para servir arquivos extraíveis no navegador.
- Executar `npm test`, `npm run check` e `npm run build`; registrar resultado. Setup reproduzível com `npm ci`.
- Revisar diff, evitar segredos e incluir apenas mudanças da tarefa. Não adicionar diretórios de configuração pessoal, tokens ou snapshots de sessão.
- Testar URL de vídeo, acesso às fontes, carregamento, fallback e navegação por teclado.
- Conferir visualmente 1440×980, 390×844 e orientação horizontal; usar ao menos um navegador desktop e um celular real quando disponível. Registrar dispositivo e limitações.
- Exercitar selecionar → isolar → reenquadrar → cortar/desmontar → montar → reset. Câmera deve conservar o objeto visível.
- Testar mecanismo no início, meio, fim, pausa, retomada, reset e alternância de aba. Ausência de NaN e poses acumuladas é critério funcional.
- Comparar captura inicial, seleção, corte e desmontagem com o guia visual. Validar som desligado e movimento reduzido.

## Testes proporcionais

Sete testes cobrem continuidade do perfil, limites da água, ordenação das camadas, reversibilidade, relógio, modelo e enquadramento. No navegador, conferir retirar/repor água, separar/remontar, quatro seleções/isolamentos, busca, tour, poros, fichas, PNGs e fallback. Não criar testes que apenas repitam o texto destes guias.

## Regressões específicas

- Água 0/43/100% e separação 0/24/73/100%, indo e voltando. Inicial/reset deve restaurar água 1 e separação 0.
- Separar abre intervalos; remontar os fecha sem alterar perfil ou espessuras. Nunca apresentar esses intervalos como vazios naturais.
- Trocar corte/poros, ocultar/repor água dos poros e voltar. A amostra não deve aparecer sob o trecho.
- Cada ficha deve manter método, data e limites. O subsolo aponta ao estudo local; a amostra de poros aponta ao USGS.
- PNG precisa manter “ilustrativo/ilustrativa” e “sem escala”, inclusive ao exportar a vista de poros.

## Rotina após lançamento

- A cada mudança de modelo: revisar IDs, pivôs, nomes, enquadramento, memória e créditos.
- A cada mudança de dependência: repetir build e fluxos essenciais; comparar imagens antes/depois.
- A cada mudança factual: atualizar a fonte e textos, incluindo capturas/posts ainda não publicados.
- Em revisão periódica: conferir links, disponibilidade de vídeos e situação das fontes. O ponto oficial não converte a cena em batimetria medida.
- Registrar bug com dispositivo, navegador, ação, resultado esperado/observado e evidência sem dados pessoais.

## Publicação e reversão

A publicação foi autorizada por Victor em 08/11/2026. O procedimento vigente, os checks, a URL e a reversão estão em [PUBLICACAO.md](PUBLICACAO.md). Pushes em `main` passam a publicar pelo workflow após validação.

## Medição do piloto

Se a medição for implementada e autorizada, observar em 7 e 28 dias: visitas à experiência, primeira interação, uso da ação principal e cliques para o vídeo. Evitar coletar placas, imagens pessoais ou identificadores desnecessários. Views dos vídeos não medem uso do aplicativo.

Usar a combinação de qualidade, uso e custo de manutenção para ajustar o próximo projeto. Não prometer crescimento ou patrocínio com base no alcance histórico.
