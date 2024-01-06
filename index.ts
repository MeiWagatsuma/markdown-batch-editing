// ESモジュール形式でのインポート
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const directoryPath = path.join(process.cwd(), "markdowns");

// 指定されたディレクトリ内のすべての.mdファイルを再帰的に探索する非同期関数
async function getAllMarkdownFiles(
  dirPath: string,
  arrayOfFiles: string[],
): Promise<string[]> {
  const files = await fs.readdir(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileStat = await fs.stat(filePath);

    if (fileStat.isDirectory()) {
      arrayOfFiles = await getAllMarkdownFiles(filePath, arrayOfFiles);
    } else {
      if (path.extname(file) === ".md") {
        arrayOfFiles.push(filePath);
      }
    }
  }

  return arrayOfFiles;
}

// ファイルのfrontmatterを更新する非同期関数
async function updateFrontmatter(filePath: string) {
  const stats = await fs.stat(filePath);
  const creationYear = stats.birthtime.getFullYear();

  // 2023年に作成されたファイルのみ更新
  if (creationYear === 2023) {
    const fileContent = await fs.readFile(filePath, "utf8");
    const frontmatter = matter(fileContent);

    // frontmatterにcreated_atを追加または更新
    frontmatter.data.created_at = stats.birthtime.toISOString().split("T")[0];
    const updatedContent = matter.stringify(
      frontmatter.content,
      frontmatter.data,
    );

    // ファイルに書き込む
    await fs.writeFile(filePath, updatedContent);
    console.log(`Updated: ${filePath}`);
  }
}

// メインの非同期処理
async function main() {
  try {
    const markdownFiles = await getAllMarkdownFiles(directoryPath, []);
    for (const file of markdownFiles) {
      await updateFrontmatter(file);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

main();
