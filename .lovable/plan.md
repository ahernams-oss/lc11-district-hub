# Atualizar a área admin com os novos menus

## O que falta hoje

Os menus novos do site estão assim no painel:

| Menu público | Situação no painel |
| --- | --- |
| IDLL — Membros | já editável (Painel Admin → IDLL — Membros) |
| Líderes Lions Internacional / Área III / DMLC | já editáveis (bloco "Lideranças institucionais") |
| **Protocolo Leonístico + 17 submenus** | **sem edição** — as 17 páginas mostram "Nenhum conteúdo publicado nesta seção" |

Então o trabalho é dar edição ao Protocolo Leonístico e colocar esse menu na navegação do painel.

## O que será construído

### 1. Conteúdo dos temas de Protocolo
Novo módulo `src/lib/protocol-content.ts`:
- Chave de gravação por tema: `protocolo_topic_<slug>` na tabela de conteúdo do site (a mesma usada pelas outras páginas, então as permissões atuais já valem).
- Campos por tema: sobre-título, título, descrição, texto da página (com `**negrito**` e `//` quebra de parágrafo), imagens com ordem e remoção, e botão **Publicar**.
- Leitura pública permitida a visitantes; gravação só para quem pode editar conteúdo (regra já existente no banco).

### 2. Telas no painel
- `/admin/protocolo` — lista os 17 temas com status (sem conteúdo / rascunho / publicado) e link para editar.
- `/admin/protocolo/<tema>` — editor de um tema: textos, imagens (até 10, com reordenação), publicar/despublicar, salvar.
- Slug desconhecido mostra página de "tema indisponível", sem criar conteúdo novo.

### 3. Páginas públicas
- `/protocolo-leonistico/<tema>` passa a mostrar o que foi publicado: topo com sobre-título/título/descrição, texto formatado e galeria de imagens. Sem conteúdo publicado, continua com o aviso atual.
- `/protocolo-leonistico` (visão geral) ganha textos editáveis no topo (sobre-título, título, descrição e introdução), mantendo as seções fixas de precedência e cerimonial.

### 4. Menus do painel
- Item **Protocolo Leonístico** na barra lateral do painel.
- Cartão **Protocolo Leonístico** na tela inicial do painel.

### 5. Relatórios Excel / PDF
- Nova área de relatório "Protocolo Leonístico — Temas", exportando o conteúdo dos 17 temas (a leitura por prefixo de chave será estendida no catálogo de relatórios).

## Verificação
- Testes do módulo de protocolo (chaves por tema, filtro de relatório).
- Sessão real no painel: editar um tema, publicar, conferir a página pública, despublicar e limpar o teste.
- Conferir no computador e no celular, sem cortes.

## Detalhes técnicos
- Sem novas tabelas: usa `site_content` (política `public read content` + `editors write content`).
- Rotas TanStack: `admin.protocolo.index.tsx` e `admin.protocolo.$slug.tsx`; `routeTree.gen.ts` regenera sozinho.
- Imagens sobem pelo mesmo envio já usado nas outras telas (`uploadContentImage`).
