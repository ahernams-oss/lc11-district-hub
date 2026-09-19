## Objetivo

Permitir que qualquer trecho escrito como `**Texto**` nos conteúdos públicos apareça em negrito, sem exibir os asteriscos.

## Implementação

- Evoluir o componente central de texto para interpretar `**...**` como negrito e continuar respeitando `//` e quebras de linha.
- Aplicar esse componente aos campos públicos que hoje exibem textos diretamente, incluindo página inicial, notícias, projetos, líderes, ex-governadores e páginas institucionais.
- Manter os campos administrativos como texto simples para que o editor continue digitando e salvando `**Texto**` normalmente.
- Verificar no navegador trechos mistos, múltiplos negritos e textos sem marcação, em computador e celular.

## Resultado esperado

`Nossa **missão** é servir` será mostrado como “Nossa missão é servir”, com apenas “missão” em negrito, em todos os campos públicos atualizados.
