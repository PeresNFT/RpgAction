# 🚀 Guia: Criar Repositório Git e Deploy na Netlify

## 📋 Passo 1: Inicializar Git Localmente

Execute estes comandos no terminal (já estou fazendo para você):

```bash
git init
git add .
git commit -m "Initial commit: RPG Game with Supabase"
```

## 📋 Passo 2: Criar Repositório no GitHub

### 2.1. Acesse o GitHub
1. Vá para: https://github.com
2. Faça login (ou crie uma conta se não tiver)

### 2.2. Criar Novo Repositório
1. Clique no botão **"+"** no canto superior direito
2. Selecione **"New repository"**

### 2.3. Configurar Repositório
- **Repository name:** `site-rpg` (ou o nome que preferir)
- **Description:** `RPG Browser Game - Next.js + Supabase`
- **Visibility:** 
  - ✅ **Public** (recomendado para Netlify free)
  - ⚠️ **Private** (se quiser privado, precisa plano pago na Netlify)
- **NÃO marque:**
  - ❌ Add a README file (já temos)
  - ❌ Add .gitignore (já temos)
  - ❌ Choose a license

4. Clique em **"Create repository"**

### 2.4. Copiar URL do Repositório
Após criar, você verá uma página com instruções. **Copie a URL** do repositório (ex: `https://github.com/seu-usuario/site-rpg.git`)

## 📋 Passo 3: Conectar Repositório Local ao GitHub

Execute estes comandos (substitua `SEU_USUARIO` e `SEU_REPO`):

```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git branch -M main
git push -u origin main
```

**Exemplo:**
```bash
git remote add origin https://github.com/joaosilva/site-rpg.git
git branch -M main
git push -u origin main
```

## 📋 Passo 4: Deploy na Netlify

### 4.1. Criar Conta na Netlify
1. Acesse: https://www.netlify.com
2. Clique em **"Sign up"**
3. Escolha **"Sign up with GitHub"** (mais fácil)
4. Autorize a Netlify a acessar seu GitHub

### 4.2. Conectar Repositório
1. No Netlify Dashboard, clique em **"Add new site"**
2. Selecione **"Import an existing project"**
3. Escolha **"Deploy with GitHub"**
4. Autorize a Netlify (se necessário)
5. Selecione o repositório `site-rpg` (ou o nome que você deu)

### 4.3. Configurar Build Settings
A Netlify deve detectar automaticamente:
- **Build command:** `npm run build`
- **Publish directory:** `.next` (ou deixe vazio - Next.js detecta)

**IMPORTANTE:** Antes de clicar em "Deploy", configure as variáveis de ambiente!

### 4.4. Configurar Variáveis de Ambiente
1. Na tela de configuração, role até **"Environment variables"**
2. Clique em **"Add variable"**
3. Adicione estas 3 variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://phxiqusbrubqdrbhsvuf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

⚠️ **Use as mesmas chaves do seu `.env.local`!**

4. Clique em **"Deploy site"**

### 4.5. Aguardar Deploy
- O deploy leva 2-5 minutos
- Você verá o progresso em tempo real
- Quando terminar, verá uma URL tipo: `seu-site.netlify.app`

## 📋 Passo 5: Verificar se Funcionou

1. Acesse a URL do site (ex: `seu-site.netlify.app`)
2. Teste criar uma conta
3. Verifique no Supabase se o usuário foi criado

## ✅ Pronto!

Seu jogo está online! 🎉

---

## 🔄 Atualizações Futuras

Sempre que você fizer mudanças:

```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

A Netlify fará deploy automático! 🚀

---

## 🆘 Problemas Comuns

### Erro: "Repository not found"
- Verifique se o nome do repositório está correto
- Verifique se você tem permissão de acesso

### Erro: "Build failed"
- Verifique se as variáveis de ambiente estão configuradas
- Verifique os logs de build na Netlify

### Site não salva dados
- Verifique se as tabelas foram criadas no Supabase
- Verifique se as chaves do Supabase estão corretas

