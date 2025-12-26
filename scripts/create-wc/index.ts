import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { URL } from "./constants";

// ⚠️ bun build --compile --minify index.ts --outfile ../../compilados/criar-wc

async function ask(question: string, defaultValue: string = ""): Promise<string> {
  const answer = prompt(`${question} ${defaultValue ? `(EX: ${defaultValue} ) ` : ""}`);
  return answer?.trim() || defaultValue;
}

// Helper para converter strings
const toPascalCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const toLowerCase = (str: string) => str.toLowerCase();

async function findComponentsPaths(): Promise<string[]> {
  const glob = new Bun.Glob("**/components");
  const paths: string[] = [];

  for await (const path of glob.scan({
    cwd: ".",
    absolute: false,
    onlyFiles: false
  })) {
    if (!path.includes("node_modules")) {
      paths.push(path);
    }
  }

  return paths;
}

async function promptUserSelection(paths: string[]): Promise<string> {
  console.log(`⚠️  Múltiplas pastas 'components' encontradas:`);
  for (const [i, p] of paths.entries()) {
    console.log(`   [${i}] ${p}`);
  }

  const indexStr = await ask("Qual número deseja usar?", "0");
  const index = parseInt(indexStr, 10);

  const selectedPath = paths[index] ?? paths[0];
  if (!selectedPath) {
    throw new Error("Nenhum caminho válido encontrado");
  }

  return selectedPath;
}

async function selectComponentsDirectory(): Promise<string> {
  const foundPaths = await findComponentsPaths();

  if (foundPaths.length === 0) {
    console.error(`❌ Erro: Seu projeto precisa de uma pasta "components".`);
    process.exit(1);
  }

  if (foundPaths.length === 1) {
    const path = foundPaths[0];
    if (!path) {
      console.error(`❌ Erro: Caminho inválido encontrado.`);
      process.exit(1);
    }
    console.log(`📂 Pasta encontrada: \x1b[33m${path}\x1b[0m`);
    return path;
  }

  return await promptUserSelection(foundPaths);
}

async function main() {
  console.log(`\n🚀 \x1b[36mIniciando gerador de Web Components...\x1b[0m\n`);

  // 1. Encontrar a pasta 'components'
  const targetDir = await selectComponentsDirectory();

  // 2. Perguntas ao Usuário
  const rawName = await ask("\t💡 Qual o nome do componente?", "Header");
  if (!rawName) {
    console.error("Nome inválido");
    process.exit(1);
  }

  let prefix = await ask("\t💡 Qual o prefixo da tag?", "wc-");
  if (!prefix.endsWith("-")) prefix += "-";

  // 3. Normalização de Nomes
  const componentName = toPascalCase(rawName);
  const fileNameLower = toLowerCase(rawName);
  const componentDir = join(targetDir, componentName);

  // Verifica se já existe
  if (existsSync(componentDir)) {
    console.error(`❌ Erro: O componente ${componentName} já existe em ${componentDir}`);
    const overwrite = await ask("Deseja sobrescrever? (s/n)", "n");
    if (overwrite.toLowerCase() !== "s") process.exit(0);
  }

  console.log(`\n⬇️  Baixando templates do GitHub...`);

  // 4. Download e Processamento
  try {
    const urls = {
      main: URL.MAIN,
      css: URL.CSS,
      template: URL.TEMPLATE
    };

    const [resMain, resCss, resTemplate] = await Promise.all([fetch(urls.main), fetch(urls.css), fetch(urls.template)]);

    if (!resMain.ok || !resCss.ok || !resTemplate.ok) {
      throw new Error(`Falha ao baixar arquivos. Verifique a URL ou a internet.`);
    }

    const mainText = await resMain.text();
    const templateText = await resTemplate.text();
    const contentCss = await resCss.text();

    // --- LÓGICA DE SUBSTITUIÇÃO ---
    const processTextMain = (content: string) => {
      return content
        .replaceAll("__ComponentName__", componentName)
        .replaceAll("wc-componentname", `wc-${componentName.toLowerCase()}`)
        .replaceAll("wc-", prefix)
        .replace(/["']\.\/.*?(componentName|componentName)\.css(\?inline)?["']/gi, (match) => {
          return match.toLowerCase().replace(/componentname|componentName/gi, fileNameLower);
        })
        .replace(/_componentNameTemplate/gi, `${fileNameLower}Template`)
        .replace(/_componentNameStyle/gi, `${fileNameLower}Style`)
        .replace(/\.\/_componentNameTemplate/gi, `./${fileNameLower}Template`);
    };

    const processTextTemplate = (content: string) => {
      const t = content.replaceAll("###", componentName.toUpperCase());
      return t;
    };

    const contentMain = processTextMain(mainText);
    const contentTemplate = processTextTemplate(templateText);

    // 5. Criação da Estrutura
    console.log(`\t🔨 Criando arquivos em: ${componentDir}`);

    if (!existsSync(componentDir)) {
      mkdirSync(componentDir, { recursive: true });
    }

    await Bun.write(join(componentDir, `${componentName}.ts`), contentMain);
    await Bun.write(join(componentDir, `${fileNameLower}.css`), contentCss);
    await Bun.write(join(componentDir, `${fileNameLower}Template.ts`), contentTemplate);

    console.log(`\t✅ \x1b[32mSucesso! Componente ${componentName} criado.\x1b[0m`);
    console.log(`\t⚠️  Não esqueça de incluir ou criar a tag no HTML: <${prefix}${fileNameLower}></${prefix}${fileNameLower}>\n`);
  } catch (error) {
    console.error("❌ Erro fatal:", error);
  }
}

main();
