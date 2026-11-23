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
- `packages`: futuros módulos compartilhados.
- `tools`: futuras ferramentas de desenvolvimento.
- `docs`: documentação do projeto.

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
