
// Function Declarations for Google Gemini API

export const geminiTools = [
  {
    functionDeclarations: [
      {
        name: "get_user_profile",
        description: "Obtém informações de perfil de um usuário (nome, status, função) dado seu ID.",
        parameters: {
          type: "OBJECT",
          properties: {
            userId: {
              type: "STRING",
              description: "O ID único do usuário, ex: '123' ou '456'.",
            },
          },
          required: ["userId"],
        },
      },
      {
        name: "read_file",
        description: "Lê o conteúdo de um arquivo no projeto. Use caminhos relativos à raiz do projeto.",
        parameters: {
          type: "OBJECT",
          properties: {
            filePath: {
              type: "STRING",
              description: "O caminho relativo do arquivo para ler, ex: 'app/page.js'.",
            },
          },
          required: ["filePath"],
        },
      },
      {
        name: "list_directory",
        description: "Lista os arquivos e pastas em um diretório do projeto.",
        parameters: {
          type: "OBJECT",
          properties: {
            dirPath: {
              type: "STRING",
              description: "O caminho relativo do diretório para listar, ex: 'app/api'. Use '.' para a raiz.",
            },
          },
          required: ["dirPath"],
        },
      },
    ],
  },
];
