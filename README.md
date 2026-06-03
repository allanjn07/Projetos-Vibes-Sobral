# 🟠 Sobral Vibe

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar o banco
cp .env.example .env
# Edite o .env com sua senha do MySQL

# 3. Criar as tabelas
# Cole o database.sql no MySQL Workbench e execute

# 4. Colocar imagens em public/img/

# 5. Rodar
npm run dev
```

Acesse: http://localhost:3000

---

## Adicionar eventos (via Postman/Insomnia)

**1. Criar conta**
```
POST /api/auth/register
{ "nome": "Seu Nome", "email": "email@email.com", "senha": "123456" }
```

**2. Login**
```
POST /api/auth/login
{ "email": "email@email.com", "senha": "123456" }
```

**3. Criar evento** (use o token retornado no login)
```
POST /api/eventos
Authorization: Bearer <token>

{
  "titulo": "Nome do Evento",
  "categoria": "shows",
  "local": "Arco do Triunfo",
  "horario": "21:00",
  "data_evento": "2026-05-10",
  "tipo": "ingresso",
  "preco": "R$ 20,00",
  "link_ingresso": "https://sympla.com.br",
  "imagem_url": "/img/sua-foto.jpeg"
}
```

Categorias disponíveis: `shows`, `academicos`, `historico`, `lazer`, `cultura`, `evento`
