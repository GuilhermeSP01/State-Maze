# State Maze

Base para um jogo web e mobile com Vite, React, TypeScript e Capacitor.

## Desenvolvimento

Requisito: Node.js 22.12+ (recomendado: Node.js 24 LTS) e npm.
Execute os comandos na raiz do repositório:

```sh
npm install
npm run dev
```

O terminal informa o endereço local. Para validar e gerar a versão web:

```sh
npm run typecheck
npm run build
npm run preview
```

## Estrutura

- `apps/game`: aplicação React com Vite e configuração do Capacitor.
- `packages/stages`: contrato, tipos TypeScript e mapas iniciais das fases.
- `tools`: futuras ferramentas de desenvolvimento.
- `docs`: documentação do projeto.

## Fases

O pacote `@state-maze/stages` centraliza o formato compartilhado pelo jogo, pelo futuro editor e pelo analisador de fases:

- `packages/stages/stage.schema.json`: contrato JSON Schema, versão 2020-12.
- `packages/stages/src/types.ts`: tipos `Tile`, `Position` e `StageDefinition`.
- `packages/stages/maps/<id>.json`: estado inicial de cada fase.

Cada fase contém `schemaVersion`, `id`, `map` e `playerStart`. A matriz usa `0` para piso em estado 0, `1` para piso em estado 1 e `2` para parede. Coordenadas começam em zero: `row` é a linha e `column` é a coluna, acessadas como `map[row][column]`. Novos códigos serão definidos quando tiles especiais forem introduzidos.

A definição inicial é somente para leitura nos tipos TypeScript. Ao implementar a partida, será necessário copiar cada linha da matriz para manter as alterações em memória separadas do mapa original.

O tile de origem não alterna ao sair. Cada piso em que o jogador entra alterna entre 0 e 1, e a vitória é verificada ao terminar o movimento. A fase 1 contém o corredor `1 0 0`, cercado de paredes, com o jogador no primeiro piso; um deslize para a direita completa a fase.

O schema serve como contrato. O construtor de fases será responsável por produzir mapas válidos; não há validação adicional no carregamento ou no CI. A tela de jogo carrega e renderiza o estado inicial, sem movimento ou alternância de tiles.

Os arquivos de `maps/` usam nomes numéricos correspondentes ao `id` (por exemplo, `1.json`). O menu lista automaticamente os mapas disponíveis. A origem dos dados fica concentrada em `apps/game/src/stages/loadStage.ts`, permitindo substituí-la por uma API futuramente.

## Mobile

O Capacitor usa `apps/game/dist` como saída web e `com.statemaze.game` como identificador inicial. Revise o identificador antes de publicar.
As dependências Android e iOS estão instaladas. Os projetos nativos são gerados sob demanda.

Android (requer Android Studio e SDK configurados):

```sh
npm run android:add
npm run cap:sync
npm run android:open
```

iOS (requer macOS, Xcode e ambiente nativo configurado):

```sh
npm run ios:add
npm run cap:sync
npm run ios:open
```

Execute `android:add` e `ios:add` apenas uma vez para cada plataforma. Após alterações no jogo, use `npm run cap:sync` para compilar e atualizar os projetos nativos existentes. A geração de APK/AAB e do aplicativo iOS acontece nas ferramentas nativas.

Referências: [Vite](https://vite.dev/guide/) e [Capacitor](https://capacitorjs.com/docs/getting-started).
