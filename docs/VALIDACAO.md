# Validação — Amazonas em camadas

Aceite local em 07/11/2026. Desenvolvimento concluído para o escopo de ESCOPO.md; sem deploy público ou envio ao X. Fontes e limites científicos em [APURACAO.md](APURACAO.md).

## Ambiente e reprodução

Mac, Node 26.7.0, npm 11.19.0 e Chrome. Dependências exatas no lockfile. `npm ci --ignore-scripts`, `npm test`, `npm run check` e `npm run build` passaram. Build conferido em servidor estático sob `/amazonas-em-camadas/`, além da prévia Vite. Sem servidor de aplicação, credenciais ou recursos da GPU de produção.

Sete testes automatizados:

- Continuidade do leito, encontro com as margens e ausência de inversão com o sedimento.
- Separação ordenada, reversível e limitada; tratamento de valores não finitos.
- Interpolação limitada e chegada aos estados pedidos.
- Relógio com pausa, limite de delta e término da transição.
- Quatro conjuntos com contatos na montagem, intervalos ao separar e reset determinístico.
- Amostra de poros independente e visibilidade da água.
- Enquadramento dos volumes montado, separado e poroso em quatro proporções de tela, incluindo vista vertical.

## Verificações de navegador

**94 verificações aprovadas:** 68 de interação, 24 no build estático e duas após o ajuste do fechamento das fontes no celular. Não são 94 testes unitários. Os logs da sessão ficam em `output/browser-qa.log`, `output/production-qa.log` e `output/source-qa.log` (ignorados pelo Git).

- Retirar água, pausar/retomar, três estados predefinidos, controles intermediários e reset.
- Quatro seleções, busca com/sem resultado, isolamento, restauração da câmera, foco, clique na cena, órbita e zoom.
- Tour completo, atalho R, malha, tela cheia e retorno.
- Vista de poros, remoção da água e contraste do botão ativo.
- Quatro fichas com origem, data, resolução e limites; fonte UnB para o subsolo e pesquisa regional para o Hamza. Botão de fechar acessível durante a rolagem no celular.
- Movimento reduzido interrompe animação e aplica o destino diretamente. O handler de visibilidade pausa/retoma com `document.hidden` controlado no teste; não foi confirmado por troca nativa de aba.
- Catálogo e isolamento no celular; ação principal no primeiro viewport de 390 × 844. Sem transbordamento horizontal em 320 px ou 844 × 390.
- Perda de contexto WebGL e indisponibilidade inicial mostram fallback textual, desativam ações 3D e mantêm catálogo/fontes. Recarregar recupera a experiência quando o contexto está disponível.
- PNGs 1920 × 1080 e 1080 × 1920; exportação também na vista de poros. Câmera restaurada após captura.
- Fontes e cinco licenças locais acessíveis; nenhuma resposta HTTP com falha ou erro de página nos fluxos testados. Recursos carregados pela aplicação são locais.

## Inspeção visual

Capturas reais de desktop, celular, paisagem, leito exposto, camadas separadas e poros foram abertas e revisadas. Ajustados materiais do corte, cor da água, sombra de apoio, contraste do controle e acesso ao fechamento das fontes.

Os três PNGs foram conferidos: marca oficial, título e indicação de representação ilustrativa/sem escala legíveis. Evidências locais em `output/playwright/`, incluindo `desktop-final.png`, `bed-final.png`, `layers-final.png`, `production-mobile.png`, `mobile-pores.png`, `landscape.png`, `mobile-source-final.png` e `export-*.png`.

## Medidas

| Item | Resultado observado |
|---|---:|
| JavaScript minificado | 800.310 bytes; 215,39 kB gzip no relatório Vite |
| CSS minificado | 22.377 bytes; 5,34 kB gzip |
| Superfície | 13 chamadas / 137.602 triângulos |
| Leito exposto | 11 chamadas / 121.218 triângulos |
| Camadas separadas | 11 chamadas / 121.216 triângulos |
| Poros | 5 chamadas / 78.872 triângulos |
| PNG horizontal / vertical / poros | 1.652.232 / 1.320.591 / 1.680.998 bytes |

Chamadas e triângulos são contadores do renderer, incluindo passagens de sombra. DPR limitado a 1,5, sombra 1024 e atualização limitada a 30 Hz; renderização para em repouso e com página oculta. Isso não comprova 30 fps em telefone físico. O aviso Vite de chunk acima de 500 kB permanece; build concluído sem erro.

## Limites do aceite

Validação móvel por viewport do Chrome no Mac, sem teste físico de bateria, GPU ou toque. Sem Safari/iOS nesta rodada. Nenhum ensaio de precisão geológica: a localização de Óbidos é documentada, mas o corte, as espessuras e os grãos são autorais e sem escala. Não há batimetria medida, profundidade numérica, previsão de cheia ou simulação de escoamento. Retirar água muda visibilidade; separar camadas cria intervalos de exploração.

Não foram copiados mapas, figuras, PDF ou malhas de estudos. O Hamza é explicado como inferência regional em meio poroso, sem posicionar uma caverna sob Óbidos. Esses limites fazem parte da interface, das fichas e das capturas.

Para regressões futuras, seguir [MANUTENCAO.md](MANUTENCAO.md). Publicação e divulgação ficam para uma etapa autorizada por Victor.
