# Decisões e estado

## 2026-11-07 — documentação inicial

- Victor solicitou salvar o plano no VicMind, criar uma pasta para cada projeto, preparar guias de desenvolvimento/identidade, enviar ao GitHub e escrever posts do X para uso posterior.
- Planejamento detalhado criado; prioridade recomendada **6/10**. A prioridade pode mudar após o piloto e a validação de assets.
- Identidade: ovictorlab.com / Laboratório noturno. Interações: referência Fusquinha, adaptadas à pergunta do projeto.
- Repositório inicialmente privado por escolha operacional conservadora nesta fase. O pedido autoriza o envio dos guias; não foi tratado como solicitação de implementar e publicar os aplicativos.
- Nenhuma postagem no X enviada. Textos de protótipo e lançamento têm condições explícitas de uso.

## 2026-11-07 — implementação e aceite local

O pedido posterior de desenvolver todos os projetos autorizou a aplicação. Publicação continua fora desta rodada.

- Óbidos como referência; ponto do CHM e estudo primário UnB/AMANAUS consultados. Cena autoral sem escala, sem importar mapas, profundidades ou figuras restritas.
- Quatro conjuntos; retirar água altera visibilidade, separar abre intervalos visuais reversíveis. Dimensões não são medidas.
- Amostra de poros em vista própria; Hamza explicado por inferência de pesquisa regional, sem desenhar canal em caverna.
- Marca oficial, fontes locais, catálogo, isolamento, tour, malha, tela cheia e PNGs. Áudio dispensado por não melhorar a explicação.
- Sete testes, 94 verificações Chrome e build em subpasta aprovados. Celular emulado; sem ensaio físico ou validação científica do perfil autoral.
- Guias e rascunho de bastidor atualizados. Sem deploy ou envio ao X.

Próximo da coleção: radar-placas. Evidência canônica em VALIDACAO.md.

## Como registrar mudanças

Acrescentar data, decisão, motivo, fonte/evidência, arquivos afetados e consequência para o escopo. Separar proposta, implementação, validação e publicação. Preservar decisões antigas com indicação de substituição quando necessário.

## 2026-11-08 — repositório público e GitHub Pages

Victor autorizou aprimorar e tornar públicos os dez projetos com HTML funcional e identidade oficial. Esta decisão substitui a restrição histórica de publicação acima. Incluídos navegação entre os dez sites, canonical/OG/X, prévia real, sitemap, página 404, verificação de caminhos e workflow com testes/build antes do deploy. URL: https://victorsodre.github.io/amazonas-em-camadas/. Conteúdo e modelo educativo preservados; nenhum post enviado ao X. Procedimento e reversão em PUBLICACAO.md.

## 2026-11-08 — vídeo do canal incorporado

Pedido de Victor: embed abaixo do experimento e thumbnail clicável no README. Vídeo `UBBU6FyUwRM`, autoria ovictorlab confirmada pelo oEmbed público. O vídeo apresenta a pergunta sobre o fundo do Amazonas. No experimento, confira o corte ilustrativo de Óbidos e a distinção entre água nos poros e um canal subterrâneo. Player `youtube-nocookie.com`, criado só por clique, `autoplay=0`, controles nativos, referrer de origem e link direto sempre disponível. Capa local para não carregar o YouTube na abertura; layout portrait. Cabeçalho leva à seção `#video`. Identidade preservada; nenhum upload ou alteração de vídeo no canal.

## 2026-11-09 — números do vídeo, tour narrativo e celular

Revisão autorizada por Victor ("faça tudo"). Motivo: o site escondia os números do vídeo, o tour não mostrava o leito e a câmera descartava a órbita.

- Números do EP096 com ficha própria em `src/content/project.ts` e valores em `src/content/facts.ts`: trechos com mais de 100 m (120 m no oeste do Pará), mergulho até 40 m, dois Cristos de 38 m, vazão de 209 mil m³/s (mais de 80 piscinas olímpicas por segundo), Hamza a cerca de 4.000 m e de 10 a 100 m/ano (3 a 27 cm por dia). Fontes reconferidas em 09/11/2026: Portal Amazônia, Wikipédia (Rio Amazonas, Rio Hamza, Cristo Redentor) e GIA.
- O corte 3D continua sem escala. Os números aparecem nas fichas das camadas e numa régua em escala real à parte (`#escala`). O Hamza segue descrito como água em rocha porosa, não túnel.
- Água em ocre barrento que escurece com a profundidade (ilustrativo, sem perfil de luz medido).
- Tour aciona o mecanismo: superfície com água, leito sem água, depósitos e subsolo separados. Etapas e "Retirar água" avançam o tour em vez de encerrá-lo (`src/simulation/tour.ts`).
- Câmera: separar, trocar de vista, isolar e redimensionar mantêm a direção escolhida; o resize preserva também o zoom. "Reenquadrar" e R voltam ao ângulo padrão.
- Toque acidental no canvas não pausa nem desmarca; só um toque curto e parado numa camada a seleciona.
- Celular: texto ≥ 11 px, alvos de 44 px, descrição da etapa visível, ferramentas da câmera abaixo do canvas, rolagem vertical liberada sobre a cena (giro por deslize lateral).
- SEO: título com "fundo do rio Amazonas" e "Hamza", texto indexável em `index.html`, JSON-LD `VideoObject`. Cena 3D carregada sob demanda (JS inicial ≈ 76 KB gzip).
- Validação: 22 testes, build e check:pages. Sem nova rodada no navegador nesta revisão.
