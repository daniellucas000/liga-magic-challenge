# Portal Administrativo para gestão de cartas

Portal para gestão de cartas, desenvolvido como desafio técnico de processo seletivo Full Stack.

## Stack

- **Backend:** PHP (sem frameworks), com organização em Controllers/Models/Services e roteamento próprio
- **Banco de dados:** MySQL 8.0
- **Frontend:** HTML5, CSS3 e JavaScript vanilla (ES Modules, sem frameworks/bibliotecas)
- **Infra:** Docker Compose (app + banco + phpMyAdmin)

## Como rodar o projeto

### Pré-requisitos
- Docker e Docker Compose instalados

### Subindo o ambiente

```bash
docker compose up -d
```
Isso vai:
1. Subir o container MySQL, aplicando automaticamente `database/schema.sql` (estrutura) e `database/seed.sql` (dados iniciais)
2. Subir o container PHP, instalar as extensões `pdo`/`pdo_mysql` e iniciar o servidor embutido do PHP

### Acessando

| Serviço | URL |
|---|---|
| Aplicação | http://localhost:8000 |
| phpMyAdmin | http://localhost:8080 |
| MySQL | localhost:3306 |

### Resetando o ambiente do zero

Se precisar reaplicar o schema/seed (ex: após alterar a estrutura do banco):

```bash
docker compose down -v
docker compose up -d
```

## Credenciais de teste

| Usuário | Senha | Role |
|---|---|---|
| `admin` | `admin123` | admin |

Novos usuários podem se cadastrar livremente pela tela de **Cadastro** (`/register.php`) e entram por padrão com a role `editor`. Um `admin` pode promover/rebaixar qualquer usuário depois, pela tela de **Usuários**.

## Estrutura do projeto

```
app/
  controllers/    # Controllers HTTP
  models/         # Acesso a dados (Card, User)
  services/       # Regras de negócio reutilizáveis (validação, upload de imagem)
  router.php      # Roteador com suporte a parâmetros dinâmicos ({id}) e restrição por role
public/
  javascript/     # Frontend em ES Modules
  partials/       # Componentes PHP reutilizáveis (header, layout)
  *.php           # Páginas (dashboard, login, register, users)
database/
  schema.sql      # Estrutura das tabelas
  seed.sql        # Dados iniciais (usuário admin + cartas de exemplo)
routes/
  api.php         # Definição de todas as rotas da API
```

O projeto não usa autoload automático, cada arquivo novo precisa ser incluído manualmente via `require_once` em `public/index.php`.

## Decisões de UX/produto

### 1. Sistema de roles (admin / editor / viewer) com ownership

Como o portal é acessado por toda a equipe, cada carta cadastrada fica vinculada ao usuário que a criou (`created_by`). Por padrão, um usuário só pode editar, excluir as cartas que ele mesmo cadastrou, isso evita que qualquer pessoa apague o trabalho de outra sem querer.

Sobre essa base, existem três níveis de acesso:
- **admin:** acesso total, incluindo cartas de outros usuários e gestão de roles da equipe
- **editor** (padrão do cadastro): cria e gerencia apenas suas próprias cartas
- **viewer:** apenas consulta o acervo, sem nenhuma ação de escrita

Optei por manter em apenas 3 níveis para não gerar complexidade desnecessária num painel desse porte. Um admin também não pode alterar a própria role, evitando que se rebaixe acidentalmente e perca acesso à própria gestão de usuários.

A restrição é aplicada tanto no frontend (ocultando botões e colunas que o usuário não pode usar) quanto principalmente no backend, via checagem de role nas rotas e validação de ownership por registro. A camada visual é só uma conveniência, a segurança real está na API.

### 2. Duplicar carta

Adicionei a ação de duplicar carta para agilizar o cadastro de variações (ex: a mesma carta em uma edição ou raridade diferente), evitando que o usuário precise preencher o formulário inteiro do zero. A cópia recebe o sufixo "- cópia" no nome (inglês e português, quando presente) e é atribuída ao usuário que duplicou, não ao dono original, preservando a lógica de ownership.

### 3. Exclusão em massa

Como o acervo pode crescer rapidamente, adicionei seleção múltipla (checkbox por item + "selecionar tudo") com exclusão em massa, reduzindo o atrito de precisar excluir carta por carta em uma limpeza de dados. A ação passa por confirmação explícita e respeita ownership individualmente: se um usuário sem permissão para excluir algum item da seleção tentar a ação, essas cartas são puladas e reportadas, sem travar a exclusão das demais.

## Principais rotas da API

| Método | Rota | Autenticação | Role |
|---|---|---|---|
| POST | `/api/login` | — | — |
| POST | `/api/register` | — | — |
| POST | `/api/logout` | — | — |
| GET | `/api/session` | — | — |
| GET | `/api/cards` | Sim | Todas |
| POST | `/api/cards` | Sim | admin, editor |
| PUT | `/api/cards` | Sim | admin, editor (+ ownership) |
| DELETE | `/api/cards` | Sim | admin, editor (+ ownership) |
| POST | `/api/cards/{id}/duplicate` | Sim | admin, editor (+ ownership) |
| POST | `/api/cards/bulk-delete` | Sim | admin, editor (+ ownership) |
| GET | `/api/editions` | Sim | Todas |
| POST | `/api/upload-image` | Sim | admin, editor |
| GET | `/api/users` | Sim | admin |
| PUT | `/api/users/{id}/role` | Sim | admin |
