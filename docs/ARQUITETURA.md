# Arquitetura implementada

Aplicação estática: React 19.2.6, TypeScript 5.9.3, Three.js 0.187.0 e Vite 8.3.6. Node >=22.18; versões exatas no lockfile. Geometria autoral local, sem backend ou download de modelo.

| Módulo | Responsabilidade |
|---|---|
| src/App.tsx | Estados de exploração, transição, seleção, vista de poros, fontes e fallback |
| src/simulation/section.ts | Perfil contínuo, separação por origens, interpolação e relógio limitado |
| src/scene/model.ts | Quatro sólidos, vegetação instanciada, guias de referência e amostra de grãos |
| src/scene/runtime.ts | Câmera, renderização, raycast, isolamento, resize e descarte |
| src/scene/camera.ts | Enquadramento por projeção e limites, incluindo retrato/vista vertical |
| src/scene/capture.ts | PNG com marca e indicação de ilustração/ausência de escala |
| src/content/ | Catálogo, coordenadas de referência, fontes e limites |
| src/ui/ e styles.css | Controles HTML, fichas, marca, fontes e layout responsivo |

## Estado e invariantes

`water` controla opacidade e presença da água; não rebaixa um nível hidrológico. `separation` desloca água, leito e subsolo a partir de suas origens. Sedimento central fica como referência. Linhas verticais indicam alinhamento original. Nenhum deslocamento é acumulado.

Estado inicial/reset: água visível, camadas montadas, corte, poros com água, sem isolamento/malha. Etapas: Superfície (1,0), Leito (0,0), Camadas (0,1). Interpolação suave de 1,2 s, somente por gesto; pausa, delta limitado a 0,1 s e congelamento durante ocultação. Movimento reduzido troca diretamente para o alvo.

`mode` troca a seção pela amostra ampliada; ela não fica desenhada sob o rio. `poreWater` alterna a água no espaço da amostra. Grãos e vegetação usam InstancedMesh. Malhas fechadas têm faces laterais com normais independentes. Perfil e cores são funções autorais, em unidades de desenho, sem escala métrica.

Quatro IDs estáveis: water, bed, sediment, substrate. Água invisível não captura cliques. Guias, linhas de superfície e chão não são peças. Selecionar água restaura sua visibilidade. Isolar guarda a câmera e retornar restaura a pose anterior.

## Renderização e entrega

DPR até 1,5; atualização até 30 vezes/s, renderização sob demanda. Sem órbita automática, áudio, texturas externas ou telemetria. Falha de WebGL preserva catálogo e fontes, desabilita ações da cena e oferece recarga.

Build com base `./`, conferido em `/amazonas-em-camadas/`. PNG produzido no navegador; restaura câmera e renderizador. Não depende dos outros repositórios ou da GPU de produção. Medidas e limitações em VALIDACAO.md.
