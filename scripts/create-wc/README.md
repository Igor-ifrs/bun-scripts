# 🚀 Gerador de Web Components + TypeScript

Script CLI para gerar boilerplate de Web Components customizados com TypeScript de forma rápida e padronizada.

## 📋 Pré-requisitos

- [Bun](https://bun.sh/) instalado na máquina
- Projeto com uma pasta `components` na estrutura

## ⚙️ Instalação

### Executar diretamente

```bash
bun run gen.ts
```

### Compilar para executável

```bash
# Compilar na pasta atual
bun build --compile --minify --sourcemap gen.ts --outfile criar-wc

# Compilar em pasta específica
bun build --compile --minify --sourcemap gen.ts --outfile ../../compilados/criar-wc
```

## 🎯 Como usar

1. Execute o script na raiz do seu projeto:

```bash
bun run gen.ts
# ou se compilou:
./criar-wc
```

2. Responda as perguntas interativas:

   - **Nome do componente**: Ex: `Header`, `Button`, `Card`
   - **Prefixo da tag**: Ex: `wc-`, `app-`, `ui-`

3. O script irá:
   - ✅ Buscar a pasta `components` no projeto
   - ✅ Baixar templates do GitHub
   - ✅ Criar estrutura de arquivos
   - ✅ Aplicar substituições automáticas

## 📁 Estrutura gerada

Para um componente chamado `Header` com prefixo `wc-`:

```
components/
└── Header/
    ├── Header.ts              # Classe do Web Component
    ├── header.css             # Estilos do componente
    └── headerTemplate.ts      # Template HTML
```

## 🏷️ Uso no HTML

Após gerar o componente, adicione a tag customizada no seu HTML:

```html
<wc-header></wc-header>
```

## 🔧 Funcionalidades

- 🔍 **Detecção automática** da pasta `components`
- 📦 **Download de templates** direto do GitHub
- ✏️ **Substituições inteligentes** de nomes e prefixos
- 🎨 **Suporte a prefixos customizados** para tags
- ⚠️ **Proteção contra sobrescrita** acidental
- 🎯 **Seleção interativa** quando há múltiplas pastas

## 📝 Exemplo de uso

```bash
$ bun run gen.ts

🚀 Iniciando gerador de Web Components...

📂 Pasta encontrada: src/components

        💡 Qual o nome do componente? (EX: Header ) Button
        💡 Qual o prefixo da tag? (EX: wc- ) app-

⬇️  Baixando templates do GitHub...
        🔨 Criando arquivos em: src/components/Button
        ✅ Sucesso! Componente Button criado.
        ⚠️  Não esqueça de incluir ou criar a tag no HTML: <app-button></app-button>
```

## 🛠️ Configuração

O script busca templates de uma URL configurada no arquivo `constants.ts`:

```typescript
export const URL = {
  MAIN: "https://raw.githubusercontent.com/...",
  CSS: "https://raw.githubusercontent.com/...",
  TEMPLATE: "https://raw.githubusercontent.com/...",
};
```

## ⚡ Scripts disponíveis

Adicione ao seu `package.json`:

```json
{
  "scripts": {
    "gen": "bun run gen.ts",
    "build:gen": "bun build --compile --minify --sourcemap gen.ts --outfile criar-wc"
  }
}
```

## 🐛 Solução de problemas

### Erro: "Seu projeto precisa de uma pasta 'components'"

Certifique-se de ter uma pasta chamada `components` em qualquer lugar do projeto (exceto `node_modules`).

### Erro ao baixar templates

Verifique sua conexão com a internet e se as URLs no arquivo `constants.ts` estão corretas.

### Componente já existe

O script perguntará se deseja sobrescrever. Responda `s` para confirmar ou `n` para cancelar.

## 📄 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

Feito com ❤️ usando [Bun](https://bun.sh/)
