# springapi-ferias-front

Front-end em React (Vite) do [springapi-ferias](https://github.com/AlisonSantos-dev/springapi-ferias) -
sistema de gestao de ferias do time de Suporte ANYMARKET.

## Stack

- React 19 + Vite
- React Router (navegacao entre telas)
- Axios (chamadas HTTP pra API)

## Como rodar

1. Instale as dependencias:
   ```
   npm install
   ```

2. Confirme que o backend (`springapi-ferias`) esta rodando em `http://localhost:8080`
   (perfil `test` ou `dev`, tanto faz).

3. Rode o front em modo desenvolvimento:
   ```
   npm run dev
   ```

4. Abra `http://localhost:5173` no navegador.

## Variaveis de ambiente

O arquivo `.env` define `VITE_API_URL`, a URL base da API. Por padrao aponta pro
backend local (`http://localhost:8080`). Quando for pra producao, troque pela URL
real do backend hospedado.

## Estrutura

```
src/
  api/        -> instancia do axios configurada (token, base URL)
  pages/      -> telas da aplicacao (login, listagem, etc.)
  components/ -> pedacos de UI reutilizaveis
  context/    -> estado global (ex.: usuario logado)
```

## Status

- [x] Passo 1: scaffolding do projeto
- [ ] Passo 2: login + listagem basica
- [ ] Passo 3: CRUD completo (solicitar, cancelar, aprovar/rejeitar)
- [ ] Passo 4: estilo e polimento
- [ ] Passo 5/6: deploy junto com o backend
