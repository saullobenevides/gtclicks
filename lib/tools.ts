import fs from 'fs/promises';
import path from 'path';

// Mock database function
const getUserFromDB = (userId) => {
    // In a real app, this would query Prisma/Database
    if (userId === '123') {
        return { name: 'Alice', role: 'Fotógrafo Premium', status: 'Ativo' };
    }
    if (userId === '456') {
        return { name: 'Bob', role: 'Cliente', status: 'Inativo' };
    }
    return null;
};

export const availableTools = {
    get_user_profile: ({ userId }) => {
        const user = getUserFromDB(userId);
        if (user) {
            return user;
        }
        return { error: 'Usuário não encontrado.' };
    },
    
    read_file: async ({ filePath }) => {
        try {
            const safePath = path.resolve(process.cwd(), filePath);
            if (!safePath.startsWith(process.cwd())) {
                return { error: "Acesso negado: Caminho fora do projeto." };
            }
            const content = await fs.readFile(safePath, 'utf-8');
            return { content };
        } catch (error) {
            return { error: `Erro ao ler arquivo: ${error.message}` };
        }
    },

    list_directory: async ({ dirPath }) => {
        try {
            const targetDir = dirPath === '.' ? process.cwd() : path.resolve(process.cwd(), dirPath);
            if (!targetDir.startsWith(process.cwd())) {
                 return { error: "Acesso negado: Caminho fora do projeto." };
            }
            
            const entries = await fs.readdir(targetDir, { withFileTypes: true });
            const files = entries.map(entry => ({
                name: entry.name,
                type: entry.isDirectory() ? 'directory' : 'file'
            }));
            
            return { files };
        } catch (error) {
            return { error: `Erro ao listar diretório: ${error.message}` };
        }
    }
};
