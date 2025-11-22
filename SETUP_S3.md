# Configuração do AWS S3 para Uploads

Para que o upload de fotos funcione, você precisa configurar um bucket no AWS S3 e obter as credenciais de acesso. Siga os passos abaixo:

## 1. Criar um Bucket no S3

1.  Acesse o console da AWS e vá para o serviço **S3**.
2.  Clique em **Create bucket**.
3.  **Bucket name**: Escolha um nome único (ex: `gtclicks-uploads-seu-nome`).
4.  **Region**: Escolha a região mais próxima (ex: `sa-east-1` para São Paulo ou `us-east-1` para N. Virginia).
5.  **Object Ownership**: Deixe como "ACLs disabled" (recomendado).
6.  **Block Public Access settings**:
    *   Desmarque a opção "Block all public access".
    *   Marque as caixas de confirmação que aparecerem.
    *   *Nota: Isso é necessário para que as fotos (previews) possam ser vistas publicamente no site.*
7.  Clique em **Create bucket**.

## 2. Configurar CORS (Cross-Origin Resource Sharing)

Para permitir que o navegador envie arquivos diretamente para o S3:

1.  Entre no bucket que você acabou de criar.
2.  Vá na aba **Permissions**.
3.  Role até **Cross-origin resource sharing (CORS)** e clique em **Edit**.
4.  Cole o seguinte JSON:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT",
            "POST",
            "GET"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "https://seu-dominio-producao.com"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]
```
5.  Clique em **Save changes**.

## 3. Configurar Política do Bucket (Bucket Policy)

Para garantir que as imagens sejam públicas para leitura:

1.  Ainda na aba **Permissions**, vá em **Bucket policy** e clique em **Edit**.
2.  Cole o JSON abaixo (substitua `NOME-DO-SEU-BUCKET` pelo nome real):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::NOME-DO-SEU-BUCKET/*"
        }
    ]
}
```
3.  Clique em **Save changes**.

## 4. Criar Credenciais de Acesso (IAM)

1.  Vá para o serviço **IAM** no console da AWS.
2.  Clique em **Users** > **Create user**.
3.  Nome: `gtclicks-uploader`.
4.  **Permissions options**: Selecione "Attach policies directly".
5.  Busque por `AmazonS3FullAccess` e selecione (ou crie uma política mais restrita apenas para o seu bucket se preferir).
6.  Clique em **Next** e **Create user**.
7.  Clique no usuário criado, vá na aba **Security credentials**.
8.  Em **Access keys**, clique em **Create access key**.
9.  Selecione "Application running outside AWS", clique em Next e depois **Create access key**.
10. **IMPORTANTE**: Copie a `Access key` e a `Secret access key`. Você não verá a Secret novamente.

## 5. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env.local` na raiz do projeto e adicione:

```env
S3_UPLOAD_BUCKET=nome-do-seu-bucket
S3_UPLOAD_REGION=regiao-do-bucket (ex: sa-east-1)
S3_UPLOAD_ACCESS_KEY_ID=SUA_ACCESS_KEY
S3_UPLOAD_SECRET_ACCESS_KEY=SUA_SECRET_KEY
```

Reinicie o servidor (`npm run dev`) e o upload deve funcionar!
